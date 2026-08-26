import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { PageTitle } from "@/components/PageTitle";
import { InfoBanner } from "@/components/InfoBanner";
import { CreateTestForm } from "./CreateTestForm";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function CreateTestPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("tests.createTitle")}</PageTitle>
      <InfoBanner>
        {t("tests.createCostNotice", { cost: COIN_COSTS.createTest })} {t("tests.createApprovalNotice")}
      </InfoBanner>
      <CreateTestForm locale={locale} />
    </main>
  );
}
