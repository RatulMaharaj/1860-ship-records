#!/usr/bin/env python3
"""Parse the 9 indentured-ship XLS files into a SQLite database.

Output: data/passengers.db with one table `passengers` + FTS5 index `passengers_fts`.
Idempotent: drops and recreates tables on each run.
"""
from __future__ import annotations

import re
import sqlite3
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
DB_PATH = ROOT / "data" / "passengers.db"

# Map raw column names -> normalized DB column names.
COLUMN_MAP = {
    "Indenture No": "indenture_no",
    "Names": "name",
    "Father": "father",
    "Yr": "age_yr",
    "Mo": "age_mo",
    "Sex": "sex",
    "Caste": "caste",
    "Zillah": "zillah",
    "Thanna": "thanna",
    "Village": "village",
    "Remarks": "remarks",
    "Arrival": "arrival_raw",
    "Employer": "employer",
    "Returned_Deceased": "returned_deceased",
    "Related_links": "related_links",
}

SENTINEL_NULLS = {"", "PAGE MISSING", "NAN", "NONE", "-", "N/A"}

SEX_MAP = {"M": "Man", "F": "Woman", "B": "Boy", "G": "Girl"}


def normalize_sex(val: str | None) -> str | None:
    if val is None:
        return None
    return SEX_MAP.get(val.strip().upper(), "Other")

# "Mon YYYY <ship words...> <port>"
ARRIVAL_RE = re.compile(
    r"^\s*([A-Za-z]{3,9})\s+(\d{4})\s+(.+?)\s+(\S+)\s*$"
)
# Trailing Roman-numeral voyage marker, e.g. "Pongola XLIX" -> ship="Pongola", voyage="XLIX"
ROMAN_RE = re.compile(r"^(.*?)\s+([IVXLCDM]+)$", re.IGNORECASE)

SCHEMA = """
DROP TABLE IF EXISTS passengers_fts;
DROP TABLE IF EXISTS passengers;

CREATE TABLE passengers (
  indenture_no       INTEGER PRIMARY KEY,
  name               TEXT,
  father             TEXT,
  age_yr             INTEGER,
  age_mo             INTEGER,
  sex                TEXT,
  caste              TEXT,
  zillah             TEXT,
  thanna             TEXT,
  village            TEXT,
  arrival_raw        TEXT,
  arrival_month      TEXT,
  arrival_year       INTEGER,
  ship_name          TEXT,
  ship_voyage        TEXT,
  embarkation_port   TEXT,
  employer           TEXT,
  returned_deceased  TEXT,
  remarks            TEXT,
  related_links      TEXT,
  source_file        TEXT
);

CREATE INDEX idx_name    ON passengers(name);
CREATE INDEX idx_ship    ON passengers(ship_name);
CREATE INDEX idx_year    ON passengers(arrival_year);
CREATE INDEX idx_port    ON passengers(embarkation_port);
CREATE INDEX idx_zillah  ON passengers(zillah);
CREATE INDEX idx_village ON passengers(village);

CREATE VIRTUAL TABLE passengers_fts USING fts5(
  name, father, village, ship_name, employer, remarks,
  content='passengers', content_rowid='indenture_no'
);
"""

INSERT_SQL = """
INSERT OR REPLACE INTO passengers (
  indenture_no, name, father, age_yr, age_mo, sex, caste, zillah, thanna,
  village, arrival_raw, arrival_month, arrival_year, ship_name, ship_voyage,
  embarkation_port, employer, returned_deceased, remarks, related_links,
  source_file
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""


def clean(val: object) -> str | None:
    """Trim, collapse whitespace, and convert sentinel strings/NaN to None."""
    if val is None:
        return None
    if isinstance(val, float) and pd.isna(val):
        return None
    s = str(val).strip()
    s = re.sub(r"\s+", " ", s)
    if not s or s.upper() in SENTINEL_NULLS:
        return None
    return s


def to_int(val: object) -> int | None:
    if val is None:
        return None
    if isinstance(val, float) and pd.isna(val):
        return None
    try:
        return int(val)
    except (TypeError, ValueError):
        return None


def parse_arrival(raw: str | None) -> tuple[str | None, int | None, str | None, str | None, str | None]:
    """Returns (month, year, ship_name, ship_voyage, port). All-None if unparsed."""
    if not raw:
        return (None, None, None, None, None)
    m = ARRIVAL_RE.match(raw)
    if not m:
        return (None, None, None, None, None)
    month, year, ship, port = m.group(1), int(m.group(2)), m.group(3).strip(), m.group(4).strip()
    voyage: str | None = None
    rm = ROMAN_RE.match(ship)
    if rm:
        ship = rm.group(1).strip()
        voyage = rm.group(2).upper()
    return (month, year, ship, voyage, port)


def load_file(path: Path) -> list[tuple]:
    df = pd.read_excel(path)
    # Drop any DOCUMENTS / Unnamed columns; we keep only known fields.
    keep = [c for c in df.columns if c in COLUMN_MAP]
    df = df[keep].rename(columns=COLUMN_MAP)

    rows: list[tuple] = []
    for r in df.itertuples(index=False):
        d = r._asdict()
        indenture = to_int(d.get("indenture_no"))
        if indenture is None:
            continue
        arrival_raw = clean(d.get("arrival_raw"))
        month, year, ship, voyage, port = parse_arrival(arrival_raw)
        rows.append((
            indenture,
            clean(d.get("name")),
            clean(d.get("father")),
            to_int(d.get("age_yr")),
            to_int(d.get("age_mo")),
            normalize_sex(clean(d.get("sex"))),
            clean(d.get("caste")),
            clean(d.get("zillah")),
            clean(d.get("thanna")),
            clean(d.get("village")),
            arrival_raw,
            month,
            year,
            ship,
            voyage,
            port,
            clean(d.get("employer")),
            clean(d.get("returned_deceased")),
            clean(d.get("remarks")),
            clean(d.get("related_links")),
            path.name,
        ))
    return rows


def main() -> None:
    files = sorted(RAW.glob("*.xls"))
    if not files:
        raise SystemExit(f"No .xls files in {RAW}. Run scripts/download.py first.")

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)

    total = 0
    unparsed_arrival = 0
    missing_arrival = 0
    for path in files:
        rows = load_file(path)
        with conn:
            conn.executemany(INSERT_SQL, rows)
        for r in rows:
            if r[10] is None:  # arrival_raw
                missing_arrival += 1
            elif r[11] is None:  # arrival_month -> parse failed
                unparsed_arrival += 1
        print(f"  {path.name}: {len(rows):,} rows")
        total += len(rows)

    # Build FTS index from the populated table.
    with conn:
        conn.execute("INSERT INTO passengers_fts(passengers_fts) VALUES('rebuild')")

    print()
    print(f"Total rows inserted: {total:,}")
    print(f"Rows with no Arrival value: {missing_arrival:,}")
    print(f"Rows where Arrival did not match regex: {unparsed_arrival:,}")
    print(f"DB written to: {DB_PATH}")
    conn.close()


if __name__ == "__main__":
    main()
