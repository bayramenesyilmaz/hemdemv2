import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { fetchProfileViewersPreview } from "@hemdem/core/usecases/profile/fetchProfileViewersPreview";
import { unlockProfileViewers } from "@hemdem/core/usecases/profile/unlockProfileViewers";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../InitialsAvatar";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

const ERROR_MESSAGES = {
  insufficient_coins: "Bunun için yeterli coin'in yok.",
};

/**
 * Mesajlar sekmesinin 3. sekmesi — eski `profile/viewers.js` ekranıyla
 * aynı iş mantığı (fetchProfileViewersPreview/unlockProfileViewers, ilk 3
 * ücretsiz), `LikesList.js` ile birebir aynı "tab content" şekline
 * uyarlandı. Profil menüsündeki kısayol da ayrıca duruyor.
 */
export function ViewersList({ contentContainerStyle, onCountChange }) {
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
      onCountChange?.(result.data?.totalCount ?? 0);
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
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const remainingCount = preview.totalCount - preview.viewers.length;
  const combined = [...preview.viewers, ...(viewers ?? [])];

  return (
    <FlatList
      data={combined}
      keyExtractor={({ viewer }) => viewer.id}
      contentContainerStyle={[styles.list, contentContainerStyle]}
      ListEmptyComponent={
        <EmptyState icon="👁️" title="Henüz kimse profilini görüntülemedi" />
      }
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => router.push(`/u/${item.viewer.id}`)}>
          <InitialsAvatar name={item.viewer.name} size={44} />
          <Text style={styles.name}>{item.viewer.name}</Text>
        </Pressable>
      )}
      ListFooterComponent={
        remainingCount > 0 && !viewers ? (
          <View style={styles.unlockPanel}>
            {error && <Text style={styles.error}>{error}</Text>}
            <Button variant="primary" onPress={handleUnlock} loading={unlocking}>
              {`Kalan ${remainingCount} kişiyi gör (${COIN_COSTS.unlockProfileViewers} coin)`}
            </Button>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  list: {
    paddingHorizontal: spacing.xl,
    flexGrow: 1,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  name: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 15,
  },
  unlockPanel: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
