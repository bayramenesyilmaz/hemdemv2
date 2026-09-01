import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, gradients, radii, spacing } from "../../../lib/theme";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

const SOLVED_TESTS_LIMIT = 5;

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();
  const [profile, setProfile] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [existingChat, setExistingChat] = useState(null);
  const [solvedTests, setSolvedTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [likeStatus, setLikeStatus] = useState(null);
  const [liking, setLiking] = useState(false);
  const [matched, setMatched] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      const found = await repositories.user.findById(id);
      if (cancelled || !found) return;

      if (userId && userId !== found.id) {
        await repositories.profileView.recordView(userId, found.id);
      }

      const [count, chat, answers] = await Promise.all([
        repositories.profileView.countViews(found.id),
        userId && userId !== found.id ? repositories.chat.findByPair(userId, found.id) : Promise.resolve(null),
        repositories.test.findAnswersByUser(found.id),
      ]);
      if (cancelled) return;

      const tests = (await Promise.all(answers.map((a) => repositories.test.findById(a.testId))))
        .filter(Boolean)
        .slice(0, SOLVED_TESTS_LIMIT);

      setProfile(found);
      setViewCount(count);
      setExistingChat(chat);
      setSolvedTests(tests);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  async function handleLike() {
    setLiking(true);
    setLikeStatus(null);
    const result = await likeUser(repositories, userId, id, "like");
    setLiking(false);
    if (result.status === "error") {
      setLikeStatus(result.message);
      return;
    }
    if (result.data.matched) {
      setMatched(true);
    } else {
      setLikeStatus("liked");
    }
  }

  async function handleSendMessage() {
    const content = messageDraft.trim();
    if (!content) return;
    setSending(true);
    setMessageStatus(null);
    const result = await sendMessage(repositories, userId, id, content);
    setSending(false);
    if (result.status === "error") {
      setMessageStatus(result.message);
      return;
    }
    setMessageOpen(false);
    router.push(`/messages/${result.data.chat.id}`);
  }

  function solvedTestHref(test) {
    if (userId === profile.id) return `/tests/${test.id}/result`;
    if (userId) return `/tests/${test.id}/compare/${profile.id}`;
    return `/tests/${test.id}`;
  }

  if (loading || !profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const age = profile.birthdate ? calculateAge(profile.birthdate) : null;
  const socialEntries = Object.entries(profile.socialLinks ?? {});
  const isOwnProfile = userId === profile.id;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <LinearGradient colors={gradients.primary} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.heroPhoto}>
            <Text style={styles.heroInitials}>
              {profile.name
                .split(" ")
                .filter(Boolean)
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </Text>
          </LinearGradient>

          <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.92)"]} style={styles.heroOverlay}>
            <Text style={styles.heroName}>
              {profile.name}
              {age ? `, ${age}` : ""}
            </Text>
            {profile.country && <Text style={styles.heroCountry}>{profile.country}</Text>}
            {profile.bio && <Text style={styles.heroBio}>{profile.bio}</Text>}
          </LinearGradient>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.viewCount}>{viewCount} kişi bu profili görüntüledi</Text>

          {profile.gateTestId && (
            <Text style={styles.gateNote}>🔒 Kapı testi aktif (%{profile.gateTestThreshold ?? 0})</Text>
          )}

          {socialEntries.length > 0 && (
            <View style={styles.socialRow}>
              {socialEntries.map(([platform, url]) => (
                <Pressable key={platform} style={styles.socialChip} onPress={() => Linking.openURL(url)}>
                  <Text style={styles.socialChipText}>{platform}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {!isOwnProfile &&
            (existingChat ? (
              <Button variant="primary" onPress={() => router.push(`/messages/${existingChat.id}`)}>
                💬 Sohbete Git
              </Button>
            ) : (
              <View style={styles.actionsRow}>
                <Button variant="primary" style={styles.actionButton} onPress={handleLike} loading={liking}>
                  ❤️ Beğen
                </Button>
                <Button
                  variant="outline"
                  style={styles.actionButton}
                  onPress={() => {
                    setMessageStatus(null);
                    setMessageDraft("");
                    setMessageOpen(true);
                  }}
                >
                  💬 Mesaj Gönder
                </Button>
              </View>
            ))}

          {likeStatus === "liked" && <Text style={styles.statusText}>Beğenin gönderildi.</Text>}
          {likeStatus && likeStatus !== "liked" && <Text style={styles.errorText}>{likeStatus}</Text>}

          {solvedTests.length > 0 && (
            <View style={styles.solvedSection}>
              <Text style={styles.solvedTitle}>Çözdüğü Testler</Text>
              {solvedTests.map((test) => (
                <Pressable key={test.id} style={styles.solvedRow} onPress={() => router.push(solvedTestHref(test))}>
                  <Text style={styles.solvedRowText} numberOfLines={1}>
                    {test.title}
                  </Text>
                  <Text style={styles.solvedRowChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={matched} transparent animationType="fade" onRequestClose={() => setMatched(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Eşleştiniz!</Text>
            <Text style={styles.modalBody}>{profile.name} ile eşleştin.</Text>
            <Button variant="primary" onPress={() => setMatched(false)}>
              Tamam
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={messageOpen} transparent animationType="fade" onRequestClose={() => setMessageOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{profile.name}'e mesaj gönder</Text>
            <TextInput
              style={styles.messageInput}
              value={messageDraft}
              onChangeText={setMessageDraft}
              placeholder="Mesajını yaz..."
              placeholderTextColor={colors.mutedDark}
              multiline
              autoFocus
            />
            {messageStatus && <Text style={styles.errorText}>{messageStatus}</Text>}
            <View style={styles.modalActions}>
              <Button variant="outline" style={styles.modalActionButton} onPress={() => setMessageOpen(false)}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                style={styles.modalActionButton}
                onPress={handleSendMessage}
                loading={sending}
                disabled={!messageDraft.trim()}
              >
                Gönder
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    height: 340,
    width: "100%",
  },
  heroPhoto: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitials: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 88,
    fontWeight: "800",
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "35%",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  heroName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  heroCountry: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  heroBio: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },
  backButton: {
    position: "absolute",
    top: 54,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(18,16,20,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: -2,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  viewCount: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  gateNote: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  socialChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  socialChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  statusText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },
  solvedSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  solvedTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  solvedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  solvedRowText: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  solvedRowChevron: {
    color: colors.mutedForeground,
    fontSize: 16,
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
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: "stretch",
  },
  modalEmoji: {
    fontSize: 40,
    textAlign: "center",
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  modalBody: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    minHeight: 70,
    textAlignVertical: "top",
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
