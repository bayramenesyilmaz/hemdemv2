import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { repositories } from "../../../lib/repositories";
import { colors } from "../../../lib/theme";

export default function TestsScreen() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await repositories.test.findMany({});
      if (cancelled) return;
      setTests(result);
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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Testler</Text>
        <Pressable style={styles.addButton} onPress={() => router.push("/tests/create")}>
          <Text style={styles.addButtonText}>+ Oluştur</Text>
        </Pressable>
      </View>

      <View style={styles.linkRow}>
        <Pressable style={styles.linkChip} onPress={() => router.push("/tests/mine")}>
          <Text style={styles.linkChipText}>Testlerim</Text>
        </Pressable>
        <Pressable style={styles.linkChip} onPress={() => router.push("/tests/history")}>
          <Text style={styles.linkChipText}>Geçmiş</Text>
        </Pressable>
      </View>

      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/tests/${item.id}`)}>
            <Text style={styles.testTitle}>{item.title}</Text>
            <Text style={styles.testMeta}>{item.questions.length} soru</Text>
          </Pressable>
        )}
      />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
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
  linkRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  linkChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkChipText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
  },
  testTitle: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 16,
  },
  testMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
