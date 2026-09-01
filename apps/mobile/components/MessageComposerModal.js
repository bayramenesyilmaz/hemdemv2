import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../lib/theme";
import { Button } from "./ui/Button";

/**
 * Discover ve u/[id] ekranlarında birebir aynı şekilde tekrarlanan mesaj
 * yazma modalı (bkz. eski kopyalar) — tek bileşene çıkarıldı. Gönderme
 * mantığı (sendMessage usecase çağrısı) her ekranda kendi state'inde
 * kalıyor, bu bileşen tamamen kontrollü/sunum amaçlı.
 */
export function MessageComposerModal({ visible, recipientName, draft, onChangeDraft, onCancel, onSend, sending, error }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{recipientName}&apos;e mesaj gönder</Text>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={onChangeDraft}
            placeholder="Mesajını yaz..."
            placeholderTextColor={colors.mutedDark}
            multiline
            autoFocus
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Button variant="outline" style={styles.actionButton} onPress={onCancel}>
              Vazgeç
            </Button>
            <Button
              variant="primary"
              style={styles.actionButton}
              onPress={onSend}
              loading={sending}
              disabled={!draft.trim()}
            >
              Gönder
            </Button>
          </View>
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
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    minHeight: 70,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
