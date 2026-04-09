import { useEffect, useMemo, useState } from "react";

import {
  cx,
  formatCompact,
  formatPct,
  safeDelta,
  sumBy,
  toCsv,
  downloadText,
  downloadExcelHtml,
  downloadHtmlAsPdf,
} from "../utils/helpers";

import { IITs, YEARS, EVIDENCE_LINKS } from "../constants";
import { KPI_DEFS, kpiValue } from "../data/kpiDefs";

import Select from "../components/ui/Select";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import IconButton from "../components/ui/IconButton";
import SectionTitle from "../components/ui/SectionTitle";

// ------------------------------------------------------------
// Templates (kept because Dashboard uses buildTemplateForFact)
// ------------------------------------------------------------
export function buildTemplateForFact(factName) {
  const templates = {
    enrollment: ["InstituteId", "Institute", "State", "Year", "Program", "Discipline", "Gender", "Category", "Students"],
    placements: ["InstituteId", "Institute", "Year", "Program", "Registered", "Placed", "AvgCTC_LPA", "MedianCTC_LPA"],
    publications: ["InstituteId", "Institute", "Year", "Type", "Discipline", "Count"],
    patents: ["InstituteId", "Institute", "Year", "Status", "Count"],
    budget: ["InstituteId", "Institute", "Year", "Head", "Allocated_Cr", "Utilised_Cr"],
    collaborations: ["InstituteId", "Institute", "Year", "Geography", "Type", "Count"],
    intlStudents: ["InstituteId", "Institute", "Year", "Level", "Students"],
  };
  const cols = templates[factName] ?? ["InstituteId", "Institute", "Year", "Value"];
  const rows = Array.from({ length: 5 }).map(() => {
    const r = {};
    for (const c of cols) r[c] = "";
    return r;
  });
  return { cols, rows };
}

// ------------------------------------------------------------
// Reports hub + AI-style (rule-based) interpretation
// ------------------------------------------------------------
const USAGE_KEY = "iitmis_report_usage_v1";

function safeGetUsage() {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeSetUsage(obj) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

const nf0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function fmtPlain(n, digits = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (!Number.isFinite(Number(n))) return "—";
  return (digits ? nf1 : nf0).format(Number(n));
}

function fmtValue(kpi, v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  if (kpi?.format === "pct") return formatPct(v);

  // Nice formatting for common units in this demo
  const label = String(kpi?.label ?? "").toLowerCase();
  if (label.includes("ctc")) return `${fmtPlain(v, 1)} LPA`;
  if (kpi?.fact === "budget" && (label.includes("allocated") || label.includes("utilised") || label.includes("utilization"))) {
    // Budget values are in Crores in our dataset.
    return `₹${fmtPlain(v, 1)} Cr`;
  }
  // fallback: compact for UI, but interpretation uses commas
  return fmtPlain(v, 0);
}

function getScopeInstituteIds({ role, instituteId, config }) {
  const ids = config?.InstituteId ?? [];
  if (role === "iit") return [instituteId];
  return ids;
}

function instituteLabel(ids) {
  if (!ids?.length) return "All IITs";
  if (ids.length === 1) {
    const inst = IITs.find((x) => x.id === ids[0]);
    return inst ? inst.name : ids[0];
  }
  if (ids.length <= 4) {
    return ids
      .map((id) => IITs.find((x) => x.id === id)?.name ?? id)
      .join(", ");
  }
  return `${ids.length} IITs`;
}

function buildReportCatalog(kpis) {
  // Create report rows similar to UDISE style pages:
  //  - frequent list
  //  - sections per "Domain" (we use Module)
  //  - each report is a KPI + a breakdown field
  let nextId = 1000;
  const out = [];
  for (const kpi of kpis) {
    // Cross-IIT ranking report (makes sense for exports)
    out.push({
      reportId: ++nextId,
      name: `${kpi.label} by Institute`,
      domain: kpi.module,
      kpiId: kpi.id,
      fact: kpi.fact,
      breakdownField: "Institute",
      breakdownLabel: "Institute",
    });

    for (const lvl of kpi.levels ?? []) {
      out.push({
        reportId: ++nextId,
        name: `${kpi.label} by ${lvl.label}`,
        domain: kpi.module,
        kpiId: kpi.id,
        fact: kpi.fact,
        breakdownField: lvl.field,
        breakdownLabel: lvl.label,
      });
    }
  }

  return out;
}

function computeOverallParts(kpi, rows) {
  if (!rows?.length) return {};

  if (kpi.kind === "ratio") {
    const num = sumBy(rows, kpi.numField);
    const den = sumBy(rows, kpi.denField);
    return { num, den };
  }

  if (kpi.kind === "share") {
    const den = sumBy(rows, kpi.denomField);
    const num = sumBy(rows.filter(kpi.numeratorFilter), kpi.denomField);
    return { num, den };
  }

  if (kpi.kind === "avg_weighted") {
    const w = sumBy(rows, kpi.weightField);
    return { w };
  }

  return {};
}

function computeGroupMetrics(kpi, rows, groupField) {
  const m = new Map();
  for (const r of rows) {
    const key = r?.[groupField] ?? "(unknown)";
    const prev = m.get(key) ?? { sum: 0, num: 0, den: 0, wsum: 0, w: 0 };

    if (kpi.kind === "sum") {
      prev.sum += Number(r[kpi.valueField] ?? 0);
    } else if (kpi.kind === "sum_where") {
      if (kpi.where?.(r)) prev.sum += Number(r[kpi.valueField] ?? 0);
    } else if (kpi.kind === "ratio") {
      prev.num += Number(r[kpi.numField] ?? 0);
      prev.den += Number(r[kpi.denField] ?? 0);
    } else if (kpi.kind === "share") {
      const v = Number(r[kpi.denomField] ?? 0);
      prev.den += v;
      if (kpi.numeratorFilter?.(r)) prev.num += v;
    } else if (kpi.kind === "avg_weighted") {
      const w = Number(r[kpi.weightField] ?? 0);
      prev.w += w;
      prev.wsum += Number(r[kpi.valueField] ?? 0) * w;
    }

    m.set(key, prev);
  }

  const out = Array.from(m.entries()).map(([name, agg]) => {
    let value = null;
    if (kpi.kind === "sum" || kpi.kind === "sum_where") value = agg.sum;
    if (kpi.kind === "ratio" || kpi.kind === "share") value = agg.den ? agg.num / agg.den : null;
    if (kpi.kind === "avg_weighted") value = agg.w ? agg.wsum / agg.w : null;
    return {
      name,
      value,
      _sum: agg.sum,
      _num: agg.num,
      _den: agg.den,
      _w: agg.w,
    };
  });

  out.sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
  return out;
}

function oneSentenceMeaning(kpi, parts, value) {
  if (value == null) return "No data in the selected scope.";

  const label = kpi?.label ?? "This metric";

  // Percent-style “out of 100” explanations
  if (kpi.format === "pct") {
    const outOf100 = Math.round(value * 100);
    if (kpi.id === "kpi_budget_utilisation") {
      return `${label} is ${formatPct(value)} — roughly ₹${outOf100} used out of every ₹100 allocated.`;
    }
    if (kpi.id === "kpi_placement_rate" && parts?.num != null && parts?.den != null) {
      return `${label} is ${formatPct(value)} — about ${fmtPlain(parts.num)} placed out of ${fmtPlain(parts.den)} registered.`;
    }
    if (kpi.id === "kpi_female_share" && parts?.num != null && parts?.den != null) {
      return `${label} is ${formatPct(value)} — about ${fmtPlain(parts.num)} female students out of ${fmtPlain(parts.den)} total.`;
    }
    return `${label} is ${formatPct(value)} — roughly ${outOf100} out of every 100.`;
  }

  // Median CTC: explain median
  if (String(kpi.label ?? "").toLowerCase().includes("ctc")) {
    const placed = parts?.w ? ` (based on ${fmtPlain(parts.w)} placed students)` : "";
    return `${label} is ${fmtPlain(value, 1)} LPA${placed}. Median means half are below and half are above this.`;
  }

  return `${label} is ${fmtPlain(value)} in the selected scope.`;
}

function buildInterpretation({ kpi, report, year, scopeText, value, prevValue, parts, groups }) {
  const lines = [];
  lines.push(`What this report is: “${report.name}”.`);
  lines.push(`Scope: ${scopeText} • Year: ${year}.`);

  // Meaning sentence
  lines.push(oneSentenceMeaning(kpi, parts, value));

  // YoY
  if (value != null && prevValue != null) {
    if (kpi.format === "pct") {
      const pp = (value - prevValue) * 100;
      lines.push(`Compared to ${year - 1}, it is ${pp >= 0 ? "up" : "down"} by ${Math.abs(pp).toFixed(1)} percentage points.`);
    } else {
      const d = safeDelta(value, prevValue);
      if (d != null) lines.push(`Compared to ${year - 1}, it is ${d >= 0 ? "up" : "down"} by ${(Math.abs(d) * 100).toFixed(1)}%.`);
    }
  }

  // Distribution highlight
  if (groups?.length) {
    const top = groups[0];
    if (kpi.kind === "sum" || kpi.kind === "sum_where") {
      const total = value ?? groups.reduce((s, g) => s + Number(g.value ?? 0), 0);
      const share = total ? (top.value ?? 0) / total : null;
      lines.push(
        `Largest ${report.breakdownLabel}: ${top.name} with ${fmtPlain(top.value)}${share != null ? ` (≈ ${(share * 100).toFixed(1)}% of the total).` : "."}`
      );
    } else {
      const bottom = groups[groups.length - 1];
      lines.push(`Highest ${report.breakdownLabel}: ${top.name} (${kpi.format === "pct" ? formatPct(top.value) : fmtPlain(top.value)}).`);
      if (bottom && bottom.name !== top.name) {
        lines.push(`Lowest ${report.breakdownLabel}: ${bottom.name} (${kpi.format === "pct" ? formatPct(bottom.value) : fmtPlain(bottom.value)}).`);
      }
    }
  }

  // “Talk track” help
  lines.push(`Simple way to say it aloud: “In ${year}, for ${scopeText}, ${oneSentenceMeaning(kpi, parts, value)}”`);
  return lines;
}

function escHtml(x) {
  return String(x ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function htmlTable(columns, rows) {
  const thead = `<thead><tr>${columns
    .map((c) => `<th>${escHtml(c.label ?? c.key)}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (r) =>
        `<tr>${columns
          .map((c) => `<td>${escHtml(r[c.key])}</td>`)
          .join("")}</tr>`
    )
    .join("")}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

function ReportPreviewModal({ open, report, facts, config, role, instituteId, accent, onClose }) {
  const kpi = useMemo(() => KPI_DEFS.find((x) => x.id === report?.kpiId), [report]);
  const scopedInstituteIds = useMemo(() => getScopeInstituteIds({ role, instituteId, config }), [role, instituteId, config]);

  const yrFrom = Math.min(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yrTo = Math.max(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearsInRange = useMemo(() => YEARS.filter((y) => y >= yrFrom && y <= yrTo), [yrFrom, yrTo]);

  const [year, setYear] = useState(yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
  const [topN, setTopN] = useState(25);
  const [dlFmt, setDlFmt] = useState("pdf"); // pdf | csv | xls | json

  useEffect(() => {
    if (!open) return;
    const y = yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1];
    setYear(y);
    setTopN(25);
    setDlFmt("pdf");
  }, [open, yearsInRange]);

  const scopeText = useMemo(() => instituteLabel(scopedInstituteIds), [scopedInstituteIds]);

  const rowsYear = useMemo(() => {
    if (!open || !report || !kpi) return [];
    let rows = facts?.[report.fact] ?? [];
    rows = rows.filter((r) => Number(r.Year ?? 0) === Number(year));
    if (scopedInstituteIds.length) {
      const set = new Set(scopedInstituteIds);
      rows = rows.filter((r) => set.has(r.InstituteId));
    }
    return rows;
  }, [open, report, kpi, facts, year, scopedInstituteIds]);

  const prevYear = useMemo(() => {
    const idx = yearsInRange.indexOf(year);
    if (idx <= 0) return null;
    return yearsInRange[idx - 1];
  }, [yearsInRange, year]);

  const rowsPrev = useMemo(() => {
    if (!prevYear || !report || !kpi) return [];
    let rows = facts?.[report.fact] ?? [];
    rows = rows.filter((r) => Number(r.Year ?? 0) === Number(prevYear));
    if (scopedInstituteIds.length) {
      const set = new Set(scopedInstituteIds);
      rows = rows.filter((r) => set.has(r.InstituteId));
    }
    return rows;
  }, [prevYear, report, kpi, facts, scopedInstituteIds]);

  const value = useMemo(() => (kpi ? kpiValue(kpi, rowsYear) : null), [kpi, rowsYear]);
  const prevValue = useMemo(() => (kpi && prevYear ? kpiValue(kpi, rowsPrev) : null), [kpi, prevYear, rowsPrev]);
  const parts = useMemo(() => (kpi ? computeOverallParts(kpi, rowsYear) : {}), [kpi, rowsYear]);

  const groups = useMemo(() => {
    if (!kpi || !report) return [];
    return computeGroupMetrics(kpi, rowsYear, report.breakdownField);
  }, [kpi, report, rowsYear]);

  const interpretation = useMemo(() => {
    if (!kpi || !report) return [];
    return buildInterpretation({
      kpi,
      report,
      year,
      scopeText,
      value,
      prevValue,
      parts,
      groups,
    });
  }, [kpi, report, year, scopeText, value, prevValue, parts, groups]);

  const table = useMemo(() => {
    if (!kpi || !report) return { columns: [], rows: [] };

    const isSum = kpi.kind === "sum" || kpi.kind === "sum_where";

    const cols = [{ key: "Rank", label: "S.no" }, { key: "Bucket", label: report.breakdownLabel }];

    if (kpi.kind === "ratio") {
      cols.push(
        { key: "Num", label: kpi.numField === "Placed" ? "Placed" : kpi.numField },
        { key: "Den", label: kpi.denField === "Registered" ? "Registered" : kpi.denField },
        { key: "Value", label: kpi.label }
      );
    } else if (kpi.kind === "share") {
      cols.push(
        { key: "Num", label: "Numerator" },
        { key: "Den", label: "Total" },
        { key: "Value", label: kpi.label }
      );
    } else if (kpi.kind === "avg_weighted") {
      cols.push(
        { key: "Weight", label: kpi.weightField },
        { key: "Value", label: kpi.label }
      );
    } else {
      cols.push({ key: "Value", label: kpi.label });
      cols.push({ key: "Share", label: "Share" });
    }

    const total = isSum ? (value ?? groups.reduce((s, g) => s + Number(g.value ?? 0), 0)) : null;

    const rows = groups.slice(0, Math.max(5, Math.min(200, topN))).map((g, idx) => {
      const base = {
        Rank: idx + 1,
        Bucket: g.name,
      };

      if (kpi.kind === "ratio" || kpi.kind === "share") {
        base.Num = fmtPlain(g._num);
        base.Den = fmtPlain(g._den);
        base.Value = kpi.format === "pct" ? formatPct(g.value) : fmtPlain(g.value);
        return base;
      }

      if (kpi.kind === "avg_weighted") {
        base.Weight = fmtPlain(g._w);
        base.Value = fmtValue(kpi, g.value);
        return base;
      }

      base.Value = fmtPlain(g.value);
      base.Share = total ? `${((Number(g.value ?? 0) / total) * 100).toFixed(1)}%` : "—";
      return base;
    });

    return { columns: cols, rows };
  }, [kpi, report, groups, topN, value]);

  function doDownload() {
    if (!kpi || !report) return;

    const filenameBase = `${report.reportId}_${report.name}`.replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "_");

    if (dlFmt === "csv") {
      downloadText(`${filenameBase}_${year}.csv`, toCsv(table.rows, table.columns), "text/csv;charset=utf-8");
      return;
    }
    if (dlFmt === "xls") {
      downloadExcelHtml(`${filenameBase}_${year}.xls`, table.columns, table.rows);
      return;
    }
    if (dlFmt === "json") {
      downloadText(`${filenameBase}_${year}.json`, JSON.stringify(table.rows, null, 2), "application/json;charset=utf-8");
      return;
    }

    // PDF (print-to-PDF)
    const html = `
      <div style="padding: 18px;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <h1 style="font-size:18px;font-weight:900;">${escHtml(report.name)}</h1>
              <div class="muted" style="font-size:12px;margin-top:4px;">Report ID: ${escHtml(report.reportId)} • Domain: ${escHtml(report.domain)} • Year: ${escHtml(year)}</div>
              <div class="muted" style="font-size:12px;margin-top:2px;">Scope: ${escHtml(scopeText)}</div>
            </div>
            <div class="pill">IITMIS Export</div>
          </div>
        </div>

        <div style="height:10px;"></div>

        <div class="card">
          <h2 style="font-size:14px;font-weight:900;">Plain-English interpretation</h2>
          <ul>
            ${interpretation.map((t) => `<li>${escHtml(t)}</li>`).join("")}
          </ul>
        </div>

        <div style="height:10px;"></div>

        <div class="card">
          <h2 style="font-size:14px;font-weight:900;margin-bottom:8px;">Table</h2>
          ${htmlTable(table.columns, table.rows)}
        </div>

        <div style="height:10px;"></div>
        <div class="muted" style="font-size:11px;">Evidence (demo): ${EVIDENCE_LINKS.map((x) => escHtml(x.label)).join(" • ")}</div>
      </div>
    `;

    downloadHtmlAsPdf({
      title: `${report.name} (${year})`,
      html,
      orientation: "landscape",
      pageSize: "A4",
    });
  }

  if (!open || !report || !kpi) return null;

  const yoyText = (() => {
    if (value == null || prevValue == null) return "—";
    if (kpi.format === "pct") {
      const pp = (value - prevValue) * 100;
      return `${pp >= 0 ? "↑" : "↓"} ${Math.abs(pp).toFixed(1)} pp`;
    }
    const d = safeDelta(value, prevValue);
    if (d == null) return "—";
    return `${d >= 0 ? "↑" : "↓"} ${(Math.abs(d) * 100).toFixed(1)}%`;
  })();

  return (
    <Modal open={open} title={`Report • ${report.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl p-4" style={{ background: "rgba(25,117,190,0.06)", border: "1px solid rgba(59,130,246,0.14)" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold" style={{ color: "#1975be" }}>Report ID {report.reportId} • Domain: {report.domain}</div>
              <div className="mt-1 text-sm font-extrabold" style={{ color: "#0f172a" }}>{kpi.label}</div>
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>Scope: <span className="font-bold" style={{ color: "#1252a0" }}>{scopeText}</span></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                label="Year"
                value={String(year)}
                onChange={(v) => setYear(Number(v))}
                options={yearsInRange.map((y) => ({ value: String(y), label: String(y) }))}
                className="w-[140px]"
              />
              <Select
                label="Top rows"
                value={String(topN)}
                onChange={(v) => setTopN(Number(v))}
                options={[10, 25, 50, 100, 200].map((n) => ({ value: String(n), label: String(n) }))}
                className="w-[140px]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <div className="text-xs font-extrabold" style={{ color: "#1975be" }}>Value ({year})</div>
            <div className="mt-1 text-2xl font-extrabold" style={{ color: "#0f172a" }}>{kpi.format === "pct" ? formatPct(value) : fmtValue(kpi, value)}</div>
            {kpi.kind === "ratio" && parts?.num != null && parts?.den != null ? (
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>{fmtPlain(parts.num)} / {fmtPlain(parts.den)}</div>
            ) : null}
            {kpi.kind === "share" && parts?.num != null && parts?.den != null ? (
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>{fmtPlain(parts.num)} / {fmtPlain(parts.den)}</div>
            ) : null}
            {kpi.kind === "avg_weighted" && parts?.w != null ? (
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>Weight: {fmtPlain(parts.w)} ({kpi.weightField})</div>
            ) : null}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <div className="text-xs font-extrabold" style={{ color: "#1975be" }}>YoY change</div>
            <div className="mt-1 text-2xl font-extrabold" style={{ color: "#0f172a" }}>{yoyText}</div>
            <div className="mt-1 text-xs" style={{ color: "#64748b" }}>vs {prevYear ?? "(no previous year in range)"}</div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <div className="text-xs font-extrabold" style={{ color: "#1975be" }}>Download</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[{ id: "pdf", label: "PDF" }, { id: "csv", label: "CSV" }, { id: "xls", label: "Excel" }, { id: "json", label: "JSON" }].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setDlFmt(o.id)}
                  className={cx(
                    "rounded-2xl border px-3 py-1.5 text-xs font-extrabold",
                    dlFmt === o.id ? "text-white" : "hover:opacity-90"
                  )}
                  style={dlFmt === o.id ? { background: accent, borderColor: accent } : { borderColor: "rgba(59,130,246,0.18)", color: "#1252a0", background: "rgba(255,255,255,0.9)" }}
                >
                  {o.label}
                </button>
              ))}
              <button
                type="button"
                onClick={doDownload}
                className="rounded-2xl px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
                style={{ background: accent }}
              >
                Download
              </button>
            </div>
            <div className="mt-2 text-[11px]" style={{ color: "#64748b" }}>PDF uses print dialog → “Save as PDF”.</div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "rgba(25,117,190,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}>
          <div className="text-sm font-extrabold" style={{ color: "#1975be" }}>Plain-English interpretation</div>
          <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: "#334155" }}>
            {interpretation.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl" style={{ border: "1px solid rgba(59,130,246,0.14)", overflow: "hidden", background: "rgba(255,255,255,0.9)" }}>
          <div className="px-4 py-3 text-sm font-extrabold" style={{ color: "#0f172a", borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
            Breakdown table • {report.breakdownLabel}
          </div>
          <div className="p-3">
            <DataTable columns={table.columns} rows={table.rows} maxHeight={520} />
          </div>
        </div>

        <div className="text-xs" style={{ color: "#64748b" }}>
          Evidence (demo): {EVIDENCE_LINKS.map((x) => x.label).join(" • ")}
        </div>
      </div>
    </Modal>
  );
}

export default function ReportsHubPage({ facts, config, accent, role, instituteId, onOpenFilters, onOpenSource, onOpenInstructions, onBack, focusKpiId, autoOpenKey = 0 }) {
  // Inputs (draft) to mimic “Submit” behaviour like the screenshot
  const [qDraft, setQDraft] = useState("");
  const [domainDraft, setDomainDraft] = useState("All");
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");

  const scopedInstituteIds = useMemo(() => getScopeInstituteIds({ role, instituteId, config }), [role, instituteId, config]);
  const scopeText = useMemo(() => instituteLabel(scopedInstituteIds), [scopedInstituteIds]);

  const yrFrom = Math.min(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yrTo = Math.max(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearsInRange = useMemo(() => YEARS.filter((y) => y >= yrFrom && y <= yrTo), [yrFrom, yrTo]);

  const [yearlyYear, setYearlyYear] = useState(yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);

  useEffect(() => {
    setYearlyYear(yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
  }, [yearsInRange]);

  const activeKpiSet = useMemo(() => {
    const ids = config?.KpiIds ?? [];
    if (!ids.length) return null;
    return new Set(ids);
  }, [config]);

  const catalog = useMemo(() => {
    const kpis = activeKpiSet ? KPI_DEFS.filter((k) => activeKpiSet.has(k.id)) : KPI_DEFS;
    return buildReportCatalog(kpis);
  }, [activeKpiSet]);

  const domains = useMemo(() => {
    const uniq = Array.from(new Set(catalog.map((r) => r.domain)));
    uniq.sort();
    return ["All", ...uniq];
  }, [catalog]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return catalog.filter((r) => {
      const okDomain = domain === "All" ? true : r.domain === domain;
      const okQ = !qq ? true : r.name.toLowerCase().includes(qq) || String(r.reportId).includes(qq);
      return okDomain && okQ;
    });
  }, [catalog, q, domain]);

  const [usage, setUsage] = useState(() => safeGetUsage());
  function bumpUsage(reportId) {
    setUsage((prev) => {
      const next = { ...prev, [reportId]: Number(prev?.[reportId] ?? 0) + 1 };
      safeSetUsage(next);
      return next;
    });
  }

  const frequent = useMemo(() => {
    const scored = catalog
      .map((r) => ({ r, c: Number(usage?.[r.reportId] ?? 0) }))
      .sort((a, b) => b.c - a.c);
    const top = scored.filter((x) => x.c > 0).slice(0, 5).map((x) => x.r);
    return top.length ? top : catalog.slice(0, 5);
  }, [catalog, usage]);

  const byDomain = useMemo(() => {
    const m = new Map();
    for (const r of filtered) {
      const key = r.domain;
      const arr = m.get(key) ?? [];
      arr.push(r);
      m.set(key, arr);
    }
    // stable ordering by domain name
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const [activeReport, setActiveReport] = useState(null);
  const reportOpen = !!activeReport;

  useEffect(() => {
    if (!focusKpiId) return;
    const first = catalog.find((item) => item.kpiId === focusKpiId);
    if (first) setActiveReport(first);
  }, [focusKpiId, autoOpenKey, catalog]);

  function downloadYearlyPdf() {
    // Simple annual PDF: KPI summary table for the selected year
    const kpis = activeKpiSet ? KPI_DEFS.filter((k) => activeKpiSet.has(k.id)) : KPI_DEFS;

    const rows = kpis.map((kpi) => {
      let r = facts?.[kpi.fact] ?? [];
      r = r.filter((x) => Number(x.Year ?? 0) === Number(yearlyYear));
      if (scopedInstituteIds.length) {
        const set = new Set(scopedInstituteIds);
        r = r.filter((x) => set.has(x.InstituteId));
      }
      const v = kpiValue(kpi, r);
      const parts = computeOverallParts(kpi, r);
      return {
        Domain: kpi.module,
        KPI: kpi.label,
        Value: kpi.format === "pct" ? formatPct(v) : fmtValue(kpi, v),
        Meaning: oneSentenceMeaning(kpi, parts, v),
      };
    });

    const columns = [
      { key: "Domain", label: "Domain" },
      { key: "KPI", label: "KPI" },
      { key: "Value", label: "Value" },
      { key: "Meaning", label: "Plain-English meaning" },
    ];

    const html = `
      <div style="padding: 18px;">
        <div class="card">
          <h1 style="font-size:18px;font-weight:900;">IITMIS • Yearly Report</h1>
          <div class="muted" style="font-size:12px;margin-top:4px;">Year: ${escHtml(yearlyYear)} • Scope: ${escHtml(scopeText)}</div>
        </div>

        <div style="height:10px;"></div>

        <div class="card">
          <h2 style="font-size:14px;font-weight:900;margin-bottom:8px;">KPI summary (one-liners you can speak)</h2>
          ${htmlTable(columns, rows)}
        </div>

        <div style="height:10px;"></div>
        <div class="muted" style="font-size:11px;">Evidence (demo): ${EVIDENCE_LINKS.map((x) => escHtml(x.label)).join(" • ")}</div>
      </div>
    `;

    downloadHtmlAsPdf({
      title: `IITMIS Yearly Report ${yearlyYear}`,
      html,
      orientation: "portrait",
      pageSize: "A4",
    });
  }

  function rowsForReportsTable(reports) {
    return reports.map((r, idx) => ({
      Sno: idx + 1,
      Id: r.reportId,
      Name: r.name,
      Domain: r.domain,
      Action: r,
    }));
  }

  const reportColumns = useMemo(
    () => [
      { key: "Sno", label: "S.no" },
      { key: "Id", label: "Id" },
      { key: "Name", label: "Report Name" },
      { key: "Domain", label: "Domain" },
      {
        key: "Action",
        label: "Action",
        format: (r) => (
          <div className="flex justify-end">
            <IconButton
              title="View report"
              onClick={() => {
                bumpUsage(r.reportId);
                setActiveReport(r);
              }}
            >
              ▦
            </IconButton>
          </div>
        ),
      },
    ],
    [accent]
  );

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Reports"
        subtitle="Browse, search, preview, and export. Classification is by Domain (Module), which matches how your data is organized."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl px-4 py-2 text-sm hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.18)", color: "#1252a0" }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onOpenFilters}
              className="rounded-2xl px-4 py-2 text-sm font-extrabold hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.18)", color: "#1252a0" }}
            >
              Filters
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Search card */}
        <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Search For Reports</div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Search</span>
              <input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="Try: students, placement, budget…"
                className="h-9 rounded-xl px-3 text-sm shadow-sm outline-none"
                style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(255,255,255,0.9)", color: "#334155" }}
              />
            </label>

            <Select
              label="Domain"
              value={domainDraft}
              onChange={setDomainDraft}
              options={domains.map((d) => ({ value: d, label: d }))}
              className="w-[220px]"
            />

            <button
              type="button"
              onClick={() => {
                setQ(qDraft);
                setDomain(domainDraft);
              }}
              className="h-9 rounded-2xl px-5 text-sm font-extrabold text-white hover:opacity-90"
              style={{ background: accent }}
            >
              SUBMIT
            </button>
          </div>
          <div className="mt-3 text-xs" style={{ color: "#64748b" }}>
            Active scope: <span className="font-bold" style={{ color: "#1252a0" }}>{scopeText}</span> • Years: <span className="font-bold" style={{ color: "#1252a0" }}>{yrFrom}–{yrTo}</span>
            {activeKpiSet ? <span> • KPI filter: <span className="font-bold" style={{ color: "#1252a0" }}>{activeKpiSet.size}</span> selected</span> : null}
          </div>
        </div>

        {/* Yearly report card */}
        <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Download IITMIS Yearly Report</div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Select
              label="Select Year"
              value={String(yearlyYear)}
              onChange={(v) => setYearlyYear(Number(v))}
              options={yearsInRange.map((y) => ({ value: String(y), label: String(y) }))}
              className="w-[220px]"
            />
            <button
              type="button"
              onClick={downloadYearlyPdf}
              className="h-9 rounded-2xl px-5 text-sm font-extrabold text-white hover:opacity-90"
              style={{ background: accent }}
            >
              DOWNLOAD
            </button>
          </div>
          <div className="mt-3 text-xs" style={{ color: "#64748b" }}>
            Generates a PDF (print-to-PDF) with one-line, layman-friendly explanations for each KPI.
          </div>
        </div>
      </div>

      {/* Frequently used */}
      <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Frequently Used Reports</div>
        <div className="mt-3">
          <DataTable columns={reportColumns} rows={rowsForReportsTable(frequent)} maxHeight={360} />
        </div>
      </div>

      {/* Domain sections */}
      {byDomain.length ? (
        byDomain.map(([dom, reports]) => (
          <div key={dom} className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>{dom}</div>
            <div className="mt-3">
              <DataTable
                columns={reportColumns}
                rows={rowsForReportsTable(reports)}
                maxHeight={520}
                onRowClick={(row) => {
                  bumpUsage(row.Action.reportId);
                  setActiveReport(row.Action);
                }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-3xl p-4" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)", color: "#64748b" }}>
          No reports match your search.
        </div>
      )}

      {/* Report modal */}
      <ReportPreviewModal
        open={reportOpen}
        report={activeReport}
        facts={facts}
        config={config}
        role={role}
        instituteId={instituteId}
        accent={accent}
        onClose={() => setActiveReport(null)}
      />
    </div>
  );
}
