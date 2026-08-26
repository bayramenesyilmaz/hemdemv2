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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f12" },
  ],
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
