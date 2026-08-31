import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { fetchDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchDiscoverCandidates";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors } from "../../lib/theme";
import { SwipeCard } from "../../components/SwipeCard";

export default function DiscoverScreen() {
  const { userId } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchName, setMatchName] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await fetchDiscoverCandidates(repositories, userId);
      if (cancelled) return;
      setLoading(false);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setCandidates(result.data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSwiped(candidateId, action) {
    // Kartın kendisi hemen kaldırılır (akıcı his için) — beğeni isteği
    // arka planda gönderilir, gate-test gibi reddedilme durumları
    // (henüz mobilde ele alınmıyor) sessizce yutulur.
    const candidate = candidates.find((c) => c.id === candidateId);
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

    const result = await likeUser(repositories, userId, candidateId, action);
    if (result.status === "success" && result.data.matched && candidate) {
      setMatchName(candidate.name);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keşfet</Text>

      {matchName && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchText}>🎉 {matchName} ile eşleştin!</Text>
        </View>
      )}

      <View style={styles.deck}>
        {candidates.length === 0 ? (
          <Text style={styles.empty}>Şu an gösterilecek kimse yok.</Text>
        ) : (
          candidates
            .slice(0, 2)
            .reverse()
            .map((candidate, index, arr) => (
              <SwipeCard
                key={candidate.id}
                candidate={candidate}
                isTop={index === arr.length - 1}
                onSwiped={handleSwiped}
              />
            ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  matchBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
  },
  matchText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  deck: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    color: colors.muted,
  },
  error: {
    color: colors.danger,
  },
});
