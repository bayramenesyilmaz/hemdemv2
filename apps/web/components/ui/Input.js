import { cn } from "@/lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
