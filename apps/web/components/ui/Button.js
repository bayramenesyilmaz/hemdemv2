import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none";

const VARIANTS = {
  add: "bg-primary text-primary-foreground hover:opacity-90",
  confirm: "bg-primary text-primary-foreground hover:opacity-90",
  edit: "bg-secondary text-secondary-foreground hover:opacity-90",
  send: "bg-primary text-primary-foreground hover:opacity-90",
  delete: "bg-destructive text-destructive-foreground hover:opacity-90",
  outline: "border border-border text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  link: "text-foreground underline underline-offset-4 px-0 py-0",
};

/**
 * Plan'da (bölüm 7) tanımlı buton varyantları: add/confirm/delete/edit/
 * send/outline/ghost/link. `href` verilirse `next/link` ile navigasyon
 * butonu, verilmezse normal `<button>` render eder.
 *
 * `forwardRef` kullanıyor çünkü Radix `asChild` (Dialog tetikleyicileri
 * vb.) ref'i doğrudan alttaki DOM elementine iletebilmek için buna
 * ihtiyaç duyar.
 */
export const Button = forwardRef(function Button(
  { variant = "confirm", className, href, ...props },
  ref
) {
  const classes = cn(BASE, VARIANTS[variant], className);

  if (href) {
    return <Link href={href} className={classes} ref={ref} {...props} />;
  }

  return <button type="button" className={classes} ref={ref} {...props} />;
});
