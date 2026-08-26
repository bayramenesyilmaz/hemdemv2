import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";

const FAQ_KEYS = ["howMatch", "gateTest", "coins", "guestLikes", "deleteAccount"];

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/help",
    title: t("help.title"),
    description: t("help.contactBody"),
  });
}

export default async function HelpPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`help.faq.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`help.faq.${key}.answer`),
      },
    })),
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageTitle>{t("help.title")}</PageTitle>

      <div className="flex flex-col gap-3">
        {FAQ_KEYS.map((key) => (
          <SectionCard key={key} className="flex flex-col gap-1">
            <p className="font-medium text-foreground">{t(`help.faq.${key}.question`)}</p>
            <p className="text-sm text-muted-foreground">{t(`help.faq.${key}.answer`)}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard className="flex flex-col gap-2">
        <p className="text-foreground">{t("help.contactBody")}</p>
        <Button href={`/${locale}/support`} variant="send" className="self-start">
          {t("help.contactLink")}
        </Button>
      </SectionCard>
    </main>
  );
}
