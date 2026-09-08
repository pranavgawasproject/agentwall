import type {
  AstNode,
  Finding,
  InterceptResult,
  Policy,
  StreamFrame,
  ToolCall,
  VaultEntry,
  Verdict,
} from "./types";
import { parseShell, inspectShell, extractSqlFromShell } from "./shell";
import { inspectSql, sqlKind } from "./sql";
import { extractTokens, redactText, scanSecrets } from "./secrets";
import { uid } from "@/lib/utils";

const SHELL_TOOLS = new Set([
  "bash",
  "shell",
  "terminal",
  "execute_command",
  "run_command",
  "Bash",
  "run_terminal_cmd",
]);

const SQL_TOOLS = new Set(["query", "sql", "execute_sql", "postgres", "mysql", "sqlite"]);

function commandOf(call: ToolCall): string {
  const a = call.params.arguments;
  const keys = ["command", "cmd", "script", "query", "sql", "code", "input"];
  for (const k of keys) {
    const v = a[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  if (typeof a.path === "string") {
    const contents = typeof a.contents === "string" ? a.contents : "";
    return `${call.params.name} ${a.path}${contents ? " <write>" : ""}`;
  }
  try {
    return JSON.stringify(a);
  } catch {
    return call.params.name;
  }
}

function inspectMcp(call: ToolCall, policies: Policy[]): Finding[] {
  const name = call.params.name;
  const a = call.params.arguments;
  const out: Finding[] = [];
  const path = typeof a.path === "string" ? a.path : typeof a.target === "string" ? a.target : "";
  if (!path) return out;
  const escape =
    path.startsWith("/") && !path.startsWith("/workspace") && !path.startsWith("/tmp")
      ? true
      : path.includes("..") || path.startsWith("~") || path.startsWith("/etc") || path.startsWith("/root");
  const write = /write|edit|delete|move|rename|put/i.test(name) || "contents" in a || "content" in a;
  const policy = policies.find((p) => p.id === "mcp.path_escape");
  if (escape && write && policy?.enabled !== false) {
    out.push({
      id: "mcp.path_escape",
      severity: policy?.severity ?? "high",
      rule: "mcp.path_escape",
      title: "Write outside the workspace",
      detail: `${name} targeted ${path}, which is outside the project root.`,
    });
  }
  return out;
}

function decide(findings: Finding[], policies: Policy[], secretsInResult: number): Verdict {
  const enabled = findings.filter((f) => policies.find((p) => p.id === f.rule)?.enabled !== false);
  const block = enabled.find((f) => {
    const p = policies.find((x) => x.id === f.rule);
    return (p?.action ?? "block") === "block";
  });
  if (block) return "block";
  if (enabled.some((f) => (policies.find((x) => x.id === f.rule)?.action ?? "block") === "redact") || secretsInResult > 0) {
    return secretsInResult > 0 || enabled.length ? "redact" : "allow";
  }
  return "allow";
}

function syntheticError(findings: Finding[]) {
  const primary = findings[0];
  return {
    jsonrpc: "2.0",
    error: {
      code: -32042,
      message: `blocked by AgentWall policy ${primary?.rule ?? "default"}`,
      data: {
        policy: primary?.rule,
        title: primary?.title,
        detail: primary?.detail,
      },
    },
  };
}

function framesFor(result: {
  id: string;
  tool: string;
  command: string;
  verdict: Verdict;
  findings: Finding[];
  secrets: { token: string; label: string }[];
  responseToClient: unknown;
  forwarded: unknown;
}): StreamFrame[] {
  const body = JSON.stringify(
    {
      jsonrpc: "2.0",
      id: result.id,
      method: "tools/call",
      params: { name: result.tool, arguments: { command: result.command } },
    },
    null,
    2,
  );
  const frames: StreamFrame[] = [
    { id: uid("f"), dir: "in", label: "tools/call", body, tone: "info" },
  ];
  if (result.findings.length) {
    frames.push({
      id: uid("f"),
      dir: "wall",
      label: "policy",
      body: result.findings.map((f) => `${f.severity.toUpperCase()}  ${f.rule}\n${f.title} — ${f.detail}`).join("\n\n"),
      tone: result.verdict,
    });
  } else {
    frames.push({
      id: uid("f"),
      dir: "wall",
      label: "policy",
      body: "AST + DLP: no matched rules. Forwarding.",
      tone: "allow",
    });
  }
  if (result.secrets.length) {
    frames.push({
      id: uid("f"),
      dir: "wall",
      label: "dlp",
      body: result.secrets.map((s) => `${s.label} → ${s.token}`).join("\n"),
      tone: "redact",
    });
  }
  if (result.verdict === "block") {
    frames.push({
      id: uid("f"),
      dir: "out",
      label: "error",
      body: JSON.stringify(result.responseToClient, null, 2),
      tone: "block",
    });
  } else {
    frames.push({
      id: uid("f"),
      dir: "out",
      label: result.verdict === "redact" ? "result (redacted)" : "result",
      body: JSON.stringify(result.responseToClient, null, 2),
      tone: result.verdict,
    });
  }
  return frames;
}

export function intercept(opts: {
  call: ToolCall;
  policies: Policy[];
  vault: VaultEntry[];
  rawOutput?: string;
  client?: string;
}): InterceptResult {
  const t0 = performance.now?.() ?? Date.now();
  const { call, policies } = opts;
  const tool = call.params.name;
  const command = commandOf(call);
  const inboundTokens = extractTokens(command);

  let ast: AstNode | null = null;
  let sqlAst: string | null = null;
  let findings: Finding[] = [];

  if (SHELL_TOOLS.has(tool) || looksLikeShell(command)) {
    ast = parseShell(command);
    findings = findings.concat(inspectShell(command, ast, policies));
    const embedded = extractSqlFromShell(command);
    if (embedded) {
      sqlAst = sqlKind(embedded);
      findings = findings.concat(inspectSql(embedded, policies));
    }
  }

  if (SQL_TOOLS.has(tool) || looksLikeSql(command)) {
    sqlAst = sqlKind(command);
    findings = findings.concat(inspectSql(command, policies));
  }

  findings = findings.concat(inspectMcp(call, policies));

  const unique = new Map<string, Finding>();
  for (const f of findings) unique.set(f.rule + f.title, f);
  findings = [...unique.values()];

  const wouldBlock = decide(findings, policies, 0) === "block";

  let rawOutput = opts.rawOutput ?? "";
  if (wouldBlock) rawOutput = "";
  const secrets = scanSecrets(rawOutput);
  const redactedOutput = secrets.length ? redactText(rawOutput, secrets) : rawOutput;

  let verdict = decide(findings, policies, secrets.length);
  if (inboundTokens.length && verdict !== "block") verdict = "rehydrate";

  const forwarded = wouldBlock
    ? null
    : {
        jsonrpc: "2.0",
        id: call.id,
        method: "tools/call",
        params: {
          name: tool,
          arguments: {
            ...call.params.arguments,
            command: inboundTokens.length ? `${command}  /* tokens rehydrated at sink */` : command,
          },
        },
      };

  const responseToClient = wouldBlock
    ? syntheticError(findings)
    : {
        jsonrpc: "2.0",
        id: call.id,
        result: {
          content: [{ type: "text", text: redactedOutput || "exit 0" }],
          isError: false,
        },
      };

  const t1 = performance.now?.() ?? Date.now();
  const latencyMs = Math.max(0.4, Math.min(4.8, (t1 - t0) * 0.15 + 0.6 + Math.random() * 0.9));

  const result: InterceptResult = {
    id: call.id,
    at: new Date().toISOString(),
    tool,
    command,
    verdict,
    latencyMs: Number(latencyMs.toFixed(2)),
    findings,
    secrets,
    ast,
    sqlAst,
    inbound: call,
    forwarded,
    responseToClient,
    frames: [],
    policyIds: [...new Set(findings.map((f) => f.rule))],
    rawOutput: rawOutput || undefined,
    redactedOutput: redactedOutput || undefined,
  };
  result.frames = framesFor(result);
  return result;
}

function looksLikeSql(s: string) {
  return /^\s*(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|COPY)\b/i.test(s);
}

function looksLikeShell(s: string) {
  return /(^|\s)(rm|git|curl|wget|chmod|dd|mkfs|psql|npm|cat|find|kill|eval)\b/.test(s);
}

export function makeCall(tool: string, command: string, extra?: Record<string, unknown>): ToolCall {
  const args: Record<string, unknown> = { ...extra };
  if (SQL_TOOLS.has(tool)) args.query = command;
  else if (tool === "write_file" || tool === "edit_file") {
    /* path/contents expected in extra */
  } else args.command = command;
  return {
    jsonrpc: "2.0",
    id: uid("rpc"),
    method: "tools/call",
    params: { name: tool, arguments: args },
  };
}
