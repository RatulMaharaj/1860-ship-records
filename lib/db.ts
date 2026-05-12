import Database from "better-sqlite3";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "passengers.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export type Passenger = {
  indenture_no: number;
  name: string | null;
  father: string | null;
  age_yr: number | null;
  age_mo: number | null;
  sex: string | null;
  caste: string | null;
  zillah: string | null;
  thanna: string | null;
  village: string | null;
  arrival_raw: string | null;
  arrival_month: string | null;
  arrival_year: number | null;
  ship_name: string | null;
  ship_voyage: string | null;
  embarkation_port: string | null;
  employer: string | null;
  returned_deceased: string | null;
  remarks: string | null;
  related_links: string | null;
};
