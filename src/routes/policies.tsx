import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useWallStore } from "@/lib/store";
import type { Policy } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/policies")({ component: PoliciesPage });

const GROUPS: Policy["group"][] = ["filesystem", "git", "sql", "network", "shell", "secrets", "mcp"];

function PoliciesPage() {
  const policies = useWallStore((s) => s.policies);
  const toggle = useWallStore((s) => s.togglePolicy);
  const setAction = useWallStore((s) => s.setPolicyAction);
  const armed = policies.filter((p) => p.enabled).length;

  return (
    <Page>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Policies</h1>
          <p className="mt-2 text-muted max-w-xl">
            Structural rules evaluated on every tool call. Disable a rule to temporarily widen the blast radius.
          </p>
        </div>
        <div className="font-mono text-sm text-subtle tabular-nums">
          {armed} / {policies.length} armed
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {GROUPS.map((g) => {
          const items = policies.filter((p) => p.group === g);
          if (!items.length) return null;
          return (
            <section key={g}>
              <h2 className="text-xs uppercase tracking-wider text-subtle mb-3">{g}</h2>
              <div className="panel divide-y divide-border">
                {items.map((p) => (
                  <div key={p.id} className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">{p.title}</h3>
                        <Badge tone={p.severity === "critical" || p.severity === "high" ? "block" : "neutral"}>
                          {p.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">{p.description}</p>
                      <div className="mt-3 flex gap-1">
                        {(["block", "warn", "redact"] as const).map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => setAction(p.id, a)}
                            className={cn(
                              "h-8 px-3 rounded-full text-xs capitalize",
                              p.action === a ? "bg-elevated text-fg shadow-border" : "text-subtle hover:text-fg",
                            )}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Switch
                      checked={p.enabled}
                      onCheckedChange={() => toggle(p.id)}
                      aria-label={`Toggle ${p.title}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
