/** City of Panama City FY 2027 adopted General Fund, and Amendment 3 estimates. */

export const MILL = 4.7999;
export const AD_VALOREM = 19_750_649;
export const GF_TOTAL = 62_593_981;
export const ALL_FUNDS = 150_263_913;
/** Additional (second) homestead exemption for 2026, CPI-adjusted, non-school. */
export const EXTRA_EXEMPTION_2026 = 26_411;

export const GAP: Record<1 | 2, number> = {
  1: 2_485_248,
  2: 3_826_011,
};

export type Year = 1 | 2;

export type Prog = {
  id: string;
  name: string;
  amt: number;
  note: string;
  /** 0 = fixed, not adjustable. Otherwise the deepest cut offered, before the floor. */
  cap: number;
  /**
   * Percent of the adopted amount that stays.
   * Omitted means BASIC_FLOOR. Set 0 when the line can go to zero.
   */
  floor?: number;
};

export type Dept = {
  id: string;
  name: string;
  group: string;
  progs: Prog[];
};

/** Kept share for police, fire, and public works. The deepest cut on those lines is 25%. */
export const PROTECTED_FLOOR = 75;

export const DEPTS: Dept[] = [
  {
    id: "police",
    name: "Police",
    group: "Public safety",
    progs: [
      {
        id: "p_pay",
        name: "Pay, pensions and benefits",
        amt: 14_989_836,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Most of the police budget. This worksheet stops at a 25% cut. Pensions already earned are not optional.",
      },
      {
        id: "p_ops",
        name: "Operating",
        amt: 2_166_460,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Fuel, repairs, insurance, communications, supplies and contracts.",
      },
      {
        id: "p_cap",
        name: "Vehicles and equipment",
        amt: 54_000,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Capital outlay in the FY 2027 adopted police budget.",
      },
      {
        id: "p_debt",
        name: "Debt service",
        amt: 524_850,
        cap: 0,
        note: "The remainder of the police total after pay, operating and capital. Treated as fixed.",
      },
    ],
  },
  {
    id: "fire",
    name: "Fire",
    group: "Public safety",
    progs: [
      {
        id: "f_pay",
        name: "Pay, pensions and benefits",
        amt: 11_975_670,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Firefighters, overtime and the fire pension. This worksheet stops at a 25% cut.",
      },
      {
        id: "f_ops",
        name: "Operating",
        amt: 1_263_350,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Stations, gear, fuel, insurance and contracts.",
      },
      {
        id: "f_cap",
        name: "Equipment",
        amt: 11_632,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Capital outlay adopted for FY 2027. Apparatus purchases are not in this line.",
      },
      {
        id: "f_debt",
        name: "Debt service",
        amt: 354_035,
        cap: 0,
        note: "Principal and interest already in the fire budget. Not adjustable here.",
      },
    ],
  },
  {
    id: "streets",
    name: "Street maintenance",
    group: "Streets and buildings",
    progs: [
      {
        id: "st",
        name: "Street maintenance",
        amt: 5_206_031,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Up from $3.92 million in the FY 2026 adopted budget. The separate drainage and sweeping departments were zeroed out in FY 2027, so this line carries the street operation.",
      },
    ],
  },
  {
    id: "paving",
    name: "Paving crew",
    group: "Streets and buildings",
    progs: [
      {
        id: "pv_pay",
        name: "Paving crew pay and benefits",
        amt: 268_625,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "New in the FY 2027 budget.",
      },
      {
        id: "pv_ops",
        name: "Paving crew operating",
        amt: 681_375,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Contracts, materials and the rest of the $950,000 paving department.",
      },
    ],
  },
  {
    id: "signs",
    name: "Signs and markings",
    group: "Streets and buildings",
    progs: [
      {
        id: "sg",
        name: "Street signs and markings",
        amt: 446_494,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Signs and pavement markings.",
      },
    ],
  },
  {
    id: "fac",
    name: "Facilities maintenance",
    group: "Streets and buildings",
    progs: [
      {
        id: "fac",
        name: "Facilities maintenance",
        amt: 1_167_318,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Upkeep of city buildings.",
      },
    ],
  },
  {
    id: "hall",
    name: "City Hall",
    group: "Streets and buildings",
    progs: [
      {
        id: "hall",
        name: "City Hall",
        amt: 552_660,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "City Hall operations in the General Fund.",
      },
    ],
  },
  {
    id: "pw",
    name: "Public works administration",
    group: "Streets and buildings",
    progs: [
      {
        id: "pw",
        name: "Public works administration",
        amt: 271_074,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "Department leadership, separate from the street crews.",
      },
    ],
  },
  {
    id: "parks",
    name: "Parks, culture and recreation",
    group: "Parks and culture",
    progs: [
      {
        id: "pk_pay",
        name: "Pay and benefits",
        amt: 2_284_327,
        cap: 100,
        note: "Park and recreation staff.",
      },
      {
        id: "pk_ops",
        name: "Operating",
        amt: 1_428_951,
        cap: 100,
        note: "Utilities, mowing contracts, supplies and programs. Down from $2.24 million adopted in FY 2026.",
      },
    ],
  },
  {
    id: "mlk",
    name: "MLK Recreation Campus",
    group: "Parks and culture",
    progs: [
      {
        id: "mlk",
        name: "MLK Recreation Campus",
        amt: 1_254_581,
        cap: 100,
        note: "Martin Luther King Jr. Recreation Campus.",
      },
    ],
  },
  {
    id: "arts",
    name: "Center for the Arts",
    group: "Parks and culture",
    progs: [
      {
        id: "arts",
        name: "Center for the Arts",
        amt: 256_460,
        cap: 100,
        note: "Most of this is a contract ($181,760), plus utilities, insurance and upkeep.",
      },
    ],
  },
  {
    id: "events",
    name: "Special events",
    group: "Parks and culture",
    progs: [
      {
        id: "dpc",
        name: "Destination Panama City",
        amt: 30_000,
        cap: 100,
        floor: 0,
        note: "Budgeted contribution. It was $115,000 in the FY 2026 amended budget. A contribution can go to zero.",
      },
      {
        id: "mardi",
        name: "St. Andrew Mardi Gras",
        amt: 22_500,
        cap: 100,
        floor: 0,
        note: "Budgeted contribution. It was $42,500 in FY 2026. A contribution can go to zero.",
      },
    ],
  },
  {
    id: "small",
    name: "Other small accounts",
    group: "Parks and culture",
    progs: [
      {
        id: "small",
        name: "Other small accounts",
        amt: 30_660,
        cap: 100,
        note: "A recreation-facility utility bill ($16,200), public facilities ($12,500), the mall area ($1,500) and a Civic Center insurance line ($460).",
      },
    ],
  },
  {
    id: "dev",
    name: "Development services",
    group: "Development",
    progs: [
      {
        id: "dev",
        name: "Development services",
        amt: 1_394_550,
        cap: 100,
        note: "Planning, zoning and land use. Permit revenue does not cover this cost.",
      },
    ],
  },
  {
    id: "eng",
    name: "Engineering",
    group: "Development",
    progs: [
      {
        id: "eng",
        name: "Engineering",
        amt: 1_496_105,
        cap: 25,
        floor: PROTECTED_FLOOR,
        note: "City engineering in the General Fund. This worksheet stops at a 25% cut. Deeper than that, the city would contract the work out, and a basic cost would remain.",
      },
    ],
  },
  {
    id: "house",
    name: "Housing administration",
    group: "Development",
    progs: [
      {
        id: "house",
        name: "Housing administration",
        amt: 182_720,
        cap: 100,
        note: "Housing general administration charged to the General Fund. Grant programs sit in other funds.",
      },
    ],
  },
  {
    id: "biz",
    name: "Business recruitment",
    group: "Development",
    progs: [
      {
        id: "biz",
        name: "Business recruitment",
        amt: 268_143,
        cap: 100,
        note: "Economic development staff and promotion.",
      },
    ],
  },
  {
    id: "econ",
    name: "Outside payments",
    group: "Fixed and outside",
    progs: [
      {
        id: "cra",
        name: "Community Redevelopment Agency",
        amt: 2_070_552,
        cap: 0,
        note: "General Fund payment to the CRA, up from $1.84 million adopted in FY 2026. Tax-increment obligations follow the redevelopment plans, so this line stays fixed.",
      },
      {
        id: "chamber",
        name: "Chamber of Commerce",
        amt: 58_500,
        cap: 100,
        floor: 0,
        note: "Budgeted contribution. A contribution can go to zero.",
      },
    ],
  },
  {
    id: "debt",
    name: "Debt transfers",
    group: "Fixed and outside",
    progs: [
      {
        id: "debt",
        name: "Transfers for capital notes",
        amt: 3_871_727,
        cap: 0,
        note: "The entire non-departmental budget: $1,438,661 on the 2018 note, $1,200,000 on the 2023/2025 refunding, $1,052,571 on the 2013B note, and $180,495 on the 2016 note. Set by the debt, so not adjustable here.",
      },
    ],
  },
  {
    id: "animal",
    name: "Animal control",
    group: "General government",
    progs: [
      {
        id: "animal",
        name: "Animal control",
        amt: 300_000,
        cap: 100,
        note: "Contract animal control. It was $250,000 in the FY 2026 adopted budget.",
      },
    ],
  },
  {
    id: "clerk",
    name: "City Clerk-Treasurer",
    group: "General government",
    progs: [
      {
        id: "clerk",
        name: "City Clerk-Treasurer",
        amt: 1_433_304,
        cap: 50,
        note: "Records, meetings and treasury. Public-records duties are required, so this worksheet stops at a 50% cut.",
      },
    ],
  },
  {
    id: "mgr",
    name: "City Manager",
    group: "General government",
    progs: [
      {
        id: "mgr",
        name: "City Manager",
        amt: 1_316_235,
        cap: 100,
        note: "City Manager's office.",
      },
    ],
  },
  {
    id: "hr",
    name: "Human resources",
    group: "General government",
    progs: [
      {
        id: "hr",
        name: "Human resources",
        amt: 917_126,
        cap: 100,
        note: "Hiring, benefits and employee relations.",
      },
    ],
  },
  {
    id: "atty",
    name: "City Attorney",
    group: "General government",
    progs: [
      {
        id: "atty",
        name: "City Attorney",
        amt: 900_000,
        cap: 50,
        note: "Legal counsel. The adopted FY 2027 budget is $900,000, up from $850,000 in FY 2026. This worksheet stops at a 50% cut.",
      },
    ],
  },
  {
    id: "purch",
    name: "Purchasing",
    group: "General government",
    progs: [
      {
        id: "purch",
        name: "Purchasing",
        amt: 511_851,
        cap: 100,
        note: "Bids and contracts.",
      },
    ],
  },
  {
    id: "log",
    name: "Logistics",
    group: "General government",
    progs: [
      {
        id: "log",
        name: "Logistics",
        amt: 493_701,
        cap: 100,
        note: "Down from $647,371 adopted in FY 2026.",
      },
    ],
  },
  {
    id: "comm",
    name: "City Commission",
    group: "General government",
    progs: [
      {
        id: "comm",
        name: "City Commission",
        amt: 348_684,
        cap: 25,
        note: "Five elected commissioners, including the mayor. The offices exist either way, so this worksheet stops at a 25% cut.",
      },
    ],
  },
];

export const LEVELS = [0, 10, 25, 50, 75, 100] as const;

/** Share of an ongoing line this worksheet will not cut. A planning floor, not an adopted minimum. */
export const BASIC_FLOOR = 25;

export function floorOf(p: Prog) {
  return p.floor ?? BASIC_FLOOR;
}

/** Deepest cut the buttons will offer, after the line cap and the floor. */
export function maxCut(p: Prog) {
  return Math.min(p.cap, 100 - floorOf(p));
}

export type RevRange = {
  id: string;
  type: "range";
  name: string;
  min: number;
  max: number;
  step: number;
  unit: "mills" | "%";
  base: (year: Year) => string;
  val: (v: number, year: Year) => number;
  note: string;
};

export type RevSeg = {
  id: string;
  type: "seg";
  name: string;
  opts: number[];
  unit: "%";
  base: () => string;
  val: (v: number) => number;
  note: string;
  labels?: Record<number, string>;
};

export type RevCheck = {
  id: string;
  type: "check";
  name: string;
  amt: number;
  base: () => string;
  note: string;
};

export type Rev = RevRange | RevSeg | RevCheck;

const FIRE_ASSESS = 6_059_224;
const ZONING_FEES = 175_000;

export const REV: Rev[] = [
  {
    id: "mill",
    type: "range",
    name: "Raise the city millage rate",
    min: 0,
    max: 1.5,
    step: 0.05,
    unit: "mills",
    val: (v, year) => v * millWorth(year),
    base: (year) =>
      `Current rate ${MILL} mills · 1 mill ≈ ${money(millWorth(year), 2)} after the FY ${year === 1 ? "2028" : "2029"} loss`,
    note: "The FY 2027 aggregate rate of 4.8609 mills is already 2.57% above the rolled-back rate of 4.7393. Under Florida's TRIM law, beating the rolled-back rate takes a two-thirds vote, and beating 110% of it takes a unanimous vote. Municipal operating millage cannot exceed 10 mills. A higher rate falls mostly on non-homestead property and on homes assessed above the new exemption.",
  },
  {
    id: "fire",
    type: "range",
    name: "Raise the fire assessment",
    min: 0,
    max: 40,
    step: 5,
    unit: "%",
    val: (v) => (FIRE_ASSESS * v) / 100,
    base: () =>
      `The city already charges one. FY 2027 budget: ${money(FIRE_ASSESS, 2)}`,
    note: "It is on the tax bill as a non-ad valorem charge, so homesteads pay it even when the exemption wipes out the city millage. Florida courts allow these assessments for fire protection, not as a blank tax, and the rate has to match a benefit study. Raising it shifts part of the tax cut back onto homeowners and renters.",
  },
  {
    id: "zone",
    type: "seg",
    name: "Raise planning and zoning fees",
    opts: [0, 50, 100],
    unit: "%",
    val: (v) => (ZONING_FEES * v) / 100,
    base: () => `Planning and zoning review is budgeted at ${money(ZONING_FEES, 0)}`,
    note: "Florida limits regulatory fees to the cost of the service. Development services costs $1.39 million, so today's fees cover a small share. A higher fee still would not close much of the gap.",
  },
  {
    id: "lbt",
    type: "check",
    name: "Raise the local business tax 5%",
    amt: 12_500,
    base: () => "Occupational license receipts are budgeted at $250,000",
    note: "State law limits local business tax increases to 5% every other year, and that takes a supermajority. Five percent of this line is $12,500.",
  },
  {
    id: "merchant",
    type: "seg",
    name: "Change the merchant fee cap",
    opts: [0, 1, 2, 3],
    unit: "%",
    labels: { 0: "Keep $50", 1: "Cap $20k", 2: "Cap $30k", 3: "Uncap autos" },
    val: (v) => (v === 1 ? 2_305_000 : v === 2 ? 3_611_000 : v === 3 ? 5_845_000 : 0),
    base: () => "Budgeted at $13.75 million. These choices are auto dealers only, not the whole fee.",
    note: "Section 7-53 is 1% of a sale, only on the first $5,000 of an item, so the fee stops at $50. The amounts here are the July 28, 2023 GAI study of 2021 auto sales, for planning only. A $20,000 cap was about $2.3 million more from auto dealers, a $30,000 cap about $3.6 million, and removing the cap about $5.8 million. Auto collections in that study were $781,200 with the cap and $6.6 million with it removed. GAI could not reliably estimate the other merchants. Its $31.2 million no-cap calculation is not an achievable estimate and is not counted. The March 31 and June 11, 2026 workshops cited $3.1 million, $4.6 million, and $6.2 million at caps of $20,000, $30,000, and $40,000. This worksheet uses the study's net auto figures, not those lines. A $100 cap was not estimated.",
  },
];

export const LOCKED_REVENUE: [string, string, string][] = [
  [
    "Utility service taxes",
    "$5.48M",
    "Electric $5.00M, gas $400,000, propane $75,000. State law caps the public service tax at 10%. The current city rate is not in the budget book.",
  ],
  [
    "Half-cent sales tax",
    "$4.63M",
    "Set by the state formula, not by a city vote.",
  ],
  [
    "State revenue sharing",
    "$2.30M",
    "Set by the state formula.",
  ],
  [
    "Communications services tax",
    "$1.84M",
    "Budgeted at $1,837,077. The municipal cap is set in state law.",
  ],
  [
    "Local option gas tax",
    "$1.42M",
    "Shared under state law. Not a city millage decision.",
  ],
];

export function millWorth(year: Year) {
  return Math.max(AD_VALOREM - GAP[year], 0) / MILL;
}

export function money(n: number, digits = 2) {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1_000_000) {
    const v = a / 1_000_000;
    const s = v.toFixed(digits).replace(/\.?0+$/, "");
    return `${sign}$${s}M`;
  }
  if (a >= 10_000) return `${sign}$${Math.round(a / 1000).toLocaleString("en-US")}K`;
  return `${sign}$${Math.round(a).toLocaleString("en-US")}`;
}

export function dollars(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function deptTotal(d: Dept) {
  return d.progs.reduce((s, p) => s + p.amt, 0);
}

export function allPrograms() {
  const map = new Map<string, Prog & { dept: Dept }>();
  for (const d of DEPTS) {
    for (const p of d.progs) map.set(p.id, { ...p, dept: d });
  }
  return map;
}

/** City operating tax only, homestead, millage held at 4.7999. */
export function cityTax(assessed: number, year: 2026 | 2027 | 2028) {
  let ex = 0;
  if (year === 2026) {
    ex = 25_000 + Math.min(Math.max(assessed - 50_000, 0), EXTRA_EXEMPTION_2026);
  } else if (year === 2027) {
    ex = 150_000;
  } else {
    ex = 250_000;
  }
  const taxable = Math.max(assessed - ex, 0);
  return { ex, taxable, tax: (taxable * MILL) / 1000 };
}

export const SERVICES = [...DEPTS]
  .map((d) => ({ name: d.name, amt: deptTotal(d) }))
  .sort((a, b) => b.amt - a.amt);
