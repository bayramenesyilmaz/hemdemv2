import { redirect } from "next/navigation";

export default async function AdminIndexPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}/admin/users`);
}
