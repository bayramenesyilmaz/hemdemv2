import { ImageResponse } from "next/og";

/**
 * Android'in "maskable" ikon formatı: sistem ikonu daire/kare/damla gibi
 * farklı şekillerde kırpar, bu yüzden marka işareti tuvalin ortasındaki
 * güvenli alanda (yaklaşık %60) kalmalı ve kenarlar dolu olmalı.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(140deg, #e11d48, #1a1a1f)",
          color: "white",
          fontSize: 220,
          fontWeight: 800,
        }}
      >
        H
      </div>
    ),
    { width: 512, height: 512 }
  );
}
