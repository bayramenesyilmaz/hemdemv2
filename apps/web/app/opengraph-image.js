import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Kod tabanlı, statik bir tasarım varlığı gerektirmeyen varsayılan OG
 * görseli — sayfa kendi `opengraph-image.js`'ini tanımlamadığı sürece
 * tüm rotalarda bu kullanılır (Next.js dosya tabanlı metadata kuralı
 * segment ağacında miras alınır).
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, hsl(350, 82%, 52%), hsl(240, 10%, 10%))",
          color: "white",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700 }}>Hemdem</div>
        <div style={{ fontSize: 36, fontWeight: 400, marginTop: 16, opacity: 0.9 }}>
          Kişiliğini keşfet, gerçek eşleşmeler bul
        </div>
      </div>
    ),
    { ...size }
  );
}
