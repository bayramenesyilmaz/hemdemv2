import { NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import { LOCALES, DEFAULT_LOCALE } from "./locales/index.js";
import { MOCK_SESSION_COOKIE } from "./lib/constants.js";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const I18nMiddleware = createI18nMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

const PROTECTED_SEGMENTS = ["onboarding", "profile", "likes", "messages", "notes", "coins"];

/**
 * Optimistic kontrol: `@supabase/ssr` oturum cookie'sini `sb-<project-ref>-auth-token`
 * adıyla (büyük tokenlar için `.0`/`.1` parçalarıyla) saklar. Burada sadece
 * cookie'nin varlığına bakılır — geçerliliği (süresi dolmuş vb.) sayfa
 * tarafında `getAuthUserId()` ile otoriter olarak doğrulanır. Bu iki
 * katmanlı yaklaşım (Proxy: hızlı/optimistic, DAL: otoriter) Next.js'in
 * kendi önerdiği desendir; ayrıca Proxy'de üretilen gerçek 307, sayfa
 * içinden atılan `redirect()`'in streaming context'te bir HTML meta-refresh'e
 * düşmesini (yaygın durum için) önler.
 */
function hasSupabaseSession(request) {
  if (USE_MOCK_DATA) {
    return Boolean(request.cookies.get(MOCK_SESSION_COOKIE)?.value);
  }
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const locale = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (locale) {
    const rest = pathname === `/${locale}` ? "/" : pathname.slice(locale.length + 1);
    const isProtected = PROTECTED_SEGMENTS.some(
      (segment) => rest === `/${segment}` || rest.startsWith(`/${segment}/`)
    );

    if (isProtected && !hasSupabaseSession(request)) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl));
    }
  }

  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
