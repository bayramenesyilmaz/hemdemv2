import Link from "next/link";

export function AdminSubNav({ locale, t }) {
  return (
    <div className="flex gap-4 text-sm">
      <Link href={`/${locale}/admin/users`} className="text-muted-foreground underline">
        {t("admin.usersLink")}
      </Link>
      <Link href={`/${locale}/admin/tests`} className="text-muted-foreground underline">
        {t("admin.testsLink")}
      </Link>
      <Link href={`/${locale}/admin/requests`} className="text-muted-foreground underline">
        {t("admin.requestsLink")}
      </Link>
    </div>
  );
}
