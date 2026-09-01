import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { blockUser } from "@hemdem/core/usecases/safety/blockUser";
import { reportUser } from "@hemdem/core/usecases/safety/reportUser";
import { repositories } from "../lib/repositories";
import { useSession } from "../lib/session";
import { colors, radii, spacing } from "../lib/theme";
import { Button } from "./ui/Button";

/**
 * Engelle + şikayet et — web'deki SafetyMenu'nün mobil karşılığı. App
 * Store'un UGC/kullanıcı-kullanıcı iletişimi olan app'ler için zorunlu
 * tuttuğu (Guideline 1.2) güvenlik akışı.
 */
export function SafetyMenu({ targetUserId, targetName, onBlocked }) {
  const { userId } = useSession();
  const [blockOpen, setBlockOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  async function handleBlock() {
    setBlocking(true);
    setBlockError(null);
    const result = await blockUser(repositories, userId, targetUserId);
    setBlocking(false);
    if (result.status === "error") {
      setBlockError(result.message);
      return;
    }
    setBlockOpen(false);
    onBlocked?.();
  }

  async function handleReport() {
    setReporting(true);
    setReportError(null);
    const result = await reportUser(repositories, {
      reporterId: userId,
      targetUserId,
      subject,
      description,
    });
    setReporting(false);
    if (result.status === "error") {
      setReportError(result.message);
      return;
    }
    setReportSuccess(true);
    setSubject("");
    setDescription("");
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={() => setBlockOpen(true)}>
        <Text style={styles.link}>Engelle</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          setReportSuccess(false);
          setReportOpen(true);
        }}
      >
        <Text style={styles.link}>Şikayet Et</Text>
      </Pressable>

      <Modal visible={blockOpen} transparent animationType="fade" onRequestClose={() => setBlockOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>{targetName} kullanıcısını engelle</Text>
            <Text style={styles.body}>
              Engellersen birbirinizi keşfette, mesajlarda ve beğenilerde göremezsiniz.
            </Text>
            {blockError && <Text style={styles.error}>{blockError}</Text>}
            <View style={styles.actions}>
              <Button variant="outline" style={styles.actionButton} onPress={() => setBlockOpen(false)}>
                Vazgeç
              </Button>
              <Button variant="delete" style={styles.actionButton} onPress={handleBlock} loading={blocking}>
                Engelle
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={reportOpen} transparent animationType="fade" onRequestClose={() => setReportOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {reportSuccess ? (
              <Text style={styles.body}>Şikayetin alındı, incelenecek.</Text>
            ) : (
              <>
                <Text style={styles.title}>{targetName} kullanıcısını şikayet et</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Konu"
                  placeholderTextColor={colors.mutedDark}
                />
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ne oldu, kısaca anlat"
                  placeholderTextColor={colors.mutedDark}
                  multiline
                />
                {reportError && <Text style={styles.error}>{reportError}</Text>}
                <View style={styles.actions}>
                  <Button variant="outline" style={styles.actionButton} onPress={() => setReportOpen(false)}>
                    Vazgeç
                  </Button>
                  <Button
                    variant="delete"
                    style={styles.actionButton}
                    onPress={handleReport}
                    loading={reporting}
                    disabled={!subject.trim() || !description.trim()}
                  >
                    Gönder
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  link: {
    color: colors.mutedForeground,
    fontSize: 13,
    textDecorationLine: "underline",
  },
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
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: "top",
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
