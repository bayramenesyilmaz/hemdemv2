import "server-only";
import { countUnreadNotifications } from "@hemdem/core/usecases/notifications/countUnreadNotifications";
import { fetchNotifications } from "@hemdem/core/usecases/notifications/fetchNotifications";
import { repositories } from "@/lib/repositories";

/**
 * Bildirim okumaları uygulama kabuğunun (header rozeti) ve bildirimler
 * sayfasının render'ını bloke eder — biri hata fırlatırsa Next.js tüm
 * `(app)` layout'unu 500'e düşürür, yani mesajlar, testler, gönderiler
 * dahil TÜM sayfalar erişilemez olur.
 *
 * En olası hata kaynağı: `notifications` tablosunun gerçek Supabase
 * projesine migration 0003 ile eklenmemiş olması (bkz. supabase/README.md).
 * Bu iki fonksiyon o hatayı sunucu loglarına yazıp güvenli bir varsayılana
 * düşerek uygulamanın geri kalanını ayakta tutar; asıl çözüm yine de
 * migration'ı gerçek projeye uygulamaktır.
 */
export async function safeCountUnreadNotifications(userId) {
  try {
    return await countUnreadNotifications(repositories, userId);
  } catch (error) {
    console.error("[notifications] unread count okunamadı, muhtemelen migration 0003 eksik:", error);
    return 0;
  }
}

export async function safeFetchNotifications(userId) {
  try {
    return await fetchNotifications(repositories, userId);
  } catch (error) {
    console.error("[notifications] liste okunamadı, muhtemelen migration 0003 eksik:", error);
    return { status: "error", data: [] };
  }
}
