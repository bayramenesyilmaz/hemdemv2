import { cn } from "@/lib/cn";

/** `text-base` gerekçesi için bkz. Input.js — iOS'un otomatik zoom'u. */
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground lg:text-sm",
        className
      )}
      {...props}
    />
  );
}
