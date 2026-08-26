/**
 * Sayfa başlığı ve (varsa) sağdaki birincil aksiyon. Mobilde başlık
 * biraz küçülür ve aksiyon dar ekranlarda alta sarabilir — aksi halde
 * "Filtrele + Test Oluştur" gibi iki butonlu başlıklar taşıyordu.
 */
export function PageTitle({ children, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-bold text-foreground lg:text-2xl">{children}</h1>
      {action}
    </div>
  );
}
