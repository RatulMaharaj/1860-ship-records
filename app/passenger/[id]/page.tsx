import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, type Passenger } from "@/lib/db";

export const dynamic = "force-dynamic";

type FieldDef = { key: keyof Passenger; label: string };

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
  { key: "embarkation_port", label: "Port of Embarkation" },
];

const VOYAGE_FIELDS: FieldDef[] = [
  { key: "ship_name", label: "Vessel" },
  { key: "ship_voyage", label: "Voyage" },
  { key: "arrival_month", label: "Month of Arrival" },
  { key: "arrival_year", label: "Year of Arrival" },
];

const SERVICE_FIELDS: FieldDef[] = [
  { key: "employer", label: "Employer" },
  { key: "returned_deceased", label: "Outcome" },
];

const NOTE_FIELDS: FieldDef[] = [
  { key: "remarks", label: "Remarks" },
  { key: "arrival_raw", label: "Original arrival entry" },
];

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
  return String(v);
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
    <section className="mt-8">
      <h2 className="ui-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 text-center">
        — {title} —
      </h2>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10">
        {rows.map(({ f, v }) => (
          <div
            key={f.key}
            className="flex items-baseline gap-3 border-b border-dotted border-zinc-300 pb-1.5"
          >
            <dt className="ui-sans text-[10px] font-semibold uppercase tracking-widest text-zinc-500 shrink-0">
              {f.label}
            </dt>
            <dd className="flex-1 text-right text-lg italic break-words">
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
    <div className="min-h-screen bg-[var(--color-cream)] text-zinc-900 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="ui-sans inline-block text-xs uppercase tracking-widest text-zinc-500 hover:text-[var(--color-primary)] mb-6"
        >
          ← Back to search
        </Link>

        {/* Certificate */}
        <article
          className="relative bg-white shadow-lg p-6 sm:p-12 border border-zinc-300"
          style={{
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.06), 0 10px 30px -10px rgba(0,0,0,0.12)",
          }}
        >
          {/* Inner double border */}
          <div className="absolute inset-2 sm:inset-3 border border-zinc-400/40 pointer-events-none" />
          <div className="absolute inset-3 sm:inset-4 border border-zinc-300/60 pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <header className="text-center">
              <p className="ui-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Colony of Natal
              </p>
              <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
                Register of Indentured Immigrants
              </h1>
              <p className="ui-sans text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-2">
                1860 — 1911
              </p>
              <Ornament className="mt-5" />
            </header>

            {/* Name */}
            <div className="mt-8 sm:mt-10 text-center">
              <p className="ui-sans text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                This is to record the arrival of
              </p>
              <h2 className="mt-3 text-4xl sm:text-5xl italic font-medium tracking-tight leading-tight break-words">
                {row.name ?? "(name unrecorded)"}
              </h2>
              <p className="ui-sans text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-3">
                Indenture No.
                <span className="ml-2 tabular-nums text-zinc-800 font-semibold">
                  {row.indenture_no.toLocaleString()}
                </span>
              </p>
            </div>

            {/* Sections */}
            <Section title="Personal Particulars" row={row} fields={PERSON_FIELDS} />
            <Section title="Place of Origin" row={row} fields={ORIGIN_FIELDS} />
            <Section title="Voyage" row={row} fields={VOYAGE_FIELDS} />
            <Section title="Service in the Colony" row={row} fields={SERVICE_FIELDS} />

            {/* Notes */}
            {noteRows.length > 0 && (
              <section className="mt-10">
                <h2 className="ui-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 text-center">
                  — Remarks of the Registrar —
                </h2>
                <div className="mt-4 space-y-3">
                  {noteRows.map(({ f, v }) => (
                    <p
                      key={f.key}
                      className="text-base italic leading-relaxed text-zinc-800"
                    >
                      <span className="ui-sans not-italic text-[10px] uppercase tracking-widest text-zinc-500 mr-2">
                        {f.label}:
                      </span>
                      {v}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Footer / seal */}
            <Ornament className="mt-10" />
            <footer className="mt-6 flex items-end justify-between gap-6">
              <div className="flex-1">
                <div className="border-b border-zinc-400 h-6" />
                <p className="ui-sans text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                  Protector of Indian Immigrants
                </p>
              </div>
              <Seal />
              <div className="flex-1">
                <div className="border-b border-zinc-400 h-6 text-right">
                  <span className="text-base italic align-bottom">
                    {row.arrival_month && row.arrival_year
                      ? `${row.arrival_month} ${row.arrival_year}`
                      : ""}
                  </span>
                </div>
                <p className="ui-sans text-[10px] uppercase tracking-widest text-zinc-500 mt-1 text-right">
                  Date of Record
                </p>
              </div>
            </footer>
          </div>
        </article>

        <p className="ui-sans text-[10px] uppercase tracking-widest text-zinc-400 text-center mt-6">
          Source: Gandhi-Luthuli Documentation Centre, UKZN
        </p>
      </div>
    </div>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-zinc-400 ${className}`}
      aria-hidden
    >
      <span className="h-px w-16 bg-zinc-300" />
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
      </svg>
      <span className="h-px w-16 bg-zinc-300" />
    </div>
  );
}

function Seal() {
  return (
    <div
      aria-hidden
      className="shrink-0 w-20 h-20 rounded-full border-2 border-[var(--color-primary)]/60 flex items-center justify-center"
      style={{
        backgroundImage:
          "repeating-conic-gradient(var(--color-primary) 0deg 2deg, transparent 2deg 8deg)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        opacity: 0.85,
      }}
    >
      <div className="w-16 h-16 rounded-full bg-white border border-[var(--color-primary)]/60 flex flex-col items-center justify-center text-[var(--color-primary)]">
        <span className="ui-sans text-[7px] uppercase tracking-widest">
          Natal
        </span>
        <span className="text-base italic font-semibold leading-none">
          1860
        </span>
        <span className="ui-sans text-[7px] uppercase tracking-widest mt-0.5">
          Register
        </span>
      </div>
    </div>
  );
}
