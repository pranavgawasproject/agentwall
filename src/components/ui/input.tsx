import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-border placeholder:text-subtle transition-[box-shadow] duration-150 ease-out focus-visible:shadow-border-hover disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-sm bg-elevated px-3 py-2.5 font-mono text-sm text-fg shadow-border placeholder:text-subtle transition-[box-shadow] duration-150 ease-out focus-visible:shadow-border-hover disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
