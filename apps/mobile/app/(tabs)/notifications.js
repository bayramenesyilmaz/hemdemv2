import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchNotifications } from "@hemdem/core/usecases/notifications/fetchNotifications";
import { markNotificationsRead } from "@hemdem/core/usecases/notifications/markNotificationsRead";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, radii, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../components/ui/Screen";

function notificationText({ notification, actor, test }) {
  if (notification.type === "test_similarity" && test) {
    return `${actor.name}, ${test.title} testinde seninle uyumlu çıktı.`;
  }
  if (notification.type === "match") {
    return `${actor.name} ile eşleştin! Sohbete başla.`;
  }
  if (notification.type === "daily_match") {
    return `Günün eşleşmesi: ${actor.name}`;
  }
  return `${actor.name} seni beğendi.`;
}

function notificationHref({ notification, actor, test, chat }) {
  if (notification.type === "test_similarity" && test) return `/tests/${test.id}/result`;
  if (notification.type === "match" && chat) return `/messages/${chat.id}`;
  return `/u/${actor.id}`;
}

export default function NotificationsScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const { userId } = useSession();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await fetchNotifications(repositories, userId);
      if (cancelled || result.status !== "success") return;
      setEntries(result.data);
      setLoading(false);
      markNotificationsRead(repositories, userId);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.notification.id)}
        contentContainerStyle={[insets, styles.list]}
        ListHeaderComponent={<ScreenHeader title="Bildirimler" back />}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="Henüz bildirimin yok" description="Beğeni, eşleşme ve uyum bildirimleri burada birikecek." />
        }
        renderItem={({ item }) => (
          <Card
            style={[styles.row, !item.notification.isRead && styles.rowUnread]}
            onPress={() => router.push(notificationHref(item))}
          >
            <InitialsAvatar name={item.actor.name} size={44} />
            <Text style={styles.text}>{notificationText(item)}</Text>
            {item.notification.similarity != null && (
              <Badge tone="primary">%{item.notification.similarity}</Badge>
            )}
            {!item.notification.isRead && <View style={styles.unreadDot} />}
          </Card>
        )}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowUnread: {
    borderColor: colors.primary,
  },
  text: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
});
