import Link from "next/link";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { LOCALES, DEFAULT_LOCALE } from "@/locales/index.js";
import { getAuthUserId } from "@/lib/session";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("home.title"),
    description: t("home.subtitle"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
        "x-default": `/${DEFAULT_LOCALE}`,
      },
    },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (userId) {
    redirect(`/${locale}/discover`);
  }

  const t = await getI18n();

  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hemdem",
    url: domain,
    inLanguage: locale,
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{t("home.title")}</h1>
      <p className="max-w-xl text-muted-foreground">{t("home.subtitle")}</p>
      <div className="flex gap-3">
        <Link
          href={`/${locale}/register`}
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground"
        >
          {t("home.ctaRegister")}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="rounded-lg border border-border px-5 py-2.5 font-medium text-foreground"
        >
          {t("home.ctaLogin")}
        </Link>
      </div>
    </main>
  );
}
