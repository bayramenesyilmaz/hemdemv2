/**
 * Sadece gerçekten gerekli olduğu sayfalarda kullanılır (plan bölüm 6) —
 * çoğu iç sayfada navigasyon zaten bağlamı verdiği için ayrı bir başlık
 * bloğu gerekmez.
 */
export function PageTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-foreground">{children}</h1>
      {action}
    </div>
  );
}
