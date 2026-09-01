import { useEffect, useState } from "react";
import { Tabs, router, useRouter } from "expo-router";
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
 *
 * "Testler"/"Mesajlar" kendi içlerinde bir Stack barındırıyor (liste ->
 * detay). Zaten aktif olan bir sekmeye tekrar dokununca o Stack'in en
 * köküne dönülür — `@react-navigation/native`'i doğrudan import etmek bu
 * projede çalışmıyor (pnpm'in sıkı çözümlemesi, transitive bir bağımlılık),
 * o yüzden `navigation.isFocused()` (temel navigasyon prop'u, her
 * navigatörde var) + expo-router'ın kendi `router.navigate` (zaten
 * stack'te olan bir rotaya gidince köküne döner) kombinasyonu kullanılıyor.
 */
function resetOnDoublePress(path) {
  return ({ navigation }) => ({
    tabPress: () => {
      if (navigation.isFocused()) {
        router.navigate(path);
      }
    },
  });
}

export default function TabsLayout() {
  const routerInstance = useRouter();
  const { userId, hydrated } = useSession();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (hydrated && !userId) routerInstance.replace("/");
  }, [hydrated, userId]);

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

  // Kalıcı oturum hidrasyonu bitene kadar (kısa bir an) hiçbir şey
  // gösterme — aksi halde saklanmış bir oturum varken bile ekran anlık
  // olarak login'e sıçrar (bkz. lib/session.js).
  if (!hydrated || !userId) return null;

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
        listeners={resetOnDoublePress("/tests")}
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
        listeners={resetOnDoublePress("/messages")}
      />
      <Tabs.Screen
        name="menu"
        options={{ title: "Diğer", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⋯</Text> }}
      />

      {/* Alt çubukta göstermek yerine üst bardan (AppTopBar) veya "Diğer"
          menüsünden erişilen rotalar — çubukta görünmesinler diye
          href: null, navigasyona kapalı değiller. "u" bir klasör (kendi
          _layout.js'i var) olduğu için burada "u/[id]" değil "u" adı
          kullanılmalı — yanlış adla eşleşmediği için daha önce alt barda
          "u" diye kendiliğinden bir sekme beliriyordu. */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="coins" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="privacy" options={{ href: null }} />
      <Tabs.Screen name="u" options={{ href: null }} />
    </Tabs>
  );
}
