import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/verdict";
import { useWallStore } from "@/lib/store";
import { formatClock, formatLatency } from "@/lib/utils";
import type { Verdict } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({ component: AuditPage });

const FILTERS: (Verdict | "all")[] = ["all", "block", "redact", "allow", "rehydrate"];

function AuditPage() {
  const events = useWallStore((s) => s.events);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filter !== "all" && e.verdict !== filter) return false;
      if (!q.trim()) return true;
      const hay = `${e.command} ${e.tool} ${e.client} ${e.summary}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [events, q, filter]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentwall-audit.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-2 text-muted max-w-xl">
            Append-only intercepts for this session. Every RPC, decision, and token swap.
          </p>
        </div>
        <Button variant="outline" onClick={exportJson}>
          Export JSON
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search command, tool, client…"
          aria-label="Search audit"
        />
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-11 px-3 rounded-sm text-sm capitalize shrink-0",
                filter === f ? "bg-elevated text-fg shadow-border" : "text-muted hover:text-fg",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 panel divide-y divide-border">
        {filtered.length === 0 && (
          <p className="p-6 text-sm text-muted">No events match that filter.</p>
        )}
        {filtered.map((e) => {
          const expanded = open === e.id;
          return (
            <div key={e.id}>
              <button
                type="button"
                className="w-full text-left px-4 sm:px-5 py-3 grid grid-cols-[auto_1fr_auto] gap-3 items-center"
                onClick={() => setOpen(expanded ? null : e.id)}
              >
                <VerdictBadge verdict={e.verdict} />
                <div className="min-w-0">
                  <div className="font-mono text-sm truncate">{e.command}</div>
                  <div className="text-xs text-subtle">
                    {formatClock(e.at)} · {e.client} · {e.tool}
                  </div>
                </div>
                <span className="font-mono text-xs text-subtle tabular-nums">
                  {formatLatency(e.latencyMs)}
                </span>
              </button>
              {expanded && (
                <div className="px-4 sm:px-5 pb-4 space-y-2">
                  <p className="text-sm text-muted">{e.summary}</p>
                  {e.findings.map((f) => (
                    <div key={f.id} className="panel-inset p-3">
                      <div className="text-sm font-medium">{f.title}</div>
                      <div className="text-sm text-muted mt-1">{f.detail}</div>
                      <div className="font-mono text-xs text-subtle mt-1">{f.rule}</div>
                    </div>
                  ))}
                  {e.secrets > 0 && (
                    <p className="text-sm text-redact">{e.secrets} secret(s) translated</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
