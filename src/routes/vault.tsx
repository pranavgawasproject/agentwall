import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { useWallStore } from "@/lib/store";
import { formatClock } from "@/lib/utils";

export const Route = createFileRoute("/vault")({ component: VaultPage });

function VaultPage() {
  const vault = useWallStore((s) => s.vault);

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Secret vault</h1>
      <p className="mt-2 text-muted max-w-xl">
        Tool results are scanned before they hit the model. Hits become deterministic nonces. The real value is rehydrated only when an authorized sink needs it.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <div className="text-xs text-subtle uppercase tracking-wider">Live tokens</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{vault.length}</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-subtle uppercase tracking-wider">Hits this session</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {vault.reduce((a, v) => a + v.hits, 0)}
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-subtle uppercase tracking-wider">Leaked to model</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-allow">0</div>
        </div>
      </div>

      <div className="mt-3 panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-subtle uppercase tracking-wider">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Token</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Preview</th>
              <th className="px-4 py-3 font-medium">Hits</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {vault.map((v) => (
              <tr key={v.token} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-redact break-all">{v.token}</td>
                <td className="px-4 py-3">
                  <Badge tone="redact">{v.label}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-subtle hidden sm:table-cell">
                  {v.preview}
                </td>
                <td className="px-4 py-3 tabular-nums">{v.hits}</td>
                <td className="px-4 py-3 font-mono text-xs text-subtle hidden md:table-cell tabular-nums">
                  {formatClock(v.lastSeen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="panel p-4 sm:p-5">
          <h2 className="text-sm font-medium">Outbound masking</h2>
          <p className="mt-2 text-sm text-muted">
            A <span className="font-mono text-fg">cat .env</span> is allowed so the agent can keep working. The result the model sees is only nonces. Prompt injection cannot exfiltrate what it never received.
          </p>
        </div>
        <div className="panel p-4 sm:p-5">
          <h2 className="text-sm font-medium">Inbound rehydration</h2>
          <p className="mt-2 text-sm text-muted">
            When the model calls Stripe with <span className="font-mono text-fg">__SECRET_TOKEN_A8F1__</span>, AgentWall restores the live key at the sink — and only if the host is on the egress allowlist.
          </p>
        </div>
      </div>
    </Page>
  );
}
