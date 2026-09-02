import { SubNav } from "@/components/SubNav";

export function AdminSubNav({ locale, t }) {
  return (
    <SubNav
      items={[
        { href: `/${locale}/admin/users`, label: t("admin.usersLink") },
        { href: `/${locale}/admin/tests`, label: t("admin.testsLink") },
        { href: `/${locale}/admin/verifications`, label: t("admin.verificationsLink") },
        { href: `/${locale}/admin/requests`, label: t("admin.requestsLink") },
      ]}
    />
  );
}
