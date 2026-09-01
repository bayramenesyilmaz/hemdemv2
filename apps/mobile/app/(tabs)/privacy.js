import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../lib/theme";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../components/ui/Screen";

const SECTIONS = [
  {
    title: "Hangi verileri topluyoruz",
    body: "Hesap bilgilerin (e-posta), profil bilgilerin (ad, doğum tarihi, cinsiyet, ülke, biyografi, sosyal medya bağlantıları), yüklediğin profil fotoğrafı, test cevapların, gönderdiğin/aldığın mesajlar, gönderiler ve coin/puan aktivitendir.",
  },
  {
    title: "Verilerini ne için kullanıyoruz",
    body: "Uyum/eşleşme hesaplamak, keşfet listesini oluşturmak, mesajlaşmayı sağlamak, bildirim göndermek ve hesabını yönetmek için kullanıyoruz. Verilerin reklam ağlarıyla paylaşılmaz; uygulama içi 'coin kazan' akışı simüle edilmiş bir deneyimdir, üçüncü taraf bir reklam SDK'sı kullanmaz.",
  },
  {
    title: "Kimlerle paylaşıyoruz",
    body: "Profilin, aynı platformdaki diğer kullanıcılara (keşfet, herkese açık profil sayfası) görünür. Verilerin, barındırma sağlayıcımız (Supabase) dışında hiçbir üçüncü tarafla paylaşılmaz veya satılmaz.",
  },
  {
    title: "Verilerini ne kadar süre saklıyoruz",
    body: "Hesabın aktif olduğu sürece verilerini saklarız. Profili Düzenle sayfasındaki 'Hesabımı Sil' ile hesabını ve tüm ilişkili verilerini kalıcı ve geri alınamaz şekilde silebilirsin.",
  },
  {
    title: "Güvenlik",
    body: "Veritabanı erişimi yalnızca sunucu tarafında, satır düzeyi güvenlik (RLS) korumalı bir bağlantıyla yapılır — cihazına hiçbir veritabanı kimlik bilgisi gönderilmez.",
  },
  {
    title: "Hakların",
    body: "Verilerine erişme, düzeltme ve silme hakkına sahipsin. Profil bilgilerini istediğin zaman düzenleyebilir, hesabını kalıcı olarak silebilir veya bir talep/şikayet ile bize ulaşabilirsin.",
  },
];

export default function PrivacyScreen() {
  const insets = useScreenInsets();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[insets, styles.content]}>
        <ScreenHeader title="Gizlilik Politikası" back />
        <Text style={styles.intro}>
          Hemdem, kişilik testleriyle tanışma sağlayan bir platformdur. Bu sayfa hangi verileri topladığımızı, neden
          topladığımızı ve haklarını nasıl kullanacağını anlatır.
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.md,
    paddingBottom: 40,
  },
  intro: {
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
  },
  cardBody: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 19,
  },
});
