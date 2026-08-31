import { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Text } from "react-native";
import { countUnreadMessageNotifications } from "@hemdem/core/usecases/notifications/countUnreadMessageNotifications";
import { repositories } from "../../lib/repositories";
import { colors } from "../../lib/theme";
import { useSession } from "../../lib/session";

/**
 * Sekmeler sadece giriş yapmış oturum için anlamlı — burada tek yerden
 * korunuyor, tek tek her ekranın kendi yönlendirme kontrolünü yazmasına
 * gerek kalmıyor (bkz. eski app/discover.js'teki tekrar eden mantık).
 *
 * Alt bar web'deki gibi 5 sekmeye sabitlendi: Keşfet/Testler/Gönderiler/
 * Mesajlar/Diğer. Beğenenler artık Mesajlar'ın içinde kaydırmalı bir alt
 * sekme (bkz. messages/index.js); Profil, Bildirimler, Coin, Liderlik
 * Tablosu gibi geri kalan her şey "Diğer" (menu) altında veya üst bar
 * avatarından erişiliyor — 6+ sekme alt barı web'de de sıkıştırıyordu.
 */
export default function TabsLayout() {
  const router = useRouter();
  const { userId } = useSession();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!userId) router.replace("/");
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    countUnreadMessageNotifications(repositories, userId).then((count) => {
      if (!cancelled) setUnreadMessages(count);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{ title: "Keşfet", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔥</Text> }}
      />
      <Tabs.Screen
        name="tests"
        options={{ title: "Testler", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }}
      />
      <Tabs.Screen
        name="posts"
        options={{ title: "Gönderiler", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text> }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mesajlar",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{ title: "Diğer", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⋯</Text> }}
      />

      {/* Alt çubukta göstermek yerine üst bardan (AppTopBar) veya "Diğer"
          menüsünden erişilen rotalar — çubukta görünmesinler diye
          href: null, navigasyona kapalı değiller. */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="coins" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="u/[id]" options={{ href: null }} />
    </Tabs>
  );
}
