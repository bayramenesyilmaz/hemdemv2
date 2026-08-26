import { notFound } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { SectionCard } from "@/components/SectionCard";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const profile = await repositories.user.findById(id);

  return {
    title: profile ? profile.name : undefined,
    robots: { index: false },
  };
}

export default async function PublicProfilePage({ params }) {
  const { locale, id } = await params;
  setStaticParamsLocale(locale);

  const profile = await repositories.user.findById(id);
  if (!profile || profile.isBanned) {
    notFound();
  }

  const viewerId = await getAuthUserId();
  if (viewerId && viewerId !== profile.id) {
    await repositories.profileView.recordView(viewerId, profile.id);
  }

  const t = await getI18n();
  const socialEntries = Object.entries(profile.socialLinks ?? {});

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>

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

        {profile.gateTestId && (
          <p className="text-sm text-muted-foreground">
            {t("profile.gateTestActive")} (%{profile.gateTestThreshold ?? 0})
          </p>
        )}

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
