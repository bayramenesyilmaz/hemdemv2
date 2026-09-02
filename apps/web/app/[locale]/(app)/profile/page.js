import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/Avatar";
import { ShareButton } from "@/components/ShareButton";
import { VerificationBadge } from "@/components/VerificationBadge";
import { BoostButton } from "./BoostButton";
import { VerificationSection } from "./VerificationSection";
import { CoinIcon, UserIcon, SupportIcon } from "@/components/icons";

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
  const coinBalance = await repositories.coin.getBalance(userId);

  // Alt sayfalar tek satır altı çizili link yerine dokunması kolay
  // kutucuklar olarak veriliyor — mobilde asıl kullanım biçimi bu.
  const quickLinks = [
    { href: `/${locale}/profile/viewers`, label: t("profile.viewersLink"), Icon: UserIcon },
    { href: `/${locale}/coins`, label: t("profile.earnCoinsLink"), Icon: CoinIcon },
    { href: `/${locale}/support`, label: t("help.contactLink"), Icon: SupportIcon },
  ];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle action={<Button href={`/${locale}/profile/edit`} variant="edit">{t("profile.edit")}</Button>}>
        {t("profile.title")}
      </PageTitle>

      <ShareButton
        path={`/${locale}/u/${userId}`}
        title={t("share.profileTitle")}
        text={t("share.profileText")}
        label={t("share.button")}
        copiedLabel={t("share.copied")}
        className="self-start"
      />

      <BoostButton cost={COIN_COSTS.boostProfile} initialBoostedUntil={profile.boostedUntil} />

      <VerificationSection initialStatus={profile.verificationStatus} />

      <SectionCard className="flex animate-fade-in flex-col gap-4 bg-gradient-surface">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatarUrl} name={profile.name} size="lg" className="shadow-card" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-base font-semibold text-foreground">
              {profile.name}
              {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ""}
              {profile.verificationStatus === "approved" && (
                <VerificationBadge label={t("profile.verifiedBadgeLabel")} />
              )}
            </p>
            {profile.country && <p className="text-sm text-muted-foreground">{profile.country}</p>}
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary shadow-soft">
              <CoinIcon className="size-3.5" />
              {t("coins.balanceLabel", { balance: coinBalance })}
            </span>
          </div>
        </div>
      </SectionCard>

      {profile.photos?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {profile.photos.slice(1).map((photo) => (
            <div key={photo} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image
                src={photo}
                alt=""
                fill
                unoptimized={photo.startsWith("data:")}
                className="object-cover"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {quickLinks.map(({ href, label, Icon }) => (
          <Link key={href} href={href}>
            <SectionCard interactive className="flex h-full flex-col items-center gap-2 p-3 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
                <Icon className="size-5" />
              </span>
              <span className="text-xs font-medium leading-tight text-foreground">{label}</span>
            </SectionCard>
          </Link>
        ))}
      </div>

      <SectionCard className="flex flex-col gap-4">
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
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center rounded-full bg-gradient-surface px-4 font-medium capitalize text-foreground shadow-soft transition-transform active:scale-95"
              >
                {platform}
              </a>
            ))}
          </div>
        )}
      </SectionCard>

      <Link
        href={`/${locale}/privacy`}
        className="self-start text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {t("privacy.title")}
      </Link>
    </main>
  );
}
