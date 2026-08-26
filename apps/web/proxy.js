import { createI18nMiddleware } from "next-international/middleware";
import { LOCALES, DEFAULT_LOCALE } from "./locales/index.js";

const I18nMiddleware = createI18nMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

export function proxy(request) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
