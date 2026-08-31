import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchTestResults } from "@hemdem/core/usecases/tests/fetchTestResults";
import { repositories } from "../../../../lib/repositories";
import { useSession } from "../../../../lib/session";
import { colors, radii, spacing } from "../../../../lib/theme";
import { InitialsAvatar } from "../../../../components/InitialsAvatar";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../../components/ui/Screen";

export default function TestResultScreen() {
  const insets = useScreenInsets();
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
      <FlatList
        data={matches}
        keyExtractor={(item) => item.profile.id}
        contentContainerStyle={[insets, styles.list]}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title={test.title}
              back
              onBack={() => router.push("/tests")}
              subtitle={
                matches.length > 0
                  ? `${matches.length} kişi bu testi çözdü, en uyumlu olduklarınla eşleştik.`
                  : "Bu testi henüz senden başka çözen yok."
              }
            />
            {perfectMatches.length > 0 && (
              <View style={styles.perfectBanner}>
                <Text style={styles.perfectText}>
                  🎉 {perfectMatches.length} kişiyle tam uyum yakaladın — doğrudan mesaj atabilirsin.
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="🤝" title="Henüz karşılaştırılacak kimse yok" description="Başkaları bu testi çözdükçe burada listelenecek." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Pressable style={styles.cardHeader} onPress={() => router.push(`/u/${item.profile.id}`)}>
              <InitialsAvatar name={item.profile.name} size={44} />
              <View style={styles.cardHeaderText}>
                <Text style={styles.name}>{item.profile.name}</Text>
                {item.profile.country && <Text style={styles.country}>{item.profile.country}</Text>}
              </View>
              <Text style={styles.similarity}>%{item.similarity}</Text>
            </Pressable>

            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${item.similarity}%` }]} />
            </View>

            <View style={styles.cardActions}>
              <Button
                variant="outline"
                style={styles.cardActionButton}
                onPress={() => router.push(`/tests/${test.id}/compare/${item.profile.id}`)}
              >
                Cevapları Karşılaştır
              </Button>
              {item.canDirectMessage && (
                <Button
                  variant="primary"
                  style={styles.cardActionButton}
                  onPress={() => router.push(`/u/${item.profile.id}`)}
                >
                  💬 Mesaj At
                </Button>
              )}
            </View>
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
  error: {
    color: colors.danger,
  },
  perfectBanner: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  perfectText: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 13,
  },
  list: {
    paddingBottom: 40,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
    color: colors.mutedForeground,
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
    borderRadius: radii.full,
    backgroundColor: colors.cardAlt,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardActionButton: {
    flex: 1,
  },
});
