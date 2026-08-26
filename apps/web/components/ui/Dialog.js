"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const VARIANTS = {
  /**
   * Mobilde alt taraftan açılan sayfa (bottom sheet), `lg:`'den itibaren
   * ortalanmış kart. Mobil uygulama hissi için varsayılan budur.
   */
  sheet: cn(
    "fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto overscroll-contain",
    "rounded-t-2xl border border-border bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-card-foreground shadow-2xl",
    "animate-sheet-in",
    "lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-full lg:max-w-md",
    "lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:p-6 lg:animate-dialog-in"
  ),
  /** Tam ekran (navigasyon menüsü gibi). */
  full: cn(
    "fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-background",
    "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
    "animate-sheet-in lg:animate-dialog-in"
  ),
};

export function DialogContent({ className, variant = "sheet", children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 animate-fade-in" />
      <DialogPrimitive.Content className={cn(VARIANTS[variant], className)} {...props}>
        {variant === "sheet" && (
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border lg:hidden"
          />
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
