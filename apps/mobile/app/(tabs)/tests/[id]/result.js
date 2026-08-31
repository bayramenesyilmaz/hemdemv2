import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchTestResults } from "@hemdem/core/usecases/tests/fetchTestResults";
import { repositories } from "../../../../lib/repositories";
import { useSession } from "../../../../lib/session";
import { colors } from "../../../../lib/theme";
import { InitialsAvatar } from "../../../../components/InitialsAvatar";

export default function TestResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await fetchTestResults(repositories, userId, id);
      if (cancelled) return;
      setLoading(false);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setData(result.data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>Sonuçlar yüklenemedi.</Text>
      </View>
    );
  }

  const { test, matches } = data;
  const perfectMatches = matches.filter((m) => m.canDirectMessage);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push("/tests")}>
        <Text style={styles.back}>‹ Testler</Text>
      </Pressable>

      <Text style={styles.title}>{test.title}</Text>
      <Text style={styles.subtitle}>
        {matches.length > 0
          ? `${matches.length} kişi bu testi çözdü, en uyumlu olduklarınla eşleştik.`
          : "Bu testi henüz senden başka çözen yok."}
      </Text>

      {perfectMatches.length > 0 && (
        <View style={styles.perfectBanner}>
          <Text style={styles.perfectText}>
            🎉 {perfectMatches.length} kişiyle tam uyum yakaladın — doğrudan mesaj atabilirsin.
          </Text>
        </View>
      )}

      {matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Henüz karşılaştırılacak kimse yok.</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.profile.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <InitialsAvatar name={item.profile.name} size={44} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.name}>{item.profile.name}</Text>
                  {item.profile.country && <Text style={styles.country}>{item.profile.country}</Text>}
                </View>
                <Text style={styles.similarity}>%{item.similarity}</Text>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${item.similarity}%` }]} />
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.outlineButton}
                  onPress={() => router.push(`/tests/${test.id}/compare/${item.profile.id}`)}
                >
                  <Text style={styles.outlineButtonText}>Cevapları Karşılaştır</Text>
                </Pressable>
                {item.canDirectMessage && (
                  <Pressable
                    style={styles.messageButton}
                    onPress={() => router.push(`/u/${item.profile.id}`)}
                  >
                    <Text style={styles.messageButtonText}>💬 Mesaj At</Text>
                  </Pressable>
                )}
              </View>
            </View>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  perfectBanner: {
    backgroundColor: "rgba(225,29,72,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  perfectText: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 13,
  },
  empty: {
    color: colors.muted,
  },
  error: {
    color: colors.danger,
  },
  list: {
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderText: {
    flex: 1,
  },
  name: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
  country: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  similarity: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cardAlt,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  outlineButtonText: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 13,
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
