/**
 * Web'deki (apps/web/app/globals.css) koyu tema token'larının React
 * Native karşılığı — burada bir CSS değişken sistemi yok, ekranlar arası
 * tutarlılık için tek yerden paylaşılıyor. Ton değerleri web'deki HSL
 * paletiyle birebir eşleşecek şekilde hesaplandı (ör. --primary:
 * hsl(350 68% 58%) → #d94861).
 */
export const colors = {
  background: "#121014",
  card: "#1c1a1f",
  cardAlt: "#242127",
  border: "#302d33",
  primary: "#d94861",
  primaryDark: "#b73c52",
  primarySoft: "rgba(217,72,97,0.14)",
  foreground: "#f0eeef",
  // `muted` daha önce buradaki ekranların çoğunda "soluk metin" anlamında
  // kullanılıyordu (ör. alt başlıklar, boş durum yazıları) — tasarım
  // sistemi eklenirken bu kullanım hâlâ birçok dosyada duruyor, o yüzden
  // aynı anlamı koruyoruz. Soluk YÜZEY rengi için ayrı `cardAlt` var.
  muted: "#9d99a3",
  mutedForeground: "#9d99a3",
  mutedDark: "#6f6b74",
  danger: "#dd5555",
  success: "#34d399",
};

/** Web'in --gradient-primary / --gradient-surface karşılığı. */
export const gradients = {
  primary: [colors.primary, colors.primaryDark],
  surface: ["rgba(217,72,97,0.12)", "rgba(217,72,97,0.05)"],
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

/** Koyu zeminde gölge yerine kenarlık ağırlıklı derinlik — web ile aynı yaklaşım. */
export const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};
