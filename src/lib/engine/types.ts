export type Verdict = "allow" | "block" | "redact" | "rehydrate";

export type Severity = "critical" | "high" | "medium" | "low";

export type Finding = {
  id: string;
  severity: Severity;
  rule: string;
  title: string;
  detail: string;
  span?: { start: number; end: number };
};

export type SecretHit = {
  kind: string;
  label: string;
  value: string;
  token: string;
  start: number;
  end: number;
};

export type AstCommand = {
  name: string;
  flags: string[];
  args: string[];
};

export type AstNode =
  | { kind: "script"; children: AstNode[] }
  | { kind: "list"; op: ";" | "&&" | "||"; children: AstNode[] }
  | { kind: "pipe"; commands: AstNode[] }
  | { kind: "subshell"; body: AstNode }
  | { kind: "subst"; body: AstNode }
  | { kind: "command"; name: string; flags: string[]; args: string[] }
  | { kind: "empty" };

export type PolicyAction = "block" | "warn" | "redact";

export type Policy = {
  id: string;
  group: "filesystem" | "git" | "sql" | "network" | "shell" | "secrets" | "mcp";
  title: string;
  description: string;
  enabled: boolean;
  action: PolicyAction;
  severity: Severity;
};

export type ToolCall = {
  jsonrpc: "2.0";
  id: string;
  method: "tools/call";
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
};

export type StreamFrame = {
  id: string;
  dir: "in" | "out" | "wall";
  label: string;
  body: string;
  tone?: Verdict | "info";
};

export type InterceptResult = {
  id: string;
  at: string;
  tool: string;
  command: string;
  verdict: Verdict;
  latencyMs: number;
  findings: Finding[];
  secrets: SecretHit[];
  ast: AstNode | null;
  sqlAst: string | null;
  inbound: ToolCall;
  forwarded: unknown;
  responseToClient: unknown;
  frames: StreamFrame[];
  policyIds: string[];
  rawOutput?: string;
  redactedOutput?: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  tool: string;
  command: string;
  verdict: Verdict;
  latencyMs: number;
  summary: string;
  findings: Finding[];
  secrets: number;
  client: string;
};

export type VaultEntry = {
  token: string;
  kind: string;
  label: string;
  lastSeen: string;
  hits: number;
  preview: string;
};

export type Snapshot = {
  id: string;
  name: string;
  at: string;
  files: number;
  bytes: string;
  dbTables: number;
  note: string;
  restored?: boolean;
};

export type Gateway = {
  id: string;
  name: string;
  transport: "stdio" | "sse";
  kind: string;
  status: "proxied" | "blocked" | "idle";
  tools: number;
  lastCall: string;
  egress: string;
};

export type Scenario = {
  id: string;
  title: string;
  blurb: string;
  client: string;
  tool: string;
  command: string;
  extraArgs?: Record<string, unknown>;
  rawOutput?: string;
};
