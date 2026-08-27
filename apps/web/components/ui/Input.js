import { cn } from "@/lib/cn";

/**
 * `text-base` (16px) mobilde bilinçli bir tercih: iOS Safari, yazı boyutu
 * 16px'in altındaki bir alana odaklanıldığında sayfayı otomatik olarak
 * yakınlaştırır ve bu, form/modal açılırken ekranın kaymasına yol açar.
 * Masaüstünde `lg:text-sm` ile eski görsel ölçeğe dönülür.
 */
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "min-h-10 rounded-lg border border-border bg-background px-3 py-1.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 lg:text-sm",
        className
      )}
      {...props}
    />
  );
}
