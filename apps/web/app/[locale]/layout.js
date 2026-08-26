import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function generateStaticParams() {
  return getStaticParams();
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  return (
    <I18nProviderClient locale={locale}>
      <div className="min-h-screen">
        <header className="flex justify-end p-4">
          <LocaleSwitcher />
        </header>
        {children}
      </div>
    </I18nProviderClient>
  );
}
