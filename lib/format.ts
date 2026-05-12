/**
 * Title-case a free-text field from the registry. The source data mixes ALL CAPS,
 * lowercase, and mixed case, so we normalize at display time without altering the DB.
 */
export function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\b([\p{L}\p{M}]+)/gu, (w) => w[0].toUpperCase() + w.slice(1));
}

export function titleCaseValue(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return String(v);
  return titleCase(v);
}
