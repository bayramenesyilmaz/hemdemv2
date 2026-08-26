/**
 * Bilgilendirme amaçlı, nötr bir banner — marka rengi kırmızı olduğu
 * için hata/destructive ile karışmasın diye bilerek `muted` tonlarını
 * kullanır (bkz. plan bölüm 7).
 */
export function InfoBanner({ children }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
