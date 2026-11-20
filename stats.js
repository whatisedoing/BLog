/* BeerLog statistics: Overview, Top rated, Year in review.
   Loaded after the main script in index.html. It reads the main script's
   beers / allCk lists and draws into #stBody. Nothing here changes your data. */
(function(){
"use strict";

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DOWL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const INF = 8.64e15;

const S = {
  tab: "overview",
  ov: { type: "12m", y: null, my: null, mm: null, from: "", to: "" },
  top: { type: "all", y: null, my: null, mm: null, from: "", to: "" },
  metric: "drinks", gran: "auto", brk: "family", brkAll: false,
  topSort: "rating", topN: 10,
  yir: null, yirTop: 5,
  tagDim: "brewery", tagVal: null, tagSort: "rating", tagQ: "", tagListSort: "n", tagN: 30, ckN: 25,
  recN: 10, flavMin: 3
};

/* ---------- tiny helpers ---------- */
function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function btn(cls, text, fn){ const b = el("button", cls, text); b.type = "button"; b.addEventListener("click", fn); return b; }
const low = x => ((x == null ? "" : x) + "").trim().toLowerCase();
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const parseISO = s => { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);

(function css(){
  if (document.getElementById("stCss")) return;
  const s = document.createElement("style"); s.id = "stCss";
  s.textContent = [
    ".st-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 4px}",
    ".st-tile{background:var(--leather);border:1px solid var(--line);border-radius:6px;padding:10px 12px}",
    ".st-tile .v{font-size:1.65rem;color:var(--brass);line-height:1.2}",
    ".st-tile .l{color:var(--parchment);font-size:.88rem}",
    ".st-tile .d{color:var(--muted);font-size:.78rem;margin-top:2px}",
    ".st-chart{display:flex;align-items:flex-end;gap:2px;margin-top:10px}",
    ".st-col{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;cursor:pointer}",
    ".st-bw{height:100px;width:100%;display:flex;align-items:flex-end}",
    ".st-col i{display:block;width:100%;background:#6b5230;border-radius:2px 2px 0 0}",
    ".st-col.max i{background:var(--brass)}",
    ".st-col.sel i{outline:2px solid var(--parchment);outline-offset:1px}",
    ".st-col small{font-size:.66rem;color:var(--muted);line-height:1.5;white-space:nowrap}",
    ".st-axis{display:flex;justify-content:space-between;color:var(--muted);font-size:.78rem;margin-top:4px}",
    ".st-cap{min-height:1.5em;margin-top:8px;font-size:.92rem}",
    ".st-sub{color:var(--muted);font-size:.88rem;margin:2px 0 4px}",
    ".st-grp{margin:12px 0 0}",
    ".st-grp .lbl{margin:0 0 6px}",
    ".st-lrow{padding:7px 0}",
    ".st-lrow .t{display:flex;justify-content:space-between;gap:10px}",
    ".st-lrow .t span:last-child{color:var(--muted);white-space:nowrap}",
    ".st-r{display:flex;align-items:center;gap:8px;white-space:nowrap}",
    ".st-rn{color:var(--brass)}",
    ".st-hl{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)}",
    ".st-hl:last-child{border-bottom:none}",
    ".st-hl .k{color:var(--muted)}",
    ".st-hl .x{text-align:right}",
    ".st-more{margin-top:10px;width:100%}",
    ".st-big{font-size:1.05rem;margin:2px 0 8px}",
    "#stBody h2{margin-top:22px}",
    "#stBody select{margin-top:8px}",
    "#stTabs{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch}",
    "#stTabs::-webkit-scrollbar{display:none}",
    "#stTabs .tab{flex:0 0 auto;white-space:nowrap;padding:8px 13px}",
    ".st-tag{display:block;width:100%;margin:0 0 8px;padding:10px 13px;text-align:left;border:1px solid var(--line);",
    " border-radius:12px;background:var(--leather);color:inherit;font-size:1rem}",
    ".st-tag:hover{background:var(--leather2);border-color:rgba(209,160,73,.45)}",
    ".st-tag .t{display:flex;justify-content:space-between;gap:10px;align-items:baseline}",
    ".st-tag .t b{font-weight:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".st-tag .t span{color:var(--brass);white-space:nowrap;font-size:.9rem;font-family:system-ui,sans-serif}",
    ".st-tag .st-cnt{margin-top:5px;font-size:.74rem;color:var(--muted);font-family:system-ui,sans-serif}",
    ".st-back{width:auto;margin:0 0 10px;padding:7px 13px;border-radius:999px;font-size:.85rem}",
    ".st-flav{padding:9px 0}",
    ".st-flav .t{display:flex;justify-content:space-between;gap:10px;align-items:baseline}",
    ".st-flav .t b{font-weight:normal}",
    ".st-flav .t span{white-space:nowrap;font-family:system-ui,sans-serif;font-size:.86rem;color:var(--brass)}",
    ".st-flav .t span i{font-style:normal;color:var(--muted);margin-left:6px}",
    ".st-up{color:#8fc0a4}",
    ".st-dn{color:#c98f8f}",
    ".st-mini{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}",
    ".st-mini span{border:1px solid rgba(209,160,73,.4);border-radius:999px;padding:3px 10px;font-size:.72rem;color:#cbb690;font-family:system-ui,sans-serif}",
    "#stBody input.st-find{margin-top:10px}"
  ].join("\n");
  document.head.appendChild(s);
})();

/* ---------- data ---------- */
function prep(){
  const byId = {}; beers.forEach(b => { byId[b.id] = b; });
  const list = allCk.map(c => {
    const d = new Date(c.checked_in_at);
    const r = c.rating == null ? null : parseFloat(c.rating);
    return { c: c, b: byId[c.beer_id] || {}, d: d, ms: d.getTime(), r: isNaN(r) ? null : r };
  }).filter(x => !isNaN(x.ms)).sort((a, b) => a.ms - b.ms || (a.c.id < b.c.id ? -1 : 1));
  const seen = new Set();
  list.forEach(x => { x.fresh = !seen.has(x.c.beer_id); seen.add(x.c.beer_id); });
  return list;
}
const inRange = (all, from, to) => all.filter(x => x.ms >= from && x.ms < to);

function summarize(items){
  const bs = new Set(), br = new Set(), st = new Set(); let sum = 0, rated = 0, fresh = 0;
  items.forEach(x => {
    bs.add(x.c.beer_id);
    if (low(x.b.brewery_name)) br.add(low(x.b.brewery_name));
    if (low(x.b.style)) st.add(low(x.b.style));
    if (x.r != null){ sum += x.r; rated++; }
    if (x.fresh) fresh++;
  });
  return { n: items.length, beers: bs.size, breweries: br.size, styles: st.size, avg: rated ? sum / rated : null, rated: rated, fresh: fresh };
}

function countBy(items, fn){
  const m = new Map(); let missing = 0;
  items.forEach(x => {
    let raw = fn(x);
    if (!Array.isArray(raw)) raw = [raw];
    const names = raw.map(v => (v == null ? "" : String(v)).trim()).filter(Boolean);
    if (!names.length){ missing++; return; }
    const seen = new Set();
    names.forEach(name => {
      const k = name.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      let t = m.get(k);
      if (!t){ t = { name: name, n: 0, rated: 0, sum: 0, beers: new Set(), last: 0 }; m.set(k, t); }
      t.n++;
      if (x.r != null){ t.rated++; t.sum += x.r; }
      t.beers.add(x.c.beer_id);
      if (x.ms > t.last) t.last = x.ms;
    });
  });
  const list = [...m.values()];
  list.forEach(t => { t.avg = t.rated ? t.sum / t.rated : null; t.nbeers = t.beers.size; });
  list.sort((a, b) => b.n - a.n || (a.name < b.name ? -1 : 1));
  return { list: list, missing: missing };
}
function flavOf(x){ const f = x.c.flavour_tags; return Array.isArray(f) ? f : []; }

function topBeers(items, mode){
  const m = new Map();
  items.forEach(x => {
    let t = m.get(x.c.beer_id);
    if (!t){ t = { id: x.c.beer_id, beer: x.b, n: 0, rated: 0, sum: 0, last: 0 }; m.set(x.c.beer_id, t); }
    t.n++; if (x.r != null){ t.rated++; t.sum += x.r; }
    if (x.ms > t.last) t.last = x.ms;
  });
  let arr = [...m.values()];
  arr.forEach(t => { t.avg = t.rated ? t.sum / t.rated : null; });
  if (mode === "drunk"){
    arr.sort((a, b) => b.n - a.n || (b.avg == null ? -1 : b.avg) - (a.avg == null ? -1 : a.avg) || b.last - a.last);
  } else {
    arr = arr.filter(t => t.avg != null);
    arr.sort((a, b) => b.avg - a.avg || b.rated - a.rated || b.last - a.last);
  }
  return arr;
}

/* ---------- time ranges ---------- */
function bounds(R){
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), tom = addD(today, 1);
  const cy = now.getFullYear();
  const mk = (a, b) => ({ from: a.getTime(), to: b.getTime() });
  let from, to, label, prev = null, prevLabel = "";
  if (R.type === "all"){
    return { from: -INF, to: INF, label: "All time", prev: null, prevLabel: "" };
  } else if (R.type === "12m"){
    from = new Date(tom.getFullYear() - 1, tom.getMonth(), tom.getDate()); to = tom;
    label = "the past 12 months";
    prev = mk(new Date(from.getFullYear() - 1, from.getMonth(), from.getDate()), from); prevLabel = "the 12 months before";
  } else if (R.type === "30d"){
    from = addD(today, -29); to = tom; label = "the past 30 days";
    prev = mk(addD(from, -30), from); prevLabel = "the 30 days before";
  } else if (R.type === "ytd" || (R.type === "year" && R.y === cy)){
    from = new Date(cy, 0, 1); to = tom; label = cy + " so far";
    prev = mk(new Date(cy - 1, 0, 1), new Date(tom.getFullYear() - 1, tom.getMonth(), tom.getDate())); prevLabel = "same period in " + (cy - 1);
  } else if (R.type === "year"){
    from = new Date(R.y, 0, 1); to = new Date(R.y + 1, 0, 1); label = String(R.y);
    prev = mk(new Date(R.y - 1, 0, 1), from); prevLabel = String(R.y - 1);
  } else if (R.type === "lastmonth" || R.type === "month"){
    let y, m;
    if (R.type === "lastmonth"){ const p = new Date(now.getFullYear(), now.getMonth() - 1, 1); y = p.getFullYear(); m = p.getMonth(); }
    else { y = R.my; m = R.mm; }
    from = new Date(y, m, 1); to = new Date(y, m + 1, 1); label = MONL[m] + " " + y;
    const p = new Date(y, m - 1, 1);
    prev = mk(p, from); prevLabel = MONL[p.getMonth()] + " " + p.getFullYear();
  } else { // custom
    let a = R.from ? parseISO(R.from) : today, b = R.to ? parseISO(R.to) : today;
    if (b < a){ const t = a; a = b; b = t; }
    from = a; to = addD(b, 1);
    label = a.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + " to " +
            b.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    const days = Math.round((to - from) / 864e5);
    prev = mk(addD(from, -days), from); prevLabel = "the period before";
  }
  return { from: from.getTime(), to: to.getTime(), label: label, prev: prev, prevLabel: prevLabel };
}

function ensure(R){
  const now = new Date();
  if (R.type === "year" && R.y == null) R.y = now.getFullYear();
  if (R.type === "month" && R.my == null){ const p = new Date(now.getFullYear(), now.getMonth() - 1, 1); R.my = p.getFullYear(); R.mm = p.getMonth(); }
  if (R.type === "custom" && !R.from){ R.from = iso(new Date(now.getFullYear(), 0, 1)); R.to = iso(now); }
}

function rangeUI(parent, R, all, onChange){
  const types = [["all","All time"],["12m","Past 12 months"],["30d","Past 30 days"],["ytd","This year"],["lastmonth","Last month"],
                 ["year","A year"],["month","A month"],["custom","Custom dates"]];
  const wrap = el("div", "st-grp"), chips = el("div", "chips");
  types.forEach(t => chips.appendChild(btn("chip" + (R.type === t[0] ? " on" : ""), t[1], () => { R.type = t[0]; ensure(R); onChange(); })));
  wrap.appendChild(chips);
  const firstY = all.length ? all[0].d.getFullYear() : new Date().getFullYear(), lastY = new Date().getFullYear();
  const yearSel = (val, set) => {
    const s = document.createElement("select"); s.setAttribute("aria-label", "Year");
    for (let y = lastY; y >= firstY; y--){ const o = document.createElement("option"); o.value = y; o.textContent = y; if (y === val) o.selected = true; s.appendChild(o); }
    s.addEventListener("change", () => { set(parseInt(s.value, 10)); onChange(); });
    return s;
  };
  if (R.type === "year"){
    wrap.appendChild(yearSel(R.y, v => { R.y = v; }));
  } else if (R.type === "month"){
    const g = el("div", "grid2"), ms = document.createElement("select"); ms.setAttribute("aria-label", "Month");
    MONL.forEach((n, i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; if (i === R.mm) o.selected = true; ms.appendChild(o); });
    ms.addEventListener("change", () => { R.mm = parseInt(ms.value, 10); onChange(); });
    g.appendChild(ms); g.appendChild(yearSel(R.my, v => { R.my = v; }));
    wrap.appendChild(g);
  } else if (R.type === "custom"){
    const g = el("div", "grid2");
    [["from", "From"], ["to", "To"]].forEach(p => {
      const box = el("div"); const l = el("label", "", p[1]); const inp = document.createElement("input");
      inp.type = "date"; inp.value = R[p[0]] || "";
      inp.addEventListener("change", () => { if (inp.value){ R[p[0]] = inp.value; onChange(); } });
      box.appendChild(l); box.appendChild(inp); g.appendChild(box);
    });
    wrap.appendChild(g);
  }
  parent.appendChild(wrap);
}

/* ---------- reusable pieces ---------- */
function delta(cur, prev, label, dec){
  if (prev == null || cur == null) return "";
  let d = cur - prev; if (dec) d = +d.toFixed(dec);
  if (d === 0) return "no change vs " + label;
  return (d > 0 ? "+" : "−") + (dec ? Math.abs(d).toFixed(dec) : Math.abs(d)) + " vs " + label;
}

function tiles(parent, cur, prev, pl){
  const g = el("div", "st-tiles");
  [["Check-ins", cur.n, prev && prev.n, 0], ["Different beers", cur.beers, prev && prev.beers, 0],
   ["Breweries", cur.breweries, prev && prev.breweries, 0], ["Styles", cur.styles, prev && prev.styles, 0],
   ["Average rating", cur.avg, prev && prev.avg, 2], ["New to you", cur.fresh, prev && prev.fresh, 0]].forEach(r => {
    const t = el("div", "st-tile");
    t.appendChild(el("div", "v", r[1] == null ? "–" : (r[3] ? r[1].toFixed(r[3]) : String(r[1]))));
    t.appendChild(el("div", "l", r[0]));
    const d = prev ? delta(r[1], r[2], pl, r[3]) : "";
    if (d) t.appendChild(el("div", "d", d));
    g.appendChild(t);
  });
  parent.appendChild(g);
}

function barChart(parent, items, o){
  o = o || {};
  const vals = items.map(i => i.v).filter(v => v != null);
  const mx = o.max || Math.max(1, ...vals);
  let top = -1, best = 0;
  items.forEach((it, i) => { if (it.v != null && it.v > best){ best = it.v; top = i; } });
  const chart = el("div", "st-chart"), cap = el("div", "st-cap");
  items.forEach((it, i) => {
    const col = el("div", "st-col" + (i === top ? " max" : ""));
    col.setAttribute("role", "img"); col.setAttribute("aria-label", it.tip);
    if (items.length <= 13) col.appendChild(el("small", "", it.v == null ? "" : (o.vfmt ? o.vfmt(it.v) : String(it.v))));
    const bw = el("div", "st-bw"), bar = document.createElement("i");
    bar.style.height = (it.v > 0 ? Math.max(2, Math.round(it.v / mx * 100)) : 0) + "px";
    bw.appendChild(bar); col.appendChild(bw);
    if (items.length <= 14) col.appendChild(el("small", "", it.lab));
    col.addEventListener("click", () => {
      chart.querySelectorAll(".sel").forEach(x => x.classList.remove("sel"));
      col.classList.add("sel"); cap.textContent = it.tip;
    });
    chart.appendChild(col);
  });
  parent.appendChild(chart);
  if (items.length > 14){
    const ax = el("div", "st-axis");
    ax.appendChild(el("span", "", items[0].full)); ax.appendChild(el("span", "", items[Math.floor(items.length / 2)].full));
    ax.appendChild(el("span", "", items[items.length - 1].full));
    parent.appendChild(ax);
  }
  cap.textContent = top >= 0 ? "Highest: " + items[top].tip + ". Tap a bar to see another." : "Nothing to show yet.";
  parent.appendChild(cap);
}

function barList(parent, rows, total){
  const mx = Math.max(1, ...rows.map(r => r.n));
  rows.forEach(r => {
    const row = el("div", "st-lrow"), t = el("div", "t");
    t.appendChild(el("span", "", r.name)); t.appendChild(el("span", "", r.n));
    row.appendChild(t);
    const bar = el("div", "bar"), f = document.createElement("i"); f.style.width = (r.n / mx * 100) + "%";
    bar.appendChild(f); row.appendChild(bar); parent.appendChild(row);
  });
}

function h2(parent, text){ parent.appendChild(el("h2", "", text)); }
function card(parent){ const c = el("section", "card"); parent.appendChild(c); return c; }

function weekdayChart(parent, items){
  const n = [0, 0, 0, 0, 0, 0, 0];
  items.forEach(x => { n[x.d.getDay()]++; });
  barChart(parent, n.map((v, i) => ({ v: v, lab: DOW[i], full: DOW[i], tip: DOWL[i] + ": " + plural(v, "check-in", "check-ins") })));
}

function histogram(parent, items){
  const bins = new Array(20).fill(0); let rated = 0;
  items.forEach(x => { if (x.r == null) return; rated++; bins[Math.max(0, Math.min(19, Math.round(x.r * 4) - 1))]++; });
  if (!rated){ parent.appendChild(el("div", "empty", "No ratings in this period.")); return; }
  barChart(parent, bins.map((v, i) => {
    const s = ((i + 1) / 4).toFixed(2);
    return { v: v, lab: s, full: s, tip: s + " stars: " + plural(v, "check-in", "check-ins") };
  }));
}

function beerRow(rank, t){
  const row = el("div", "entry hit"), top = el("div", "top");
  top.appendChild(el("div", "name", rank + ". " + (t.beer.name || "Unknown beer")));
  if (t.avg != null){
    const r = el("div", "st-r"); r.appendChild(starsEl(t.avg)); r.appendChild(el("span", "st-rn", t.avg.toFixed(2))); top.appendChild(r);
  }
  row.appendChild(top);
  const sub = [t.beer.brewery_name, t.beer.style].filter(Boolean).join(", ");
  if (sub) row.appendChild(el("div", "sub", sub));
  row.appendChild(el("div", "sub", countText(t.n) + (t.rated !== t.n ? " (" + t.rated + " rated)" : "")));
  row.addEventListener("click", () => { window.statsScroll = window.scrollY; (typeof goBeer === "function" ? goBeer : openBeer)(t.id, "stats"); });
  return row;
}

function beerList(parent, arr, n, onMore, moreStep){
  if (!arr.length){ parent.appendChild(el("div", "empty", "No rated beers in this period.")); return; }
  arr.slice(0, n).forEach((t, i) => parent.appendChild(beerRow(i + 1, t)));
  if (arr.length > n) parent.appendChild(btn("quiet st-more", "Show more (" + Math.min(moreStep, arr.length - n) + " more)", onMore));
}

/* ---------- time chart ---------- */
const GRANS = ["day", "week", "month", "year"];
function bstart(d, g){
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (g === "day") return s;
  if (g === "week") return addD(s, -((s.getDay() + 6) % 7));
  if (g === "month") return new Date(d.getFullYear(), d.getMonth(), 1);
  return new Date(d.getFullYear(), 0, 1);
}
function bnext(d, g){
  if (g === "day") return addD(d, 1);
  if (g === "week") return addD(d, 7);
  if (g === "month") return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return new Date(d.getFullYear() + 1, 0, 1);
}
function makeBuckets(startMs, endMs, g){
  const out = []; let d = bstart(new Date(startMs), g);
  while (d.getTime() < endMs && out.length < 5000){ out.push(d); d = bnext(d, g); }
  return out;
}
function blabel(d, g, n){
  if (g === "day") return n <= 14 ? String(d.getDate()) : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
  if (g === "week") return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (g === "month") return n <= 14 ? MON[d.getMonth()] : MON[d.getMonth()] + " " + d.getFullYear();
  return String(d.getFullYear());
}
function btip(d, g){
  if (g === "day") return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  if (g === "week") return "Week of " + d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  if (g === "month") return MONL[d.getMonth()] + " " + d.getFullYear();
  return String(d.getFullYear());
}

function timeChart(parent, items, bd){
  const startMs = bd.from <= 0 ? (items.length ? items[0].ms : Date.now()) : bd.from;
  const tomorrow = addD(new Date(), 1).getTime();
  const endMs = Math.min(bd.to, tomorrow);
  const spanDays = Math.max(1, (endMs - startMs) / 864e5);
  let g = S.gran === "auto" ? (spanDays <= 45 ? "day" : spanDays <= 200 ? "week" : spanDays <= 365 * 3 ? "month" : "year") : S.gran;
  let b = makeBuckets(startMs, endMs, g);
  while (b.length > 500 && GRANS.indexOf(g) < 3){ g = GRANS[GRANS.indexOf(g) + 1]; b = makeBuckets(startMs, endMs, g); }
  const idx = new Map(); b.forEach((d, i) => idx.set(d.getTime(), i));
  const agg = b.map(() => ({ n: 0, sum: 0, rated: 0, fresh: 0 }));
  items.forEach(x => {
    const i = idx.get(bstart(x.d, g).getTime()); if (i == null) return;
    const a = agg[i]; a.n++; if (x.r != null){ a.sum += x.r; a.rated++; } if (x.fresh) a.fresh++;
  });
  const m = S.metric;
  const rows = b.map((d, i) => {
    const a = agg[i];
    const v = m === "drinks" ? a.n : m === "new" ? a.fresh : (a.rated ? a.sum / a.rated : null);
    const txt = m === "drinks" ? plural(a.n, "check-in", "check-ins") : m === "new" ? plural(a.fresh, "new beer", "new beers")
              : (a.rated ? "average " + (a.sum / a.rated).toFixed(2) : "no ratings");
    return { v: v, lab: blabel(d, g, b.length), full: blabel(d, g, 99), tip: btip(d, g) + ": " + txt };
  });
  barChart(parent, rows, { max: m === "avg" ? 5 : null, vfmt: m === "avg" ? (v => v.toFixed(1)) : null });
  parent.appendChild(el("div", "st-sub", "Each bar is one " + g + "."));
}

/* ---------- Overview tab ---------- */
const DIMS = [
  ["brewery", "Brewery", x => x.b.brewery_name, "breweries"],
  ["style", "Style", x => x.b.style, "styles"],
  ["flavour", "Flavour", flavOf, "flavours"],
  ["family", "Style family", x => x.b.style_family, "style families"],
  ["serving", "Serving", x => (typeof SERVE_MAP !== "undefined" && SERVE_MAP[x.c.serving_style]) || x.c.serving_style, "servings"],
  ["venue", "Venue", x => x.c.venue_name, "venues"],
  ["country", "Country", x => x.b.brewery_country, "countries"],
  ["region", "Province or state", x => low(x.b.brewery_region) ? x.b.brewery_region.trim() + (low(x.b.brewery_country) ? ", " + x.b.brewery_country.trim() : "") : "", "provinces and states"]
];
const dimPlural = d => d[3] || (d[1].toLowerCase() + "s");

function chipRow(parent, opts, cur, set){
  const row = el("div", "chips st-grp");
  opts.forEach(o => row.appendChild(btn("chip" + (cur === o[0] ? " on" : ""), o[1], () => { set(o[0]); render(); })));
  parent.appendChild(row);
}

function overview(root, all){
  const R = S.ov; ensure(R);
  h2(root, "Period");
  rangeUI(root, R, all, render);
  const bd = bounds(R), items = inRange(all, bd.from, bd.to);
  root.appendChild(el("div", "st-sub", "Showing " + (R.type === "all" ? "all time" : bd.label) + ": " + plural(items.length, "check-in", "check-ins") + "."));
  if (!items.length){ root.appendChild(el("div", "empty", "No check-ins in this period.")); return; }
  const cur = summarize(items);
  let prev = null;
  if (bd.prev){ const p = summarize(inRange(all, bd.prev.from, bd.prev.to)); if (p.n) prev = p; }
  tiles(root, cur, prev, bd.prevLabel);

  h2(root, "Over time");
  let c = card(root);
  chipRow(c, [["drinks", "Check-ins"], ["avg", "Average rating"], ["new", "New beers"]], S.metric, v => { S.metric = v; });
  chipRow(c, [["auto", "Auto"], ["day", "Day"], ["week", "Week"], ["month", "Month"], ["year", "Year"]], S.gran, v => { S.gran = v; });
  timeChart(c, items, bd);

  h2(root, "By day of the week");
  c = card(root); weekdayChart(c, items);

  h2(root, "Breakdown");
  c = card(root);
  chipRow(c, DIMS.map(d => [d[0], d[1]]), S.brk, v => { S.brk = v; S.brkAll = false; });
  const dim = DIMS.find(d => d[0] === S.brk), res = countBy(items, dim[2]);
  const box = el("div", "st-grp");
  if (!res.list.length) box.appendChild(el("div", "empty", "Nothing recorded for this in the period."));
  else {
    box.appendChild(el("div", "st-sub", plural(res.list.length, "different value", "different values") + (res.missing ? "; " + plural(res.missing, "check-in", "check-ins") + " without one" : "") + "."));
    barList(box, S.brkAll ? res.list : res.list.slice(0, 10));
    if (res.list.length > 10) box.appendChild(btn("quiet st-more", S.brkAll ? "Show top 10" : "Show all " + res.list.length, () => { S.brkAll = !S.brkAll; render(); }));
  }
  c.appendChild(box);

  h2(root, "Ratings given");
  c = card(root);
  c.appendChild(el("div", "st-big", cur.avg == null ? "No ratings" : "Average " + cur.avg.toFixed(2) + " across " + plural(cur.rated, "rating", "ratings")));
  histogram(c, items);
}

/* ---------- Top rated tab ---------- */
function topTab(root, all){
  const R = S.top; ensure(R);
  h2(root, "Period");
  rangeUI(root, R, all, () => { S.topN = 10; render(); });
  const bd = bounds(R), items = inRange(all, bd.from, bd.to);
  chipRow(root, [["rating", "Highest rated"], ["drunk", "Most often"]], S.topSort, v => { S.topSort = v; S.topN = 10; });
  const arr = topBeers(items, S.topSort);
  root.appendChild(el("div", "st-sub", (R.type === "all" ? "All time" : bd.label.charAt(0).toUpperCase() + bd.label.slice(1)) + ": " +
    plural(items.length, "check-in", "check-ins") + ", " + plural(arr.length, "beer", "beers") + " listed. " +
    (S.topSort === "rating" ? "Beers are ranked by their average rating in this period; ties go to the beer rated more often, then the more recent one."
                            : "Beers are ranked by how many times you checked them in; ties go to the higher rating.")));
  const c = card(root);
  beerList(c, arr, S.topN, () => { S.topN += 15; render(); }, 15);
}

/* ---------- Year in review tab ---------- */
function highlight(parent, k, x){ const r = el("div", "st-hl"); r.appendChild(el("span", "k", k)); r.appendChild(el("span", "x", x)); parent.appendChild(r); }
function deltaSentence(n, prevN, pl){
  if (prevN == null) return "";
  const d = n - prevN;
  if (d === 0) return " That matches " + (/^same/.test(pl) ? "the " : "") + pl + ".";
  return " That is " + Math.abs(d) + (d > 0 ? " more" : " fewer") + " than " + (/^same/.test(pl) ? "the " : "") + pl + ".";
}

function yearTab(root, all){
  const counts = {}; all.forEach(x => { const y = x.d.getFullYear(); counts[y] = (counts[y] || 0) + 1; });
  const years = Object.keys(counts).map(Number).filter(y => counts[y] >= 5).sort((a, b) => b - a);
  if (!years.length){ root.appendChild(el("div", "empty", "A year shows up here once it has at least 5 check-ins.")); return; }
  if (years.indexOf(S.yir) < 0) S.yir = years[0];
  const Y = S.yir, curY = new Date().getFullYear();
  const chips = el("div", "chips st-grp");
  years.forEach(y => chips.appendChild(btn("chip" + (y === Y ? " on" : ""), String(y), () => { S.yir = y; S.yirTop = 5; render(); })));
  root.appendChild(chips);

  const bd = bounds({ type: "year", y: Y }), items = inRange(all, bd.from, bd.to);
  const pItems = bd.prev ? inRange(all, bd.prev.from, bd.prev.to) : [];
  const cur = summarize(items), prev = pItems.length ? summarize(pItems) : null, pl = bd.prevLabel;
  const so = Y === curY ? " so far" : "";
  h2(root, "Your " + Y + so);
  root.appendChild(el("div", "st-sub", plural(items.length, "check-in", "check-ins") + (so ? ", compared with the same stretch of " + (Y - 1) + "." : ".")));
  tiles(root, cur, prev, pl);

  h2(root, "Highlights");
  let c = card(root);
  const tb = countBy(items, x => x.b.brewery_name).list[0], ts = countBy(items, x => x.b.style).list[0],
        tf = countBy(items, x => x.b.style_family).list[0], tv = countBy(items, x => x.c.venue_name).list[0],
        tsv = countBy(items, x => (typeof SERVE_MAP !== "undefined" && SERVE_MAP[x.c.serving_style]) || x.c.serving_style).list[0],
        mb = topBeers(items, "drunk")[0];
  if (tb) highlight(c, "Top brewery", tb.name + " (" + tb.n + ")");
  if (ts) highlight(c, "Top style", ts.name + " (" + ts.n + ")");
  if (tf && (!ts || low(tf.name) !== low(ts.name))) highlight(c, "Top style family", tf.name + " (" + tf.n + ")");
  if (tsv) highlight(c, "Most common serving", tsv.name + " (" + tsv.n + ")");
  if (tv) highlight(c, "Top venue", tv.name + " (" + tv.n + ")");
  if (mb && mb.n > 1) highlight(c, "Most checked-in beer", (mb.beer.name || "Unknown beer") + " (" + mb.n + ")");

  h2(root, "Top rated beers");
  c = card(root);
  beerList(c, topBeers(items, "rating"), S.yirTop, () => { S.yirTop += 5; render(); }, 5);

  h2(root, "Check-ins by month");
  c = card(root);
  const mn = new Array(12).fill(0); items.forEach(x => { mn[x.d.getMonth()]++; });
  barChart(c, mn.map((v, i) => ({ v: v, lab: MON[i], full: MON[i], tip: MONL[i] + " " + Y + ": " + plural(v, "check-in", "check-ins") })));

  h2(root, "By day of the week");
  c = card(root); weekdayChart(c, items);

  h2(root, "Breweries");
  c = card(root);
  c.appendChild(el("div", "st-big", "You drank from " + plural(cur.breweries, "different brewery", "different breweries") + "." +
    deltaSentence(cur.breweries, prev ? prev.breweries : null, pl)));
  barList(c, countBy(items, x => x.b.brewery_name).list.slice(0, 5));

  h2(root, "Styles");
  c = card(root);
  c.appendChild(el("div", "st-big", "You tried " + plural(cur.styles, "different style", "different styles") + "." +
    deltaSentence(cur.styles, prev ? prev.styles : null, pl)));
  barList(c, countBy(items, x => x.b.style).list.slice(0, 5));

  const sv = countBy(items, x => (typeof SERVE_MAP !== "undefined" && SERVE_MAP[x.c.serving_style]) || x.c.serving_style).list;
  if (sv.length){ h2(root, "How you drank"); c = card(root); barList(c, sv); }
  const vn = countBy(items, x => x.c.venue_name).list;
  if (vn.length){ h2(root, "Venues"); c = card(root); c.appendChild(el("div", "st-sub", plural(vn.length, "different venue", "different venues") + ".")); barList(c, vn.slice(0, 5)); }

  h2(root, "Ratings given");
  c = card(root);
  c.appendChild(el("div", "st-big", cur.avg == null ? "No ratings" : "Average " + cur.avg.toFixed(2) + " across " + plural(cur.rated, "rating", "ratings")));
  histogram(c, items);

  const earned = [];
  try {
    computeBadges("all").forEach(b => {
      for (let i = 0; i < b.level; i++){
        const dt = b.dates[i] ? new Date(b.dates[i]).getTime() : NaN;
        if (dt >= bd.from && dt < bd.to) earned.push({ ms: dt, t: b.name + ", level " + (i + 1) });
      }
    });
  } catch (e) { /* badges are optional here */ }
  if (earned.length){
    earned.sort((a, b) => a.ms - b.ms);
    h2(root, "Badge levels earned");
    c = card(root);
    c.appendChild(el("div", "st-sub", plural(earned.length, "level", "levels") + " in " + Y + "."));
    earned.forEach(e => highlight(c, new Date(e.ms).toLocaleDateString(undefined, { month: "short", day: "numeric" }), e.t));
  }
}


/* ---------- Tags: browse every check-in behind a brewery, style or flavour ---------- */
function ckRow(x){
  const row = el("div", "entry hit"), top = el("div", "top");
  top.appendChild(el("div", "name", x.b.name || "Unknown beer"));
  if (x.r != null){
    const r = el("div", "st-r"); r.appendChild(starsEl(x.r)); r.appendChild(el("span", "st-rn", x.r.toFixed(2)));
    top.appendChild(r);
  }
  row.appendChild(top);
  const a = [S.tagVal && S.tagDim === "brewery" ? "" : x.b.brewery_name, fmtDate(x.c.checked_in_at)].filter(Boolean);
  if (a.length) row.appendChild(el("div", "sub", a.join(" \u00b7 ")));
  const b = [x.c.serving_style, x.c.venue_name].filter(Boolean);
  if (b.length) row.appendChild(el("div", "sub", b.join(" \u00b7 ")));
  row.addEventListener("click", () => {
    window.statsScroll = window.scrollY;
    (typeof goBeer === "function" ? goBeer : openBeer)(x.c.beer_id, "stats");
  });
  return row;
}
function openTag(dim, val){
  S.tab = "tags"; S.tagDim = dim; S.tagVal = val; S.ckN = 25; S.tagSort = "rating";
  if (typeof pushState === "function") pushState({ view: "stats", tab: "tags", tagDim: dim, tagVal: val });
  render(); window.scrollTo(0, 0);
}
function matchesTag(x, dim, val){
  const d = DIMS.find(y => y[0] === dim); if (!d) return false;
  let raw = d[2](x); if (!Array.isArray(raw)) raw = [raw];
  return raw.some(v => low(v) === low(val));
}
function tagsTab(root, all){
  const dim = DIMS.find(d => d[0] === S.tagDim) || DIMS[0];
  if (S.tagVal){ tagDetail(root, all, dim); return; }
  h2(root, "Browse by");
  chipRow(root, DIMS.map(d => [d[0], d[1]]), S.tagDim, v => { S.tagDim = v; S.tagQ = ""; S.tagN = 30; });
  const res = countBy(all, dim[2]);
  if (!res.list.length){ root.appendChild(el("div", "empty", "Nothing recorded for this yet.")); return; }
  const c = card(root);
  if (res.list.length > 12){
    const inp = document.createElement("input");
    inp.className = "st-find"; inp.type = "search"; inp.autocomplete = "off";
    inp.placeholder = "Search " + dimPlural(dim); inp.value = S.tagQ;
    inp.addEventListener("input", () => { S.tagQ = inp.value; S.tagN = 30; draw(); });
    c.appendChild(inp);
  }
  chipRow(c, [["n", "Most check-ins"], ["rating", "Highest rated"], ["az", "A to Z"]], S.tagListSort,
    v => { S.tagListSort = v; S.tagN = 30; });
  const box = el("div", "st-grp"); c.appendChild(box);
  function draw(){
    box.innerHTML = "";
    const q = S.tagQ.trim().toLowerCase();
    let list = res.list.filter(t => !q || t.name.toLowerCase().indexOf(q) >= 0);
    if (S.tagListSort === "rating") list = list.slice().sort((a, b) => (b.avg == null ? -1 : b.avg) - (a.avg == null ? -1 : a.avg) || b.n - a.n);
    else if (S.tagListSort === "az") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    box.appendChild(el("div", "st-sub", list.length + " " + (list.length === 1 ? dim[1].toLowerCase() : dimPlural(dim)) +
      (res.missing && !q ? "; " + plural(res.missing, "check-in", "check-ins") + " without one" : "")));
    if (!list.length){ box.appendChild(el("div", "empty", "Nothing matches that.")); return; }
    list.slice(0, S.tagN).forEach(t => {
      const b = btn("st-tag", "", () => openTag(S.tagDim, t.name));
      const row = el("div", "t");
      row.appendChild(el("b", "", t.name));
      const right = el("span");
      right.textContent = t.avg != null ? "\u2605 " + t.avg.toFixed(2) : "not rated";
      row.appendChild(right);
      b.appendChild(row);
      const mx = Math.max.apply(null, list.map(y => y.n));
      const bar = el("div", "bar"), f = document.createElement("i");
      f.style.width = (t.n / mx * 100) + "%"; bar.appendChild(f); b.appendChild(bar);
      b.appendChild(el("div", "st-cnt", plural(t.n, "check-in", "check-ins") +
        (S.tagDim === "brewery" || S.tagDim === "flavour" || S.tagDim === "style" ? " \u00b7 " + plural(t.nbeers, "beer", "beers") : "")));
      box.appendChild(b);
    });
    if (list.length > S.tagN) box.appendChild(btn("quiet st-more", "Show more (" + Math.min(30, list.length - S.tagN) + " more)", () => { S.tagN += 30; draw(); }));
  }
  draw();
}
function tagDetail(root, all, dim){
  root.appendChild(btn("quiet st-back", "\u2039 All " + dimPlural(dim), () => {
    S.tagVal = null;
    if (typeof pushState === "function") pushState({ view: "stats", tab: "tags", tagDim: S.tagDim });
    render(); window.scrollTo(0, 0);
  }));
  const items = all.filter(x => matchesTag(x, S.tagDim, S.tagVal));
  root.appendChild(el("h2", "", S.tagVal));
  root.appendChild(el("div", "st-sub", dim[1]));
  if (!items.length){ root.appendChild(el("div", "empty", "No check-ins here.")); return; }
  const sum = summarize(items);
  const g = el("div", "st-tiles");
  [["Check-ins", String(sum.n)], ["Different beers", String(sum.beers)],
   ["Average rating", sum.avg == null ? "\u2013" : sum.avg.toFixed(2)],
   ["Last one", fmtDate(items[items.length - 1].c.checked_in_at)]].forEach(r => {
    const t = el("div", "st-tile");
    t.appendChild(el("div", "v", r[1])); t.appendChild(el("div", "l", r[0]));
    g.appendChild(t);
  });
  root.appendChild(g);
  if (S.tagDim !== "brewery"){
    const br = countBy(items, x => x.b.brewery_name).list.slice(0, 3).map(t => t.name + " (" + t.n + ")").join(", ");
    if (br) root.appendChild(el("div", "st-sub", "Mostly from " + br + "."));
  }
  h2(root, "Check-ins");
  const c = card(root);
  chipRow(c, [["rating", "Highest rated"], ["recent", "Most recent"]], S.tagSort, v => { S.tagSort = v; S.ckN = 25; });
  const sorted = items.slice().sort(S.tagSort === "recent"
    ? (a, b) => b.ms - a.ms
    : (a, b) => (b.r == null ? -1 : b.r) - (a.r == null ? -1 : a.r) || b.ms - a.ms);
  const box = el("div", "st-grp"); c.appendChild(box);
  sorted.slice(0, S.ckN).forEach(x => box.appendChild(ckRow(x)));
  if (sorted.length > S.ckN)
    box.appendChild(btn("quiet st-more", "Show more (" + Math.min(25, sorted.length - S.ckN) + " more)", () => { S.ckN += 25; render(); }));
}

/* ---------- Flavours: which tasting notes go with your better ratings ---------- */
function flavTab(root, all){
  const rated = all.filter(x => x.r != null);
  if (!rated.length){ root.appendChild(el("div", "empty", "Rate a few check-ins and this fills in.")); return; }
  const overall = rated.reduce((t, x) => t + x.r, 0) / rated.length;
  const res = countBy(rated, flavOf);
  const enough = res.list.filter(t => t.rated >= S.flavMin).sort((a, b) => b.avg - a.avg);
  h2(root, "Flavours you rate highest");
  root.appendChild(el("div", "st-sub", "Your average across every rated check-in is " + overall.toFixed(2) +
    ". Each row shows that flavour's average, how far it sits from yours, and how many rated check-ins it covers. " +
    "A flavour appears once you have rated it " + S.flavMin + " times or more; tap one to see those check-ins."));
  if (!enough.length){
    root.appendChild(el("div", "empty", "Not enough rated check-ins carry the same flavour yet."));
    return;
  }
  function flavList(parent, list){
    list.forEach(t => {
      const row = el("div", "st-flav"), head = el("div", "t");
      head.appendChild(el("b", "", t.name));
      const d = t.avg - overall;
      const right = el("span", "", t.avg.toFixed(2));
      const dd = el("i", Math.abs(d) < 0.005 ? "" : (d > 0 ? "st-up" : "st-dn"),
        (d > 0 ? "+" : d < 0 ? "\u2212" : "\u00b1") + Math.abs(d).toFixed(2) + "  \u00b7  " + t.n);
      right.appendChild(dd); head.appendChild(right);
      row.appendChild(head);
      const bar = el("div", "bar"), f = document.createElement("i");
      f.style.width = (t.avg / 5 * 100) + "%";
      if (d < 0) f.style.background = "#8a6a4a";
      bar.appendChild(f); row.appendChild(bar);
      row.addEventListener("click", () => openTag("flavour", t.name));
      row.style.cursor = "pointer";
      parent.appendChild(row);
    });
  }
  let c = card(root);
  flavList(c, enough.slice(0, 8));
  if (enough.length > 10){
    h2(root, "Flavours you rate lowest");
    c = card(root);
    flavList(c, enough.slice(-5).reverse());
  }

  const best = enough.filter(t => t.avg > overall).slice(0, 8);
  h2(root, "Worth another round");
  if (!best.length){
    root.appendChild(el("div", "empty", "Nothing stands out above your average yet."));
    return;
  }
  const names = {}; best.forEach(t => { names[t.name.toLowerCase()] = t.name; });
  root.appendChild(el("div", "st-sub", "Beers you rate above your average that carry " +
    best.map(t => t.name).join(", ") + "."));
  const m = new Map();
  all.forEach(x => {
    let t = m.get(x.c.beer_id);
    if (!t){ t = { id: x.c.beer_id, beer: x.b, n: 0, rated: 0, sum: 0, last: 0, fl: new Set() }; m.set(x.c.beer_id, t); }
    t.n++; if (x.r != null){ t.rated++; t.sum += x.r; }
    if (x.ms > t.last) t.last = x.ms;
    flavOf(x).forEach(f => { const k = low(f); if (names[k]) t.fl.add(k); });
  });
  const picks = [...m.values()].filter(t => t.rated && t.fl.size);
  picks.forEach(t => { t.avg = t.sum / t.rated; });
  const good = picks.filter(t => t.avg >= overall)
    .sort((a, b) => b.avg - a.avg || b.fl.size - a.fl.size || b.last - a.last);
  if (!good.length){ root.appendChild(el("div", "empty", "No beers match those flavours yet.")); return; }
  c = card(root);
  good.slice(0, S.recN).forEach((t, i) => {
    const row = beerRow(i + 1, t);
    const chips = el("div", "st-mini");
    [...t.fl].forEach(k => chips.appendChild(el("span", "", names[k])));
    row.appendChild(chips);
    row.appendChild(el("div", "sub", "Last had " + fmtDate(new Date(t.last).toISOString())));
    c.appendChild(row);
  });
  if (good.length > S.recN)
    c.appendChild(btn("quiet st-more", "Show more (" + Math.min(10, good.length - S.recN) + " more)", () => { S.recN += 10; render(); }));
}

/* ---------- entry point ---------- */
function render(){
  const root = $("stBody"); if (!root) return;
  const tabs = $("stTabs");
  if (!tabs._wired){
    tabs._wired = true;
    tabs.addEventListener("click", e => {
      const t = e.target.closest(".tab"); if (!t) return;
      S.tab = t.dataset.st; render(); window.scrollTo(0, 0);
    });
  }
  tabs.querySelectorAll(".tab").forEach(b => b.classList.toggle("on", b.dataset.st === S.tab));
  root.innerHTML = "";
  const all = prep();
  if (!all.length){ root.appendChild(el("div", "empty", "Statistics will appear once you have some check-ins.")); return; }
  if (S.tab === "tags") tagsTab(root, all);
  else if (S.tab === "flavour") flavTab(root, all);
  else if (S.tab === "top") topTab(root, all);
  else if (S.tab === "year") yearTab(root, all);
  else overview(root, all);
}

window.renderStats = render;
window.statsApply = function(st){
  if (!st) return;
  if (st.tab) S.tab = st.tab;
  if (st.tagDim) S.tagDim = st.tagDim;
  S.tagVal = st.tagVal || null;
  if (!$("stats").classList.contains("hidden")) render();
};
window.statsOpenTag = function(dim, val){
  S.tab = "tags"; S.tagDim = dim; S.tagVal = val; S.ckN = 25; S.tagSort = "rating";
};
})();
