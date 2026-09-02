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
  const isOwn = viewerId === profileId;
  const [answers, viewerAnswers] = await Promise.all([
    repositories.test.findAnswersByUser(profileId),
    viewerId && !isOwn ? repositories.test.findAnswersByUser(viewerId) : Promise.resolve([]),
  ]);
  const solvedTests = (await Promise.all(answers.map((a) => repositories.test.findById(a.testId)))).filter(Boolean);

  if (solvedTests.length === 0) return null;

  const viewerAnsweredTestIds = new Set(viewerAnswers.map((a) => a.testId));
  const t = await getI18n();

  // Karşılaştırma sayfası sadece ziyaretçi o testi KENDİSİ de çözmüşse
  // anlamlı — aksi halde fetchTestResults "not_answered_yet" hatası verir.
  // Çözmemişse önce testin kendisine gönderilir, çözünce zaten kendi sonuç
  // ekranına düşer.
  function hrefFor(test) {
    if (isOwn) return `/${locale}/tests/${test.id}/result`;
    if (viewerId && viewerAnsweredTestIds.has(test.id)) return `/${locale}/tests/${test.id}/compare/${profileId}`;
    return `/${locale}/tests/${test.id}`;
  }

  return (
    <SectionCard className="mx-4 flex flex-col gap-3 lg:mx-0">
      <h2 className="text-sm font-semibold text-foreground">{t("profile.solvedTestsTitle")}</h2>
      <div className="flex flex-col gap-2">
        {solvedTests.map((test) => (
          <Link
            key={test.id}
            href={hrefFor(test)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground underline-offset-2 hover:bg-muted hover:underline"
          >
            {test.title}
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
