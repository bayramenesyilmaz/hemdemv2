import Link from "next/link";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { safeFetchNotifications } from "@/lib/notifications";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { SimilarityBadge } from "@/components/SimilarityBadge";
import { AdSlot } from "@/components/AdSlot";
import { HeartIcon } from "@/components/icons";
import { MarkNotificationsRead } from "./MarkNotificationsRead";
import { cn } from "@/lib/cn";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function NotificationsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const result = await safeFetchNotifications(userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("nav.notifications")}</PageTitle>

      {result.status === "error" ? (
        <EmptyState
          icon={<HeartIcon className="h-6 w-6" />}
          title={t("notifications.loadErrorTitle")}
          description={t("notifications.loadErrorBody")}
        />
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="h-6 w-6" />}
          title={t("notifications.emptyTitle")}
          description={t("notifications.emptyBody")}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {result.data.map(({ notification, actor, test }, index) => {
              const href =
                notification.type === "test_similarity" && test
                  ? `/${locale}/tests/${test.id}/compare/${actor.id}`
                  : `/${locale}/u/${actor.id}`;

              return (
                <li
                  key={notification.id}
                  className="animate-list-in"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <Link href={href}>
                    <SectionCard
                      interactive
                      className={cn(
                        "flex items-center gap-3",
                        !notification.isRead && "border-primary/30 bg-gradient-surface"
                      )}
                    >
                      <Avatar src={actor.avatarUrl} name={actor.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">
                          {notification.type === "test_similarity" && test
                            ? t("notifications.testSimilarity", {
                                name: actor.name,
                                test: test.title,
                              })
                            : t("notifications.incomingLike", { name: actor.name })}
                        </p>
                      </div>
                      {notification.similarity != null && (
                        <SimilarityBadge value={notification.similarity} />
                      )}
                    </SectionCard>
                  </Link>
                </li>
              );
            })}
          </ul>

          <AdSlot label={t("ads.label")} />
          <MarkNotificationsRead />
        </>
      )}
    </main>
  );
}
