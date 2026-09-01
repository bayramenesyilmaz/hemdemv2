# Mağaza Gönderimi — Gizlilik / Veri Güvenliği Kontrol Listesi

Bu dosya kod değil, App Store Connect ve Google Play Console'daki "Privacy
Nutrition Label" / "Data Safety" formlarını doldururken referans alman için.
Uygulama içi gizlilik politikası: web'de `/privacy`, mobilde "Diğer →
Gizlilik Politikası" (`apps/mobile/app/(tabs)/privacy.js`).

## Toplanan veri türleri

| Veri | Toplanır mı | Amaç | Üçüncü tarafla paylaşılır mı |
|---|---|---|---|
| E-posta | Evet | Hesap/kimlik doğrulama | Hayır (sadece Supabase Auth) |
| Ad, doğum tarihi, cinsiyet, ülke, biyografi | Evet | Profil, eşleştirme | Hayır |
| Profil fotoğrafı | Evet (kullanıcı yüklerse) | Profil görünürlüğü | Hayır (Supabase Storage) |
| Sosyal medya bağlantıları | Evet (opsiyonel) | Profil zenginleştirme | Hayır (kullanıcı kendi paylaşır) |
| Test cevapları | Evet | Uyum/benzerlik hesaplama | Hayır |
| Mesajlar | Evet | Uygulama içi mesajlaşma | Hayır |
| Gönderiler/notlar | Evet | Sosyal akış özelliği | Hayır |
| Coin/puan aktivitesi | Evet | Oyunlaştırma (liderlik tablosu) | Hayır |
| Konum | **Hayır** (bkz. plan — konuma göre filtreleme henüz yok) | — | — |
| Reklam/izleme SDK'sı | **Hayır** — "coin kazan" akışı simülasyon, gerçek reklam SDK'sı yok | — | — |
| Analitik/crash reporting SDK'sı | **Hayır** (şu an entegre değil) | — | — |

## Google Play — Data Safety formu için notlar

- "Veriler şifrelenerek aktarılıyor mu" → Evet (HTTPS + Supabase).
- "Kullanıcı veri silme talep edebiliyor mu" → Evet, uygulama içi hesap
  silme var (mobil: Profili Düzenle → Hesabımı Sil; web: aynı yerde).
- Kategoriler: Personal info (isim, e-posta, doğum tarihi), Photos,
  Messages, App activity (test cevapları, coin/puan).
- Üçüncü taraf paylaşımı: yok — "No data shared with third parties"
  seçilebilir (Supabase sadece barındırma sağlayıcısı, veri işleyen sıfatıyla
  ayrı bir "third party" sayılmaz, dilersen Supabase'i "service provider"
  olarak formda ayrıca belirtebilirsin).

## Apple App Store — Privacy Nutrition Label için notlar

- "Data Used to Track You" → Hayır (App Tracking Transparency prompt'u
  gerekmiyor, hiçbir tracking SDK'sı yok).
- "Data Linked to You": Contact Info (email), User Content (fotoğraf,
  mesajlar, gönderiler), Identifiers yok (Supabase Auth UUID kullanıcıya
  gösterilmiyor).
- Guideline 1.2 (User Generated Content) gereği zorunlu olan engelleme +
  şikayet mekanizması artık var (`packages/core/usecases/safety/`) —
  bu maddeyi App Store başvuru formunda "Does your app include
  user-generated content?" → Evet, "content moderation" → engelleme +
  şikayet + admin panelinden inceleme.
- Guideline 5.1.1(v) — hesap oluşturmayı destekleyen app'lerde uygulama
  içi hesap silme zorunlu → hem web hem mobilde var (bkz. yukarı).

## Eksik/ileride tamamlanması gerekenler (bu pass'in kapsamı dışında)

- Gerçek reklam SDK'sı eklenirse (AdMob vb.) bu tablo ve store formları
  güncellenmeli — şu an "coin kazan" tamamen simülasyon.
- Push bildirimleri eklenirse (Expo push token) yeni bir "Device ID/Push
  Token" veri kategorisi bu tabloya eklenmeli.
- `eas.json`'daki `submit.production` boş — gerçek gönderim için doldurman
  gerekenler: `ios.appleId`, `ios.ascAppId`, `ios.appleTeamId` (Apple
  Developer hesabından), `android.serviceAccountKeyPath` (Google Play
  Console'da oluşturacağın bir service-account JSON key'inin yolu). Bunlar
  senin kendi hesap kimlik bilgilerin — Claude bunlara dokunmaz/istemez.
