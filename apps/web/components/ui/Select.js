"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-base text-foreground outline-none transition-colors",
        "hover:border-foreground/20 data-[placeholder]:text-muted-foreground",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
        "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/30",
        "lg:text-sm",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted-foreground transition-transform data-[state=open]:rotate-180">
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path
            d="M4 6l3.5 3.5L11 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "scrollbar-none z-50 max-h-[60dvh] w-[var(--radix-select-trigger-width)] overflow-y-auto overscroll-contain rounded-lg border border-border bg-card text-card-foreground shadow-lg animate-fade-in",
          className
        )}
        position="popper"
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-10 cursor-pointer select-none items-center justify-between gap-2 rounded-md px-3 py-1.5 text-base outline-none",
        "data-[highlighted]:bg-muted data-[state=checked]:font-semibold data-[state=checked]:text-primary",
        "lg:min-h-9 lg:text-sm",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator aria-hidden="true" className="text-primary">
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path
            d="M3 8l3 3 6-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
