import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { isProfileComplete } from "@hemdem/core/domain/entities/user";
import { fetchDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchDiscoverCandidates";
import { fetchGuestDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchGuestDiscoverCandidates";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { DiscoverFilters } from "./DiscoverFilters";
import { SwipeDeck } from "./SwipeDeck";

export async function generateMetadata() {
  return { robots: { index: false } };
}

function parseFilters(sp) {
  return {
    gender: sp.gender || undefined,
    country: sp.country || undefined,
    minAge: sp.minAge ? Number(sp.minAge) : undefined,
    maxAge: sp.maxAge ? Number(sp.maxAge) : undefined,
  };
}

export default async function DiscoverPage({ params, searchParams }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const t = await getI18n();
  const userId = await getAuthUserId();

  let candidates;
  let isGuest = true;

  if (userId) {
    const profile = await repositories.user.findById(userId);
    if (!isProfileComplete(profile)) {
      redirect(`/${locale}/onboarding`);
    }
    const result = await fetchDiscoverCandidates(repositories, userId, filters);
    candidates = result.data;
    isGuest = false;
  } else {
    const result = await fetchGuestDiscoverCandidates(repositories, filters);
    candidates = result.data;
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-10">
      <PageTitle
        action={
          <DiscoverFilters
            locale={locale}
            initialGender={sp.gender}
            initialCountry={sp.country}
            initialMinAge={sp.minAge}
            initialMaxAge={sp.maxAge}
          />
        }
      >
        {t("discover.title")}
      </PageTitle>
      <SwipeDeck locale={locale} initialCandidates={candidates} isGuest={isGuest} />
    </main>
  );
}
