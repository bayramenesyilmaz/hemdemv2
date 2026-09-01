import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { countUnreadNotifications } from "@hemdem/core/usecases/notifications/countUnreadNotifications";
import { fetchRecentNotes } from "@hemdem/core/usecases/notes/fetchRecentNotes";
import { fetchLatestNotesByUsers } from "@hemdem/core/usecases/notes/fetchLatestNotesByUsers";
import { createNote } from "@hemdem/core/usecases/notes/createNote";
import { updateNote } from "@hemdem/core/usecases/notes/updateNote";
import { deleteNote } from "@hemdem/core/usecases/notes/deleteNote";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, gradients, radii, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../InitialsAvatar";
import { Button } from "../ui/Button";

const NOTE_MAX_LENGTH = 120;

/**
 * Web'deki AppHeader + PostAuthorRail'in (Instagram Not benzeri durum
 * şeridi) mobil karşılığı, tek bir üst bar altında birleştirilmiş —
 * kullanıcının isteği üzerine notlar ayrı bir sayfa/bölüm yerine burada.
 * Ana sekme köklerinde (discover/tests/posts/messages/menu) render
 * edilir; alt rotalarda (detay ekranları) kendi ScreenHeader'ları var.
 *
 * Not şeridi sadece `showNotes` verilen ekranda (Gönderiler) açılır —
 * Keşfet gibi tüm ekranı kullanan sayfalarda yer kaplamaması için.
 */
export function AppTopBar({ showNotes = false }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useSession();
  const [profile, setProfile] = useState(null);
  const [coins, setCoins] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notesByAuthor, setNotesByAuthor] = useState({});
  const [noteAuthors, setNoteAuthors] = useState([]);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeError, setComposeError] = useState(null);

  const [activeAuthor, setActiveAuthor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const [foundProfile, balance, unread, ownNotes, recentNotes] = await Promise.all([
        repositories.user.findById(userId),
        repositories.coin.getBalance(userId),
        countUnreadNotifications(repositories, userId),
        showNotes ? fetchLatestNotesByUsers(repositories, [userId]) : Promise.resolve({ data: {} }),
        showNotes ? fetchRecentNotes(repositories, 20) : Promise.resolve({ data: [] }),
      ]);
      if (cancelled) return;

      const combined = { ...ownNotes.data };
      for (const note of recentNotes.data) {
        if (!combined[note.userId]) combined[note.userId] = note;
      }

      const authorIds = Object.keys(combined).filter((id) => id !== userId);
      const authorProfiles = showNotes
        ? await Promise.all(authorIds.map((id) => repositories.user.findById(id)))
        : [];
      if (cancelled) return;

      setProfile(foundProfile);
      setCoins(balance);
      setUnreadCount(unread);
      setNotesByAuthor(combined);
      setNoteAuthors(authorProfiles.filter(Boolean));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, showNotes]);

  function openCompose() {
    setComposeError(null);
    setComposeText(notesByAuthor[userId]?.text ?? "");
    setComposeOpen(true);
  }

  async function handleCompose() {
    const text = composeText.trim();
    if (!text) return;
    setComposeError(null);
    setComposeLoading(true);
    const result = await createNote(repositories, userId, text);
    setComposeLoading(false);
    if (result.status === "error") {
      setComposeError("Not paylaşılamadı, tekrar dene.");
      return;
    }
    setNotesByAuthor((prev) => ({ ...prev, [userId]: result.data }));
    setComposeOpen(false);
  }

  function openNote(author) {
    const note = notesByAuthor[author.id];
    if (!note) return;
    setActiveAuthor(author);
    setEditText(note.text);
    setEditing(false);
  }

  async function handleSaveEdit() {
    const note = notesByAuthor[userId];
    if (!note || !editText.trim()) return;
    setDetailLoading(true);
    const result = await updateNote(repositories, userId, note.id, editText.trim());
    setDetailLoading(false);
    if (result.status === "error") return;
    setNotesByAuthor((prev) => ({ ...prev, [userId]: result.data }));
    setEditing(false);
  }

  function confirmDelete() {
    const note = notesByAuthor[userId];
    if (!note) return;
    Alert.alert("Notu sil", "Notunu silmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          setDetailLoading(true);
          await deleteNote(repositories, userId, note.id);
          setDetailLoading(false);
          setNotesByAuthor((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
          setActiveAuthor(null);
        },
      },
    ]);
  }

  const rail = [];
  if (userId && profile) rail.push(profile);
  for (const author of noteAuthors) {
    if (notesByAuthor[author.id]) rail.push(author);
  }

  const activeNote = activeAuthor ? notesByAuthor[activeAuthor.id] : null;
  const isOwnActiveNote = activeAuthor?.id === userId;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Text style={styles.logo}>Hemdem</Text>
        <View style={styles.spacer} />

        <Pressable style={styles.coinPill} onPress={() => router.push("/coins")}>
          <Text style={styles.coinText}>🪙 {coins}</Text>
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => router.push("/notifications")}>
          <Text style={styles.iconText}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/profile")}>
          <InitialsAvatar name={profile?.name ?? "?"} size={34} />
        </Pressable>
      </View>

      {showNotes && rail.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {rail.map((author) => {
            const note = notesByAuthor[author.id];
            const isMe = author.id === userId;
            return (
              <View key={author.id} style={styles.railItem}>
                <View style={styles.bubbleSlot}>
                  {note && (
                    <Pressable style={styles.noteBubble} onPress={() => openNote(author)}>
                      <Text style={styles.noteBubbleText} numberOfLines={2}>
                        {note.text}
                      </Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.avatarWrap}>
                  <Pressable
                    onPress={() => (isMe ? openCompose() : router.push(`/u/${author.id}`))}
                    style={styles.avatarRing}
                  >
                    <LinearGradient colors={gradients.primary} style={styles.avatarRingFill}>
                      <View style={styles.avatarInner}>
                        <InitialsAvatar name={author.name} size={48} />
                      </View>
                    </LinearGradient>
                  </Pressable>
                  {isMe && (
                    <Pressable style={styles.plusBadge} onPress={openCompose}>
                      <Text style={styles.plusBadgeText}>+</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.railName} numberOfLines={1}>
                  {isMe ? "Sen" : author.name}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={composeOpen} transparent animationType="fade" onRequestClose={() => setComposeOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Not bırak</Text>
            <TextInput
              style={styles.modalInput}
              value={composeText}
              onChangeText={(text) => setComposeText(text.slice(0, NOTE_MAX_LENGTH))}
              placeholder="Aklından ne geçiyor?"
              placeholderTextColor={colors.mutedDark}
              multiline
              autoFocus
            />
            <Text style={styles.charCount}>
              {composeText.length}/{NOTE_MAX_LENGTH}
            </Text>
            {composeError && <Text style={styles.error}>{composeError}</Text>}
            <View style={styles.modalActions}>
              <Button variant="outline" style={styles.modalActionButton} onPress={() => setComposeOpen(false)}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                style={styles.modalActionButton}
                onPress={handleCompose}
                loading={composeLoading}
                disabled={!composeText.trim()}
              >
                Paylaş
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(activeAuthor)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveAuthor(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {activeAuthor && activeNote && (
              <>
                <View style={styles.detailHeader}>
                  <InitialsAvatar name={activeAuthor.name} size={36} />
                  <Text style={styles.modalTitle}>{isOwnActiveNote ? "Notun" : activeAuthor.name}</Text>
                </View>

                {editing ? (
                  <>
                    <TextInput
                      style={styles.modalInput}
                      value={editText}
                      onChangeText={(text) => setEditText(text.slice(0, NOTE_MAX_LENGTH))}
                      multiline
                      autoFocus
                    />
                    <View style={styles.modalActions}>
                      <Button variant="outline" style={styles.modalActionButton} onPress={() => setEditing(false)}>
                        Vazgeç
                      </Button>
                      <Button
                        variant="primary"
                        style={styles.modalActionButton}
                        onPress={handleSaveEdit}
                        loading={detailLoading}
                      >
                        Kaydet
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.noteFullText}>{activeNote.text}</Text>
                    <View style={styles.modalActions}>
                      {isOwnActiveNote ? (
                        <>
                          <Button
                            variant="outline"
                            style={styles.modalActionButton}
                            onPress={confirmDelete}
                            disabled={detailLoading}
                          >
                            Sil
                          </Button>
                          <Button
                            variant="primary"
                            style={styles.modalActionButton}
                            onPress={() => setEditing(true)}
                          >
                            Düzenle
                          </Button>
                        </>
                      ) : (
                        <Button variant="primary" style={styles.modalActionButton} onPress={() => setActiveAuthor(null)}>
                          Kapat
                        </Button>
                      )}
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    height: 52,
    gap: spacing.sm,
  },
  logo: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
  },
  spacer: {
    flex: 1,
  },
  coinPill: {
    backgroundColor: colors.cardAlt,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  coinText: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 13,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  rail: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  railItem: {
    width: 68,
    alignItems: "center",
    gap: spacing.xs,
  },
  bubbleSlot: {
    height: 30,
    justifyContent: "flex-end",
  },
  noteBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    maxWidth: 88,
  },
  noteBubbleText: {
    color: colors.foreground,
    fontSize: 10,
    lineHeight: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarRing: {
    borderRadius: 27,
  },
  avatarRingFill: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background,
  },
  plusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  plusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    marginTop: -1,
  },
  railName: {
    color: colors.mutedForeground,
    fontSize: 11,
    maxWidth: 68,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "800",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    minHeight: 70,
    textAlignVertical: "top",
  },
  charCount: {
    color: colors.mutedDark,
    fontSize: 11,
    textAlign: "right",
  },
  noteFullText: {
    color: colors.foreground,
    fontSize: 15,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalActionButton: {
    flex: 1,
  },
});
