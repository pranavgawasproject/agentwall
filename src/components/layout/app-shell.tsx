import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Camera,
  KeyRound,
  Menu,
  Network,
  ScrollText,
  Settings2,
  Shield,
  Terminal,
  X,
} from "lucide-react";
import { LogoWord } from "./logo";
import { cn } from "@/lib/utils";
import { useWallStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

const NAV = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/intercept", label: "Intercept", icon: Terminal },
  { to: "/policies", label: "Policies", icon: Shield },
  { to: "/vault", label: "Vault", icon: KeyRound },
  { to: "/audit", label: "Audit", icon: ScrollText },
  { to: "/snapshots", label: "Snapshots", icon: Camera },
  { to: "/gateways", label: "Gateways", icon: Network },
  { to: "/config", label: "Config", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const daemonArmed = useWallStore((s) => s.daemonArmed);
  const setDaemon = useWallStore((s) => s.setDaemon);
  const setHydrated = useWallStore((s) => s.setHydrated);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void useWallStore.persist.rehydrate();
    setHydrated();
  }, [setHydrated]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-bg sticky top-0 h-dvh">
        <div className="px-4 h-16 flex items-center">
          <Link to="/" className="min-w-0">
            <LogoWord />
          </Link>
        </div>
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-sm px-3 h-11 text-sm transition-[background-color,color] duration-150 ease-out",
                  active ? "bg-elevated text-fg" : "text-muted hover:text-fg hover:bg-elevated/60",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 m-2 panel-inset">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-subtle">Daemon</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    daemonArmed ? "bg-allow aw-pulse" : "bg-subtle",
                  )}
                />
                {daemonArmed ? "Armed" : "Paused"}
              </div>
            </div>
            <Switch checked={daemonArmed} onCheckedChange={setDaemon} aria-label="Toggle daemon" />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-bg/95 px-3 backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-2">
            <LogoWord />
          </Link>
          <button
            type="button"
            className="size-11 inline-flex items-center justify-center rounded-sm text-fg"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {open && (
          <div className="md:hidden border-b border-border bg-surface px-2 py-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 h-12 text-sm",
                    active ? "bg-elevated text-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
            <div className="flex items-center justify-between px-3 h-12">
              <span className="text-sm text-muted">Daemon {daemonArmed ? "armed" : "paused"}</span>
              <Switch checked={daemonArmed} onCheckedChange={setDaemon} aria-label="Toggle daemon" />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
