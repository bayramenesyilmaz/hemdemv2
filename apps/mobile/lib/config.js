// Web tarafının canlı domaini build zamanında EXPO_PUBLIC_WEB_BASE_URL ile
// enjekte edilir (Expo, NEXT_PUBLIC_* gibi EXPO_PUBLIC_* değişkenlerini
// otomatik inline eder). Ayarlanmamışsa (henüz deploy edilmemiş/yerel
// geliştirme) paylaşım linki oluşturulmaz — kırık bir link paylaşmaktansa
// sadece metin paylaşılır (bkz. lib/share.js).
export const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL || null;
