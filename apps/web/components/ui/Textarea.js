import { cn } from "@/lib/cn";

/** `text-base` gerekçesi için bkz. Input.js — iOS'un otomatik zoom'u. */
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-10 rounded-lg border border-border bg-background px-3 py-1.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 lg:text-sm",
        className
      )}
      {...props}
    />
  );
}
