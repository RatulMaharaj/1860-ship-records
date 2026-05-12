"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InfoLabel } from "./InfoLabel";

export type SearchableOption = {
  value: string | number;
  count?: number;
};

export function SearchableSelect({
  label,
  docKey,
  options,
  values,
  onChange,
  placeholder = "Any",
}: {
  label: string;
  docKey?: string;
  options: SearchableOption[];
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedSet = useMemo(() => new Set(values), [values]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(v: string) {
    if (selectedSet.has(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  }
  function clear() {
    onChange([]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 200);
    return options
      .filter((o) => String(o.value).toLowerCase().includes(q))
      .slice(0, 200);
  }, [options, query]);

  const buttonLabel =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? values[0]
        : `${values.length} selected`;

  return (
    <div className="relative" ref={wrapRef}>
      <div className="text-xs font-semibold uppercase text-zinc-500 mb-1">
        <InfoLabel label={label} docKey={docKey ?? ""} />
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left border px-2.5 py-2 text-sm bg-white flex items-center justify-between gap-2 transition ${
          open
            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary-ring)]"
            : values.length > 0
              ? "border-[var(--color-primary)]"
              : "border-zinc-300 hover:border-zinc-400"
        }`}
      >
        <span
          className={`truncate ${values.length === 0 ? "text-zinc-400" : "text-zinc-900 font-medium"}`}
        >
          {buttonLabel}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {values.length > 0 && (
            <span
              className="text-[10px] font-semibold leading-none bg-[var(--color-primary)] text-white px-1.5 py-0.5"
              aria-hidden
            >
              {values.length}
            </span>
          )}
          <svg
            className="w-3.5 h-3.5 text-zinc-400"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 left-0 right-0 min-w-[16rem] border border-zinc-200 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-zinc-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="flex-1 border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            {values.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-xs text-zinc-500 hover:text-[var(--color-primary)] px-1.5"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-zinc-500">No matches.</li>
            )}
            {filtered.map((o) => {
              const sv = String(o.value);
              const selected = selectedSet.has(sv);
              return (
                <li key={sv}>
                  <button
                    type="button"
                    onClick={() => toggle(sv)}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-50 ${
                      selected ? "bg-[var(--color-primary-soft)]" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`shrink-0 w-4 h-4 border flex items-center justify-center transition ${
                        selected
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                          : "border-zinc-300 bg-white"
                      }`}
                    >
                      {selected && (
                        <svg
                          viewBox="0 0 12 12"
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M2.5 6.5L5 9L9.5 3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`truncate flex-1 ${selected ? "text-[var(--color-primary)] font-medium" : ""}`}
                    >
                      {o.value}
                    </span>
                    {o.count != null && (
                      <span className="text-xs text-zinc-400 tabular-nums shrink-0">
                        {o.count.toLocaleString()}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {query.trim() === "" && options.length > 200 && (
              <li className="px-3 py-2 text-xs text-zinc-400 border-t border-zinc-100">
                Showing top 200 of {options.length.toLocaleString()}. Type to
                search.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
