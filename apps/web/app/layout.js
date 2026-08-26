import "./globals.css";

export const metadata = {
  metadataBase: process.env.NEXT_PUBLIC_DOMAIN
    ? new URL(process.env.NEXT_PUBLIC_DOMAIN)
    : undefined,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
