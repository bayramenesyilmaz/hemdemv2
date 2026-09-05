import { LOCALES, DEFAULT_LOCALE } from "@/locales/index.js";
import { repositories } from "@/lib/repositories";

const STATIC_PATHS = [
  "",
  "/leaderboard",
  "/tests",
  "/posts",
  "/help",
  "/support",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/forgot-password",
];

export default async function sitemap() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";

  function languagesFor(path) {
    return {
      ...Object.fromEntries(LOCALES.map((l) => [l, `${domain}/${l}${path}`])),
      "x-default": `${domain}/${DEFAULT_LOCALE}${path}`,
    };
  }

  const approvedTests = await repositories.test.findMany({});
  const paths = [...STATIC_PATHS, ...approvedTests.map((test) => `/tests/${test.id}`)];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: `${domain}/${locale}${path}`,
      lastModified: new Date(),
      alternates: { languages: languagesFor(path) },
    }))
  );
}
