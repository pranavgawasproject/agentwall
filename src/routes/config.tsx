import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { useWallStore } from "@/lib/store";
import { EGRESS_ALLOWLIST } from "@/lib/engine/policies";

export const Route = createFileRoute("/config")({ component: ConfigPage });

function ConfigPage() {
  const policies = useWallStore((s) => s.policies);
  const reset = useWallStore((s) => s.resetDemo);
  const toml = toToml(policies);

  function copy() {
    void navigator.clipboard.writeText(toml);
    toast.success("agentwall.toml copied");
  }

  return (
    <Page>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Config</h1>
          <p className="mt-2 text-muted max-w-xl">
            Generated from the live policy set. Drop this in the project root, then wrap any agent with{" "}
            <span className="font-mono text-fg">agentwall -- command</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copy}>
            Copy TOML
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              toast.message("Demo state reset");
            }}
          >
            Reset demo
          </Button>
        </div>
      </div>

      <pre className="mt-8 panel p-4 sm:p-5 font-mono text-xs sm:text-sm text-muted whitespace-pre overflow-x-auto leading-relaxed">
        {toml}
      </pre>
    </Page>
  );
}

function toToml(policies: { id: string; enabled: boolean; action: string }[]) {
  const lines = [
    "# agentwall.toml — generated from the live console",
    "",
    "[proxy]",
    'listen = "stdio"',
    "latency_budget_ms = 5",
    "",
    "[secrets]",
    "redact = true",
    "rehydrate_authorized = true",
    'patterns = ["openai", "anthropic", "aws", "stripe", "github", "jwt", "ssh", "db_url"]',
    "",
    "[egress]",
    'default = "deny"',
    `allow = [${EGRESS_ALLOWLIST.map((h) => `"${h}"`).join(", ")}]`,
    "",
    "[audit]",
    'path = "~/.agentwall/sessions.db"',
    "",
    "[policies]",
  ];
  for (const p of policies) {
    lines.push(`  "${p.id}" = { enabled = ${p.enabled}, action = "${p.action}" }`);
  }
  return lines.join("\n");
}
