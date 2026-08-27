import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Sayfa içi ikincil gezinme. Altı çizili düz linkler yerine dokunması
 * kolay hap biçimli çipler — mobilde 44px'lik dokunma hedefini korur ve
 * taşarsa yatayda kayar (dikeyde sarmaz).
 *
 * @param {{ items: { href: string, label: string }[], className?: string }} props
 */
export function SubNav({ items, className }) {
  return (
    <nav className={cn("scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex min-h-11 shrink-0 items-center rounded-full bg-gradient-surface px-4 text-sm font-medium text-foreground shadow-soft transition-transform active:scale-95"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
