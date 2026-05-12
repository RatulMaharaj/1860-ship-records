"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { Passenger } from "@/lib/db";
import type { ReactNode } from "react";
import { SearchableSelect } from "./SearchableSelect";
import { InfoLabel } from "./InfoLabel";

type Facet = { value: string | number; count: number };
type Facets = Record<string, Facet[]>;

type SearchResponse = {
  total: number;
  limit: number;
  offset: number;
  results: Passenger[];
};

type StatsBreakdownItem = { value: string | number; count: number };
type StatsResponse = {
  total: number;
  age: { avg_age: number | null; min_age: number | null; max_age: number | null };
  year_range: { min_y: number | null; max_y: number | null };
  by_sex: StatsBreakdownItem[];
  by_port: StatsBreakdownItem[];
  by_ship: StatsBreakdownItem[];
  by_year: StatsBreakdownItem[];
  by_zillah: StatsBreakdownItem[];
};

const FILTERS = [
  { key: "ship_name", label: "Ship", docKey: "ship_name" },
  { key: "embarkation_port", label: "Port", docKey: "embarkation_port" },
  { key: "arrival_year", label: "Arrival year", docKey: "arrival_year" },
  { key: "zillah", label: "Zillah", docKey: "zillah" },
  { key: "sex", label: "Sex", docKey: "sex" },
] as const;

export default function Home() {
  const [q, setQ] = useState("");
  const [exact, setExact] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [data, setData] = useState<SearchResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  useEffect(() => {
    fetch("/facets.json")
      .then((r) => r.json())
      .then(setFacets)
      .catch(() => {});
  }, []);

  const runSearch = useCallback(
    async (newOffset: number) => {
      setLoading(true);
      const base = new URLSearchParams();
      if (q.trim()) {
        base.set("q", q.trim());
        if (exact) base.set("exact", "1");
      }
      for (const [k, vs] of Object.entries(filters)) {
        for (const v of vs) base.append(k, v);
      }
      const searchParams = new URLSearchParams(base);
      searchParams.set("limit", String(LIMIT));
      searchParams.set("offset", String(newOffset));

      const [searchRes, statsRes] = await Promise.all([
        fetch(`/api/search?${searchParams.toString()}`),
        newOffset === 0
          ? fetch(`/api/stats?${base.toString()}`)
          : Promise.resolve(null),
      ]);
      const searchJson = (await searchRes.json()) as SearchResponse;
      setData(searchJson);
      if (statsRes) {
        const statsJson = (await statsRes.json()) as StatsResponse;
        setStats(statsJson);
      }
      setOffset(newOffset);
      setLoading(false);
    },
    [q, exact, filters],
  );

  useEffect(() => {
    runSearch(0);
  }, [runSearch]);

  function updateFilter(key: string, values: string[]) {
    setFilters((prev) => {
      const next = { ...prev };
      if (values.length > 0) next[key] = values;
      else delete next[key];
      return next;
    });
  }

  function clearAll() {
    setQ("");
    setExact(false);
    setFilters({});
  }

  const activeCount =
    (q.trim() ? 1 : 0) +
    Object.values(filters).reduce((n, vs) => n + vs.length, 0);
  const page = Math.floor(offset / LIMIT) + 1;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-zinc-900">
      <div className="sm:sticky sm:top-0 sm:z-20">
      <header className="sticky top-0 z-20 sm:static sm:z-auto border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
              Indentured Ship Records,{" "}
              <span className="italic font-normal">1860–1911</span>
            </h1>
            <p className="ui-sans text-[10px] sm:text-xs text-zinc-500 mt-1 uppercase tracking-wider">
              Data from the Gandhi-Luthuli Documentation Centre, UKZN
            </p>
          </div>
          <a
            href="https://gldc.ukzn.ac.za/ships-list-1860-1911/"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-sans shrink-0 inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 hover:text-[var(--color-primary)] mt-1"
          >
            Original source
            <svg
              viewBox="0 0 12 12"
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M4.5 2.5h5v5" strokeLinecap="round" />
              <path d="M9.5 2.5l-7 7" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </header>

      <div className="bg-[var(--color-cream)] border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-3 sm:pt-4 sm:pb-4">
          {/* Search + filters */}
          <section className="border border-zinc-200 bg-white p-3 sm:p-4 space-y-3">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-xs font-semibold uppercase text-zinc-500">
                <InfoLabel label="Search" docKey="search" />
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                <span>Exact match only</span>
                <span className="relative inline-flex h-4 w-7 shrink-0">
                  <input
                    type="checkbox"
                    checked={exact}
                    onChange={(e) => setExact(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-zinc-300 peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary-ring)] transition-colors"
                  />
                  <span
                    aria-hidden
                    className="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-3"
                  />
                </span>
              </label>
            </div>
            <input
              type="text"
              inputMode="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                exact
                  ? "Exact phrase, e.g. DAVARUM"
                  : "Name, village, employer, remarks…"
              }
              className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {FILTERS.map((f) => (
              <SearchableSelect
                key={f.key}
                label={f.label}
                docKey={f.docKey}
                options={facets?.[f.key] ?? []}
                values={filters[f.key] ?? []}
                onChange={(vs) => updateFilter(f.key, vs)}
                placeholder={`Any ${f.label.toLowerCase()}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-zinc-600">
              {data ? `${data.total.toLocaleString()} matches` : "Loading…"}
            </span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[var(--color-primary)] hover:underline"
              >
                Clear all ({activeCount})
              </button>
            )}
          </div>
          </section>
        </div>
      </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Stats */}
        {stats && stats.total > 0 && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat
                label="Records"
                value={stats.total.toLocaleString()}
              />
              <Stat
                label="Year range"
                value={
                  stats.year_range.min_y && stats.year_range.max_y
                    ? stats.year_range.min_y === stats.year_range.max_y
                      ? String(stats.year_range.min_y)
                      : `${stats.year_range.min_y}–${stats.year_range.max_y}`
                    : "—"
                }
              />
              <Stat
                label="Average age"
                value={
                  stats.age.avg_age != null
                    ? `${stats.age.avg_age.toFixed(1)}`
                    : "—"
                }
                suffix={stats.age.avg_age != null ? "years" : undefined}
              />
              <Stat
                label="Distinct ships"
                value={stats.by_ship.length.toLocaleString()}
                hint={
                  stats.by_ship[0]
                    ? `most common: ${stats.by_ship[0].value}`
                    : undefined
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Breakdown title="By sex" items={stats.by_sex} total={stats.total} />
              <Breakdown title="By port" items={stats.by_port} total={stats.total} />
              <Breakdown title="Top ships" items={stats.by_ship} total={stats.total} />
              <Breakdown title="Top years" items={stats.by_year} total={stats.total} />
            </div>
          </section>
        )}

        {/* Results */}
        <section className="border border-zinc-200 bg-white overflow-hidden min-w-0 max-w-full">
          {/* Mobile cards */}
          <ul className="sm:hidden divide-y divide-zinc-100">
            {loading && (
              <li className="px-4 py-6 text-center text-zinc-500 text-sm">
                Loading…
              </li>
            )}
            {!loading && data?.results.length === 0 && (
              <li className="px-4 py-6 text-center text-zinc-500 text-sm">
                No matches.
              </li>
            )}
            {!loading &&
              data?.results.map((r) => {
                const fields: { label: string; value: string | null }[] = [
                  {
                    label: "Age",
                    value:
                      r.age_yr != null
                        ? `${r.age_yr}${r.age_mo ? ` ${r.age_mo}m` : ""} ${r.age_yr === 1 ? "year" : "years"}`
                        : null,
                  },
                  { label: "Sex", value: r.sex },
                  {
                    label: "Ship",
                    value: r.ship_name
                      ? `${r.ship_name}${r.ship_voyage ? ` ${r.ship_voyage}` : ""}`
                      : null,
                  },
                  {
                    label: "Arrived",
                    value:
                      r.arrival_month && r.arrival_year
                        ? `${r.arrival_month} ${r.arrival_year}`
                        : null,
                  },
                  { label: "Port", value: r.embarkation_port },
                  { label: "Village", value: r.village },
                  { label: "Zillah", value: r.zillah },
                  { label: "Employer", value: r.employer },
                ];
                const visible = fields.filter((f) => f.value);
                return (
                  <li key={r.indenture_no} className="odd:bg-white even:bg-zinc-50/70">
                    <Link
                      href={`/passenger/${r.indenture_no}`}
                      className="relative block px-4 py-3 pr-9 active:bg-[#fff4ec]"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-sm uppercase">
                          {r.name ?? "(unknown)"}
                        </span>
                        <span className="ui-sans font-mono text-xs text-zinc-500">
                          #{r.indenture_no}
                        </span>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                        {visible.map((f) => (
                          <div key={f.label} className="min-w-0">
                            <dt className="ui-sans text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
                              {f.label}
                            </dt>
                            <dd className="text-xs text-zinc-800 uppercase break-words leading-snug mt-0.5">
                              {f.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <svg
                        aria-hidden
                        viewBox="0 0 12 12"
                        className="absolute right-3 bottom-3 w-3.5 h-3.5 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          d="M4 2.5l4 3.5-4 3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </li>
                );
              })}
          </ul>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[5rem]" />
                <col className="w-[14%]" />
                <col className="w-[3.5rem]" />
                <col className="w-[4rem]" />
                <col className="w-[14%]" />
                <col className="w-[7rem]" />
                <col className="w-[6rem]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-800 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="No." docKey="indenture_no" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Name" docKey="name" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Age" docKey="age_yr" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Sex" docKey="sex" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Ship" docKey="ship_name" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Arrival" docKey="arrival_year" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Port" docKey="embarkation_port" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Village" docKey="village" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Zillah" docKey="zillah" />
                  </th>
                  <th className="text-left px-3 py-2 font-semibold">
                    <InfoLabel label="Employer" docKey="employer" />
                  </th>
                </tr>
              </thead>
              <tbody className="uppercase">
                {loading && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-8 text-center text-zinc-500"
                    >
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && data?.results.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-8 text-center text-zinc-500"
                    >
                      No matches.
                    </td>
                  </tr>
                )}
                {!loading &&
                  data?.results.map((r) => (
                    <tr
                      key={r.indenture_no}
                      className="odd:bg-white even:bg-zinc-50/70 hover:bg-[#fff4ec] transition-colors"
                    >
                      <HoverCell
                        tip={String(r.indenture_no)}
                        className="font-mono text-xs"
                      >
                        <Link
                          href={`/passenger/${r.indenture_no}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {r.indenture_no}
                        </Link>
                      </HoverCell>
                      <HoverCell tip={r.name} className="font-medium">
                        {r.name}
                      </HoverCell>
                      <HoverCell tip={r.age_yr != null ? String(r.age_yr) : null}>
                        {r.age_yr ?? ""}
                      </HoverCell>
                      <HoverCell tip={r.sex}>
                        {r.sex ? r.sex.charAt(0) : ""}
                      </HoverCell>
                      <HoverCell
                        tip={
                          [r.ship_name, r.ship_voyage].filter(Boolean).join(" ") ||
                          null
                        }
                      >
                        {r.ship_name}
                        {r.ship_voyage && (
                          <span className="text-zinc-400 ml-1">
                            {r.ship_voyage}
                          </span>
                        )}
                      </HoverCell>
                      <HoverCell
                        tip={
                          r.arrival_month && r.arrival_year
                            ? `${r.arrival_month} ${r.arrival_year}`
                            : null
                        }
                        className="whitespace-nowrap"
                      >
                        {r.arrival_month} {r.arrival_year}
                      </HoverCell>
                      <HoverCell tip={r.embarkation_port}>
                        {r.embarkation_port}
                      </HoverCell>
                      <HoverCell tip={r.village}>{r.village ?? ""}</HoverCell>
                      <HoverCell tip={r.zillah}>{r.zillah ?? ""}</HoverCell>
                      <HoverCell tip={r.employer}>{r.employer ?? ""}</HoverCell>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {data && data.total > LIMIT && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-zinc-500">
              Page {page} of {totalPages.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                disabled={offset === 0}
                onClick={() => runSearch(Math.max(0, offset - LIMIT))}
                className="border border-zinc-300 bg-white px-3 py-1.5 disabled:opacity-40 hover:bg-zinc-100"
              >
                ← Prev
              </button>
              <button
                disabled={offset + LIMIT >= data.total}
                onClick={() => runSearch(offset + LIMIT)}
                className="border border-zinc-300 bg-white px-3 py-1.5 disabled:opacity-40 hover:bg-zinc-100"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="border border-zinc-200 bg-white px-4 py-3.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-zinc-500 font-medium">{suffix}</span>
        )}
      </div>
      {hint && (
        <div className="text-xs text-zinc-500 mt-1 truncate">{hint}</div>
      )}
    </div>
  );
}

function Breakdown({
  title,
  items,
  total,
}: {
  title: string;
  items: StatsBreakdownItem[];
  total: number;
}) {
  if (!items.length) return null;
  const max = items[0].count;
  return (
    <div className="border border-zinc-200 bg-white px-4 py-3.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-2.5">
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((i, idx) => {
          const pct = total > 0 ? (i.count / total) * 100 : 0;
          const barPct = (i.count / max) * 100;
          return (
            <li key={String(i.value)} className="text-xs">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="truncate text-zinc-800 font-medium">
                  {i.value}
                </span>
                <span className="text-zinc-500 tabular-nums shrink-0 text-[11px]">
                  {i.count.toLocaleString()}
                  <span className="text-zinc-400 ml-1">
                    {pct >= 1 ? `${pct.toFixed(0)}%` : `<1%`}
                  </span>
                </span>
              </div>
              <div className="h-1.5 bg-zinc-100 overflow-hidden">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${barPct}%`,
                    background: "#FE661D",
                    opacity: Math.max(0.35, 1 - idx * 0.12),
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HoverCell({
  tip,
  className = "",
  children,
}: {
  tip: string | null | undefined;
  className?: string;
  children: ReactNode;
}) {
  const text = tip ?? "";
  return (
    <td className={`px-3 py-2 relative group/cell ${className}`}>
      <div className="truncate">{children}</div>
      {text && (
        <span
          role="tooltip"
          className="pointer-events-none invisible opacity-0 group-hover/cell:visible group-hover/cell:opacity-100 absolute z-30 left-2 top-full mt-1 max-w-xs whitespace-normal break-words bg-zinc-900 text-white text-[11px] leading-snug px-2 py-1.5 shadow-lg normal-case tracking-normal font-normal ui-sans transition-opacity duration-75"
        >
          {text}
        </span>
      )}
    </td>
  );
}
