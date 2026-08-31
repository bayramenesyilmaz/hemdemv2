import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { repositories } from "../../lib/repositories";
import { colors, gradients, radii, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";
import { Card } from "../../components/ui/Card";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../components/ui/Screen";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const rows = await repositories.test.findLeaderboard(50);
      const profiles = await Promise.all(rows.map((row) => repositories.user.findById(row.userId)));
      if (cancelled) return;
      setEntries(rows.map((row, index) => ({ ...row, profile: profiles[index] })).filter((e) => e.profile));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={[insets, styles.list]}
        ListHeaderComponent={<ScreenHeader title="Liderlik Tablosu" back />}
        renderItem={({ item, index }) => (
          <Card onPress={() => router.push(`/u/${item.userId}`)} style={styles.row}>
            {index < 3 ? (
              <Text style={styles.medal}>{MEDALS[index]}</Text>
            ) : (
              <View style={styles.rankCircle}>
                <Text style={styles.rank}>{index + 1}</Text>
              </View>
            )}
            <InitialsAvatar name={item.profile.name} size={44} />
            <Text style={styles.name} numberOfLines={1}>
              {item.profile.name}
            </Text>
            <LinearGradient colors={gradients.surface} style={styles.pointsPill}>
              <Text style={styles.points}>{item.point}</Text>
            </LinearGradient>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  medal: {
    width: 28,
    textAlign: "center",
    fontSize: 20,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rank: {
    color: colors.mutedForeground,
    fontWeight: "700",
    fontSize: 12,
  },
  name: {
    flex: 1,
    color: colors.foreground,
    fontWeight: "600",
  },
  pointsPill: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  points: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
});
