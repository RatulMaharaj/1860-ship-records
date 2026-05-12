import { ImageResponse } from "next/og";
import { getDb, type Passenger } from "@/lib/db";
import { titleCase } from "@/lib/format";
import {
  CertificateBorder,
  COLORS,
  loadOgFonts,
  OG_CONTENT_TYPE,
  OG_SIZE,
  Ornament,
  Seal,
} from "../../og-shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Passenger record";
export const revalidate = false;

const flex = { display: "flex" } as const;
const flexCol = { display: "flex", flexDirection: "column" as const };

export default async function PassengerOG({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = parseInt(id, 10);
  const fonts = await loadOgFonts();

  const row = Number.isFinite(n)
    ? (getDb()
        .prepare("SELECT * FROM passengers WHERE indenture_no = ?")
        .get(n) as Passenger | undefined)
    : undefined;

  if (!row) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: COLORS.cream,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Newsreader",
            fontSize: 56,
            color: COLORS.zinc500,
          }}
        >
          Record not found
        </div>
      ),
      { ...size, fonts },
    );
  }

  const name = row.name ?? "(name unrecorded)";
  const arrival =
    row.arrival_month && row.arrival_year
      ? `${row.arrival_month} ${row.arrival_year}`
      : row.arrival_year
        ? String(row.arrival_year)
        : "";
  const ship = row.ship_name
    ? `${titleCase(row.ship_name)}${row.ship_voyage ? ` ${row.ship_voyage}` : ""}`
    : "";
  const port = row.embarkation_port ? titleCase(row.embarkation_port) : "";
  const origin = [titleCase(row.village ?? ""), titleCase(row.zillah ?? "")]
    .filter(Boolean)
    .join(", ");
  const ageBits = [
    row.age_yr != null ? `${row.age_yr} yrs` : null,
    row.sex ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Build facts list, filtering empties so we never render a null child.
  const facts: { label: string; value: string }[] = [];
  if (ship) facts.push({ label: "Vessel", value: ship });
  if (arrival) facts.push({ label: "Arrival", value: arrival });
  if (port) facts.push({ label: "Port", value: port });
  if (ageBits) facts.push({ label: "Particulars", value: ageBits });

  const nameLen = name.length;
  const nameFontSize =
    nameLen > 28 ? 44 : nameLen > 20 ? 56 : nameLen > 14 ? 68 : 84;

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
            padding: "56px 80px",
          }}
        >
          <CertificateBorder />

          {/* Top kicker */}
          <div
            style={{
              ...flex,
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.zinc500,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Colony of Natal
          </div>

          <div style={{ ...flex, marginTop: 14 }}>
            <Ornament width={90} size={16} />
          </div>

          {/* Lead-in */}
          <div
            style={{
              ...flex,
              marginTop: 26,
              fontFamily: "Inter",
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.zinc400,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            This is to record the arrival of
          </div>

          {/* Big italic name */}
          <div
            style={{
              ...flex,
              marginTop: 18,
              fontSize: nameFontSize,
              fontStyle: "italic",
              fontWeight: 500,
              color: COLORS.zinc900,
              letterSpacing: -1,
              lineHeight: 1,
              textAlign: "center",
              maxWidth: "100%",
            }}
          >
            {name}
          </div>

          {/* Indenture number */}
          <div
            style={{
              ...flex,
              marginTop: 20,
              fontFamily: "Inter",
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.zinc500,
              letterSpacing: 5,
              textTransform: "uppercase",
              gap: 12,
            }}
          >
            <div style={flex}>Indenture No.</div>
            <div style={{ ...flex, color: COLORS.zinc900 }}>
              {row.indenture_no.toLocaleString()}
            </div>
          </div>

          <div style={{ ...flex, marginTop: 26 }}>
            <Ornament width={70} size={12} />
          </div>

          {/* Facts row */}
          <div
            style={{
              ...flex,
              marginTop: 26,
              gap: 36,
              fontFamily: "Inter",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "100%",
              maxWidth: 880,
            }}
          >
            {facts.map((f) => (
              <Fact key={f.label} label={f.label} value={f.value} />
            ))}
          </div>

          {origin ? (
            <div
              style={{
                ...flexCol,
                marginTop: 24,
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  ...flex,
                  fontFamily: "Inter",
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.zinc400,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                Place of Origin
              </div>
              <div
                style={{
                  ...flex,
                  fontSize: 28,
                  fontStyle: "italic",
                  color: COLORS.zinc900,
                  lineHeight: 1.1,
                  textAlign: "center",
                  maxWidth: 900,
                }}
              >
                {origin}
              </div>
            </div>
          ) : null}

          {/* Seal */}
          <div
            style={{
              ...flex,
              position: "absolute",
              top: 48,
              right: 48,
            }}
          >
            <Seal year={row.arrival_year ?? 1860} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        maxWidth: 220,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 10,
          fontWeight: 600,
          color: COLORS.zinc400,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Newsreader",
          fontSize: 24,
          fontStyle: "italic",
          color: COLORS.zinc900,
          lineHeight: 1.15,
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        {value}
      </div>
    </div>
  );
}
