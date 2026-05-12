export const FIELD_DOCS: Record<string, string> = {
  search:
    "Full-text search across passenger name, father's name, village, ship, employer and remarks. Prefix-matched per word unless 'Exact match only' is on.",
  indenture_no:
    "Unique ID assigned to each passenger on arrival in Natal. The Protector of Indian Immigrants office issued these in sequence between 1860 and 1911.",
  name: "Passenger's given name as recorded by the colonial registrar — often a single name, anglicised or transliterated, frequently misspelled.",
  father: "Passenger's father's name as recorded at registration.",
  age_yr: "Age in years at the time of arrival in Natal.",
  age_mo:
    "Age in additional months at arrival (used for infants/children — combined with 'years').",
  sex: "Recorded as Man, Woman, Boy or Girl. The register distinguished adults from children.",
  caste:
    "Caste or community group as recorded by colonial officials. Categories were imposed by the registrar and are inconsistent across decades.",
  zillah:
    "Administrative district (zillah) of origin in colonial India — e.g. Madras, Calcutta, Ganjam, Vizagapatam.",
  thanna:
    "Police-station sub-district (thanna/thana) of origin — a finer-grained location than zillah.",
  village: "Village of origin in India, as recorded.",
  ship_name:
    "Name of the vessel that carried the passenger from India to Port Natal (Durban).",
  ship_voyage:
    "Roman-numeral voyage number for that ship (e.g. 'Umzinto XXXVIII' = the 38th voyage of the Umzinto).",
  arrival_month: "Month of arrival at Port Natal (Durban).",
  arrival_year:
    "Year the passenger arrived in Natal — between 1860 and 1911. (Not their year of birth or year of indenture's end.)",
  arrival_raw:
    "Original combined arrival string from the source spreadsheet: 'Month Year Ship Port-of-embarkation'.",
  embarkation_port:
    "Port in India where the passenger boarded — Madras or Calcutta in this dataset.",
  employer:
    "Estate owner, planter or company that employed the indentured worker in Natal.",
  returned_deceased:
    "Notes on the passenger's eventual outcome — returned to India, deceased, transferred, etc.",
  remarks: "Free-text notes from the immigration register.",
  related_links:
    "Cross-references to related passengers in the source data (e.g. family members on the same voyage).",
};
