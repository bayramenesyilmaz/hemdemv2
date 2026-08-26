import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/Button";
import { ProfileEditForm } from "./ProfileEditForm";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function ProfileEditPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const profile = await repositories.user.findById(userId);
  if (!profile) {
    redirect(`/${locale}/onboarding`);
  }

  const tests = await repositories.test.findMany({});
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <Button href={`/${locale}/profile`} variant="ghost">
          {t("profile.backToProfile")}
        </Button>
      </div>
      <PageTitle>{t("profile.editTitle")}</PageTitle>
      <ProfileEditForm locale={locale} profile={profile} tests={tests} />
    </main>
  );
}
