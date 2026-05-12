import { ImageResponse } from "next/og";
import {
  CertificateBorder,
  COLORS,
  loadOgFonts,
  OG_CONTENT_TYPE,
  OG_SIZE,
  Ornament,
  Seal,
} from "./og-shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Indentured Ship Records, 1860–1911 — Gandhi-Luthuli Documentation Centre, UKZN";

export default async function OG() {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: COLORS.cream,
          display: "flex",
          padding: 60,
          fontFamily: "Newsreader",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            background: "#ffffff",
            border: `1px solid ${COLORS.zinc300}`,
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.06), 0 10px 30px -10px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 60,
          }}
        >
          <CertificateBorder />

          <div
            style={{
              fontFamily: "Inter",
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.zinc500,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Colony of Natal
          </div>

          <div style={{ marginTop: 20, display: "flex" }}>
            <Ornament width={110} size={22} />
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 70,
              fontWeight: 600,
              color: COLORS.zinc900,
              letterSpacing: -1,
              lineHeight: 1.05,
              textAlign: "center",
            }}
          >
            Indentured Ship Records,
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 76,
              fontWeight: 600,
              fontStyle: "italic",
              color: COLORS.zinc900,
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            1860 — 1911
          </div>

          <div
            style={{
              marginTop: 32,
              fontFamily: "Inter",
              fontSize: 22,
              fontWeight: 600,
              color: "#3f3f46",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            152,240 passengers · 81 ships · 2 ports
          </div>

          <div
            style={{
              marginTop: 14,
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.zinc400,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Data from the Gandhi-Luthuli Documentation Centre, UKZN
          </div>

          <div style={{ marginTop: 24, display: "flex" }}>
            <Ornament />
          </div>

          {/* Seal top-right */}
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 48,
              display: "flex",
            }}
          >
            <Seal year={1860} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
