import { useState } from "react";
import { Play, ScanSearch, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VerdictBadge, verdictColor } from "@/components/verdict";
import { AstTree } from "@/components/ast-tree";
import { cn, formatLatency } from "@/lib/utils";
import { SCENARIOS, OVERNIGHT_SEQUENCE } from "@/lib/engine/samples";
import { useWallStore } from "@/lib/store";
import { inspectWithGrok, type GrokInspection } from "@/lib/analyze";
import type { InterceptResult, Verdict } from "@/lib/engine/types";
import { toast } from "sonner";

const TOOLS = ["bash", "postgres", "write_file"] as const;

export function InterceptPlayground({ initialId }: { initialId?: string }) {
  const runScenario = useWallStore((s) => s.runScenario);
  const runCustom = useWallStore((s) => s.runCustom);
  const lastResult = useWallStore((s) => s.lastResult);
  const takeSnapshot = useWallStore((s) => s.takeSnapshot);
  const sequenceRunning = useWallStore((s) => s.sequenceRunning);
  const setSequenceRunning = useWallStore((s) => s.setSequenceRunning);

  const [selected, setSelected] = useState(initialId ?? "rm-rf");
  const [tool, setTool] = useState<(typeof TOOLS)[number]>("bash");
  const [command, setCommand] = useState(
    SCENARIOS.find((s) => s.id === (initialId ?? "rm-rf"))?.command ?? "rm -rf / --no-preserve-root",
  );
  const [phase, setPhase] = useState<"idle" | "send" | "inspect" | "done">("idle");
  const [grok, setGrok] = useState<GrokInspection | null>(null);
  const [grokBusy, setGrokBusy] = useState(false);
  const [grokError, setGrokError] = useState<string | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === selected);

  function pick(id: string) {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    setSelected(id);
    setCommand(s.command);
    setTool((s.tool as (typeof TOOLS)[number]) || "bash");
    setGrok(null);
    setGrokError(null);
  }

  async function run() {
    setGrok(null);
    setPhase("send");
    await wait(220);
    setPhase("inspect");
    await wait(380);
    if (scenario && command.trim() === scenario.command) runScenario(scenario.id);
    else runCustom(tool, command);
    setPhase("done");
  }

  async function overnight() {
    if (sequenceRunning) {
      setSequenceRunning(false);
      return;
    }
    takeSnapshot("pre-overnight-run");
    setSequenceRunning(true);
    toast("Snapshot taken. Overnight run armed.");
    for (const id of OVERNIGHT_SEQUENCE) {
      if (!useWallStore.getState().sequenceRunning) break;
      pick(id);
      setPhase("send");
      await wait(180);
      setPhase("inspect");
      await wait(320);
      const result = runScenario(id);
      setPhase("done");
      if (result?.verdict === "block") {
        toast.error(`Blocked · ${result.findings[0]?.title ?? result.command}`);
      } else if (result?.verdict === "redact") {
        toast.message(`Redacted ${result.secrets.length} secret${result.secrets.length === 1 ? "" : "s"}`);
      }
      await wait(700);
    }
    setSequenceRunning(false);
    toast.success("Overnight run complete. Secrets leaked to the model: 0.");
  }

  async function askGrok() {
    setGrokBusy(true);
    setGrokError(null);
    try {
      const res = await inspectWithGrok({ data: { command } });
      if (!res.ok) setGrokError(res.error);
      else setGrok(res.inspection);
    } catch {
      setGrokError("Could not reach the inspector.");
    } finally {
      setGrokBusy(false);
    }
  }

  const result = lastResult;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Live interceptor
          </h1>
          <p className="mt-2 text-muted max-w-xl text-pretty">
            Drop a tool call through the wall. AST inspection, DLP, and egress rules decide before anything reaches a sink.
          </p>
        </div>
        <Button variant={sequenceRunning ? "outline" : "default"} onClick={overnight} className="shrink-0">
          {sequenceRunning ? (
            <>
              <Square className="size-4" /> Stop run
            </>
          ) : (
            <>
              <Play className="size-4" /> Overnight run
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s.id)}
            className={cn(
              "shrink-0 h-9 px-3 rounded-full text-sm transition-[background-color,color,box-shadow] duration-150 ease-out",
              selected === s.id
                ? "bg-accent text-accent-fg"
                : "text-muted shadow-border hover:text-fg hover:shadow-border-hover",
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Call</div>
            {scenario && <span className="text-xs text-subtle">{scenario.blurb}</span>}
          </div>
          <div className="flex gap-2">
            {TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                className={cn(
                  "h-9 px-3 rounded-sm text-sm font-mono",
                  tool === t ? "bg-elevated text-fg shadow-border" : "text-muted hover:text-fg",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            rows={5}
            spellCheck={false}
            aria-label="Tool command"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={!command.trim() || sequenceRunning}>
              <Play className="size-4" /> Run through wall
            </Button>
            <Button variant="outline" onClick={askGrok} disabled={grokBusy || !command.trim()}>
              <ScanSearch className="size-4" />
              {grokBusy ? "Inspecting…" : "Inspect with Grok"}
            </Button>
          </div>
          {grokError && <p className="text-sm text-block">{grokError}</p>}
          {grok && <GrokPanel inspection={grok} />}
        </div>

        <Pipeline phase={phase} result={result} />
      </div>

      {result && <ResultDetail result={result} />}
    </div>
  );
}

function GrokPanel({ inspection }: { inspection: GrokInspection }) {
  return (
    <div className="panel-inset p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-subtle uppercase tracking-wider">Grok analysis</span>
        <Badge
          tone={
            inspection.recommendation === "block"
              ? "block"
              : inspection.recommendation === "redact"
                ? "redact"
                : "allow"
          }
        >
          {inspection.recommendation}
        </Badge>
      </div>
      <p className="text-sm text-fg">{inspection.intent}</p>
      <p className="text-xs text-muted">
        Risk {inspection.risk}
        {inspection.obfuscated ? " · obfuscated" : ""}
      </p>
      {inspection.findings.map((f, i) => (
        <div key={i} className="text-sm">
          <div className="font-medium">{f.title}</div>
          <div className="text-muted">{f.detail}</div>
        </div>
      ))}
    </div>
  );
}

function Pipeline({
  phase,
  result,
}: {
  phase: "idle" | "send" | "inspect" | "done";
  result: InterceptResult | null;
}) {
  const verdict: Verdict | null = phase === "done" ? result?.verdict ?? null : null;
  return (
    <div className="panel p-4 sm:p-5">
      <div className="text-sm font-medium mb-4">JSON-RPC path</div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Hop title="Client" sub="Cursor / Claude" active={phase !== "idle"} />
        <Hop
          title="AgentWall"
          sub={phase === "inspect" ? "AST + DLP" : "proxy"}
          active={phase === "inspect" || phase === "done"}
          emphasis
        />
        <Hop
          title={verdict === "block" ? "Blocked" : "Sink"}
          sub={verdict === "block" ? "synthetic error" : "bash / MCP / db"}
          active={phase === "done" && verdict !== "block"}
        />
      </div>
      <div className="relative h-1 mt-4 mb-5 rounded-full bg-elevated overflow-hidden">
        {(phase === "send" || phase === "inspect") && (
          <div className="absolute inset-y-0 w-1/3 bg-fg/70 aw-flow" />
        )}
        {phase === "done" && verdict && (
          <div
            className={cn(
              "absolute inset-y-0 w-full",
              verdict === "block" ? "bg-block/70" : verdict === "redact" ? "bg-redact/70" : "bg-allow/70",
            )}
          />
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {(result?.frames ?? []).map((f) => (
          <div key={f.id} className="panel-inset p-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-xs text-subtle">
                {f.dir === "in" ? "→" : f.dir === "out" ? "←" : "◆"} {f.label}
              </span>
              {f.tone && f.tone !== "info" && <VerdictBadge verdict={f.tone as Verdict} />}
            </div>
            <pre className="font-mono text-xs text-muted whitespace-pre-wrap break-all leading-relaxed">
              {f.body}
            </pre>
          </div>
        ))}
        {!result && <p className="text-sm text-muted">Run a call to see framed JSON-RPC traffic.</p>}
      </div>
    </div>
  );
}

function Hop({
  title,
  sub,
  active,
  emphasis,
}: {
  title: string;
  sub: string;
  active?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md p-3 min-h-20",
        emphasis ? "bg-elevated shadow-border" : "bg-bg shadow-border",
        active && "shadow-border-hover",
      )}
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-subtle mt-1">{sub}</div>
    </div>
  );
}

function ResultDetail({ result }: { result: InterceptResult }) {
  const secrets = result.secrets;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="panel p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Verdict</h2>
          <VerdictBadge verdict={result.verdict} />
        </div>
        <div className={cn("text-3xl font-semibold tabular-nums tracking-tight", verdictColor(result.verdict))}>
          {formatLatency(result.latencyMs)}
        </div>
        <p className="text-sm text-muted">Inspection overhead. Budget is 5ms.</p>
        <div className="space-y-2">
          {result.findings.length === 0 && <p className="text-sm text-muted">No policy findings.</p>}
          {result.findings.map((f) => (
            <div key={f.id} className="panel-inset p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{f.title}</span>
                <span className="font-mono text-xs text-subtle">{f.rule}</span>
              </div>
              <p className="text-sm text-muted mt-1">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="panel p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-medium">AST</h2>
        {result.sqlAst && (
          <div className="font-mono text-xs text-ice mb-2">SQL {result.sqlAst}</div>
        )}
        <AstTree node={result.ast} />
      </div>
      <div className="panel p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-medium">Secrets</h2>
        {secrets.length === 0 && <p className="text-sm text-muted">No credentials in this payload.</p>}
        {secrets.map((s) => (
          <div key={s.token} className="panel-inset p-3">
            <div className="text-sm font-medium">{s.label}</div>
            <div className="font-mono text-xs text-redact mt-1 break-all">{s.token}</div>
            <div className="font-mono text-xs text-subtle mt-1 break-all">
              {s.value.length > 28 ? `${s.value.slice(0, 14)}…${s.value.slice(-8)}` : s.value}
            </div>
          </div>
        ))}
        {result.verdict === "redact" && result.redactedOutput && (
          <pre className="font-mono text-xs text-muted whitespace-pre-wrap break-all panel-inset p-3 max-h-40 overflow-auto">
            {result.redactedOutput}
          </pre>
        )}
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
