import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function ProfilePage({ params }) {
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

  const t = await getI18n();
  const socialEntries = Object.entries(profile.socialLinks ?? {});

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle action={<Button href={`/${locale}/profile/edit`} variant="edit">{t("profile.edit")}</Button>}>
        {t("profile.title")}
      </PageTitle>

      <SectionCard className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
            {profile.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {profile.name}
              {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ""}
            </p>
            {profile.country && <p className="text-sm text-muted-foreground">{profile.country}</p>}
          </div>
        </div>

        {profile.bio && <p className="text-foreground">{profile.bio}</p>}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("profile.genderLabel")}</dt>
            <dd className="text-foreground">{profile.gender ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("profile.interestedInLabel")}</dt>
            <dd className="text-foreground">{profile.interestedIn ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("profile.gateTestLabel")}</dt>
            <dd className="text-foreground">
              {profile.gateTestId ? `${t("profile.gateTestActive")} (%${profile.gateTestThreshold ?? 0})` : t("profile.gateTestNone")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("profile.allowGuestLikesLabel")}</dt>
            <dd className="text-foreground">
              {profile.allowGuestLikes ? t("profile.yes") : t("profile.no")}
            </dd>
          </div>
        </dl>

        {socialEntries.length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            {socialEntries.map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noreferrer" className="underline text-foreground">
                {platform}
              </a>
            ))}
          </div>
        )}
      </SectionCard>
    </main>
  );
}
