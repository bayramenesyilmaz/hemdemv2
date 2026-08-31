import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AD_WATCH_TIERS } from "@hemdem/core/domain/entities/coin";
import { grantAdWatchReward } from "@hemdem/core/usecases/coins/grantAdWatchReward";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors } from "../../lib/theme";

export default function CoinsScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [balance, setBalance] = useState(null);
  const [claimingTier, setClaimingTier] = useState(null);

  useEffect(() => {
    if (!userId) return;
    repositories.coin.getBalance(userId).then(setBalance);
  }, [userId]);

  async function handleWatch(tier) {
    // Gerçek bir reklam SDK'sı yerine (bu iskelette henüz yok) kısa bir
    // bekleme simülasyonu — web'deki reklam süresi hissini korumak için.
    setClaimingTier(tier.tier);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const result = await grantAdWatchReward(repositories, userId, tier.tier);
    setClaimingTier(null);
    if (result.status === "success") {
      setBalance(result.data.newBalance);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Geri</Text>
      </Pressable>
      <Text style={styles.title}>Coin Kazan</Text>
      <Text style={styles.balance}>{balance == null ? "…" : `${balance} coin`}</Text>

      <View style={styles.list}>
        {AD_WATCH_TIERS.map((tier) => (
          <Pressable
            key={tier.tier}
            style={styles.card}
            onPress={() => handleWatch(tier)}
            disabled={claimingTier != null}
          >
            <View>
              <Text style={styles.cardTitle}>{tier.seconds} saniyelik reklam</Text>
              <Text style={styles.cardReward}>+{tier.coinReward} coin</Text>
            </View>
            {claimingTier === tier.tier ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.watchLabel}>İzle</Text>
            )}
          </Pressable>
        ))}
      </View>
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
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
  },
  balance: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
  },
  cardTitle: {
    color: colors.foreground,
    fontWeight: "700",
  },
  cardReward: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  watchLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
});
