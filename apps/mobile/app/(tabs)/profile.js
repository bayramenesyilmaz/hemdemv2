import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";

export default function ProfileScreen() {
  const router = useRouter();
  const { userId, setUserId } = useSession();
  const [profile, setProfile] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const [found, balance] = await Promise.all([
        repositories.user.findById(userId),
        repositories.coin.getBalance(userId),
      ]);
      if (cancelled) return;
      setProfile(found);
      setCoins(balance);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function handleLogout() {
    setUserId(null);
    router.replace("/");
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <InitialsAvatar name={profile.name} size={72} />
        <Text style={styles.name}>{profile.name}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <Pressable style={styles.coinCard} onPress={() => router.push("/coins")}>
        <Text style={styles.coinLabel}>Bakiye</Text>
        <Text style={styles.coinValue}>{coins} coin</Text>
      </Pressable>

      <View style={styles.linkList}>
        <Pressable style={styles.link} onPress={() => router.push("/notifications")}>
          <Text style={styles.linkText}>Bildirimler</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.push("/leaderboard")}>
          <Text style={styles.linkText}>Liderlik Tablosu</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  name: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  bio: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  coinCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coinLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  coinValue: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 16,
  },
  linkList: {
    gap: 8,
    marginBottom: 24,
  },
  link: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
  },
  linkText: {
    color: colors.foreground,
    fontWeight: "600",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "700",
  },
});
