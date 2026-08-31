import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../lib/theme";
import { useSession } from "../../lib/session";

/**
 * Sekmeler sadece giriş yapmış oturum için anlamlı — burada tek yerden
 * korunuyor, tek tek her ekranın kendi yönlendirme kontrolünü yazmasına
 * gerek kalmıyor (bkz. eski app/discover.js'teki tekrar eden mantık).
 */
export default function TabsLayout() {
  const router = useRouter();
  const { userId } = useSession();

  useEffect(() => {
    if (!userId) router.replace("/");
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
        name="likes"
        options={{ title: "Beğenenler", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>❤️</Text> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "Mesajlar", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profil", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
      {/* Alt çubukta göstermek için 6. sekme fazla kalabalık olurdu —
          Bildirimler ve Coin Kazan Profil ekranından erişilen ayrı
          rotalar (href: null onları çubuktan gizler, navigasyona
          kapatmaz). */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="coins" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
    </Tabs>
  );
}
