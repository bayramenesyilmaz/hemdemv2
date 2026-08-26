import { redirect } from "next/navigation";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function AdminIndexPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}/admin/users`);
}
