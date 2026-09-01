import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";

const SECTION_KEYS = ["collected", "use", "sharing", "retention", "security", "rights", "contact"];

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/privacy",
    title: t("privacy.title"),
    description: t("privacy.intro"),
  });
}

export default async function PrivacyPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("privacy.title")}</PageTitle>

      <SectionCard>
        <p className="text-foreground">{t("privacy.intro")}</p>
      </SectionCard>

      <div className="flex flex-col gap-3">
        {SECTION_KEYS.map((key) => (
          <SectionCard key={key} className="flex flex-col gap-1">
            <p className="font-medium text-foreground">{t(`privacy.sections.${key}.title`)}</p>
            <p className="text-sm text-muted-foreground">{t(`privacy.sections.${key}.body`)}</p>
          </SectionCard>
        ))}
      </div>

      <Button href={`/${locale}/support`} variant="send" className="self-start">
        {t("privacy.contactLink")}
      </Button>
    </main>
  );
}
