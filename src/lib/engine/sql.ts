import type { Finding, Policy } from "./types";

function stripSqlComments(sql: string) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ")
    .replace(/#.*$/gm, " ");
}

function splitStatements(sql: string) {
  const parts: string[] = [];
  let buf = "";
  let q: string | null = null;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (q) {
      buf += c;
      if (c === q && sql[i - 1] !== "\\") q = null;
      continue;
    }
    if (c === "'" || c === '"') {
      q = c;
      buf += c;
      continue;
    }
    if (c === ";") {
      if (buf.trim()) parts.push(buf.trim());
      buf = "";
      continue;
    }
    buf += c;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function hasTopLevelWhere(stmt: string) {
  let depth = 0;
  let q: string | null = null;
  const s = stmt;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q && s[i - 1] !== "\\") q = null;
      continue;
    }
    if (c === "'" || c === '"') {
      q = c;
      continue;
    }
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && /\bwhere\b/i.test(s.slice(i, i + 6)) && (i === 0 || !/[A-Za-z0-9_]/.test(s[i - 1]))) {
      return true;
    }
  }
  return false;
}

function finding(policies: Policy[], rule: string, title: string, detail: string): Finding | null {
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

export function inspectSql(sql: string, policies: Policy[]): Finding[] {
  const out: Finding[] = [];
  const statements = splitStatements(stripSqlComments(sql));
  for (const stmt of statements) {
    const head = stmt.replace(/\s+/g, " ").trim();
    const upper = head.toUpperCase();
    if (/^(DROP|TRUNCATE)\b/.test(upper)) {
      const f = finding(policies, "sql.ddl_drop", "Destructive DDL", head.slice(0, 140));
      if (f) out.push(f);
    }
    if (/^ALTER\b/.test(upper) && /\b(DROP|RENAME)\b/.test(upper)) {
      const f = finding(policies, "sql.ddl_drop", "ALTER removes or renames a relation", head.slice(0, 140));
      if (f) out.push(f);
    }
    if (/^(UPDATE|DELETE)\b/.test(upper)) {
      const unbounded = !hasTopLevelWhere(head) || /\bWHERE\s+1\s*=\s*1\b/i.test(head) || /\bWHERE\s+TRUE\b/i.test(head);
      if (unbounded) {
        const f = finding(
          policies,
          "sql.unbounded_mutation",
          "UPDATE/DELETE without a real WHERE",
          head.slice(0, 140),
        );
        if (f) out.push(f);
      }
    }
    if (/\bCOPY\s+.*\s+TO\s+PROGRAM\b/i.test(head) || /\bINTO\s+OUTFILE\b/i.test(head)) {
      const f = finding(policies, "sql.ddl_drop", "SQL file/program export", head.slice(0, 140));
      if (f) out.push(f);
    }
  }
  return out;
}

export function sqlKind(sql: string) {
  const u = stripSqlComments(sql).trim().toUpperCase();
  if (u.startsWith("SELECT")) return "SELECT";
  if (u.startsWith("INSERT")) return "INSERT";
  if (u.startsWith("UPDATE")) return "UPDATE";
  if (u.startsWith("DELETE")) return "DELETE";
  if (u.startsWith("DROP")) return "DROP";
  if (u.startsWith("TRUNCATE")) return "TRUNCATE";
  if (u.startsWith("ALTER")) return "ALTER";
  if (u.startsWith("CREATE")) return "CREATE";
  return u.split(/\s+/)[0] ?? "SQL";
}
