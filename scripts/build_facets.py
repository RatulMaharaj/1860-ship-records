#!/usr/bin/env python3
"""Pre-compute distinct filter values from passengers.db into public/facets.json.

Run after build_db.py whenever the database changes:
  python3 scripts/build_db.py && python3 scripts/build_facets.py
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "passengers.db"
OUT_PATH = ROOT / "public" / "facets.json"

# (column, max_values). max_values=None -> include all distinct values.
FACETS: list[tuple[str, int | None]] = [
    ("ship_name", None),
    ("embarkation_port", None),
    ("arrival_year", None),
    ("zillah", None),
    ("sex", None),
    ("caste", 200),
    ("employer", 500),
]


def main() -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"DB not found at {DB_PATH}. Run scripts/build_db.py first.")

    conn = sqlite3.connect(DB_PATH)
    out: dict[str, list[dict[str, object]]] = {}
    for col, limit in FACETS:
        sql = (
            f"SELECT {col} AS value, COUNT(*) AS count FROM passengers "
            f"WHERE {col} IS NOT NULL AND {col} != '' "
            f"GROUP BY {col} ORDER BY count DESC"
        )
        if limit is not None:
            sql += f" LIMIT {limit}"
        rows = conn.execute(sql).fetchall()
        out[col] = [{"value": v, "count": c} for v, c in rows]
        print(f"  {col}: {len(rows):,} values")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print(f"\nWrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")
    conn.close()


if __name__ == "__main__":
    main()
