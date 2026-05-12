import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export const COLORS = {
  zinc900: "#18181b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  saffron: "#FE661D",
  cream: "#ededed",
} as const;

const FONTS_DIR = join(process.cwd(), "app", "og-fonts");

export async function loadOgFonts() {
  const [serif, serifItalic, serifBoldItalic, sans] = await Promise.all([
    readFile(join(FONTS_DIR, "Newsreader-SemiBold.ttf")),
    readFile(join(FONTS_DIR, "Newsreader-Italic.ttf")),
    readFile(join(FONTS_DIR, "Newsreader-SemiBoldItalic.ttf")),
    readFile(join(FONTS_DIR, "Inter-SemiBold.ttf")),
  ]);
  return [
    {
      name: "Newsreader",
      data: serif,
      style: "normal" as const,
      weight: 600 as const,
    },
    {
      name: "Newsreader",
      data: serifItalic,
      style: "italic" as const,
      weight: 400 as const,
    },
    {
      name: "Newsreader",
      data: serifBoldItalic,
      style: "italic" as const,
      weight: 600 as const,
    },
    { name: "Inter", data: sans, style: "normal" as const, weight: 600 as const },
  ];
}

export async function readFlagDataUri(file: string) {
  const buf = await readFile(join(process.cwd(), "public", "flags", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

export function Ornament({
  width = 80,
  size = 14,
  color = COLORS.zinc400,
}: {
  width?: number;
  size?: number;
  color?: string;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, color }}
    >
      <div style={{ width, height: 2, background: color }} />
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
      </svg>
      <div style={{ width, height: 2, background: color }} />
    </div>
  );
}

export function SealGuilloche({
  size = 140,
  rOuter = 68,
  rInner = 60,
  ticks = 60,
  showInnerRing = true,
  color = COLORS.saffron,
}: {
  size?: number;
  rOuter?: number;
  rInner?: number;
  ticks?: number;
  showInnerRing?: boolean;
  color?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const tickEls = [];
  for (let i = 0; i < ticks; i++) {
    const angle = (i / ticks) * Math.PI * 2;
    tickEls.push(
      <line
        key={i}
        x1={cx + rInner * Math.cos(angle)}
        y1={cy + rInner * Math.sin(angle)}
        x2={cx + rOuter * Math.cos(angle)}
        y2={cy + rOuter * Math.sin(angle)}
        stroke={color}
        strokeWidth="1.2"
      />,
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={rOuter}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
      />
      {showInnerRing ? (
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
        />
      ) : null}
      {tickEls}
    </svg>
  );
}

export function Seal({
  year = 1860,
  size = 94,
  rOuter = 46,
  rInner = 36,
  ticks = 44,
  discSize = 64,
  showInnerRing = true,
  yearFontSize = 17,
  labelFontSize = 7,
  labelLetterSpacing = 1.2,
}: {
  year?: number | string;
  size?: number;
  rOuter?: number;
  rInner?: number;
  ticks?: number;
  discSize?: number;
  showInnerRing?: boolean;
  yearFontSize?: number;
  labelFontSize?: number;
  labelLetterSpacing?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <SealGuilloche
        size={size}
        rOuter={rOuter}
        rInner={rInner}
        ticks={ticks}
        showInnerRing={showInnerRing}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          width: discSize,
          height: discSize,
          borderRadius: "50%",
          background: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.saffron,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: labelFontSize,
            fontWeight: 600,
            letterSpacing: labelLetterSpacing,
          }}
        >
          NATAL
        </div>
        <div
          style={{
            display: "flex",
            fontSize: yearFontSize,
            fontStyle: "italic",
            fontWeight: 600,
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {year}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: labelFontSize,
            fontWeight: 600,
            letterSpacing: labelLetterSpacing,
            marginTop: 2,
          }}
        >
          REGISTER
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the double ruled border using an SVG that fills the parent card.
 * The card inside `<ImageResponse>` is 1080 × 510 (1200 minus 60px padding each side).
 * Satori reliably renders SVG strokes — empty positioned <div>s collapse instead.
 */
export function CertificateBorder({
  width = 1080,
  height = 510,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <rect
        x={14}
        y={14}
        width={width - 28}
        height={height - 28}
        fill="none"
        stroke="rgba(161,161,170,0.55)"
        strokeWidth="1"
      />
      <rect
        x={22}
        y={22}
        width={width - 44}
        height={height - 44}
        fill="none"
        stroke="rgba(161,161,170,0.4)"
        strokeWidth="1"
      />
    </svg>
  );
}
