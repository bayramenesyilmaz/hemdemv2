import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { deleteOwnTest } from "@hemdem/core/usecases/tests/deleteOwnTest";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, spacing } from "../../../lib/theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../components/ui/Screen";

export default function MyTestsScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const { userId } = useSession();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId]);

  async function load() {
    setLoading(true);
    const result = await repositories.test.findCreatedByUser(userId);
    setTests(result);
    setLoading(false);
  }

  function confirmDelete(test) {
    Alert.alert("Testi sil", `"${test.title}" testini silmek istediğine emin misin?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          setDeletingId(test.id);
          await deleteOwnTest(repositories, userId, test.id);
          setDeletingId(null);
          load();
        },
      },
    ]);
  }

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
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[insets, styles.list]}
        ListHeaderComponent={
          <ScreenHeader
            title="Testlerim"
            back
            action={
              <Button variant="primary" onPress={() => router.push("/tests/create")}>
                + Oluştur
              </Button>
            }
          />
        }
        ListEmptyComponent={
          <EmptyState icon="📋" title="Henüz bir test oluşturmadın" description="İlk testini oluşturarak başla." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Pressable style={styles.cardMain} onPress={() => router.push(`/tests/${item.id}`)}>
              <Text style={styles.testTitle}>{item.title}</Text>
              {!item.approved && <Badge style={styles.pendingBadge}>Onay bekliyor</Badge>}
            </Pressable>
            <Button
              variant="delete"
              onPress={() => confirmDelete(item)}
              disabled={deletingId === item.id}
              loading={deletingId === item.id}
            >
              Sil
            </Button>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardMain: {
    flex: 1,
    gap: spacing.xs,
  },
  testTitle: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
  pendingBadge: {
    marginTop: 2,
  },
});
