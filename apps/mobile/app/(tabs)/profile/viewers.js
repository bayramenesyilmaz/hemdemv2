import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { fetchProfileViewersPreview } from "@hemdem/core/usecases/profile/fetchProfileViewersPreview";
import { unlockProfileViewers } from "@hemdem/core/usecases/profile/unlockProfileViewers";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";
import { InitialsAvatar } from "../../../components/InitialsAvatar";

const ERROR_MESSAGES = {
  insufficient_coins: "Bunun için yeterli coin'in yok.",
};

export default function ProfileViewersScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await fetchProfileViewersPreview(repositories, userId);
      if (cancelled) return;
      setPreview(result.data);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleUnlock() {
    setError(null);
    setUnlocking(true);
    const result = await unlockProfileViewers(repositories, userId);
    setUnlocking(false);

    if (result.status === "error") {
      setError(ERROR_MESSAGES[result.message] ?? result.message);
      return;
    }

    const excluded = new Set((preview?.viewers ?? []).map(({ viewer }) => viewer.id));
    setViewers(result.data.viewers.filter(({ viewer }) => !excluded.has(viewer.id)));
  }

  if (loading || !preview) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const remainingCount = preview.totalCount - preview.viewers.length;
  const combined = [...preview.viewers, ...(viewers ?? [])];

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Profil</Text>
      </Pressable>

      <Text style={styles.title}>Profilimi Görüntüleyenler</Text>
      <Text style={styles.count}>{preview.totalCount} kişi profilini görüntüledi.</Text>

      {preview.totalCount === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Henüz kimse profilini görüntülemedi.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={combined}
            keyExtractor={({ viewer }) => viewer.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => router.push(`/u/${item.viewer.id}`)}>
                <InitialsAvatar name={item.viewer.name} size={40} />
                <Text style={styles.name}>{item.viewer.name}</Text>
              </Pressable>
            )}
          />

          {remainingCount > 0 && !viewers && (
            <View style={styles.unlockPanel}>
              {error && <Text style={styles.error}>{error}</Text>}
              <Pressable style={styles.unlockButton} onPress={handleUnlock} disabled={unlocking}>
                {unlocking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.unlockButtonText}>
                    Kalan {remainingCount} kişiyi gör ({COIN_COSTS.unlockProfileViewers} coin)
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </>
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
    fontSize: 20,
    fontWeight: "800",
    color: colors.foreground,
  },
  count: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  empty: {
    color: colors.muted,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  name: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 15,
  },
  unlockPanel: {
    marginTop: 16,
    gap: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  unlockButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  unlockButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
