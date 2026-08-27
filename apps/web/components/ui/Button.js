import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * `min-h-11` (44px) dokunmatik hedef alt sınırıdır (WCAG 2.5.8 / iOS
 * HIG). `active:scale-[0.97]` mobilde dokunma geri bildirimi verir —
 * hover'ı olmayan cihazlarda butonun "bastım" hissini karşılar.
 */
/**
 * Disabled durumu opacity ile değil sabit renklerle işaretlenir: koyu
 * zeminde opacity azaltmak, kontrastı VEREN şeyin (beyaz metnin
 * parlaklığının) ta kendisini siliyor ve "Paylaş" gibi butonlar okunaksız
 * koyu bir leke hâline geliyordu. `!` ile zorlanan sabit renkler, hangi
 * varyant olursa olsun (gradyan dahil) aynı okunaklı gri disabled hâlini
 * garanti eder.
 */
const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
  "transition-all duration-150 active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:active:scale-100 " +
  "disabled:!bg-none disabled:!bg-muted disabled:!text-muted-foreground disabled:!shadow-none disabled:!border-transparent " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const VARIANTS = {
  add: "bg-gradient-primary text-primary-foreground shadow-card hover:shadow-float hover:brightness-105",
  confirm:
    "bg-gradient-primary text-primary-foreground shadow-card hover:shadow-float hover:brightness-105",
  send: "bg-gradient-primary text-primary-foreground shadow-card hover:shadow-float hover:brightness-105",
  edit: "bg-secondary text-secondary-foreground shadow-soft hover:opacity-90",
  delete: "bg-destructive text-destructive-foreground shadow-soft hover:brightness-110",
  outline: "border border-border bg-card text-foreground shadow-soft hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  link: "min-h-0 px-0 py-0 font-medium text-primary underline underline-offset-4 hover:opacity-80 active:scale-100",
};

/**
 * Plan'da (bölüm 7) tanımlı buton varyantları. `href` verilirse
 * `next/link` ile navigasyon butonu, verilmezse normal `<button>`.
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
