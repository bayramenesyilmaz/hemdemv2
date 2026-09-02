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

/**
 * Açık (light) kırmızı-beyaz tema paleti — web'deki
 * :root[data-theme="light"] ile aynı ton değerleri. Koyu tema (yukarıdaki
 * `colors`) varsayılan kalıyor; bu sadece ThemeContext.js üzerinden
 * kullanıcının bilinçli seçimiyle açılıyor.
 */
export const lightColors = {
  background: "#ffffff",
  card: "#fafafa",
  cardAlt: "#f1f1f3",
  border: "#e2e1e5",
  primary: "#c81e3f",
  primaryDark: "#a01732",
  primarySoft: "rgba(200,30,63,0.1)",
  foreground: "#1c1a1f",
  muted: "#6b6870",
  mutedForeground: "#6b6870",
  mutedDark: "#8f8c93",
  danger: "#c8283f",
  success: "#1f9d6c",
};

export const lightGradients = {
  primary: [lightColors.primary, lightColors.primaryDark],
  surface: ["rgba(200,30,63,0.08)", "rgba(200,30,63,0.03)"],
};

/**
 * Manrope (expo-google-fonts/manrope ile yüklenir, bkz. app/_layout.js) —
 * sistem fontu yerine daha geometrik/modern bir görünüm. Bu turda sadece
 * en çok kullanılan kabuk bileşenlerine (AppTopBar, alt sekme çubuğu,
 * Button, Card, Screen) uygulanıyor; ekran ekran tam kapsama ayrı bir tur.
 */
export const fontFamily = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
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
