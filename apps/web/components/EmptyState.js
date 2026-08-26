/**
 * Boş liste durumları için tek tip görünüm (testler, gönderiler,
 * mesajlar, notlar vb. her yerde aynı boşluk hissi). `icon` verilirse
 * üstte yumuşak bir daire içinde gösterilir — düz metinden çok daha
 * sıcak bir boş ekran verir.
 */
export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-gradient-surface px-6 py-12 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-primary shadow-soft">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
