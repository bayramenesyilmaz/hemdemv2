import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AD_WATCH_TIERS } from "@hemdem/core/domain/entities/coin";
import { grantAdWatchReward } from "@hemdem/core/usecases/coins/grantAdWatchReward";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, gradients, radii, spacing } from "../../lib/theme";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../components/ui/Screen";

export default function CoinsScreen() {
  const insets = useScreenInsets();
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
    <ScrollView style={styles.container} contentContainerStyle={[insets, styles.content]}>
      <ScreenHeader title="Coin Kazan" back />

      <LinearGradient colors={gradients.surface} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Bakiyen</Text>
        <Text style={styles.balanceValue}>{balance == null ? "…" : `${balance} coin`}</Text>
      </LinearGradient>

      <View style={styles.list}>
        {AD_WATCH_TIERS.map((tier) => (
          <Card key={tier.tier} style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{tier.seconds} saniyelik reklam</Text>
              <Text style={styles.cardReward}>+{tier.coinReward} coin</Text>
            </View>
            <Button
              variant="primary"
              style={styles.watchButton}
              onPress={() => handleWatch(tier)}
              disabled={claimingTier != null}
              loading={claimingTier === tier.tier}
            >
              İzle
            </Button>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  balanceValue: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 22,
    marginTop: 2,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.foreground,
    fontWeight: "700",
  },
  cardReward: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },
  watchButton: {
    minWidth: 84,
  },
});
