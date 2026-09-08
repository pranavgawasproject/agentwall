import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWallStore } from "@/lib/store";
import { formatClock } from "@/lib/utils";
import { EGRESS_ALLOWLIST } from "@/lib/engine/policies";

export const Route = createFileRoute("/gateways")({ component: GatewaysPage });

function GatewaysPage() {
  const gateways = useWallStore((s) => s.gateways);
  const setStatus = useWallStore((s) => s.setGatewayStatus);

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Gateways</h1>
      <p className="mt-2 text-muted max-w-xl">
        Every MCP server and shell is a high-privilege sink. AgentWall fronts them, allowlists egress, and can drop a third-party server entirely.
      </p>

      <div className="mt-8 grid gap-3">
        {gateways.map((g) => (
          <div key={g.id} className="panel p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-sm font-medium">{g.name}</h2>
                <Badge
                  tone={g.status === "proxied" ? "allow" : g.status === "blocked" ? "block" : "neutral"}
                >
                  {g.status}
                </Badge>
                <Badge tone="ice">{g.transport}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">
                {g.kind} · {g.tools} tools · egress {g.egress}
              </p>
              <p className="mt-1 font-mono text-xs text-subtle">last {formatClock(g.lastCall)}</p>
            </div>
            <div className="flex gap-2">
              {g.status !== "proxied" && (
                <Button variant="outline" size="sm" onClick={() => setStatus(g.id, "proxied")}>
                  Proxy
                </Button>
              )}
              {g.status !== "blocked" && (
                <Button variant="outline" size="sm" onClick={() => setStatus(g.id, "blocked")}>
                  Block
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 panel p-4 sm:p-5">
        <h2 className="text-sm font-medium">Egress allowlist</h2>
        <p className="mt-1 text-sm text-muted">
          curl, wget, and MCP fetches to any other host are blocked. Third-party MCP servers cannot exfiltrate the tree.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EGRESS_ALLOWLIST.map((h) => (
            <span key={h} className="font-mono text-xs px-3 h-8 inline-flex items-center rounded-full bg-elevated text-ice">
              {h}
            </span>
          ))}
        </div>
      </div>
    </Page>
  );
}
