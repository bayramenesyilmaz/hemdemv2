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
        "min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground lg:text-sm",
        className
      )}
      {...props}
    />
  );
}
