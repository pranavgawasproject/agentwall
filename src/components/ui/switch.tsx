import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  className,
  "aria-label": ariaLabel,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center shrink-0 rounded-sm",
        "disabled:opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-10 items-center rounded-full shadow-border transition-[background-color] duration-150 ease-out",
          checked ? "bg-accent" : "bg-elevated",
        )}
      >
        <span
          className={cn(
            "block size-5 rounded-full bg-fg shadow-sm transition-transform duration-150 ease-out",
            checked ? "translate-x-4 bg-accent-fg" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
