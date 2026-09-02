import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { setStaticParamsLocale } from "next-international/server";
import { calculateAge, isOnline } from "@hemdem/core/domain/entities/user";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { MessagesIcon } from "@/components/icons";
import { SendMessageDialog } from "./SendMessageDialog";
import { ProfileActions } from "./ProfileActions";
import { SafetyMenu } from "./SafetyMenu";
import { SolvedTestsSection } from "./SolvedTestsSection";

export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  const profile = await repositories.user.findById(id);
  if (!profile) return { robots: { index: false } };

  return buildMetadata({
    locale,
    path: `/u/${id}`,
    title: profile.name,
    description: profile.bio ?? undefined,
    noindex: true,
  });
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
  const viewCount = await repositories.profileView.countViews(profile.id);
  const existingChat =
    viewerId && viewerId !== profile.id ? await repositories.chat.findByPair(viewerId, profile.id) : null;

  const t = await getI18n();
  const socialEntries = Object.entries(profile.socialLinks ?? {});
  const age = profile.birthdate ? calculateAge(profile.birthdate) : null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 pb-6 lg:px-6 lg:py-8">
      {/* Keşfet kartındaki gibi büyük bir fotoğraf, ama bu sayfa kaydırılan
          bir profil sayfası (keşfetin tam ekran kartı değil): yükseklik
          görüntü alanının çoğunu kaplamasın diye viewport'a göre sınırlı. */}
      <div className="relative h-[42vh] max-h-[420px] min-h-[280px] w-full overflow-hidden bg-muted lg:h-[420px] lg:rounded-3xl lg:border lg:border-border lg:shadow-float">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt=""
            fill
            unoptimized={profile.avatarUrl.startsWith("data:")}
            className="object-cover"
            priority
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-6xl">🙂</span>
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        <div className="relative mt-auto flex h-full flex-col justify-end gap-1.5 p-5 text-white">
          <h1 className="flex items-center gap-2 text-2xl font-bold drop-shadow-sm">
            {profile.name}
            {age ? `, ${age}` : ""}
            {isOnline(profile.lastSeenAt) && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t("profile.online")}
              </span>
            )}
          </h1>
          {profile.country && <p className="text-sm text-white/80">{profile.country}</p>}
          {profile.bio && <p className="text-sm text-white/90">{profile.bio}</p>}
        </div>
      </div>

      <SectionCard className="mx-4 flex animate-fade-in flex-col gap-4 lg:mx-0">
        <p className="text-sm text-muted-foreground">{t("viewers.viewCount", { count: viewCount })}</p>

        {profile.gateTestId && (
          <p className="text-sm text-muted-foreground">
            {t("profile.gateTestActive")} (%{profile.gateTestThreshold ?? 0})
          </p>
        )}

        {socialEntries.length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            {socialEntries.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-10 items-center rounded-full bg-gradient-surface px-4 font-medium capitalize text-foreground shadow-soft transition-transform active:scale-95"
              >
                {platform}
              </a>
            ))}
          </div>
        )}

        {viewerId && viewerId !== profile.id && (
          <>
            {existingChat ? (
              <Button href={`/${locale}/messages/${existingChat.id}`} variant="send">
                <MessagesIcon className="size-4" />
                {t("messages.goToChat")}
              </Button>
            ) : (
              // İki aksiyon da aynı paylaşılan Button bileşeniyle, eşit
              // genişlikte render edilir — önceden biri dairesel ikon-only
              // (48px), diğeri Button'ın kendi ölçüsünde (40px) tam genişlik
              // bir metin butonuydu ve boyutça tutarsız duruyordu.
              <div className="flex gap-3">
                <ProfileActions
                  locale={locale}
                  profileId={profile.id}
                  profileName={profile.name}
                  gateTestId={profile.gateTestId}
                />
                <SendMessageDialog
                  locale={locale}
                  recipientId={profile.id}
                  recipientName={profile.name}
                  trigger={
                    <Button type="button" variant="outline" className="min-w-0 flex-1">
                      {t("messages.sendMessageButton")}
                    </Button>
                  }
                />
              </div>
            )}
            <SafetyMenu targetUserId={profile.id} targetName={profile.name} />
          </>
        )}
      </SectionCard>

      <Suspense fallback={null}>
        <SolvedTestsSection profileId={profile.id} viewerId={viewerId} locale={locale} />
      </Suspense>
    </main>
  );
}
