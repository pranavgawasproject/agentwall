import type { SecretHit } from "./types";

type Pattern = {
  kind: string;
  label: string;
  re: RegExp;
};

const PATTERNS: Pattern[] = [
  { kind: "openai", label: "OpenAI API key", re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { kind: "anthropic", label: "Anthropic API key", re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { kind: "stripe", label: "Stripe secret key", re: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g },
  { kind: "github", label: "GitHub token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g },
  { kind: "aws_akid", label: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { kind: "aws_secret", label: "AWS secret key", re: /\b(?:aws)?_?secret_?access_?key["'=\s:]{1,8}[A-Za-z0-9/+=]{40}\b/gi },
  { kind: "jwt", label: "JWT", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { kind: "slack", label: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { kind: "google", label: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { kind: "private_key", label: "Private key block", re: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g },
  { kind: "db_url", label: "Database URL", re: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s'"\\]+/gi },
  { kind: "pem", label: "PEM material", re: /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g },
];

const TOKEN_RE = /__SECRET_TOKEN_[A-Z0-9]{4}__/g;

function hashKind(kind: string, value: string) {
  let h = 0;
  const s = `${kind}:${value}`;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).toUpperCase().slice(0, 4).padStart(4, "0");
}

export function makeToken(kind: string, value: string) {
  return `__SECRET_TOKEN_${hashKind(kind, value)}__`;
}

export function scanSecrets(text: string): SecretHit[] {
  if (!text) return [];
  const hits: SecretHit[] = [];
  const seen = new Set<string>();

  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(text))) {
      const value = m[0];
      const key = `${p.kind}:${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        kind: p.kind,
        label: p.label,
        value,
        token: makeToken(p.kind, value),
        start: m.index,
        end: m.index + value.length,
      });
      if (p.re.lastIndex === m.index) p.re.lastIndex++;
    }
  }

  return hits.sort((a, b) => a.start - b.start);
}

export function redactText(text: string, hits: SecretHit[]) {
  if (!hits.length) return text;
  let out = text;
  for (const h of [...hits].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, h.start) + h.token + out.slice(h.end);
  }
  return out;
}

export function rehydrateText(
  text: string,
  vault: { token: string; value: string }[],
) {
  return text.replace(TOKEN_RE, (tok) => {
    const found = vault.find((v) => v.token === tok);
    return found ? found.value : tok;
  });
}

export function extractTokens(text: string) {
  return text.match(TOKEN_RE) ?? [];
}

export function previewSecret(value: string) {
  const compact = value.replace(/\s+/g, " ");
  if (compact.length <= 18) return compact;
  return `${compact.slice(0, 10)}…${compact.slice(-6)}`;
}
