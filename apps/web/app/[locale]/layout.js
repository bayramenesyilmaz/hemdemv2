import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";

export function generateStaticParams() {
  return getStaticParams();
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}
