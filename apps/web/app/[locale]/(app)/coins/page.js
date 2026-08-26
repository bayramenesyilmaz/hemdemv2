import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { AD_WATCH_TIERS } from "@hemdem/core/domain/entities/coin";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { AdWatchTierList } from "./AdWatchTierList";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function CoinsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const balance = await repositories.coin.getBalance(userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("coins.title")}</PageTitle>
      <p className="text-foreground">{t("coins.balanceLabel", { balance })}</p>
      <AdWatchTierList tiers={AD_WATCH_TIERS} />
    </main>
  );
}
