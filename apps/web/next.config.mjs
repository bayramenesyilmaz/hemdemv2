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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_USE_MOCK_DATA: useMockData ? "true" : "false",
  },
};

export default nextConfig;
