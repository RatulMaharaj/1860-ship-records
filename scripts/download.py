#!/usr/bin/env python3
"""Download the 9 indentured-ship XLS files from gldc.ukzn.ac.za."""
from pathlib import Path
from urllib.request import urlretrieve

BASE = "https://gldc.ukzn.ac.za/wp-content/uploads/2025/12/"
FILES = [
    "1-15000.xls",
    "15001-30000.xls",
    "30001-49999.xls",
    "50000-65000.xls",
    "65001-80000.xls",
    "80001-100000.xls",
    "100001-115000.xls",
    "115001-130000.xls",
    "130001-End.xls",
]

OUT = Path(__file__).resolve().parent.parent / "data" / "raw"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        dest = OUT / name
        if dest.exists() and dest.stat().st_size > 0:
            print(f"skip  {name} ({dest.stat().st_size:,} bytes)")
            continue
        url = BASE + name
        print(f"fetch {url}")
        urlretrieve(url, dest)
        print(f"  ->  {dest} ({dest.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
