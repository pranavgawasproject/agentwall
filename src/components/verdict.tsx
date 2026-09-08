import { Badge } from "@/components/ui/badge";
import type { Verdict } from "@/lib/engine/types";

const TONE: Record<Verdict, "allow" | "block" | "redact" | "ice"> = {
  allow: "allow",
  block: "block",
  redact: "redact",
  rehydrate: "ice",
};

const LABEL: Record<Verdict, string> = {
  allow: "Allow",
  block: "Block",
  redact: "Redact",
  rehydrate: "Rehydrate",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge tone={TONE[verdict]}>{LABEL[verdict]}</Badge>;
}

export function verdictColor(v: Verdict) {
  if (v === "block") return "text-block";
  if (v === "redact") return "text-redact";
  if (v === "rehydrate") return "text-ice";
  return "text-allow";
}
