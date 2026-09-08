import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto w-full", className)}>
      {children}
    </div>
  );
}
