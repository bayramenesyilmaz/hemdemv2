import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("help.title"),
    alternates: { canonical: `/${locale}/help` },
  };
}

export default async function HelpPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  const faqKeys = ["howMatch", "gateTest", "coins", "guestLikes", "deleteAccount"];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("help.title")}</PageTitle>

      <div className="flex flex-col gap-3">
        {faqKeys.map((key) => (
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
