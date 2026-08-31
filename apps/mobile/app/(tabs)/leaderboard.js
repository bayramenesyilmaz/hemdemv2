import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { repositories } from "../../lib/repositories";
import { colors } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";

export default function LeaderboardScreen() {
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

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Geri</Text>
      </Pressable>
      <Text style={styles.title}>Liderlik Tablosu</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Pressable style={styles.row} onPress={() => router.push(`/u/${item.userId}`)}>
              <Text style={[styles.rank, index < 3 && styles.rankTop]}>{index + 1}</Text>
              <InitialsAvatar name={item.profile.name} size={40} />
              <Text style={styles.name}>{item.profile.name}</Text>
              <Text style={styles.points}>{item.point}</Text>
            </Pressable>
          )}
        />
      )}
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
    marginBottom: 16,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  list: {
    gap: 8,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  rank: {
    width: 24,
    textAlign: "center",
    color: colors.muted,
    fontWeight: "700",
  },
  rankTop: {
    color: colors.primary,
  },
  name: {
    flex: 1,
    color: colors.foreground,
    fontWeight: "600",
  },
  points: {
    color: colors.primary,
    fontWeight: "700",
  },
});
