import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { repositories } from "../lib/repositories";
import { colors, radii, spacing } from "../lib/theme";
import { Button } from "./ui/Button";

/**
 * Arama + sayfalanmış liste şeklindeki test seçici — gönderi test
 * etiketleme ve profil düzenlemedeki kapı testi seçimi arasında paylaşmak
 * için posts.js'ten buraya çıkarıldı.
 */
export function TestPickerModal({ visible, onClose, onSelect, title = "Test seç" }) {
  const [query, setQuery] = useState("");
  const [tests, setTests] = useState([]);

  async function handleSearch(text) {
    setQuery(text);
    const result = await repositories.test.findMany({ search: text || undefined, limit: 30 });
    setTests(result);
  }

  function handleShow() {
    if (tests.length === 0 && !query) {
      repositories.test.findMany({ limit: 30 }).then(setTests);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={handleShow} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Test ara..."
            placeholderTextColor={colors.mutedDark}
          />
          <FlatList
            data={tests}
            keyExtractor={(item) => item.id}
            style={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Sonuç yok.</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.rowText} numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            )}
          />
          <Button variant="outline" onPress={onClose}>
            Vazgeç
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "70%",
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
  },
  list: {
    maxHeight: 260,
  },
  empty: {
    color: colors.mutedForeground,
    fontSize: 13,
    paddingVertical: spacing.md,
    textAlign: "center",
  },
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    color: colors.foreground,
    fontSize: 14,
  },
});
