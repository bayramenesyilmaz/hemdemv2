// Vercel, `next build`'i çalıştıran Node sürecine `VERCEL_ENV`'i her zaman
// (NEXT_PUBLIC_ öneki olmadan, panel ayarından bağımsız) enjekte eder. Bu,
// mock veri anahtarının .env dosyasında/Vercel panelinde yanlışlıkla "true"
// bırakılması durumunda bile PRODUCTION build'inde asla mock veriye
// dönmeyeceğini garanti eden tek yer — aksi halde gerçek kullanıcılar
// birbirini göremez hale gelebilir (bkz. keşfette kaydırılmayan kullanıcı
// hatası). Local/preview'da (VERCEL_ENV production değilken) .env'deki
// değer olduğu gibi kullanılır, böylece geliştirme sırasında mock modu
// serbestçe test edilebilir.
const isVercelProduction = process.env.VERCEL_ENV === "production";
const useMockData = !isVercelProduction && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@hemdem/core"],
  // Next.js'in sol altta gösterdiği geliştirme rotası göstergesi (sadece
  // `next dev`'de görünür) tam ekran modallerin (ör. kapı testi seçici)
  // alt kısmındaki içeriğin üzerine biniyordu — üretim build'ini hiç
  // etkilemiyor, sadece yerel geliştirmede kafa karıştırıyordu.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Varsayılan 1MB, kırpılmamış bir profil fotoğrafı için genelde
      // yetmiyor (avatar yükleme server action'a çevrildi, bkz.
      // profileActions.js) — istemci tarafında da 5MB sınırı var, burada
      // multipart form-data'nın ekstra baytları için biraz pay bırakılıyor.
      bodySizeLimit: "6mb",
    },
  },
  env: {
    NEXT_PUBLIC_USE_MOCK_DATA: useMockData ? "true" : "false",
  },
  // Gerçek kullanıcı verisiyle çalışmadan önce eklenen minimum güvenlik
  // başlıkları — tam bir CSP (Content-Security-Policy) bilinçli olarak
  // dahil edilmedi: next/image, service worker (PWA) ve Turbopack'in dev
  // overlay'i gibi mevcut parçaları kırma riski taşıyor, kapsamlı test
  // gerektiriyor. Bunlar hiçbir mevcut özelliği bozmayan, güvenli
  // varsayılanlar.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
