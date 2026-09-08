import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-fg", className)}
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="3.2" height="20" rx="0.6" fill="currentColor" opacity="0.95" />
      <rect x="8.2" y="9" width="3.2" height="17" rx="0.6" fill="currentColor" opacity="0.78" />
      <rect x="13.4" y="4" width="3.2" height="22" rx="0.6" fill="currentColor" />
      <rect x="20.6" y="9" width="3.2" height="17" rx="0.6" fill="currentColor" opacity="0.78" />
      <rect x="25.8" y="6" width="3.2" height="20" rx="0.6" fill="currentColor" opacity="0.95" />
    </svg>
  );
}

export function LogoWord({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <LogoMark className="size-7 shrink-0" />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-semibold tracking-tight">AgentWall</div>
          <div className="text-xs text-subtle tracking-wide">Zero-trust runtime</div>
        </div>
      )}
    </div>
  );
}
