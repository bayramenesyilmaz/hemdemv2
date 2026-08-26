import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";

export function generateStaticParams() {
  return getStaticParams();
}

export default function LocaleLayout({ children, params: { locale } }) {
  setStaticParamsLocale(locale);

  return (
    <I18nProviderClient locale={locale}>
      <div className="min-h-screen">{children}</div>
    </I18nProviderClient>
  );
}
