import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Landmark } from "lucide-react";
import {
  AD_VALOREM,
  ALL_FUNDS,
  DEPTS,
  GAP,
  GF_TOTAL,
  LEVELS,
  LOCKED_REVENUE,
  MILL,
  REV,
  SERVICES,
  allPrograms,
  cityTax,
  deptTotal,
  dollars,
  floorOf,
  maxCut,
  millWorth,
  money,
  type Dept,
  type Year,
} from "@/data/budget";
import { submitPostcard } from "@/lib/collect";

const PROGS = allPrograms();
const KEY = "pc-budget-gap-v1";
const POLICE_FIRE =
  deptTotal(DEPTS.find((d) => d.id === "police")!) +
  deptTotal(DEPTS.find((d) => d.id === "fire")!);

type Plan = {
  year: Year;
  cuts: Record<string, number>;
  rev: Record<string, number>;
  headline: string;
  pal: "bay" | "sunset" | "sand";
  av: number;
  name: string;
  email: string;
};

const fresh = (): Plan => ({
  year: 2,
  cuts: {},
  rev: {},
  headline: "My Panama City budget",
  pal: "bay",
  av: 250000,
  name: "",
  email: "",
});

const PALS = {
  bay: { bg: "#0c242c", bg2: "#0e6e78", ink: "#f4fffe", sub: "#c5e4e4", acc: "#f0c27a" },
  sunset: { bg: "#3c2418", bg2: "#c45c1a", ink: "#fff6ee", sub: "#f3d2b8", acc: "#ffe08a" },
  sand: { bg: "#f3efe6", bg2: "#e4d7c0", ink: "#142028", sub: "#5c6e74", acc: "#0e6e78" },
};

function revAmount(id: string, raw: number | undefined, year: Year) {
  const spec = REV.find((r) => r.id === id);
  if (!spec || !raw) return 0;
  if (spec.type === "check") return spec.amt;
  if (spec.type === "seg") return spec.val(raw);
  return spec.val(raw, year);
}

export function Worksheet() {
  const [plan, setPlan] = useState<Plan>(fresh);
  const [avText, setAvText] = useState("250,000");
  const [showMath, setShowMath] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendNote, setSendNote] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const capRef = useRef<HTMLTextAreaElement>(null);
  const ready = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Plan>;
        if (s && s.cuts && s.rev) {
          const next = { ...fresh(), ...s, year: s.year === 1 ? 1 : 2 } as Plan;
          setPlan(next);
          setAvText(Math.round(next.av || 0).toLocaleString("en-US"));
        }
      }
    } catch {
      /* keep defaults */
    }
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(plan));
    } catch {
      /* private mode */
    }
  }, [plan]);

  const totals = useMemo(() => {
    let cuts = 0;
    const byDept: Record<string, number> = {};
    for (const [id, level] of Object.entries(plan.cuts)) {
      const p = PROGS.get(id);
      if (!p || !level) continue;
      const deepest = maxCut(p);
      const v = (p.amt * Math.min(level, deepest)) / 100;
      cuts += v;
      byDept[p.dept.id] = (byDept[p.dept.id] || 0) + v;
    }
    let rev = 0;
    const byRev: Record<string, number> = {};
    for (const r of REV) {
      const v = revAmount(r.id, plan.rev[r.id], plan.year);
      if (v) {
        rev += v;
        byRev[r.id] = v;
      }
    }
    const gap = GAP[plan.year];
    const closed = cuts + rev;
    const left = Math.max(gap - closed, 0);
    return { cuts, rev, byDept, byRev, gap, closed, left };
  }, [plan]);

  const tax = useMemo(() => {
    const av = plan.av || 0;
    const a = cityTax(av, 2026);
    const b = cityTax(av, 2027);
    const c = cityTax(av, 2028);
    const s27 = Math.max(0, Math.min(a.tax - b.tax, a.tax));
    const s28 = Math.max(0, Math.min(a.tax - c.tax, a.tax));
    return { av, a, b, c, s27, s28 };
  }, [plan.av]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;
    const P = PALS[plan.pal];
    const g = ctx.createLinearGradient(0, 0, 1080, 1350);
    g.addColorStop(0, P.bg);
    g.addColorStop(1, P.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 1180 + i * 28);
      ctx.bezierCurveTo(360, 1160 + i * 28, 720, 1210 + i * 28, 1080, 1170 + i * 28);
      ctx.stroke();
    }
    ctx.fillStyle = P.sub;
    ctx.font = "600 28px 'Source Sans 3', sans-serif";
    ctx.fillText(`PANAMA CITY  ·  AMENDMENT 3  ·  YEAR ${plan.year}`, 72, 110);
    ctx.fillStyle = P.ink;
    ctx.font = "560 84px Fraunces, serif";
    const y0 = wrap(ctx, plan.headline || "My Panama City budget", 72, 220, 920, 92);
    ctx.fillStyle = P.sub;
    ctx.font = "400 34px 'Source Sans 3', sans-serif";
    const y1 = wrap(ctx, `Closing a ${money(totals.gap)} General Fund gap`, 72, y0 + 16, 920, 46);
    const barY = y1 + 24;
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(72, barY, 936, 26);
    const w = Math.min((totals.cuts + totals.rev) / totals.gap, 1) * 936;
    ctx.fillStyle = P.acc;
    ctx.fillRect(72, barY, w, 26);
    ctx.fillStyle = P.ink;
    ctx.font = "560 60px Fraunces, serif";
    ctx.fillText(totals.left <= 0 ? "Gap closed" : `${money(totals.left)} to go`, 72, barY + 100);
    ctx.font = "600 30px 'Source Sans 3', sans-serif";
    ctx.fillStyle = P.sub;
    ctx.fillText(`Cuts ${money(totals.cuts)}    ·    New revenue ${money(totals.rev)}`, 72, barY + 150);

    const picks: { t: string; v: number; rev?: boolean }[] = [];
    for (const d of DEPTS) {
      const v = totals.byDept[d.id];
      if (v) picks.push({ t: `Cut ${d.name}`, v });
    }
    for (const r of REV) {
      const v = totals.byRev[r.id];
      if (!v) continue;
      const raw = plan.rev[r.id] || 0;
      const label =
        r.type === "check"
          ? "Business tax +5%"
          : r.id === "mill"
            ? `Millage +${raw.toFixed(2)}`
            : r.id === "fire"
              ? `Fire assessment +${raw}%`
              : r.id === "fran"
                ? `Franchise fee +${raw}%`
                : `Zoning fees +${raw}%`;
      picks.push({ t: label, v, rev: true });
    }
    picks.sort((a, b) => b.v - a.v);
    let y = barY + 200;
    ctx.font = "650 34px 'Source Sans 3', sans-serif";
    if (!picks.length) {
      ctx.fillStyle = P.sub;
      ctx.fillText("No choices yet. Build a plan above.", 72, y + 20);
    }
    for (const p of picks.slice(0, 6)) {
      ctx.fillStyle = "rgba(255,255,255,.1)";
      roundRect(ctx, 72, y, 936, 72, 12);
      ctx.fillStyle = P.ink;
      const label = p.t.length > 36 ? p.t.slice(0, 35) + "…" : p.t;
      ctx.fillText(label, 96, y + 46);
      ctx.fillStyle = P.acc;
      ctx.font = "700 32px 'Source Sans 3', sans-serif";
      const s = (p.rev ? "+" : "−") + money(p.v);
      ctx.fillText(s, 980 - ctx.measureText(s).width, y + 46);
      ctx.font = "650 34px 'Source Sans 3', sans-serif";
      y += 84;
    }
    ctx.fillStyle = P.sub;
    ctx.font = "400 22px 'Source Sans 3', sans-serif";
    ctx.fillText("My preferences, not a City decision. Independent estimate.", 72, 1305);
    imgRef.current.src = canvas.toDataURL("image/png");

    const top = picks.slice(0, 3).map((p) => p.t);
    const closed = totals.left <= 0 ? "all" : `${money(Math.min(totals.closed, totals.gap))} of`;
    if (capRef.current) {
      capRef.current.value = `${plan.headline}: I closed ${closed} Panama City's ${money(totals.gap)} Amendment 3 gap${
        top.length ? ` with ${top.join(", ")}` : ""
      }. The city's General Fund is ${money(GF_TOTAL)}. Try the worksheet and see what you'd cut.`;
    }
  }, [plan, totals, step]);

  const topBar = SERVICES[0]?.amt || 1;
  const cutW = Math.min(totals.cuts / totals.gap, 1) * 100;
  const revW = Math.min(totals.rev / totals.gap, 1 - cutW / 100) * 100;
  const flexBase = GF_TOTAL - POLICE_FIRE;
  const groups = [...new Set(DEPTS.map((d) => d.group))];

  function setCut(id: string, level: number) {
    setPlan((p) => {
      const cuts = { ...p.cuts };
      if (level) cuts[id] = level;
      else delete cuts[id];
      return { ...p, cuts };
    });
  }

  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choiceLines() {
    const cuts: string[] = [];
    for (const [id, level] of Object.entries(plan.cuts)) {
      const p = PROGS.get(id);
      if (!p || !level) continue;
      cuts.push(`${p.dept.name} / ${p.name}: ${Math.min(level, maxCut(p))}%`);
    }
    const revenue: string[] = [];
    for (const r of REV) {
      const amt = revAmount(r.id, plan.rev[r.id], plan.year);
      if (amt) revenue.push(`${r.name}: +${Math.round(amt)}`);
    }
    return {
      cuts: cuts.join("; ") || "none",
      revenue: revenue.join("; ") || "none",
    };
  }

  async function sharePostcard() {
    const text = capRef.current?.value || "";
    const src = imgRef.current?.src;
    if (!src) return;
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], "panama-city-budget.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: plan.headline || "Panama City budget",
          text,
        });
        return;
      }
    } catch {
      /* fall through to the caption copy */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      capRef.current?.select();
    }
  }

  async function sendResponse() {
    const name = plan.name.trim();
    const email = plan.email.trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSent("error");
      setSendNote("Enter your name and a real email address.");
      return;
    }
    setSent("sending");
    setSendNote("");
    const lines = choiceLines();
    try {
      await submitPostcard({
        name,
        email,
        year: plan.year === 1 ? "Year 1" : "Year 2",
        assessed: String(Math.round(plan.av || 0)),
        cityTaxSavings2027: String(Math.round(tax.s27)),
        cityTaxSavings2028: String(Math.round(tax.s28)),
        gap: String(Math.round(totals.gap)),
        cuts: lines.cuts,
        revenue: lines.revenue,
        closed: String(Math.round(totals.closed)),
      });
      setSent("sent");
      setSendNote("Saved to the private response file.");
    } catch (err) {
      setSent("error");
      setSendNote(err instanceof Error ? err.message : "Could not save just now. Try again in a moment.");
    }
  }

  return (
    <div>
      <div className="notice">
        <div className="wrap">
          <span>Independent estimate. Not a City of Panama City website.</span>
          <span>Figures reviewed November 23, 2026</span>
        </div>
      </div>

      <header className="top">
        <div className="wrap">
          <div className="brand">
            <span className="mark" aria-hidden>
              <Landmark size={22} />
            </span>
            <span className="eyebrow">Panama City · General Fund</span>
          </div>
          <h1>Close a {money(GAP[2])} gap in the city budget.</h1>
          <p className="lede">
            Florida voters raised the homestead exemption on non-school property taxes. The Bay
            County Property Appraiser's estimate, reported before the vote, put Panama City's loss
            at {dollars(GAP[1])} the first year and {dollars(GAP[2])} once the $250,000 exemption
            is in place. Use the city's own FY 2027 adopted budget to see what that means for a
            homestead tax bill and for the services the General Fund pays for.
          </p>
          <nav className="nav" aria-label="Steps">
            {["The gap", "Your home", "Postcard"].map((label, i) => (
              <button
                key={label}
                type="button"
                aria-current={step === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {step === 2 && (
      <div className="meter">
        <div className="wrap">
          <div className="meter-row">
            <div className="year-toggle" role="group" aria-label="Which year's gap">
              <button
                type="button"
                aria-pressed={plan.year === 1}
                onClick={() => setPlan((p) => ({ ...p, year: 1 }))}
              >
                Year 1 · {money(GAP[1])}
              </button>
              <button
                type="button"
                aria-pressed={plan.year === 2}
                onClick={() => setPlan((p) => ({ ...p, year: 2 }))}
              >
                Year 2 · {money(GAP[2])}
              </button>
            </div>
            <div className={`status num ${totals.left <= 0 ? "done" : ""}`} aria-live="polite">
              {totals.left <= 0 ? "Gap closed" : `${money(totals.left)} to go`}
            </div>
          </div>
          <div className="track" aria-hidden>
            <i className="c" style={{ width: `${cutW}%` }} />
            <i className="r" style={{ width: `${revW}%` }} />
          </div>
          <div className="chips">
            <span>
              <i className="dot" style={{ background: "var(--color-gap)" }} />
              Cuts {money(totals.cuts)}
            </span>
            <span>
              <i className="dot" style={{ background: "var(--color-gulf)" }} />
              New revenue {money(totals.rev)}
            </span>
            <span>Target {money(totals.gap)}</span>
          </div>
        </div>
      </div>
      )}

      {step === 0 && (
      <>
      <section id="overview">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Overview</p>
            <h2>The numbers in brief</h2>
          </div>
          <div className="stats">
            <div className="stat">
              <span>General Fund, FY 2027</span>
              <b className="num">{money(GF_TOTAL)}</b>
              <span>Adopted. All city funds together are {money(ALL_FUNDS)}.</span>
            </div>
            <div className="stat">
              <span>Property tax in that fund</span>
              <b className="num">{money(AD_VALOREM)}</b>
              <span>Ad valorem at {MILL} mills. The full gap is about 19% of this levy.</span>
            </div>
            <div className="stat">
              <span>Year 1 loss</span>
              <b className="num">{money(GAP[1])}</b>
              <span>$150,000 exemption. About 4% of the General Fund.</span>
            </div>
            <div className="stat">
              <span>Year 2 loss</span>
              <b className="num">{money(GAP[2])}</b>
              <span>$250,000 exemption. About 6% of the General Fund.</span>
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <article className="card">
              <p className="eyebrow">Statewide vote</p>
              <h3 style={{ marginTop: 8 }}>Passed with about 62%</h3>
              <p className="note">Needed 60%. The marker is the threshold.</p>
              <div className="vote">
                <div className="scale" aria-hidden>
                  <i />
                  <span className="mark60" />
                </div>
              </div>
            </article>
            <article className="card">
              <p className="eyebrow">If police and fire are spared</p>
              <h3 style={{ marginTop: 8 }}>About a 12% cut everywhere else</h3>
              <p className="note">
                Police and fire are {money(POLICE_FIRE)}, half the General Fund. The Year 2 gap is{" "}
                {money(GAP[2])} of the other {money(flexBase)}. Debt transfers and the CRA payment
                are not really optional, so the cut on what is left would be deeper than 12%.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="services">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Services</p>
            <h2>Where the General Fund goes</h2>
            <p className="lede">
              FY 2027 adopted totals. Utilities, garbage and the marinas are enterprise funds and
              are not in this chart. Police and fire together are half the General Fund.
            </p>
          </div>
          {SERVICES.map((d) => (
            <div className="dept" key={d.name}>
              <span>{d.name}</span>
              <span className="bar" aria-hidden>
                <i style={{ width: `${(d.amt / topBar) * 100}%` }} />
              </span>
              <span className="amt num">{money(d.amt)}</span>
            </div>
          ))}
          <p className="note" style={{ marginTop: 12 }}>
            Source: City of Panama City FY 2027 Adopted Budget, General Fund department totals.
            Information technology ($1,610,437) and the Bay County transportation payment ($179,457)
            are not on this page. The adopted General Fund is {dollars(GF_TOTAL)}.
          </p>
        </div>
      </section>

      <section id="amendment">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">The amendment</p>
            <h2>What Amendment 3 changes</h2>
            <p className="lede">
              It applies to non-school property taxes, the ones that pay for city police, fire,
              parks and streets. School district taxes are unchanged.
            </p>
          </div>
          <div className="grid-2">
            <article className="card">
              <h3>$150,000 exemption first</h3>
              <p className="note">
                On the 2027 tax roll, homesteads get up to $150,000 off assessed value for city,
                county and other non-school levies. The current non-school exemption is $25,000
                plus a CPI-adjusted second slice, $26,411 in 2026, on value above $50,000.
              </p>
            </article>
            <article className="card">
              <h3>$250,000 the next year</h3>
              <p className="note">
                The exemption rises to $250,000 on the 2028 roll, then adjusts with inflation
                starting in 2029. School taxes still use the $25,000 homestead exemption.
              </p>
            </article>
            <article className="card">
              <h3>5% cap on other property</h3>
              <p className="note">
                Yearly assessment growth on rentals, commercial property and second homes is capped
                at 5% for non-school levies, down from 10%. That limits value growth. It does not
                cut the tax rate.
              </p>
            </article>
            <article className="card">
              <h3>New residents phase in</h3>
              <p className="note">
                People who become permanent Florida residents after December 31, 2026 start at the
                current exemption and phase up to the full amount over five years.
              </p>
            </article>
          </div>
          <div className="timeline">
            <div>
              <strong>2026</strong>Vote
            </div>
            <div>
              <strong>2027</strong>$150K
            </div>
            <div>
              <strong>2028</strong>$250K
            </div>
            <div>
              <strong>2029</strong>CPI
            </div>
          </div>
          <div className="row-actions" style={{ marginTop: 22 }}>
            <button type="button" className="textbtn" onClick={() => go(1)}>
              See the homestead savings
            </button>
          </div>
        </div>
      </section>
      </>
      )}

      {step === 1 && (
      <section id="bill">
        <div className="wrap grid-2">
          <div>
            <div className="sec-head">
              <p className="eyebrow">Your household</p>
              <h2>What could this save on city taxes?</h2>
              <p className="lede">
                Enter the assessed value before exemptions. Find it on your TRIM notice, or search
                the address at the{" "}
                <a href="https://www.baypa.net" style={{ color: "var(--color-gulf)" }}>
                  Bay County Property Appraiser
                </a>
                . This is City of Panama City operating tax only.
              </p>
            </div>
            <label className="field">
              <span>Assessed home value</span>
              <input
                type="text"
                inputMode="numeric"
                value={avText}
                aria-label="Assessed home value"
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "");
                  setAvText(digits ? Number(digits).toLocaleString("en-US") : "");
                  setPlan((p) => ({ ...p, av: Math.min(5_000_000, Number(digits) || 0) }));
                }}
              />
              <input
                type="range"
                min={50000}
                max={800000}
                step={5000}
                value={Math.max(50000, Math.min(800000, plan.av || 50000))}
                aria-label="Assessed value slider"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPlan((p) => ({ ...p, av: v }));
                  setAvText(v.toLocaleString("en-US"));
                }}
              />
            </label>
            <p className="note">
              Example shown starts at $250,000. Assumes a homestead in place by December 31, 2026,
              holds assessed value and the {MILL} mill city rate constant, and rounds to the
              dollar.
            </p>
          </div>
          <div className="card">
            <Row label="2026 · today" value={dollars(tax.a.tax)} sub="city tax per year" />
            <Row label="2027 · $150K" value={dollars(tax.b.tax)} sub={`saves ${dollars(tax.s27)}`} />
            <Row label="2028 · $250K" value={dollars(tax.c.tax)} sub={`saves ${dollars(tax.s28)}`} />
            <button type="button" className="textbtn ghost" onClick={() => setShowMath((v) => !v)}>
              {showMath ? "Hide the calculation" : "See the calculation"}
            </button>
            {showMath && (
              <pre className="math">{`2026: ${dollars(tax.av)} − ${dollars(tax.a.ex)} exemption = ${dollars(tax.a.taxable)} taxable
      × ${MILL} ÷ 1,000 = ${dollars(tax.a.tax)}
2027: ${dollars(tax.av)} − $150,000 = ${dollars(tax.b.taxable)} taxable → ${dollars(tax.b.tax)}
      savings ${dollars(tax.s27)}
2028: ${dollars(tax.av)} − $250,000 = ${dollars(tax.c.taxable)} taxable → ${dollars(tax.c.tax)}
      savings ${dollars(tax.s28)}`}</pre>
            )}
            <p className="note">
              Savings are per year, not cumulative. County, school and Downtown Improvement Board
              taxes are not included, and neither is the fire assessment or garbage and stormwater
              charges. A higher millage later would shrink these savings.
            </p>
          </div>
        </div>
        <div className="wrap">
          <div className="row-actions" style={{ marginTop: 8 }}>
            <button type="button" className="textbtn" onClick={() => go(2)}>
              Make the postcard
            </button>
            <button type="button" className="textbtn ghost" onClick={() => go(0)}>
              Back
            </button>
          </div>
        </div>
      </section>
      )}

      {step === 2 && (
      <>
      <section id="build">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Budget builder</p>
            <h2>A city budget, built by you</h2>
            <p className="lede">
              Close the Year {plan.year} gap by cutting General Fund lines, adding revenue, or
              both. Amounts are the FY 2027 adopted figures. Police, fire, and public works stop
              at a 25% cut. Public works here is streets, paving, signs, facilities, City Hall, and
              public works administration. Other ongoing lines keep at least 25% as a basic cost.
              Contributions and one-time equipment outside those departments can still go to zero.
              Debt and the CRA payment stay fixed.
            </p>
          </div>
          <div className="row-actions" style={{ marginBottom: 16 }}>
            <a className="textbtn" href="#card">
              Make my postcard
            </a>
            <button
              type="button"
              className="textbtn ghost"
              onClick={() =>
                setPlan((p) => ({
                  ...fresh(),
                  year: p.year,
                  headline: p.headline,
                  pal: p.pal,
                  av: p.av,
                }))
              }
            >
              Reset plan
            </button>
          </div>

          {groups.map((group) => (
            <div key={group}>
              <div className="group-h">
                <h3>{group}</h3>
              </div>
              {DEPTS.filter((d) => d.group === group).map((d) => (
                <DeptBox
                  key={d.id}
                  dept={d}
                  cut={totals.byDept[d.id] || 0}
                  cuts={plan.cuts}
                  onCut={setCut}
                />
              ))}
            </div>
          ))}

          <div className="group-h" style={{ marginTop: 28 }}>
            <h3>Add revenue</h3>
            <p className="note">
              Each of these needs commission action. The millage math uses the smaller tax base
              after the estimated loss, so a mill is worth less than it is today.
            </p>
          </div>
          <div className="revgrid">
            {REV.map((r) => {
              const raw = plan.rev[r.id] || 0;
              const amt = revAmount(r.id, raw, plan.year);
              const base = r.type === "range" ? r.base(plan.year) : r.base();
              return (
                <div className={`choice ${amt ? "on" : ""}`} key={r.id}>
                  <div className="hd">
                    <strong>{r.name}</strong>
                    <span className="val num">{amt ? `+${money(amt)}` : "$0"}</span>
                  </div>
                  <span className="base">{base}</span>
                  {r.type === "range" && (
                    <input
                      type="range"
                      min={r.min}
                      max={r.max}
                      step={r.step}
                      value={raw}
                      aria-label={r.name}
                      onChange={(e) =>
                        setPlan((p) => ({ ...p, rev: { ...p.rev, [r.id]: Number(e.target.value) } }))
                      }
                    />
                  )}
                  {r.type === "range" && (
                    <p className="num">
                      {r.unit === "mills"
                        ? `+${raw.toFixed(2)} mills · new rate ${(MILL + raw).toFixed(4)}`
                        : `+${raw}%`}
                    </p>
                  )}
                  {r.type === "seg" && (
                    <div className="seg" role="group" aria-label={r.name}>
                      {r.opts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          aria-pressed={raw === o}
                          onClick={() => setPlan((p) => ({ ...p, rev: { ...p.rev, [r.id]: o } }))}
                        >
                          {o ? `+${o}%` : "No change"}
                        </button>
                      ))}
                    </div>
                  )}
                  {r.type === "check" && (
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={!!raw}
                        onChange={(e) =>
                          setPlan((p) => ({
                            ...p,
                            rev: { ...p.rev, [r.id]: e.target.checked ? 1 : 0 },
                          }))
                        }
                      />
                      <span>Add {dollars(r.amt)} a year</span>
                    </label>
                  )}
                  <p>{r.note}</p>
                </div>
              );
            })}
          </div>
          <div className="group-h" style={{ marginTop: 22 }}>
            <h3>Already in the budget, not a dial</h3>
          </div>
          <div className="maxed">
            {LOCKED_REVENUE.map((m) => (
              <div className="choice locked" key={m[0]}>
                <div className="hd">
                  <strong>{m[0]}</strong>
                  <span className="base">{m[1]}</span>
                </div>
                <p>{m[2]}</p>
              </div>
            ))}
          </div>
          <p className="note" style={{ marginTop: 14 }}>
            Your choices are not a City decision. Send the response below if you want your name,
            email, and these choices kept with the other postcards.
          </p>
        </div>
      </section>

      <section id="card">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Share your take</p>
            <h2>Your budget, on a postcard</h2>
            <p className="lede">
              One image for the expenses and the revenue you picked. Share it, and send your name
              and email with the choices so the responses can be read together.
            </p>
          </div>
          <div className="postcard">
            <div>
              <img ref={imgRef} className="pcimg" alt="Postcard of your budget plan" />
              <div className="row-actions" style={{ marginTop: 8 }}>
                <a
                  className="textbtn"
                  href={imgRef.current?.src || undefined}
                  download="panama-city-budget-gap.png"
                  onClick={(e) => {
                    const src = imgRef.current?.src;
                    if (!src) e.preventDefault();
                    else (e.currentTarget as HTMLAnchorElement).href = src;
                  }}
                >
                  Save image
                </a>
              </div>
            </div>
            <div>
              <label className="field">
                Your name
                <input
                  className="head-in"
                  value={plan.name}
                  autoComplete="name"
                  maxLength={80}
                  onChange={(e) => setPlan((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label className="field">
                Email
                <input
                  className="head-in"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={plan.email}
                  maxLength={120}
                  onChange={(e) => setPlan((p) => ({ ...p, email: e.target.value }))}
                />
              </label>
              <p className="note">
                The postcard image does not include your name or email. Those are added to a
                private CSV only when you save the response, along with the homestead value and
                the cuts and revenue you chose. They are not sent to the City.
              </p>
              <label className="field">
                Headline
                <input
                  className="head-in"
                  value={plan.headline}
                  maxLength={80}
                  onChange={(e) => setPlan((p) => ({ ...p, headline: e.target.value }))}
                />
              </label>
              <div className="swatches" role="group" aria-label="Postcard color" style={{ margin: "12px 0" }}>
                {(["bay", "sunset", "sand"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`swatch ${id}`}
                    aria-label={id}
                    aria-pressed={plan.pal === id}
                    onClick={() => setPlan((p) => ({ ...p, pal: id }))}
                  />
                ))}
              </div>
              <label className="field">
                Caption
                <textarea ref={capRef} rows={5} readOnly />
              </label>
              <button
                type="button"
                className="textbtn"
                style={{ marginTop: 8 }}
                onClick={async () => {
                  const text = capRef.current?.value || "";
                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    capRef.current?.select();
                  }
                }}
              >
                {copied ? "Copied" : "Copy caption"}
              </button>
              <button type="button" className="textbtn" style={{ marginTop: 8 }} onClick={() => void sharePostcard()}>
                Share postcard
              </button>
              <div className="row-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="textbtn ghost"
                  onClick={() => {
                    const text = `${capRef.current?.value || plan.headline} https://beegee1006.github.io/panama-city-budget-gap/`;
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  Post on X
                </button>
                <button
                  type="button"
                  className="textbtn ghost"
                  onClick={() => {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        "https://beegee1006.github.io/panama-city-budget-gap/",
                      )}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  Facebook
                </button>
              </div>
              <button
                type="button"
                className="textbtn"
                style={{ marginTop: 8 }}
                disabled={sent === "sending"}
                onClick={() => void sendResponse()}
              >
                {sent === "sending" ? "Saving" : sent === "sent" ? "Response saved" : "Save my response"}
              </button>
              {sendNote && <p className="note">{sendNote}</p>}
              <div className="row-actions" style={{ marginTop: 16 }}>
                <button type="button" className="textbtn ghost" onClick={() => go(1)}>
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {step === 0 && (
      <>
      <section id="faq" className="faq">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">FAQs</p>
            <h2>Questions, answered</h2>
          </div>
          <Faq q="Does Amendment 3 eliminate my property tax bill?">
            No. School taxes still apply, with the existing $25,000 exemption. The county's
            non-school taxes use the new exemption too, but they do not disappear unless the
            assessed value is under the exemption. The fire assessment, garbage and stormwater
            charges are not ad valorem taxes, so the exemption does not wipe them out. A homestead
            assessed under $250,000 would owe no City of Panama City operating tax starting with
            the 2028 roll. It can still owe the county, the school board, the downtown board if it
            is inside that district, and the assessments.
          </Faq>
          <Faq q="Why is the city's loss bigger in year two?">
            The exemption steps up: $150,000 first, then $250,000. The Bay County Property
            Appraiser's figures, reported by the News Herald on June 25, 2026, were $2,485,248 the
            first year and an additional $1,340,763 in 2028. Added together, that is $3,826,011.
            The same figure came up at the city's June 11, 2026 budget workshop. These are
            estimates from before the election, not a revised FY 2028 budget.
          </Faq>
          <Faq q="Can't the city just raise the millage?">
            Within limits. Florida caps municipal operating millage at 10. The adopted FY 2027 city
            rate is 4.7999 mills, and the downtown district adds 3 mills inside its boundary. The
            aggregate rate of 4.8609 is already 2.57% over the rolled-back rate of 4.7393, which
            took the higher vote threshold under the TRIM law. After the exemption, each mill
            raises less because the tax base is smaller: about {money(millWorth(1))} in year 1 and{" "}
            {money(millWorth(2))} in year 2, against about {money(AD_VALOREM / MILL)} on today's
            budgeted levy.
          </Faq>
          <Faq q="Why can't I cut the debt transfers or the CRA payment?">
            Non-departmental expenses in FY 2027 are $3.87 million, and every dollar is a transfer
            for capital notes. Those payments follow the debt. The $2.07 million CRA line is the
            General Fund's payment into the redevelopment districts. The chamber contribution,
            which sits in the same department, can be reduced.
          </Faq>
          <Faq q="The city already has a fire assessment. Why is it a revenue option?">
            Because it already exists, at $6.06 million in the FY 2027 budget, against a $13.6
            million fire department. Raising it is a real lever, and unlike millage it does not
            shrink when the homestead exemption grows. It also lands on the same homeowners the
            amendment was written to help.
          </Faq>
          <Faq q="Can reserves cover it?">
            Only once. The FY 2027 budget was cut, including travel, vacant positions and
            cost-of-living adjustments, so the city could put money back into reserves. A reserve
            draw does not repeat. The Amendment 3 loss does.
          </Faq>
          <Faq q="Who made this page?">
            It is an independent community resource. It is not produced, reviewed or endorsed by
            the City of Panama City. A saved response adds your name, email, homestead value,
            and the expense and revenue choices to a private CSV. The postcard image stays on your
            device unless you share it.
          </Faq>
        </div>
      </section>

      <section id="sources" className="sources">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Sources and method</p>
            <h2>Where the figures come from</h2>
          </div>
          <ul className="lede">
            <li>
              <a href="https://www.panamacity.gov/DocumentCenter/View/12435/FY27-Adopted-Document">
                City of Panama City, FY 2027 Adopted Budget
              </a>
              . General Fund revenue and department totals. Ad valorem taxes $19,750,649. Fire
              assessment $6,059,224. Electric franchise $4,250,000. Department totals sum to
              $62,593,981.
            </li>
            <li>
              Final millage resolution, September 22, 2026: 4.7999 mills citywide and 3.0000 mills
              for the Downtown Improvement District. Aggregate 4.8609 versus a rolled-back
              aggregate of 4.7393.
            </li>
            <li>
              <a href="https://www.newsherald.com/story/news/local/2026/06/25/property-tax-plan-could-gut-bay-county-budgets/90659981007">
                Panama City News Herald, June 25, 2026
              </a>
              . Property Appraiser estimates for Panama City: $2,485,248 the first year and an
              additional $1,340,763 in 2028. The June 11 workshop figure of $3,826,011 matches that
              sum.
            </li>
            <li>
              WJHG, September 22, 2026: the commission adopted a budget over $140 million, kept the
              millage unchanged, and described the cuts as a way to rebuild reserves.
            </li>
            <li>
              Florida Department of Revenue CPI homestead table: the 2026 additional non-school
              exemption used here is $26,411.
            </li>
          </ul>
          <p className="note">
            Savings math: city taxable value equals assessed value minus the exemption. Tax equals
            taxable value times 4.7999 divided by 1,000. The gap figures are the Property
            Appraiser's estimates as reported, not an adopted budget. One mill after the loss
            equals the remaining ad valorem budget divided by 4.7999. Cuts are taken off FY 2027
            adopted amounts, with no inflation. Real cuts take time and can carry severance or
            contract costs.
          </p>
        </div>
      </section>
      </>
      )}

      <footer className="fine">
        <div className="wrap">
          Independent community resource. Not affiliated with the City of Panama City. Not an
          official city website. Check the adopted budget and the Bay County Property Appraiser
          before you rely on a number.
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="hd" style={{ marginBottom: 12 }}>
      <div>
        <strong>{label}</strong>
        <div className="note">{sub}</div>
      </div>
      <span className="val num">{value}</span>
    </div>
  );
}

function DeptBox({
  dept,
  cut,
  cuts,
  onCut,
}: {
  dept: Dept;
  cut: number;
  cuts: Record<string, number>;
  onCut: (id: string, level: number) => void;
}) {
  return (
    <details className={`deptbox ${cut ? "on" : ""}`}>
      <summary>
        <span>
          {dept.name}
          <span className="note" style={{ display: "block", fontWeight: 500 }}>
            {money(deptTotal(dept))} · {dept.progs.length} line{dept.progs.length > 1 ? "s" : ""}
          </span>
        </span>
        <span className="dcut num">{cut ? `−${money(cut)}` : ""}</span>
      </summary>
      <div className="progs">
        {dept.progs.map((p) =>
          p.cap === 0 ? (
            <div key={p.id}>
              <div className="hd">
                <strong>{p.name}</strong>
                <span className="num">{dollars(p.amt)}</span>
              </div>
              <p>{p.note}</p>
            </div>
          ) : (
            <div key={p.id}>
              <div className="hd">
                <strong>{p.name}</strong>
                <span className="num">{dollars(p.amt)}</span>
              </div>
              <p>{p.note}</p>
              {floorOf(p) > 0 && maxCut(p) === 100 - floorOf(p) && (
                <p>
                  {floorOf(p) >= 50
                    ? `Stops at a ${100 - floorOf(p)}% cut. ${dollars((p.amt * floorOf(p)) / 100)} stays.`
                    : `At least ${floorOf(p)}% stays (${dollars((p.amt * floorOf(p)) / 100)}). A basic cost on this worksheet, not a quote.`}
                </p>
              )}
              <div className="seg" role="group" aria-label={`Cut to ${p.name}`}>
                {LEVELS.filter((l) => l <= maxCut(p)).map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={Math.min(cuts[p.id] || 0, maxCut(p)) === l}
                    onClick={() => onCut(p.id, l)}
                  >
                    {l === 0 ? "None" : l === 100 ? "Cut all" : `−${l}%`}
                  </button>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </details>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details>
      <summary>{q}</summary>
      <p>{children}</p>
    </details>
  );
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = t;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
