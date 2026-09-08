import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallStore } from "@/lib/store";
import { formatClock } from "@/lib/utils";

export const Route = createFileRoute("/snapshots")({ component: SnapshotsPage });

function SnapshotsPage() {
  const snapshots = useWallStore((s) => s.snapshots);
  const take = useWallStore((s) => s.takeSnapshot);
  const restore = useWallStore((s) => s.restoreSnapshot);

  return (
    <Page>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Snapshots</h1>
          <p className="mt-2 text-muted max-w-xl">
            Copy-on-write of the repository and database before an agent starts a task. One click rolls a rogue run back.
          </p>
        </div>
        <Button
          onClick={() => {
            const s = take();
            toast.success(`Snapshot ${s.name} captured`);
          }}
        >
          Take snapshot
        </Button>
      </div>

      <div className="mt-8 grid gap-3">
        {snapshots.map((s) => (
          <div key={s.id} className="panel p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium">{s.name}</h2>
                {s.restored && <Badge tone="allow">restored</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">{s.note}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-subtle">
                <span>{formatClock(s.at)}</span>
                <span className="tabular-nums">{s.files} files</span>
                <span>{s.bytes}</span>
                <span className="tabular-nums">{s.dbTables} tables</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                restore(s.id);
                toast.message(`Rolled back to ${s.name}`);
              }}
            >
              Restore
            </Button>
          </div>
        ))}
      </div>
    </Page>
  );
}
