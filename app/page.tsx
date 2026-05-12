"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { Passenger } from "@/lib/db";
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
    <div className="min-h-screen bg-[var(--color-cream)] text-zinc-900 overflow-x-hidden">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
              Indentured Ship Records,{" "}
              <span className="italic font-normal">1860–1911</span>
            </h1>
            <p className="ui-sans text-[10px] sm:text-xs text-zinc-500 mt-1 uppercase tracking-wider">
              Gandhi-Luthuli Documentation Centre, UKZN
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Search + filters */}
        <section className="border border-zinc-200 bg-white p-3 sm:p-4 space-y-3">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-xs font-semibold uppercase text-zinc-500">
                <InfoLabel label="Search" docKey="search" />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exact}
                  onChange={(e) => setExact(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                />
                Exact match only
              </label>
            </div>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                exact
                  ? "exact phrase, e.g. RAMASAMY"
                  : "name, village, employer, remarks…"
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
              data?.results.map((r) => (
                <li key={r.indenture_no}>
                  <Link
                    href={`/passenger/${r.indenture_no}`}
                    className="block px-4 py-3 active:bg-zinc-100"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-sm uppercase">
                        {r.name ?? "(unknown)"}
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        #{r.indenture_no}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600 mt-0.5 uppercase">
                      {[
                        r.sex,
                        r.age_yr != null ? `${r.age_yr}y` : null,
                        r.village,
                        r.zillah,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 uppercase">
                      {r.ship_name}
                      {r.ship_voyage && (
                        <span className="text-zinc-400"> {r.ship_voyage}</span>
                      )}
                      {" · "}
                      {r.arrival_month} {r.arrival_year} · {r.embarkation_port}
                    </div>
                  </Link>
                </li>
              ))}
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
                      <td className="px-3 py-2 font-mono text-xs truncate">
                        <Link
                          href={`/passenger/${r.indenture_no}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {r.indenture_no}
                        </Link>
                      </td>
                      <td
                        className="px-3 py-2 font-medium truncate"
                        title={r.name ?? undefined}
                      >
                        {r.name}
                      </td>
                      <td className="px-3 py-2 truncate">{r.age_yr ?? ""}</td>
                      <td className="px-3 py-2 truncate">{r.sex ?? ""}</td>
                      <td
                        className="px-3 py-2 truncate"
                        title={
                          [r.ship_name, r.ship_voyage].filter(Boolean).join(" ") ||
                          undefined
                        }
                      >
                        {r.ship_name}
                        {r.ship_voyage && (
                          <span className="text-zinc-400 ml-1">
                            {r.ship_voyage}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap truncate">
                        {r.arrival_month} {r.arrival_year}
                      </td>
                      <td
                        className="px-3 py-2 truncate"
                        title={r.embarkation_port ?? undefined}
                      >
                        {r.embarkation_port}
                      </td>
                      <td
                        className="px-3 py-2 truncate"
                        title={r.village ?? undefined}
                      >
                        {r.village ?? ""}
                      </td>
                      <td
                        className="px-3 py-2 truncate"
                        title={r.zillah ?? undefined}
                      >
                        {r.zillah ?? ""}
                      </td>
                      <td
                        className="px-3 py-2 truncate"
                        title={r.employer ?? undefined}
                      >
                        {r.employer ?? ""}
                      </td>
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
