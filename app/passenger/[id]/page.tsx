import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, type Passenger } from "@/lib/db";
import { titleCase } from "@/lib/format";

// Historical data is immutable — cache each rendered page forever.
export const revalidate = false;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const n = parseInt(id, 10);
  if (!Number.isFinite(n)) return { title: "Passenger not found" };

  const row = getDb()
    .prepare("SELECT * FROM passengers WHERE indenture_no = ?")
    .get(n) as Passenger | undefined;
  if (!row) return { title: "Passenger not found" };

  const displayName = row.name ? titleCase(row.name) : "Unknown passenger";
  const title = `${displayName} — Indenture No. ${row.indenture_no.toLocaleString()}`;

  const bits: string[] = [];
  if (row.ship_name) {
    bits.push(
      `${titleCase(row.ship_name)}${row.ship_voyage ? ` ${row.ship_voyage}` : ""}`,
    );
  }
  if (row.arrival_month && row.arrival_year) {
    bits.push(`${row.arrival_month} ${row.arrival_year}`);
  } else if (row.arrival_year) {
    bits.push(String(row.arrival_year));
  }
  if (row.embarkation_port) bits.push(`from ${titleCase(row.embarkation_port)}`);
  if (row.village || row.zillah) {
    bits.push(
      `origin ${[titleCase(row.village ?? ""), titleCase(row.zillah ?? "")]
        .filter(Boolean)
        .join(", ")}`,
    );
  }
  const description = `Indentured passenger record from the Natal register, 1860–1911. ${bits.join(" · ")}`;

  return {
    title,
    description,
    alternates: { canonical: `/passenger/${row.indenture_no}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/passenger/${row.indenture_no}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type FieldDef = { key: keyof Passenger; label: string; longLabel?: string };

const PERSON_FIELDS: FieldDef[] = [
  { key: "father", label: "Father" },
  { key: "age_yr", label: "Age" },
  { key: "sex", label: "Sex" },
  { key: "caste", label: "Caste" },
];

const ORIGIN_FIELDS: FieldDef[] = [
  { key: "village", label: "Village" },
  { key: "thanna", label: "Thanna" },
  { key: "zillah", label: "Zillah" },
  { key: "embarkation_port", label: "Port", longLabel: "Port of Embarkation" },
];

const VOYAGE_FIELDS: FieldDef[] = [
  { key: "ship_name", label: "Vessel" },
  { key: "ship_voyage", label: "Voyage" },
  { key: "arrival_month", label: "Month", longLabel: "Month of Arrival" },
  { key: "arrival_year", label: "Year", longLabel: "Year of Arrival" },
];

const SERVICE_FIELDS: FieldDef[] = [
  { key: "employer", label: "Employer" },
  { key: "returned_deceased", label: "Outcome" },
];

const NOTE_FIELDS: FieldDef[] = [
  { key: "remarks", label: "Remarks" },
  { key: "arrival_raw", label: "Original arrival entry" },
];

// Fields that should NOT be title-cased (already normalized, or codes/numbers).
const RAW_FIELDS = new Set<keyof Passenger>([
  "indenture_no",
  "sex", // already "Man"/"Woman"/"Boy"/"Girl"/"Other"
  "ship_voyage", // Roman numerals
  "arrival_month", // already "Nov", "Jan", …
  "arrival_year",
  "age_yr",
  "age_mo",
]);

function fmt(row: Passenger, f: FieldDef): string | null {
  const v = row[f.key];
  if (v === null || v === undefined || v === "") return null;
  if (f.key === "age_yr") {
    const yr = row.age_yr;
    const mo = row.age_mo;
    if (yr == null) return null;
    if (mo && mo > 0) return `${yr} years, ${mo} months`;
    return `${yr} years`;
  }
  if (RAW_FIELDS.has(f.key)) return String(v);
  return titleCase(String(v));
}

function Section({
  title,
  row,
  fields,
}: {
  title: string;
  row: Passenger;
  fields: FieldDef[];
}) {
  const rows = fields
    .map((f) => ({ f, v: fmt(row, f) }))
    .filter((r) => r.v !== null);
  if (rows.length === 0) return null;
  return (
    <section className="mt-5 sm:mt-10">
      <h2 className="ui-sans text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 text-center">
        — {title} —
      </h2>
      <dl className="mt-1.5 sm:mt-4 grid grid-cols-2 gap-y-1 sm:gap-y-3 gap-x-4 sm:gap-x-10">
        {rows.map(({ f, v }) => (
          <div
            key={f.key}
            className="flex items-baseline gap-2 sm:gap-3 border-b border-dotted border-zinc-300 pb-0.5 sm:pb-1.5"
          >
            <dt className="ui-sans text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-zinc-500 shrink-0">
              <span className="sm:hidden">{f.label}</span>
              <span className="hidden sm:inline">{f.longLabel ?? f.label}</span>
            </dt>
            <dd className="flex-1 text-right text-sm sm:text-lg italic break-words leading-tight">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function PassengerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = parseInt(id, 10);
  if (!Number.isFinite(n)) notFound();

  const row = getDb()
    .prepare("SELECT * FROM passengers WHERE indenture_no = ?")
    .get(n) as Passenger | undefined;
  if (!row) notFound();

  const noteRows = NOTE_FIELDS.map((f) => ({ f, v: fmt(row, f) })).filter(
    (r) => r.v !== null,
  );

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-zinc-900 pt-4 pb-2 sm:py-12 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="ui-sans inline-block text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 hover:text-[var(--color-primary)] mb-4 sm:mb-6"
        >
          ← Back to search
        </Link>

        {/* Certificate */}
        <article
          className="relative bg-white shadow-lg p-3.5 sm:p-12 border border-zinc-300"
          style={{
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.06), 0 10px 30px -10px rgba(0,0,0,0.12)",
          }}
        >
          {/* Inner double border */}
          <div className="absolute inset-1.5 sm:inset-3 border border-zinc-400/40 pointer-events-none" />
          <div className="absolute inset-2 sm:inset-4 border border-zinc-300/60 pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <header className="text-center">
              <p className="ui-sans text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Colony of Natal
              </p>
              <h1 className="mt-1 sm:mt-4 text-sm sm:text-3xl font-semibold tracking-tight">
                Register of Indentured Immigrants
              </h1>
              <p className="ui-sans text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-0.5 sm:mt-2">
                1860 — 1911
              </p>
              <Ornament className="mt-2 sm:mt-5" />
            </header>

            {/* Name */}
            <div className="mt-3 sm:mt-10 text-center">
              <p className="ui-sans text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                This is to record the arrival of
              </p>
              <h2 className="mt-1 sm:mt-3 text-2xl sm:text-5xl italic font-medium tracking-tight leading-tight break-words">
                {row.name ?? "(name unrecorded)"}
              </h2>
              <p className="ui-sans text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-1 sm:mt-3">
                Indenture No.
                <span className="ml-2 tabular-nums text-zinc-800 font-semibold">
                  {row.indenture_no.toLocaleString()}
                </span>
              </p>
              <Ornament className="mt-3 sm:mt-6" />
            </div>

            {/* Sections */}
            <Section title="Personal Particulars" row={row} fields={PERSON_FIELDS} />
            <Section title="Place of Origin" row={row} fields={ORIGIN_FIELDS} />
            <Section title="Voyage" row={row} fields={VOYAGE_FIELDS} />
            <Section title="Service in the Colony" row={row} fields={SERVICE_FIELDS} />

            {/* Notes */}
            {noteRows.length > 0 && (
              <section className="mt-3 sm:mt-10">
                <h2 className="ui-sans text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 text-center">
                  — Remarks of the Registrar —
                </h2>
                <div className="mt-1.5 sm:mt-4 space-y-1.5 sm:space-y-3">
                  {noteRows.map(({ f, v }) => (
                    <p
                      key={f.key}
                      className="text-xs sm:text-base italic leading-snug sm:leading-relaxed text-zinc-800"
                    >
                      <span className="ui-sans not-italic text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 mr-1.5 sm:mr-2">
                        {f.label}:
                      </span>
                      {v}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Footer / seal */}
            <Ornament className="mt-6 sm:mt-12" />
            <footer className="mt-4 sm:mt-6 flex items-end justify-between gap-2 sm:gap-6">
              <div className="flex-1 min-w-0">
                <div className="h-4 sm:h-6 flex items-end justify-start border-b border-zinc-400 leading-none">
                  <span className="text-[10px] sm:text-base italic">&nbsp;</span>
                </div>
                <p className="ui-sans text-[7px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-zinc-500 mt-0.5 sm:mt-1 leading-tight">
                  Protector of Indian Immigrants
                </p>
              </div>
              <Seal />
              <div className="flex-1 min-w-0">
                <div className="h-4 sm:h-6 flex items-end justify-end border-b border-zinc-400 leading-none">
                  <span className="text-[10px] sm:text-base italic">
                    {row.arrival_month && row.arrival_year
                      ? `${row.arrival_month} ${row.arrival_year}`
                      : " "}
                  </span>
                </div>
                <p className="ui-sans text-[7px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-zinc-500 mt-0.5 sm:mt-1 text-right leading-tight">
                  Date of Record
                </p>
              </div>
            </footer>
          </div>
        </article>

        <p className="ui-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400 text-center mt-1.5 sm:mt-3">
          Source: Gandhi-Luthuli Documentation Centre, UKZN
        </p>
      </div>
    </div>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 sm:gap-3 text-zinc-400 ${className}`}
      aria-hidden
    >
      <span className="h-px w-10 sm:w-16 bg-zinc-300" />
      <svg
        viewBox="0 0 24 24"
        className="w-3 h-3 sm:w-4 sm:h-4"
        fill="currentColor"
      >
        <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
      </svg>
      <span className="h-px w-10 sm:w-16 bg-zinc-300" />
    </div>
  );
}

function Seal() {
  return (
    <div
      aria-hidden
      className="shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--color-primary)]/60 flex items-center justify-center"
      style={{
        backgroundImage:
          "repeating-conic-gradient(var(--color-primary) 0deg 2deg, transparent 2deg 8deg)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        opacity: 0.85,
      }}
    >
      <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-full bg-white border border-[var(--color-primary)]/60 flex flex-col items-center justify-center text-[var(--color-primary)]">
        <span className="ui-sans text-[5px] sm:text-[7px] uppercase tracking-widest">
          Natal
        </span>
        <span className="text-[10px] sm:text-base italic font-semibold leading-none">
          1860
        </span>
        <span className="ui-sans text-[5px] sm:text-[7px] uppercase tracking-widest mt-0.5">
          Register
        </span>
      </div>
    </div>
  );
}
