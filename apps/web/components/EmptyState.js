/**
 * Boş liste durumları için tek tip görünüm (testler, gönderiler,
 * mesajlar, notlar vb. her yerde aynı boşluk hissi).
 */
export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
