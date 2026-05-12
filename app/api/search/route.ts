import { NextRequest, NextResponse } from "next/server";
import { getDb, type Passenger } from "@/lib/db";

const FILTER_COLUMNS = [
  "ship_name",
  "embarkation_port",
  "arrival_year",
  "zillah",
  "sex",
  "caste",
  "employer",
  "village",
] as const;

function escapeFtsTerm(term: string): string {
  // Quote and escape inner quotes to make a phrase token safe for FTS5.
  return `"${term.replace(/"/g, '""')}"`;
}

function buildFtsQuery(q: string, exact: boolean): string {
  if (exact) {
    // Treat the whole query as a single phrase, no prefix expansion.
    return escapeFtsTerm(q.trim());
  }
  // Split on whitespace; each term becomes a prefix-matched phrase.
  return q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `${escapeFtsTerm(t)}*`)
    .join(" AND ");
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q")?.trim() ?? "";
  const exact = params.get("exact") === "1";
  const limit = Math.min(parseInt(params.get("limit") ?? "50", 10) || 50, 200);
  const offset = Math.max(parseInt(params.get("offset") ?? "0", 10) || 0, 0);

  const where: string[] = [];
  const args: unknown[] = [];

  if (q) {
    where.push(
      "p.indenture_no IN (SELECT rowid FROM passengers_fts WHERE passengers_fts MATCH ?)",
    );
    args.push(buildFtsQuery(q, exact));
  }

  for (const col of FILTER_COLUMNS) {
    const vals = params.getAll(col).flatMap((v) => v.split(",")).map((s) => s.trim()).filter(Boolean);
    if (vals.length === 0) continue;
    const placeholders = vals.map(() => "?").join(", ");
    where.push(`p.${col} IN (${placeholders})`);
    for (const v of vals) {
      args.push(col === "arrival_year" ? Number(v) : v);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const db = getDb();

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS c FROM passengers p ${whereSql}`)
    .get(...args) as { c: number };

  const results = db
    .prepare(
      `SELECT p.* FROM passengers p ${whereSql} ORDER BY p.indenture_no LIMIT ? OFFSET ?`,
    )
    .all(...args, limit, offset) as Passenger[];

  return NextResponse.json({ total: totalRow.c, limit, offset, results });
}
