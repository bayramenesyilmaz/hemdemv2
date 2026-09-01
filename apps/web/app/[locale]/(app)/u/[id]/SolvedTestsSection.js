import Link from "next/link";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { SectionCard } from "@/components/SectionCard";

/**
 * Sayfanın geri kalanından (hero + ana aksiyonlar) ayrı bir `<Suspense>`
 * sınırı içinde render edilir — üretimde (gerçek Supabase) bu birkaç ek
 * network isteği gerektirir; kullanıcı asıl önemli olan fotoğraf/beğen/
 * mesaj aksiyonlarını beklemeden görsün diye bu bölüm ayrı akar.
 */
export async function SolvedTestsSection({ profileId, viewerId, locale }) {
  const answers = await repositories.test.findAnswersByUser(profileId);
  const solvedTests = (await Promise.all(answers.map((a) => repositories.test.findById(a.testId)))).filter(Boolean);

  if (solvedTests.length === 0) return null;

  const t = await getI18n();

  return (
    <SectionCard className="mx-4 flex flex-col gap-3 lg:mx-0">
      <h2 className="text-sm font-semibold text-foreground">{t("profile.solvedTestsTitle")}</h2>
      <div className="flex flex-col gap-2">
        {solvedTests.map((test) => (
          <Link
            key={test.id}
            href={
              viewerId === profileId
                ? `/${locale}/tests/${test.id}/result`
                : viewerId
                  ? `/${locale}/tests/${test.id}/compare/${profileId}`
                  : `/${locale}/tests/${test.id}`
            }
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground underline-offset-2 hover:bg-muted hover:underline"
          >
            {test.title}
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
