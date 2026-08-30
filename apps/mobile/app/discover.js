import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchDiscoverCandidates";
import { repositories } from "../lib/repositories";
import { useSession } from "../lib/session";
import { InitialsAvatar } from "../components/InitialsAvatar";

/**
 * Keşfet ekranı — bu iskelette henüz kaydırma (swipe) yok, sadece
 * `fetchDiscoverCandidates` usecase'inin (aynı dosya, web'de de kullanılan)
 * mobilde de sorunsuz çalıştığını göstermek için düz bir liste.
 * Gesture-handler/reanimated tabanlı kart destesi sonraki adım.
 */
export default function DiscoverScreen() {
  const router = useRouter();
  const { userId, setUserId } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }

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

  function handleLogout() {
    setUserId(null);
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Keşfet</Text>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logout}>Çıkış</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#e11d48" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {!loading && !error && candidates.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.empty}>Şu an gösterilecek kimse yok.</Text>
        </View>
      )}

      <FlatList
        data={candidates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <InitialsAvatar name={item.name} />
            <View style={styles.cardText}>
              <Text style={styles.name}>{item.name}</Text>
              {item.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {item.bio}
                </Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  logout: {
    color: "#9ca3af",
    fontSize: 14,
  },
  center: {
    paddingTop: 40,
    alignItems: "center",
  },
  error: {
    color: "#f87171",
  },
  empty: {
    color: "#9ca3af",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#18181b",
    borderRadius: 14,
    padding: 14,
  },
  cardText: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  bio: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
});
