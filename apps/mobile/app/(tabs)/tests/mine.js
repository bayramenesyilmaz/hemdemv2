import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { deleteOwnTest } from "@hemdem/core/usecases/tests/deleteOwnTest";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";

export default function MyTestsScreen() {
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
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Testler</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Testlerim</Text>
        <Pressable style={styles.addButton} onPress={() => router.push("/tests/create")}>
          <Text style={styles.addButtonText}>+ Oluştur</Text>
        </Pressable>
      </View>

      {tests.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Henüz bir test oluşturmadın.</Text>
        </View>
      ) : (
        <FlatList
          data={tests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable style={styles.cardMain} onPress={() => router.push(`/tests/${item.id}`)}>
                <Text style={styles.testTitle}>{item.title}</Text>
                {!item.approved && <Text style={styles.pending}>Onay bekliyor</Text>}
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => confirmDelete(item)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator color={colors.danger} size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Sil</Text>
                )}
              </Pressable>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  empty: {
    color: colors.muted,
  },
  list: {
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardMain: {
    flex: 1,
  },
  testTitle: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
  pending: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
});
