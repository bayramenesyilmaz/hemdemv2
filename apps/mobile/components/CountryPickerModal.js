import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { COUNTRIES } from "../lib/countries";
import { colors, radii, spacing } from "../lib/theme";
import { Button } from "./ui/Button";

/**
 * Arama + liste şeklindeki ülke seçici — hem keşfet filtresinde hem profil
 * düzenlemede aynı deneyimi paylaşmak için DiscoverFiltersModal'dan buraya
 * çıkarıldı.
 */
export function CountryPickerModal({ visible, onClose, onSelect, allowAny = true }) {
  const [query, setQuery] = useState("");
  const filteredCountries = query
    ? COUNTRIES.filter((c) => c.tr.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  function handleSelect(code) {
    onSelect(code);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Ülke seç</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Ara..."
            placeholderTextColor={colors.mutedDark}
          />
          {allowAny && (
            <Pressable style={styles.option} onPress={() => handleSelect(undefined)}>
              <Text style={styles.optionText}>Herhangi</Text>
            </Pressable>
          )}
          <ScrollView style={styles.list}>
            {filteredCountries.map((c) => (
              <Pressable key={c.code} style={styles.option} onPress={() => handleSelect(c.code)}>
                <Text style={styles.optionText}>{c.tr}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Button variant="outline" onPress={onClose}>
            Kapat
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
    maxHeight: "75%",
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
    marginBottom: spacing.xs,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
  },
  list: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    color: colors.foreground,
    fontSize: 14,
  },
});
