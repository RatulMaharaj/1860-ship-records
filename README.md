# Indentured Ship Records, 1860–1911

A searchable web app over the indentured passenger registers held by the
[Gandhi-Luthuli Documentation Centre](https://gldc.ukzn.ac.za/ships-list-1860-1911/)
at the University of KwaZulu-Natal. ~152,000 records of indentured Indian
labourers who arrived at Port Natal between 1860 and 1911, parsed from the
nine `.xls` files published by GLDC into a single SQLite database with
full-text search and faceted filtering.

Created by [Ratul Maharaj](https://ratulmaharaj.com). Data © Gandhi-Luthuli
Documentation Centre, UKZN.

## Run it locally with Docker

A prebuilt multi-arch image (`linux/amd64` + `linux/arm64`) is published on
Docker Hub. The image is fully self-contained — the historical data is baked
in, no volume mounts or env vars required.

```bash
docker run --rm -p 3000:3000 ratulmaharaj/1860-ship-records:latest
```

Then open <http://localhost:3000>.

Tags:

- `ratulmaharaj/1860-ship-records:latest` — current build
- `ratulmaharaj/1860-ship-records:v1.0.0` — pinned release

## Run it locally from source

Requires Node 22+, pnpm, and Python 3 (with `pandas` + `xlrd`) to rebuild
the dataset.

```bash
pnpm install
python3 scripts/download.py     # fetch the 9 source .xls files from GLDC
python3 scripts/build_db.py     # parse into data/passengers.db
python3 scripts/build_facets.py # pre-compute public/facets.json
pnpm dev                        # http://localhost:1860
```

## What's in the dataset

Per passenger: indenture number, name, father's name, age, sex, caste,
zillah (district), thanna (sub-district), village, ship, voyage number,
arrival month/year, embarkation port, employer, outcome, and remarks.

The source `Arrival` column packs date, ship and port into one string; the
build script parses it into structured fields. Two of ~152,273 rows have
non-standard arrival strings and are kept verbatim.

## Stack

- Next.js 16 (App Router) + React 19, deployed as a standalone Node server
- SQLite via `better-sqlite3`, with FTS5 for full-text search
- Tailwind v4, Newsreader (serif) + Inter (sans) via `next/font`
- Multi-stage Dockerfile: Python parses the XLS, Node builds Next.js,
  runtime image ships only the standalone server + DB

## License

MIT for the code in this repository. The underlying records were transcribed
and published by the Gandhi-Luthuli Documentation Centre, UKZN — see the
[original source](https://gldc.ukzn.ac.za/ships-list-1860-1911/) for any
questions about reuse of the data itself.
