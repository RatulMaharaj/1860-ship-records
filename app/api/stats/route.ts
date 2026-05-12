import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
  return `"${term.replace(/"/g, '""')}"`;
}
function buildFtsQuery(q: string, exact: boolean): string {
  if (exact) return escapeFtsTerm(q.trim());
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

  const breakdown = (col: string, limit: number) =>
    db
      .prepare(
        `SELECT p.${col} AS value, COUNT(*) AS count FROM passengers p ${whereSql}
         ${whereSql ? "AND" : "WHERE"} p.${col} IS NOT NULL AND p.${col} != ''
         GROUP BY p.${col} ORDER BY count DESC LIMIT ?`,
      )
      .all(...args, limit) as { value: string | number; count: number }[];

  const ageRow = db
    .prepare(
      `SELECT AVG(age_yr) AS avg_age, MIN(age_yr) AS min_age, MAX(age_yr) AS max_age
       FROM passengers p ${whereSql} ${whereSql ? "AND" : "WHERE"} age_yr IS NOT NULL AND age_yr > 0`,
    )
    .get(...args) as {
    avg_age: number | null;
    min_age: number | null;
    max_age: number | null;
  };

  const yearRangeRow = db
    .prepare(
      `SELECT MIN(arrival_year) AS min_y, MAX(arrival_year) AS max_y
       FROM passengers p ${whereSql} ${whereSql ? "AND" : "WHERE"} arrival_year IS NOT NULL`,
    )
    .get(...args) as { min_y: number | null; max_y: number | null };

  return NextResponse.json({
    total: totalRow.c,
    age: ageRow,
    year_range: yearRangeRow,
    by_sex: breakdown("sex", 10),
    by_port: breakdown("embarkation_port", 5),
    by_ship: breakdown("ship_name", 5),
    by_year: breakdown("arrival_year", 10),
    by_zillah: breakdown("zillah", 5),
  });
}
