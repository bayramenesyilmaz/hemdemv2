import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "",
    title: t("home.title"),
    description: t("home.subtitle"),
  });
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
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Hemdem",
      url: domain,
      inLanguage: locale,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Hemdem",
      url: domain,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{t("home.title")}</h1>
      <p className="max-w-xl text-muted-foreground">{t("home.subtitle")}</p>
      <div className="flex gap-3">
        <Button href={`/${locale}/register`} variant="confirm">
          {t("home.ctaRegister")}
        </Button>
        <Button href={`/${locale}/login`} variant="outline">
          {t("home.ctaLogin")}
        </Button>
      </div>
    </main>
  );
}
