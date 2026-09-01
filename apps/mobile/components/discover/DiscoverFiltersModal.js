import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { COUNTRIES } from "../../lib/countries";
import { colors, radii, spacing } from "../../lib/theme";
import { Button } from "../ui/Button";

const GENDER_OPTIONS = [
  { value: undefined, label: "Herkes" },
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
];

/**
 * Web'deki DiscoverFilters'ın (cinsiyet + ülke + yaş aralığı) mobil
 * karşılığı. Web'de çift tutamaçlı bir RangeSlider var — RN'de aynı
 * bileşeni kullanamadığımız için yaş aralığı iki ayrı sayısal alan
 * olarak tutuluyor, aynı sonucu üretiyor.
 */
export function DiscoverFiltersModal({ visible, onClose, filters, onApply }) {
  const [gender, setGender] = useState(filters.gender);
  const [country, setCountry] = useState(filters.country);
  const [minAge, setMinAge] = useState(String(filters.minAge ?? 18));
  const [maxAge, setMaxAge] = useState(String(filters.maxAge ?? 80));
  const [countryQuery, setCountryQuery] = useState("");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const selectedCountryName = COUNTRIES.find((c) => c.code === country)?.tr;
  const filteredCountries = countryQuery
    ? COUNTRIES.filter((c) => c.tr.toLowerCase().includes(countryQuery.toLowerCase()))
    : COUNTRIES;

  function handleApply() {
    const min = Number(minAge) || 18;
    const max = Number(maxAge) || 80;
    onApply({
      gender,
      country,
      minAge: min > 18 ? min : undefined,
      maxAge: max < 80 ? max : undefined,
    });
    onClose();
  }

  function handleClear() {
    setGender(undefined);
    setCountry(undefined);
    setMinAge("18");
    setMaxAge("80");
    onApply({});
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Filtrele</Text>

          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                style={[styles.genderChip, gender === option.value && styles.genderChipActive]}
                onPress={() => setGender(option.value)}
              >
                <Text style={[styles.genderChipText, gender === option.value && styles.genderChipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Ülke</Text>
          <Pressable style={styles.countryTrigger} onPress={() => setCountryPickerOpen(true)}>
            <Text style={styles.countryTriggerText}>{selectedCountryName ?? "Herhangi"}</Text>
            <Text style={styles.countryTriggerChevron}>›</Text>
          </Pressable>

          <Text style={styles.label}>Yaş aralığı</Text>
          <View style={styles.ageRow}>
            <TextInput
              style={styles.ageInput}
              value={minAge}
              onChangeText={setMinAge}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.ageSeparator}>–</Text>
            <TextInput
              style={styles.ageInput}
              value={maxAge}
              onChangeText={setMaxAge}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.actions}>
            <Button variant="ghost" style={styles.actionButton} onPress={handleClear}>
              Temizle
            </Button>
            <Button variant="outline" style={styles.actionButton} onPress={onClose}>
              Vazgeç
            </Button>
            <Button variant="primary" style={styles.actionButton} onPress={handleApply}>
              Uygula
            </Button>
          </View>
        </View>
      </View>

      <Modal
        visible={countryPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.card, styles.countryCard]}>
            <Text style={styles.title}>Ülke seç</Text>
            <TextInput
              style={styles.countrySearchInput}
              value={countryQuery}
              onChangeText={setCountryQuery}
              placeholder="Ara..."
              placeholderTextColor={colors.mutedDark}
            />
            <Pressable
              style={styles.countryOption}
              onPress={() => {
                setCountry(undefined);
                setCountryPickerOpen(false);
              }}
            >
              <Text style={styles.countryOptionText}>Herhangi</Text>
            </Pressable>
            <ScrollView style={styles.countryList}>
              {filteredCountries.map((c) => (
                <Pressable
                  key={c.code}
                  style={styles.countryOption}
                  onPress={() => {
                    setCountry(c.code);
                    setCountryPickerOpen(false);
                  }}
                >
                  <Text style={styles.countryOptionText}>{c.tr}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button variant="outline" onPress={() => setCountryPickerOpen(false)}>
              Kapat
            </Button>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  countryCard: {
    maxHeight: "75%",
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  genderRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  genderChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: 8,
    alignItems: "center",
  },
  genderChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  genderChipText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  genderChipTextActive: {
    color: colors.primary,
  },
  countryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  countryTriggerText: {
    color: colors.foreground,
    fontSize: 14,
  },
  countryTriggerChevron: {
    color: colors.mutedForeground,
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    textAlign: "center",
  },
  ageSeparator: {
    color: colors.mutedForeground,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  countrySearchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
  },
  countryList: {
    maxHeight: 300,
  },
  countryOption: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryOptionText: {
    color: colors.foreground,
    fontSize: 14,
  },
});
