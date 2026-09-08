import type { AstNode, Finding, Policy } from "./types";
import { EGRESS_ALLOWLIST } from "./policies";

type Tok = { t: "word" | "op"; v: string; i: number };

const OPS = ["||", "&&", ">>", "<<", ">&", "2>", "$(", ";;", "|", ";", "&", "(", ")", "<", ">", "`"];

function tokenize(input: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const n = input.length;
  while (i < n) {
    const c = input[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    if (c === "#") {
      while (i < n && input[i] !== "\n") i++;
      continue;
    }
    if (c === "'" || c === '"') {
      const q = c;
      const start = i;
      i++;
      let buf = "";
      while (i < n && input[i] !== q) {
        if (q === '"' && input[i] === "\\" && i + 1 < n) {
          buf += input[i + 1];
          i += 2;
          continue;
        }
        buf += input[i];
        i++;
      }
      if (i < n) i++;
      out.push({ t: "word", v: buf, i: start });
      continue;
    }
    const rest = input.slice(i);
    const op = OPS.find((o) => rest.startsWith(o));
    if (op) {
      out.push({ t: "op", v: op, i });
      i += op.length;
      continue;
    }
    if (c === "\\") {
      const start = i;
      i++;
      if (i < n) {
        out.push({ t: "word", v: input[i], i: start });
        i++;
      }
      continue;
    }
    const start = i;
    let buf = "";
    while (i < n) {
      const ch = input[i];
      if (" \t\n\r".includes(ch)) break;
      if (OPS.some((o) => input.startsWith(o, i))) break;
      if (ch === "'" || ch === '"') break;
      buf += ch;
      i++;
    }
    if (buf) out.push({ t: "word", v: buf, i: start });
  }
  return out;
}

function parseCommand(tokens: Tok[], i: number): { node: AstNode; next: number } {
  const flags: string[] = [];
  const args: string[] = [];
  let name = "";
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok.t === "op" && ["|", "||", "&&", ";", "&", ")", "`"].includes(tok.v)) break;
    if (tok.t === "op" && (tok.v === "(" || tok.v === "$(")) {
      const inner = parseScript(tokens, i + 1, tok.v === "$(" ? ")" : ")");
      return {
        node: { kind: tok.v === "$(" ? "subst" : "subshell", body: inner.node },
        next: inner.next,
      };
    }
    if (tok.t === "op") {
      i++;
      if (i < tokens.length && tokens[i].t === "word") i++;
      continue;
    }
    if (!name) name = tok.v;
    else if (tok.v.startsWith("-")) flags.push(tok.v);
    else args.push(tok.v);
    i++;
  }
  if (!name) return { node: { kind: "empty" }, next: i };
  return { node: { kind: "command", name, flags, args }, next: i };
}

function parsePipeline(tokens: Tok[], i: number): { node: AstNode; next: number } {
  const commands: AstNode[] = [];
  while (i < tokens.length) {
    const c = parseCommand(tokens, i);
    commands.push(c.node);
    i = c.next;
    if (i < tokens.length && tokens[i].t === "op" && tokens[i].v === "|") {
      i++;
      continue;
    }
    break;
  }
  if (commands.length === 1) return { node: commands[0], next: i };
  return { node: { kind: "pipe", commands }, next: i };
}

function parseScript(tokens: Tok[], i: number, stop?: string): { node: AstNode; next: number } {
  const children: AstNode[] = [];
  let op: ";" | "&&" | "||" | null = null;
  while (i < tokens.length) {
    if (stop && tokens[i].t === "op" && tokens[i].v === stop) {
      i++;
      break;
    }
    const p = parsePipeline(tokens, i);
    children.push(p.node);
    i = p.next;
    if (i < tokens.length && tokens[i].t === "op" && ["&&", "||", ";", "&"].includes(tokens[i].v)) {
      const v = tokens[i].v === "&" ? ";" : (tokens[i].v as ";" | "&&" | "||");
      op = op ?? v;
      i++;
      continue;
    }
    break;
  }
  if (children.length === 0) return { node: { kind: "empty" }, next: i };
  if (children.length === 1) return { node: children[0], next: i };
  return { node: { kind: "list", op: op ?? ";", children }, next: i };
}

export function parseShell(input: string): AstNode {
  const tokens = tokenize(input);
  return parseScript(tokens, 0).node;
}

function walk(node: AstNode, visit: (n: AstNode, trail: AstNode[]) => void, trail: AstNode[] = []) {
  visit(node, trail);
  const next = [...trail, node];
  switch (node.kind) {
    case "script":
    case "list":
      node.children.forEach((c) => walk(c, visit, next));
      break;
    case "pipe":
      node.commands.forEach((c) => walk(c, visit, next));
      break;
    case "subshell":
    case "subst":
      walk(node.body, visit, next);
      break;
    default:
      break;
  }
}

const SYSTEM_PATHS = new Set(["/", "~", "$HOME", "/home", "/etc", "/usr", "/var", "/bin", "/sbin", "/root", "/*"]);
const SENSITIVE_FILE = /(\.env(\.|$)|id_rsa|id_ed25519|id_ecdsa|\.pem$|\.key$|credentials|\.aws|\.npmrc|\.netrc|authorized_keys|secrets)/i;
const PROJECT_SAFE = /^(dist|build|coverage|tmp|\.cache|node_modules|\.next|\.turbo|\.git\/objects)(\/|$)/i;

function inPipeToShell(trail: AstNode[]) {
  const pipe = [...trail].reverse().find((n) => n.kind === "pipe");
  if (!pipe || pipe.kind !== "pipe") return false;
  return pipe.commands.some(
    (c) => c.kind === "command" && /^(sh|bash|zsh|ksh|dash|fish)$/.test(c.name),
  );
}

function hostOfUrl(url: string) {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname;
  } catch {
    const m = url.match(/https?:\/\/([^/\s]+)/i);
    return m?.[1] ?? url;
  }
}

function flagHas(flags: string[], ...needles: string[]) {
  const joined = flags.join(" ");
  return needles.some((n) => {
    if (n.startsWith("--")) return flags.includes(n) || flags.some((f) => f.startsWith(`${n}=`));
    if (n.length === 2 && n.startsWith("-")) {
      const letter = n[1];
      return flags.some((f) => f.startsWith("-") && !f.startsWith("--") && f.includes(letter));
    }
    return flags.includes(n);
  });
}

function isEnabled(policies: Policy[], id: string) {
  return policies.find((p) => p.id === id)?.enabled !== false;
}

function finding(
  policies: Policy[],
  rule: string,
  title: string,
  detail: string,
): Finding | null {
  const p = policies.find((x) => x.id === rule);
  if (p && !p.enabled) return null;
  return {
    id: `${rule}:${title}`,
    severity: p?.severity ?? "high",
    rule,
    title,
    detail,
  };
}

export function inspectShell(command: string, ast: AstNode, policies: Policy[]): Finding[] {
  const out: Finding[] = [];
  const push = (f: Finding | null) => {
    if (f) out.push(f);
  };

  if (/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/.test(command) && isEnabled(policies, "shell.fork_bomb")) {
    push(finding(policies, "shell.fork_bomb", "Fork bomb", "Classic bash fork bomb would exhaust process table."));
  }

  walk(ast, (node, trail) => {
    if (node.kind !== "command") return;
    const name = node.name.split("/").pop() ?? node.name;
    const args = node.args;
    const flags = node.flags;
    const all = [...flags, ...args].join(" ");

    if ((name === "rm" || name === "unlink" || name === "rmdir") && isEnabled(policies, "fs.recursive_delete")) {
      const recursive = flagHas(flags, "-r", "-R", "--recursive") || name === "rmdir";
      const force = flagHas(flags, "-f", "--force") || flagHas(flags, "--no-preserve-root");
      const target = args.find((a) => !a.startsWith("-")) ?? args[0] ?? "";
      const system = SYSTEM_PATHS.has(target) || target === "/*" || /^\/\*$/.test(target);
      if (recursive && (system || flagHas(flags, "--no-preserve-root"))) {
        push(
          finding(
            policies,
            "fs.recursive_delete",
            "Recursive delete of system root",
            `${name} ${flags.join(" ")} ${args.join(" ")} would wipe a system path.`,
          ),
        );
      } else if (recursive && target.startsWith("/") && !PROJECT_SAFE.test(target.slice(1))) {
        if (!/^(tmp|var\/tmp|workspace|home\/[^/]+\/(src|code|projects))/.test(target.slice(1))) {
          if (target === "/home" || target.startsWith("/etc") || target.startsWith("/usr") || target.startsWith("/var")) {
            push(
              finding(
                policies,
                "fs.recursive_delete",
                "Recursive delete of system path",
                `Target ${target} is outside the workspace.`,
              ),
            );
          }
        }
      }
      if (args.some((a) => SENSITIVE_FILE.test(a)) && isEnabled(policies, "fs.sensitive_delete")) {
        push(
          finding(
            policies,
            "fs.sensitive_delete",
            "Deleting credential material",
            `Refusing to delete ${args.filter((a) => SENSITIVE_FILE.test(a)).join(", ")}.`,
          ),
        );
      }
      void force;
    }

    if (name === "find" && args.includes("-delete") && args.some((a) => a === "/" || a === "~")) {
      push(finding(policies, "fs.recursive_delete", "find -delete on a system path", "find … -delete at filesystem root is a wipe."));
    }

    if (/^(mkfs|mkfs\.ext4|mkfs\.xfs|mkfs\.vfat|fdisk|parted|shred)$/.test(name)) {
      push(finding(policies, "fs.disk_wipe", "Disk destructive utility", `${name} can destroy block devices.`));
    }
    if (name === "dd" && args.some((a) => /^of=\/dev\//.test(a))) {
      push(finding(policies, "fs.disk_wipe", "dd write to block device", "dd of=/dev/… is a disk wipe."));
    }

    if (/^(cat|less|more|head|tail|bat|type)$/.test(name) && args.some((a) => SENSITIVE_FILE.test(a))) {
      push(
        finding(
          policies,
          "fs.sensitive_read",
          "Sensitive file read",
          `Output of ${args.filter((a) => SENSITIVE_FILE.test(a)).join(", ")} will be redacted before it reaches the model.`,
        ),
      );
    }

    if (name === "git") {
      const sub = args[0] ?? flags[0] ?? "";
      const rest = [...flags, ...args];
      if (sub === "push" && rest.some((x) => x === "--force" || x === "-f" || x === "--force-with-lease")) {
        push(finding(policies, "git.force_push", "Force push", "git push --force can rewrite shared history."));
      }
      if (sub === "reset" && rest.some((x) => x === "--hard")) {
        push(finding(policies, "git.hard_reset", "Hard reset", "git reset --hard discards uncommitted work."));
      }
      if (sub === "clean" && (rest.includes("-fdx") || (rest.includes("-f") && rest.includes("-d") && rest.includes("-x")))) {
        push(finding(policies, "git.hard_reset", "git clean -fdx", "Would delete untracked and ignored files."));
      }
    }

    if (/^(curl|wget|http|aria2c)$/.test(name)) {
      if (inPipeToShell(trail)) {
        push(finding(policies, "net.pipe_to_shell", "Remote script piped to a shell", `${name} output is piped into sh/bash.`));
      }
      const url = args.find((a) => /https?:\/\//i.test(a) || a.includes(".")) ?? "";
      if (url) {
        const host = hostOfUrl(url);
        const allowed = EGRESS_ALLOWLIST.some((h) => host === h || host.endsWith(`.${h}`));
        if (!allowed && isEnabled(policies, "net.egress_unlisted")) {
          push(
            finding(
              policies,
              "net.egress_unlisted",
              "Host not on egress allowlist",
              `${host || url} is not in the network allowlist.`,
            ),
          );
        }
      }
      const dataIdx = [...flags, ...args].join(" ");
      if (/(-d|--data|--data-binary|@)/.test(dataIdx) && /(id_rsa|\.env|secrets|token|credential)/i.test(dataIdx)) {
        push(finding(policies, "secrets.exfil", "Possible credential exfiltration", "Request body appears to attach secrets or key files."));
      }
    }

    if (/^(eval|exec)$/.test(name) || name === "bash" && flagHas(flags, "-c") && /base64|eval|\$\(/.test(all)) {
      if (name === "eval" || /base64/.test(all)) {
        push(finding(policies, "shell.eval_obfuscation", "Dynamic eval", "eval / encoded payloads hide the real command from simple scanners."));
      }
    }

    if (name === "base64" && (flagHas(flags, "-d", "-D", "--decode")) && inPipeToShell(trail)) {
      push(finding(policies, "shell.eval_obfuscation", "base64-decoded payload piped to shell", "Decoded bytes execute immediately — classic obfuscation."));
    }

    if (name === "python" || name === "python3" || name === "node" || name === "perl") {
      const code = args.join(" ");
      if (/(os\.system|subprocess|child_process|rm -rf|DROP TABLE)/i.test(code)) {
        push(finding(policies, "shell.eval_obfuscation", "Interpreter executing a destructive one-liner", `${name} -c payload matches a destructive pattern.`));
      }
    }

    if (name === "kill" && (args.includes("-1") || args.includes("-- -1")) && (flags.includes("-9") || args.includes("-9"))) {
      push(finding(policies, "shell.fork_bomb", "kill -9 -1", "Would signal every process the agent can reach."));
    }

    if (name === "chmod" && (args.includes("777") || args.includes("0777") || flags.includes("777"))) {
      push(finding(policies, "shell.chmod_world", "chmod 777", "World-writable mode on any path is refused."));
    }
  });

  const unique = new Map<string, Finding>();
  for (const f of out) unique.set(f.rule + f.title, f);
  return [...unique.values()];
}

export function flattenCommands(node: AstNode): { name: string; flags: string[]; args: string[] }[] {
  const acc: { name: string; flags: string[]; args: string[] }[] = [];
  walk(node, (n) => {
    if (n.kind === "command") acc.push({ name: n.name, flags: n.flags, args: n.args });
  });
  return acc;
}

export function extractSqlFromShell(command: string): string | null {
  if (!/\b(psql|mysql|sqlite3)\b/.test(command)) return null;
  const m = command.match(/(?:-c|--command)\s+(['"])([\s\S]*?)\1/);
  return m?.[2] ?? null;
}
