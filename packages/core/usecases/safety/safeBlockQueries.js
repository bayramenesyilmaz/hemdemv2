/**
 * `user_blocks` tablosu migration 0006 ile eklendi — gerçek Supabase
 * projesine bu migration henüz uygulanmamışsa bu sorgular hata fırlatır.
 * Keşfet/mesajlar/beğeniler gibi ana sayfaların salt bu eksik migration
 * yüzünden tamamen çökmesini önlemek için (bkz. CLAUDE.md'deki "hataya
 * dayanıklı yan etki" deseni — aynı yaklaşım daha önce notifications
 * tablosu için de uygulanmıştı, bkz. apps/web/lib/notifications.js)
 * hata yutulup güvenli varsayılana düşülür: engelleme özelliği henüz
 * hiç kullanılmamış demektir, boş liste/false dönmek yanlış bir
 * engellemeye yol açmaz — sadece henüz var olmayan engellemeler
 * filtrelenmemiş olur.
 */
export async function safeFindRelatedBlockIds(repositories, userId) {
  try {
    return await repositories.block.findRelatedIds(userId);
  } catch (error) {
    console.error("[safety] engelleme listesi okunamadı, muhtemelen migration 0006 eksik:", error);
    return [];
  }
}

export async function safeIsBlocked(repositories, blockerId, blockedId) {
  try {
    return await repositories.block.exists(blockerId, blockedId);
  } catch (error) {
    console.error("[safety] engelleme kontrolü okunamadı, muhtemelen migration 0006 eksik:", error);
    return false;
  }
}
