import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { fetchNotes } from "@hemdem/core/usecases/notes/fetchNotes";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { getCurrentProfile } from "@/lib/currentUser";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { NotesList } from "./NotesList";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function NotesPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const [result, profile] = await Promise.all([
    fetchNotes(repositories, userId),
    getCurrentProfile(),
  ]);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("nav.notes")}</PageTitle>
      <NotesList initialNotes={result.data} author={profile} />
    </main>
  );
}
