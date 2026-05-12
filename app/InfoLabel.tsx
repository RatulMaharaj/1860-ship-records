"use client";

import { FIELD_DOCS } from "./fieldDocs";

export function InfoLabel({
  label,
  docKey,
  className = "",
}: {
  label: string;
  docKey: keyof typeof FIELD_DOCS | string;
  className?: string;
}) {
  const doc = FIELD_DOCS[docKey];
  return (
    <span
      className={`group/info relative inline-flex items-center gap-1 ${className}`}
    >
      <span>{label}</span>
      {doc && (
        <>
          <span
            aria-label={`What is ${label}?`}
            tabIndex={0}
            className="inline-flex items-center justify-center w-3.5 h-3.5 border border-zinc-300 text-[9px] font-semibold text-zinc-400 cursor-help leading-none focus:outline-none focus:border-blue-500 focus:text-blue-500 hover:border-blue-500 hover:text-blue-500"
          >
            i
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute z-30 left-0 top-full mt-1.5 w-64 max-w-[min(16rem,calc(100vw-2rem))] bg-zinc-900 text-white text-xs leading-snug px-2.5 py-2 shadow-lg opacity-0 translate-y-0.5 group-hover/info:opacity-100 group-hover/info:translate-y-0 group-focus-within/info:opacity-100 group-focus-within/info:translate-y-0 transition normal-case font-normal tracking-normal"
          >
            {doc}
          </span>
        </>
      )}
    </span>
  );
}
