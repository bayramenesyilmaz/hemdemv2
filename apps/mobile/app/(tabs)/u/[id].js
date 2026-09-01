import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, radii, spacing } from "../../../lib/theme";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { SafetyMenu } from "../../../components/SafetyMenu";
import { ProfileHero } from "../../../components/profile/ProfileHero";
import { SolvedTestsList } from "../../../components/profile/SolvedTestsList";
import { MessageComposerModal } from "../../../components/MessageComposerModal";

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
        <ProfileHero profile={profile} age={age} onBack={() => router.back()} />

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

          {!isOwnProfile && (
            <SafetyMenu
              targetUserId={profile.id}
              targetName={profile.name}
              onBlocked={() => router.back()}
            />
          )}

          <SolvedTestsList tests={solvedTests} onPressTest={(test) => router.push(solvedTestHref(test))} />
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

      <MessageComposerModal
        visible={messageOpen}
        recipientName={profile.name}
        draft={messageDraft}
        onChangeDraft={setMessageDraft}
        onCancel={() => setMessageOpen(false)}
        onSend={handleSendMessage}
        sending={sending}
        error={messageStatus}
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
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 40,
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
});
