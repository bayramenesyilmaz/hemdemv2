import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";

const SECTION_KEYS = [
  "service",
  "ageRequirement",
  "account",
  "content",
  "moderation",
  "virtualGoods",
  "liability",
  "changes",
  "contact",
];

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/terms",
    title: t("terms.title"),
    description: t("terms.intro"),
  });
}

export default async function TermsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("terms.title")}</PageTitle>

      <SectionCard>
        <p className="text-foreground">{t("terms.intro")}</p>
      </SectionCard>

      <div className="flex flex-col gap-3">
        {SECTION_KEYS.map((key) => (
          <SectionCard key={key} className="flex flex-col gap-1">
            <p className="font-medium text-foreground">{t(`terms.sections.${key}.title`)}</p>
            <p className="text-sm text-muted-foreground">{t(`terms.sections.${key}.body`)}</p>
          </SectionCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href={`/${locale}/support`} variant="send" className="self-start">
          {t("terms.contactLink")}
        </Button>
        <Button href={`/${locale}/privacy`} variant="outline" className="self-start">
          {t("terms.privacyLink")}
        </Button>
      </div>
    </main>
  );
}
