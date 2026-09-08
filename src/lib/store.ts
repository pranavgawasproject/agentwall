import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuditEvent,
  Gateway,
  InterceptResult,
  Policy,
  Snapshot,
  VaultEntry,
} from "@/lib/engine/types";
import { DEFAULT_POLICIES } from "@/lib/engine/policies";
import {
  SEED_EVENTS,
  SEED_GATEWAYS,
  SEED_SNAPSHOTS,
  SEED_VAULT,
  SCENARIOS,
} from "@/lib/engine/samples";
import { intercept, makeCall } from "@/lib/engine/inspect";
import { previewSecret } from "@/lib/engine/secrets";
import { uid } from "@/lib/utils";

type WallState = {
  policies: Policy[];
  events: AuditEvent[];
  vault: VaultEntry[];
  snapshots: Snapshot[];
  gateways: Gateway[];
  daemonArmed: boolean;
  lastResult: InterceptResult | null;
  sequenceRunning: boolean;
  hydrated: boolean;
  togglePolicy: (id: string) => void;
  setPolicyAction: (id: string, action: Policy["action"]) => void;
  setDaemon: (armed: boolean) => void;
  setGatewayStatus: (id: string, status: Gateway["status"]) => void;
  runScenario: (scenarioId: string) => InterceptResult | null;
  runCustom: (tool: string, command: string) => InterceptResult;
  ingestResult: (result: InterceptResult, client: string) => void;
  takeSnapshot: (name?: string) => Snapshot;
  restoreSnapshot: (id: string) => void;
  resetDemo: () => void;
  setHydrated: () => void;
  setSequenceRunning: (v: boolean) => void;
};

function resultToEvent(result: InterceptResult, client: string): AuditEvent {
  return {
    id: result.id,
    at: result.at,
    tool: result.tool,
    command: result.command,
    verdict: result.verdict,
    latencyMs: result.latencyMs,
    summary:
      result.verdict === "block"
        ? result.findings[0]?.rule ?? "blocked"
        : result.verdict === "redact"
          ? `${result.secrets.length} secret${result.secrets.length === 1 ? "" : "s"} redacted`
          : result.verdict === "rehydrate"
            ? "tokens rehydrated at sink"
            : "Forwarded",
    findings: result.findings,
    secrets: result.secrets.length,
    client,
  };
}

function mergeVault(vault: VaultEntry[], result: InterceptResult): VaultEntry[] {
  if (!result.secrets.length) return vault;
  const next = [...vault];
  for (const s of result.secrets) {
    const idx = next.findIndex((v) => v.token === s.token);
    if (idx >= 0) {
      next[idx] = {
        ...next[idx],
        hits: next[idx].hits + 1,
        lastSeen: result.at,
      };
    } else {
      next.unshift({
        token: s.token,
        kind: s.kind,
        label: s.label,
        lastSeen: result.at,
        hits: 1,
        preview: previewSecret(s.value),
      });
    }
  }
  return next;
}

const initial = {
  policies: DEFAULT_POLICIES,
  events: SEED_EVENTS,
  vault: SEED_VAULT,
  snapshots: SEED_SNAPSHOTS,
  gateways: SEED_GATEWAYS,
  daemonArmed: true,
  lastResult: null as InterceptResult | null,
  sequenceRunning: false,
  hydrated: false,
};

export const useWallStore = create<WallState>()(
  persist(
    (set, get) => ({
      ...initial,
      togglePolicy: (id) =>
        set({
          policies: get().policies.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
        }),
      setPolicyAction: (id, action) =>
        set({
          policies: get().policies.map((p) => (p.id === id ? { ...p, action } : p)),
        }),
      setDaemon: (armed) => set({ daemonArmed: armed }),
      setGatewayStatus: (id, status) =>
        set({
          gateways: get().gateways.map((g) => (g.id === id ? { ...g, status } : g)),
        }),
      ingestResult: (result, client) => {
        const event = resultToEvent(result, client);
        set({
          lastResult: result,
          events: [event, ...get().events].slice(0, 200),
          vault: mergeVault(get().vault, result),
        });
      },
      runScenario: (scenarioId) => {
        const s = SCENARIOS.find((x) => x.id === scenarioId);
        if (!s) return null;
        const call = makeCall(s.tool, s.command, s.extraArgs);
        const result = intercept({
          call,
          policies: get().policies,
          vault: get().vault,
          rawOutput: s.rawOutput,
        });
        get().ingestResult(result, s.client);
        return result;
      },
      runCustom: (tool, command) => {
        const call = makeCall(tool, command);
        const rawOutput = guessOutput(command);
        const result = intercept({
          call,
          policies: get().policies,
          vault: get().vault,
          rawOutput,
        });
        get().ingestResult(result, "Playground");
        return result;
      },
      takeSnapshot: (name) => {
        const snap: Snapshot = {
          id: uid("snap"),
          name: name ?? `manual-${new Date().toISOString().slice(11, 19).replace(/:/g, "")}`,
          at: new Date().toISOString(),
          files: 412 + Math.floor(Math.random() * 8),
          bytes: "18.5 MB",
          dbTables: 24,
          note: "Copy-on-write snapshot of repository + database.",
        };
        set({ snapshots: [snap, ...get().snapshots] });
        return snap;
      },
      restoreSnapshot: (id) => {
        set({
          snapshots: get().snapshots.map((s) => (s.id === id ? { ...s, restored: true } : { ...s, restored: false })),
        });
      },
      resetDemo: () =>
        set({
          ...initial,
          hydrated: true,
          lastResult: null,
        }),
      setHydrated: () => set({ hydrated: true }),
      setSequenceRunning: (v) => set({ sequenceRunning: v }),
    }),
    {
      name: "agentwall-v1",
      skipHydration: true,
      partialize: (s) => ({
        policies: s.policies,
        events: s.events.slice(0, 80),
        vault: s.vault,
        snapshots: s.snapshots,
        gateways: s.gateways,
        daemonArmed: s.daemonArmed,
      }),
    },
  ),
);

function guessOutput(command: string) {
  if (/cat\s+.*\.env/.test(command)) {
    return `OPENAI_API_KEY=sk-proj-AGENTWALLDEMO000000000000000000000000
DATABASE_URL=postgres://nova:p9sW0rd-demo@db.internal:5432/app`;
  }
  if (/cat\s+.*id_/.test(command)) {
    return `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDemoKeyMaterialNotReal000000000000000000000000000==
-----END OPENSSH PRIVATE KEY-----`;
  }
  if (/^ls\b/.test(command.trim())) {
    return `app.tsx\nlib\nroutes\nstyles.css`;
  }
  if (/git status/.test(command)) {
    return `On branch main\nnothing to commit, working tree clean`;
  }
  if (/^SELECT/i.test(command.trim())) {
    return `id | email\n----+------------------\n 1 | founder@agentwall.dev\n(1 row)`;
  }
  return "exit 0";
}

export function statsFrom(events: AuditEvent[]) {
  const allowed = events.filter((e) => e.verdict === "allow" || e.verdict === "rehydrate").length;
  const blocked = events.filter((e) => e.verdict === "block").length;
  const redacted = events.filter((e) => e.verdict === "redact").length;
  const leaked = 0;
  const avg =
    events.length === 0 ? 0 : events.reduce((a, e) => a + e.latencyMs, 0) / events.length;
  return { allowed, blocked, redacted, leaked, avg, total: events.length };
}
