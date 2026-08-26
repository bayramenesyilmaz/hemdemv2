"use client";

import { useI18n } from "@/locales/client";
import {
  CompassIcon,
  TestsIcon,
  PostsIcon,
  MessagesIcon,
  TrophyIcon,
  HeartIcon,
  UserIcon,
  CoinIcon,
  NoteIcon,
  ShieldIcon,
  BellIcon,
  HelpIcon,
  SupportIcon,
} from "@/components/icons";

/**
 * Plan bölüm 6'daki navigasyon haritası tek bir yerde tanımlanır:
 * `primary` mobilde alt bara / masaüstünde sidebar'a, `secondary` ise
 * tam ekran menüye gider. Misafirlerin göremeyeceği sekmeler
 * `isAuthenticated`'a göre elenir.
 *
 * @param {{ locale: string, isAuthenticated: boolean, isAdmin: boolean }} options
 */
export function useNavItems({ locale, isAuthenticated, isAdmin }) {
  const t = useI18n();

  const primary = [
    { href: `/${locale}/discover`, label: t("nav.discover"), Icon: CompassIcon },
    { href: `/${locale}/tests`, label: t("nav.tests"), Icon: TestsIcon },
    { href: `/${locale}/posts`, label: t("nav.posts"), Icon: PostsIcon },
    isAuthenticated
      ? { href: `/${locale}/messages`, label: t("nav.messages"), Icon: MessagesIcon }
      : {
          href: `/${locale}/leaderboard`,
          label: t("nav.leaderboard"),
          // Alt bar sekmeleri tek satıra sığmalı: "Liderlik Tablosu" iki
          // satıra sarıp ikonu yukarı itiyor ve sekme kayık görünüyordu.
          shortLabel: t("nav.leaderboardShort"),
          Icon: TrophyIcon,
        },
  ];

  const secondary = [
    ...(isAuthenticated
      ? [
          { href: `/${locale}/profile`, label: t("nav.profile"), Icon: UserIcon },
          { href: `/${locale}/notifications`, label: t("nav.notifications"), Icon: BellIcon },
          { href: `/${locale}/likes`, label: t("nav.likes"), Icon: HeartIcon },
          { href: `/${locale}/notes`, label: t("nav.notes"), Icon: NoteIcon },
          { href: `/${locale}/coins`, label: t("profile.earnCoinsLink"), Icon: CoinIcon },
          { href: `/${locale}/profile/viewers`, label: t("profile.viewersLink"), Icon: UserIcon },
          { href: `/${locale}/tests/mine`, label: t("tests.mine"), Icon: TestsIcon },
          { href: `/${locale}/tests/history`, label: t("tests.history"), Icon: TestsIcon },
        ]
      : []),
    { href: `/${locale}/leaderboard`, label: t("nav.leaderboard"), Icon: TrophyIcon },
    { href: `/${locale}/help`, label: t("nav.help"), Icon: HelpIcon },
    { href: `/${locale}/support`, label: t("support.title"), Icon: SupportIcon },
    ...(isAdmin ? [{ href: `/${locale}/admin`, label: t("nav.admin"), Icon: ShieldIcon }] : []),
  ];

  // Misafirken Liderlik hem alt barda hem menüde çıkardı; alt barda zaten
  // görünen bir rota menüde tekrar listelenmez.
  const primaryHrefs = new Set(primary.map((item) => item.href));

  return { primary, secondary: secondary.filter((item) => !primaryHrefs.has(item.href)) };
}

/**
 * Alt bar/sidebar'da aktif sekme vurgusu. Tam eşleşme yetmez: `/tests`
 * sekmesi `/tests/create` gibi alt rotalarda da aktif kalmalı; ancak
 * `/tests` sekmesinin `/testsomething` gibi bir yola sızmaması için
 * sınır olarak `/` aranır.
 */
export function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
