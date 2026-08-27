import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata = {
  metadataBase: process.env.NEXT_PUBLIC_DOMAIN
    ? new URL(process.env.NEXT_PUBLIC_DOMAIN)
    : undefined,
  appleWebApp: {
    capable: true,
    title: "Hemdem",
    statusBarStyle: "default",
  },
};

/**
 * `viewportFit: "cover"` olmadan `env(safe-area-inset-*)` değerleri her
 * zaman 0 döner — çentikli ekranlarda alt navigasyonun home indicator'ın
 * altında kalmaması buna bağlı.
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Mobil klavye açıldığında layout viewport'u (ve dolayısıyla dvh
  // birimlerini) küçültür; bu olmadan `fixed bottom-0` sheet'ler klavyenin
  // arkasında, görünmez halde kalıyordu.
  interactiveWidget: "resizes-content",
  // Uygulamanın tek teması koyu (bkz. globals.css) — sistem tercihine göre
  // değişen iki ayrı renk yerine tarayıcı kromu her zaman bu tonla eşleşir.
  themeColor: "#0e0e11",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
