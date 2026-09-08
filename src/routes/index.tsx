import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/verdict";
import { useWallStore, statsFrom } from "@/lib/store";
import { formatClock, formatLatency } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Overview });

function Overview() {
  const events = useWallStore((s) => s.events);
  const gateways = useWallStore((s) => s.gateways);
  const vault = useWallStore((s) => s.vault);
  const daemonArmed = useWallStore((s) => s.daemonArmed);
  const stats = statsFrom(events);
  const proxied = gateways.filter((g) => g.status === "proxied").length;
  const chart = buildChart(events);

  return (
    <Page>
      <div className="aw-rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted mb-3">
            <span className={daemonArmed ? "text-allow" : "text-subtle"}>
              {daemonArmed ? "Armed" : "Paused"}
            </span>
            <span className="text-subtle">/</span>
            <span>{proxied} sinks proxied</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Blast radius,
            <br />
            contained.
          </h1>
          <p className="mt-4 text-muted max-w-lg text-pretty">
            AgentWall sits between Cursor, Claude Code, and every MCP or shell sink. Secrets never enter the model. Destructive AST matches never reach the kernel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/intercept">
              Open interceptor
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/intercept">
              <Play className="size-4" /> Overnight demo
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Allowed" value={stats.allowed} hint="forwarded to sink" />
        <Stat label="Blocked" value={stats.blocked} hint="synthetic error" tone="block" />
        <Stat label="Redacted" value={stats.redacted} hint="nonces in context" tone="redact" />
        <Stat label="Leaked" value={stats.leaked} hint="secrets to the model" tone="allow" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Inspection latency</h2>
            <span className="font-mono text-xs text-subtle tabular-nums">
              avg {formatLatency(stats.avg)} · budget 5ms
            </span>
          </div>
          <div className="h-40">
            <Sparkline values={chart.map((d) => d.ms)} />
          </div>
        </div>

        <div className="panel p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-medium">Coverage</h2>
          <Row label="Outbound DLP" value={`${vault.length} live nonces`} />
          <Row label="MCP gateways" value={`${proxied} / ${gateways.length} proxied`} />
          <Row label="CoW snapshots" value="on before unsupervised runs" />
          <div className="flex items-start gap-2 text-sm text-muted pt-1">
            <ShieldCheck className="size-4 mt-0.5 text-allow shrink-0" strokeWidth={1.75} />
            Zero secrets have crossed into model context this session.
          </div>
        </div>
      </div>

      <Architecture />

      <div className="mt-3 panel overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4">
          <h2 className="text-sm font-medium">Recent intercepts</h2>
          <Link to="/audit" className="text-sm text-ice hover:text-fg">
            Full audit
          </Link>
        </div>
        <div className="divide-y divide-border">
          {events.slice(0, 8).map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[7rem_6rem_1fr_auto] gap-3 items-center px-4 sm:px-5 py-3"
            >
              <span className="hidden sm:block font-mono text-xs text-subtle tabular-nums">
                {formatClock(e.at)}
              </span>
              <VerdictBadge verdict={e.verdict} />
              <div className="min-w-0">
                <div className="font-mono text-sm truncate">{e.command}</div>
                <div className="text-xs text-subtle truncate">
                  {e.client} · {e.tool} · {e.summary}
                </div>
              </div>
              <span className="font-mono text-xs text-subtle tabular-nums">
                {formatLatency(e.latencyMs)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "block" | "redact" | "allow";
}) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-subtle uppercase tracking-wider">{label}</div>
      <div
        className={`mt-2 text-3xl font-semibold tabular-nums tracking-tight ${
          tone === "block" ? "text-block" : tone === "redact" ? "text-redact" : "text-fg"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-muted">{hint}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right text-fg">{value}</span>
    </div>
  );
}

function Architecture() {
  const layers = [
    { title: "Transport", copy: "Dual-faced JSON-RPC. Surfaces as an MCP server to the client, owns the real sink as a child." },
    { title: "AST engine", copy: "tree-sitter-grade shell + SQL inspection. Obfuscated pipes, force-pushes, unbounded DML." },
    { title: "Secret vault", copy: "Pattern + entropy DLP. Ephemeral nonces inbound; rehydration only at authorized sinks." },
    { title: "Audit", copy: "Append-only local log. Every frame, decision, and token translation stays on disk." },
  ];
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {layers.map((l, i) => (
        <div key={l.title} className="panel p-4 sm:p-5">
          <div className="font-mono text-xs text-subtle tabular-nums">0{i + 1}</div>
          <h3 className="mt-2 text-base font-medium">{l.title}</h3>
          <p className="mt-2 text-sm text-muted">{l.copy}</p>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 640;
  const h = 160;
  const pad = 10;
  const min = Math.min(...values, 0.2) - 0.35;
  const max = Math.max(...values, 1) + 0.45;
  const span = Math.max(max - min, 0.5);
  const coords = values.map((v, i) => {
    const x = pad + (values.length === 1 ? 0 : (i / (values.length - 1)) * (w - pad * 2));
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return { x, y };
  });
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full text-fg" aria-hidden="true">
      <polygon points={area} fill="currentColor" opacity={0.12} />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

function buildChart(events: { at: string; latencyMs: number }[]) {
  const slice = [...events].slice(0, 14).reverse();
  if (slice.length < 3) {
    return [0.6, 1.1, 0.8, 1.4, 0.9, 2.1, 1.0].map((ms, i) => ({ t: String(i), ms }));
  }
  return slice.map((e, i) => ({ t: String(i), ms: e.latencyMs }));
}
