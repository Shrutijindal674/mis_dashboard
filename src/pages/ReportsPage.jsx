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
import IconButton from "../components/ui/IconButton";
import SectionTitle from "../components/ui/SectionTitle";
import BreakdownBar from "../components/charts/BreakdownBar";
import BreakdownLine from "../components/charts/BreakdownLine";

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
// Reports hub + report detail page helpers
// ------------------------------------------------------------
const USAGE_KEY = "iitmis_report_usage_v1";
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "give",
  "in",
  "into",
  "last",
  "me",
  "of",
  "on",
  "over",
  "report",
  "show",
  "the",
  "to",
  "view",
  "what",
  "with",
  "year",
  "years",
]);

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
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  if (!Number.isFinite(Number(n))) return "-";
  return (digits ? nf1 : nf0).format(Number(n));
}

function fmtValue(kpi, v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  if (kpi?.format === "pct") return formatPct(v);

  const label = String(kpi?.label ?? "").toLowerCase();
  if (label.includes("ctc")) return `${fmtPlain(v, 1)} LPA`;
  if (kpi?.fact === "budget" || label.includes("(cr)")) return `Rs ${fmtPlain(v, 1)} Cr`;
  return fmtPlain(v, 0);
}

function getScopeInstituteIds({ role, instituteId, config }) {
  const ids = config?.InstituteId ?? [];
  if (role === "iit") return [instituteId];
  return ids;
}

function getExpectedInstituteIds({ role, instituteId, config }) {
  if (role === "iit") return [instituteId].filter(Boolean);
  const configured = config?.InstituteId ?? [];
  return configured.length ? configured : IITs.map((x) => x.id);
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

function instituteName(id) {
  return IITs.find((x) => x.id === id)?.name ?? id;
}

function applyKpiRowFilter(kpi, rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  if (!kpi?.rowFilter) return list;
  return list.filter(kpi.rowFilter);
}

function rowsForYear({ facts, report, year, scopedInstituteIds }) {
  if (!report) return [];
  let rows = facts?.[report.fact] ?? [];
  rows = rows.filter((r) => Number(r.Year ?? 0) === Number(year));
  if (scopedInstituteIds?.length) {
    const set = new Set(scopedInstituteIds);
    rows = rows.filter((r) => set.has(r.InstituteId));
  }
  return rows;
}

function metricRowsForMissingCheck(kpi, rows = []) {
  let out = applyKpiRowFilter(kpi, rows);
  if (kpi?.kind === "sum_where" && kpi?.where) out = out.filter(kpi.where);
  return out;
}

function buildReportCatalog(kpis) {
  let nextId = 1000;
  const out = [];

  for (const kpi of kpis) {
    out.push({
      reportId: ++nextId,
      name: `Year-on-Year Trend for ${kpi.label}`,
      domain: kpi.module,
      tag: kpi.module,
      kpiId: kpi.id,
      fact: kpi.fact,
      breakdownField: "Year",
      breakdownLabel: "Year",
      reportType: "trend",
      defaultView: "chart",
    });

    out.push({
      reportId: ++nextId,
      name: `${kpi.label} by Institute`,
      domain: kpi.module,
      tag: kpi.module,
      kpiId: kpi.id,
      fact: kpi.fact,
      breakdownField: "Institute",
      breakdownLabel: "Institute",
      reportType: "breakdown",
      defaultView: "table",
    });

    for (const lvl of kpi.levels ?? []) {
      out.push({
        reportId: ++nextId,
        name: `${kpi.label} by ${lvl.label}`,
        domain: kpi.module,
        tag: kpi.module,
        kpiId: kpi.id,
        fact: kpi.fact,
        breakdownField: lvl.field,
        breakdownLabel: lvl.label,
        reportType: "breakdown",
        defaultView: "table",
      });
    }
  }

  return out;
}

function computeOverallParts(kpi, rows) {
  rows = applyKpiRowFilter(kpi, rows);
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

  if (kpi.kind === "sum_where") {
    return { sum: sumBy(rows.filter(kpi.where), kpi.valueField) };
  }

  if (kpi.kind === "count_distinct") {
    return { distinct: new Set(rows.map((r) => r[kpi.distinctField || kpi.valueField]).filter(Boolean)).size };
  }

  if (kpi.kind === "sum") return { sum: sumBy(rows, kpi.valueField) };

  return {};
}

function groupLabelForRow(row, groupFields) {
  const parts = groupFields.map((field) => {
    const value = row?.[field];
    if (value === null || value === undefined || value === "") return "Data not available";
    return String(value);
  });
  return parts.join(" > ");
}

function computeGroupMetrics(kpi, rawRows, groupFieldsInput) {
  const groupFields = Array.isArray(groupFieldsInput) ? groupFieldsInput.filter(Boolean) : [groupFieldsInput].filter(Boolean);
  if (!groupFields.length) return [];

  const rows = applyKpiRowFilter(kpi, rawRows);
  const m = new Map();

  for (const r of rows) {
    const key = groupLabelForRow(r, groupFields);
    const prev = m.get(key) ?? { sum: 0, num: 0, den: 0, wsum: 0, w: 0, distinct: new Set(), records: 0 };
    prev.records += 1;

    if (kpi.kind === "sum") {
      prev.sum += Number(r[kpi.valueField] ?? 0);
    } else if (kpi.kind === "sum_where") {
      if (kpi.where?.(r)) prev.sum += Number(r[kpi.valueField] ?? 0);
    } else if (kpi.kind === "count_distinct") {
      const value = r[kpi.distinctField || kpi.valueField];
      if (value !== null && value !== undefined && value !== "") prev.distinct.add(value);
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
    if (kpi.kind === "count_distinct") value = agg.distinct.size;
    if (kpi.kind === "ratio" || kpi.kind === "share") value = agg.den ? agg.num / agg.den : null;
    if (kpi.kind === "avg_weighted") value = agg.w ? agg.wsum / agg.w : null;
    return {
      name,
      value,
      _sum: agg.sum,
      _num: agg.num,
      _den: agg.den,
      _w: agg.w,
      _distinct: agg.distinct.size,
      _records: agg.records,
    };
  });

  out.sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
  return out;
}

function buildBreakdownOptions(kpi, report) {
  if (!kpi) return [];

  const base = [{ label: "Institute", field: "Institute" }, ...(kpi.levels ?? [])];
  const seen = new Set();
  const options = [
    {
      id: "__trend",
      label: "Year-on-Year",
      variant: "Trend",
      groupFields: ["Year"],
      chartKind: "line",
    },
  ];

  for (const item of base) {
    if (!item?.field || seen.has(item.field)) continue;
    seen.add(item.field);

    options.push({
      id: `${item.field}__broad`,
      label: item.label,
      variant: "Broad",
      groupFields: [item.field],
      chartKind: "bar",
    });

    options.push({
      id: `${item.field}__detail`,
      label: item.label,
      variant: "Detailed View",
      groupFields: item.field === "Institute" ? ["State", "Institute"] : [item.field, "Institute"],
      chartKind: "bar",
    });
  }

  const defaultId = report?.reportType === "trend" ? "__trend" : `${report?.breakdownField ?? "Institute"}__broad`;
  if (!options.some((o) => o.id === defaultId)) {
    options.push({
      id: defaultId,
      label: report?.breakdownLabel ?? report?.breakdownField ?? "Breakdown",
      variant: "Broad",
      groupFields: [report?.breakdownField ?? "Institute"],
      chartKind: "bar",
    });
  }

  return options;
}

function oneSentenceMeaning(kpi, parts, value) {
  if (value == null) return "No data is available in the selected scope.";

  const label = kpi?.label ?? "This metric";

  if (kpi.format === "pct") {
    const outOf100 = Math.round(value * 100);
    if (kpi.id === "kpi_budget_utilisation") {
      return `${label} is ${formatPct(value)} - roughly Rs ${outOf100} used out of every Rs 100 allocated.`;
    }
    if (String(kpi.label ?? "").toLowerCase().includes("placement") && parts?.num != null && parts?.den != null) {
      return `${label} is ${formatPct(value)} - about ${fmtPlain(parts.num)} placed out of ${fmtPlain(parts.den)} registered.`;
    }
    if (kpi.id === "kpi_female_share" && parts?.num != null && parts?.den != null) {
      return `${label} is ${formatPct(value)} - about ${fmtPlain(parts.num)} female students out of ${fmtPlain(parts.den)} total.`;
    }
    return `${label} is ${formatPct(value)} - roughly ${outOf100} out of every 100.`;
  }

  if (String(kpi.label ?? "").toLowerCase().includes("ctc")) {
    const placed = parts?.w ? ` (based on ${fmtPlain(parts.w)} placed students)` : "";
    return `${label} is ${fmtPlain(value, 1)} LPA${placed}. Median means half are below and half are above this value.`;
  }

  return `${label} is ${fmtValue(kpi, value)} in the selected scope.`;
}

function buildInterpretation({ kpi, report, year, scopeText, value, prevValue, parts, groups, activeBreakdown, missingInstitutes }) {
  const lines = [];
  const breakdownLabel = activeBreakdown?.id === "__trend" ? "year-on-year trend" : `${activeBreakdown?.label ?? report.breakdownLabel} ${activeBreakdown?.variant ?? ""}`.trim();

  lines.push(`What this report is: ${report.name}.`);
  lines.push(`Scope: ${scopeText} | Year: ${year} | View: ${breakdownLabel}.`);
  lines.push(oneSentenceMeaning(kpi, parts, value));

  if (value != null && prevValue != null) {
    if (kpi.format === "pct") {
      const pp = (value - prevValue) * 100;
      lines.push(`Compared to ${year - 1}, it is ${pp >= 0 ? "up" : "down"} by ${Math.abs(pp).toFixed(1)} percentage points.`);
    } else {
      const d = safeDelta(value, prevValue);
      if (d != null) lines.push(`Compared to ${year - 1}, it is ${d >= 0 ? "up" : "down"} by ${(Math.abs(d) * 100).toFixed(1)}%.`);
    }
  }

  if (groups?.length && activeBreakdown?.id !== "__trend") {
    const top = groups[0];
    if (kpi.kind === "sum" || kpi.kind === "sum_where" || kpi.kind === "count_distinct") {
      const total = value ?? groups.reduce((s, g) => s + Number(g.value ?? 0), 0);
      const share = total ? (top.value ?? 0) / total : null;
      lines.push(
        `Largest ${activeBreakdown?.label ?? report.breakdownLabel}: ${top.name} with ${fmtValue(kpi, top.value)}${share != null ? ` (${(share * 100).toFixed(1)}% of the total).` : "."}`
      );
    } else {
      const bottom = groups[groups.length - 1];
      lines.push(`Highest ${activeBreakdown?.label ?? report.breakdownLabel}: ${top.name} (${kpi.format === "pct" ? formatPct(top.value) : fmtValue(kpi, top.value)}).`);
      if (bottom && bottom.name !== top.name) {
        lines.push(`Lowest ${activeBreakdown?.label ?? report.breakdownLabel}: ${bottom.name} (${kpi.format === "pct" ? formatPct(bottom.value) : fmtValue(kpi, bottom.value)}).`);
      }
    }
  }

  if (missingInstitutes?.length) {
    lines.push(`Data is not available for ${missingInstitutes.length} selected institute(s): ${missingInstitutes.map(instituteName).join(", ")}.`);
  }

  lines.push(`Simple way to say it aloud: In ${year}, for ${scopeText}, ${oneSentenceMeaning(kpi, parts, value)}`);
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

function trendDataForReport({ facts, report, kpi, yearsInRange, scopedInstituteIds }) {
  return yearsInRange.map((y, index) => {
    const rows = rowsForYear({ facts, report, year: y, scopedInstituteIds });
    const value = kpiValue(kpi, rows);
    const prev = index > 0 ? kpiValue(kpi, rowsForYear({ facts, report, year: yearsInRange[index - 1], scopedInstituteIds })) : null;
    let yoy = null;
    if (value != null && prev != null) {
      yoy = kpi.format === "pct" ? (value - prev) * 100 : safeDelta(value, prev);
    }
    return {
      name: String(y),
      year: y,
      value,
      formattedValue: kpi.format === "pct" ? formatPct(value) : fmtValue(kpi, value),
      yoy,
      formattedYoY: yoy == null ? "-" : kpi.format === "pct" ? `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)} pp` : `${yoy >= 0 ? "+" : ""}${(yoy * 100).toFixed(1)}%`,
      Records: rows.length,
    };
  });
}

function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 2 && !STOPWORDS.has(x));
}

function scoreReportForQuestion(report, kpi, questionTokens, questionText) {
  const haystack = `${report.name} ${report.domain} ${kpi?.label ?? ""} ${kpi?.fact ?? ""} ${(kpi?.levels ?? []).map((x) => x.label).join(" ")}`.toLowerCase();
  let score = 0;
  for (const token of questionTokens) {
    if (haystack.includes(token)) score += token.length > 6 ? 4 : 2;
  }

  const rules = [
    { words: ["student", "students", "enrolment", "enrollment", "admission"], boost: "People & Student Life" },
    { words: ["placement", "placed", "ctc", "recruiter"], boost: "People & Student Life" },
    { words: ["publication", "publications", "research", "patent", "patents"], boost: "Research & Innovation" },
    { words: ["budget", "funding", "finance", "utilisation", "utilization"], boost: "Infrastructure & Finance" },
    { words: ["collaboration", "collaborations", "outreach", "alumni"], boost: "Collaboration & Outreach" },
    { words: ["ranking", "rankings", "accreditation", "governance", "audit", "legal"], boost: "Institution & Governance" },
  ];

  for (const rule of rules) {
    if (rule.words.some((w) => questionText.includes(w)) && report.domain === rule.boost) score += 8;
  }

  if (questionText.includes(String(report.reportId))) score += 50;
  if (questionText.includes(report.name.toLowerCase())) score += 30;
  return score;
}

function resolveNaturalLanguageReport({ text, catalog, yearsInRange }) {
  const query = String(text ?? "").trim();
  if (!query) return { report: null, reason: "Please type a report question first." };

  const lowered = query.toLowerCase();
  const tokens = tokenize(query);
  const yearMatch = lowered.match(/\b(20\d{2})\b/);
  const requestedYear = yearMatch ? Number(yearMatch[1]) : null;
  const year = requestedYear && yearsInRange.includes(requestedYear) ? requestedYear : yearsInRange[yearsInRange.length - 1];
  const wantsTrend = /trend|growth|year\s*on\s*year|year-on-year|last\s+\d+\s+years|over\s+time|increase|decrease/.test(lowered);

  let best = null;
  for (const report of catalog) {
    const kpi = KPI_DEFS.find((x) => x.id === report.kpiId);
    let score = scoreReportForQuestion(report, kpi, tokens, lowered);
    if (wantsTrend && report.reportType === "trend") score += 14;
    if (!wantsTrend && report.reportType === "trend") score -= 3;
    if (!best || score > best.score) best = { report, score };
  }

  if (!best || best.score <= 0) return { report: null, reason: "No matching report was found. Try a metric such as students, placements, research, budget, rankings or collaborations." };

  let report = best.report;
  if (wantsTrend && report.reportType !== "trend") {
    report = catalog.find((r) => r.kpiId === report.kpiId && r.reportType === "trend") ?? report;
  }

  return {
    report,
    year,
    reason: `Matched to ${report.name}. Review the generated report page before using it for exports.`,
  };
}

function formatYoYForCard(kpi, value, prevValue) {
  if (value == null || prevValue == null) return "-";
  if (kpi.format === "pct") {
    const pp = (value - prevValue) * 100;
    return `${pp >= 0 ? "+" : ""}${pp.toFixed(1)} pp`;
  }
  const d = safeDelta(value, prevValue);
  if (d == null) return "-";
  return `${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)}%`;
}

function ReportDetailPage({ report, facts, config, accent, role, instituteId, initialYear, onBack }) {
  const kpi = useMemo(() => KPI_DEFS.find((x) => x.id === report?.kpiId), [report]);
  const scopedInstituteIds = useMemo(() => getScopeInstituteIds({ role, instituteId, config }), [role, instituteId, config]);
  const expectedInstituteIds = useMemo(() => getExpectedInstituteIds({ role, instituteId, config }), [role, instituteId, config]);
  const scopeText = useMemo(() => instituteLabel(scopedInstituteIds), [scopedInstituteIds]);

  const yrFrom = Math.min(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yrTo = Math.max(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearsInRange = useMemo(() => YEARS.filter((y) => y >= yrFrom && y <= yrTo), [yrFrom, yrTo]);

  const breakdownOptions = useMemo(() => buildBreakdownOptions(kpi, report), [kpi, report]);
  const defaultBreakdownId = report?.reportType === "trend" ? "__trend" : `${report?.breakdownField ?? "Institute"}__broad`;

  const [year, setYear] = useState(initialYear ?? yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
  const [topN, setTopN] = useState(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
  const [activeBreakdownId, setActiveBreakdownId] = useState(defaultBreakdownId);
  const [viewMode, setViewMode] = useState(report?.defaultView ?? "table");
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  useEffect(() => {
    setYear(initialYear ?? yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
    setTopN(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
    setActiveBreakdownId(defaultBreakdownId);
    setViewMode(report?.defaultView ?? "table");
    setDownloadMenuOpen(false);
  }, [report?.reportId, initialYear, yearsInRange, config?.MaxRows, defaultBreakdownId, report?.defaultView]);

  const activeBreakdown = useMemo(() => {
    return breakdownOptions.find((x) => x.id === activeBreakdownId) ?? breakdownOptions[0];
  }, [breakdownOptions, activeBreakdownId]);

  const rowsYear = useMemo(() => rowsForYear({ facts, report, year, scopedInstituteIds }), [facts, report, year, scopedInstituteIds]);
  const prevYear = useMemo(() => {
    const idx = yearsInRange.indexOf(year);
    if (idx <= 0) return null;
    return yearsInRange[idx - 1];
  }, [yearsInRange, year]);

  const rowsPrev = useMemo(() => {
    if (!prevYear) return [];
    return rowsForYear({ facts, report, year: prevYear, scopedInstituteIds });
  }, [facts, report, prevYear, scopedInstituteIds]);

  const value = useMemo(() => (kpi ? kpiValue(kpi, rowsYear) : null), [kpi, rowsYear]);
  const prevValue = useMemo(() => (kpi && prevYear ? kpiValue(kpi, rowsPrev) : null), [kpi, prevYear, rowsPrev]);
  const parts = useMemo(() => (kpi ? computeOverallParts(kpi, rowsYear) : {}), [kpi, rowsYear]);

  const missingInstituteIds = useMemo(() => {
    if (!kpi || !expectedInstituteIds.length) return [];
    const dataRows = metricRowsForMissingCheck(kpi, rowsYear);
    const available = new Set(dataRows.map((r) => r.InstituteId).filter(Boolean));
    return expectedInstituteIds.filter((id) => !available.has(id));
  }, [kpi, expectedInstituteIds, rowsYear]);

  const groups = useMemo(() => {
    if (!kpi || !activeBreakdown || activeBreakdown.id === "__trend") return [];
    return computeGroupMetrics(kpi, rowsYear, activeBreakdown.groupFields);
  }, [kpi, rowsYear, activeBreakdown]);

  const trendData = useMemo(() => {
    if (!kpi) return [];
    return trendDataForReport({ facts, report, kpi, yearsInRange, scopedInstituteIds });
  }, [facts, report, kpi, yearsInRange, scopedInstituteIds]);

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
      activeBreakdown,
      missingInstitutes: missingInstituteIds,
    });
  }, [kpi, report, year, scopeText, value, prevValue, parts, groups, activeBreakdown, missingInstituteIds]);

  const detailTable = useMemo(() => {
    if (!kpi || !report || !activeBreakdown) return { columns: [], rows: [] };

    if (activeBreakdown.id === "__trend") {
      return {
        columns: [
          { key: "Year", label: "Year" },
          { key: "Value", label: kpi.label },
          { key: "YoY", label: kpi.format === "pct" ? "YoY Change" : "YoY Growth" },
          { key: "Records", label: "Source Rows" },
          { key: "Availability", label: "Availability" },
        ],
        rows: trendData.map((item) => ({
          Year: item.year,
          Value: item.formattedValue,
          YoY: item.formattedYoY,
          Records: item.Records,
          Availability: item.value == null ? "Data not available" : "Available",
        })),
      };
    }

    const isSumLike = kpi.kind === "sum" || kpi.kind === "sum_where" || kpi.kind === "count_distinct";
    const cols = [
      { key: "Rank", label: "S.no" },
      { key: "Bucket", label: `${activeBreakdown.label}${activeBreakdown.variant === "Detailed View" ? " (Detailed)" : ""}` },
    ];

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

    cols.push({ key: "Availability", label: "Availability" });

    const total = isSumLike ? (value ?? groups.reduce((s, g) => s + Number(g.value ?? 0), 0)) : null;
    const rows = groups.slice(0, Math.max(5, Math.min(200, topN))).map((g, idx) => {
      const base = {
        Rank: idx + 1,
        Bucket: g.name,
        Availability: g.value == null ? "Data not available" : "Available",
      };

      if (kpi.kind === "ratio" || kpi.kind === "share") {
        base.Num = fmtPlain(g._num);
        base.Den = fmtPlain(g._den);
        base.Value = kpi.format === "pct" ? formatPct(g.value) : fmtValue(kpi, g.value);
        return base;
      }

      if (kpi.kind === "avg_weighted") {
        base.Weight = fmtPlain(g._w);
        base.Value = fmtValue(kpi, g.value);
        return base;
      }

      base.Value = fmtValue(kpi, g.value);
      base.Share = total ? `${((Number(g.value ?? 0) / total) * 100).toFixed(1)}%` : "-";
      return base;
    });

    if (activeBreakdown.groupFields?.includes("Institute") && missingInstituteIds.length) {
      for (const id of missingInstituteIds) {
        const base = {
          Rank: "-",
          Bucket: activeBreakdown.groupFields.length > 1 ? `Data not available > ${instituteName(id)}` : instituteName(id),
          Availability: "Data not available",
        };
        for (const col of cols) {
          if (!(col.key in base)) base[col.key] = "-";
        }
        rows.push(base);
      }
    }

    return { columns: cols, rows };
  }, [kpi, report, activeBreakdown, trendData, groups, topN, value, missingInstituteIds]);

  const chartData = useMemo(() => {
    if (!kpi) return [];
    if (activeBreakdown?.id === "__trend") {
      return trendData
        .filter((item) => item.value != null)
        .map((item) => ({ name: item.name, value: item.value }));
    }
    return groups
      .filter((item) => item.value != null)
      .slice(0, Math.max(5, Math.min(25, topN)))
      .map((item) => ({ name: item.name, value: item.value }));
  }, [kpi, activeBreakdown, trendData, groups, topN]);

  function doDownload(fmt) {
    if (!kpi || !report) return;
    setDownloadMenuOpen(false);
    const filenameBase = `${report.reportId}_${report.name}`.replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "_");

    if (fmt === "csv") {
      downloadText(`${filenameBase}_${year}.csv`, toCsv(detailTable.rows, detailTable.columns), "text/csv;charset=utf-8");
      return;
    }
    if (fmt === "xls") {
      downloadExcelHtml(`${filenameBase}_${year}.xls`, detailTable.columns, detailTable.rows);
      return;
    }
    if (fmt === "json") {
      downloadText(`${filenameBase}_${year}.json`, JSON.stringify(detailTable.rows, null, 2), "application/json;charset=utf-8");
      return;
    }

    const html = `
      <div style="padding: 18px;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <h1 style="font-size:18px;font-weight:900;">${escHtml(report.name)}</h1>
              <div class="muted" style="font-size:12px;margin-top:4px;">Report ID: ${escHtml(report.reportId)} | Tag: ${escHtml(report.domain)} | Year: ${escHtml(year)}</div>
              <div class="muted" style="font-size:12px;margin-top:2px;">Scope: ${escHtml(scopeText)} | View: ${escHtml(activeBreakdown?.label)} ${escHtml(activeBreakdown?.variant)}</div>
            </div>
            <div class="pill">IITMIS Export</div>
          </div>
        </div>

        <div style="height:10px;"></div>

        <div class="card">
          <h2 style="font-size:14px;font-weight:900;">AI report insight</h2>
          <ul>
            ${interpretation.map((t) => `<li>${escHtml(t)}</li>`).join("")}
          </ul>
        </div>

        <div style="height:10px;"></div>

        <div class="card">
          <h2 style="font-size:14px;font-weight:900;margin-bottom:8px;">${escHtml(viewMode === "chart" ? "Chart data table" : "Report table")}</h2>
          ${htmlTable(detailTable.columns, detailTable.rows)}
        </div>

        <div style="height:10px;"></div>
        <div class="muted" style="font-size:11px;">Evidence (demo): ${EVIDENCE_LINKS.map((x) => escHtml(x.label)).join(" | ")}</div>
      </div>
    `;

    downloadHtmlAsPdf({
      title: `${report.name} (${year})`,
      html,
      orientation: "landscape",
      pageSize: "A4",
    });
  }

  if (!report || !kpi) return null;

  const totalRowsLabel = `${rowsYear.length} source row${rowsYear.length === 1 ? "" : "s"}`;
  const dataQualityCopy = missingInstituteIds.length
    ? `Showing available data. Data not available for: ${missingInstituteIds.map(instituteName).join(", ")}.`
    : rowsYear.length
      ? "All selected institute data is available for this report view."
      : "No source rows are available for the selected scope and year.";

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Reports"
        subtitle="Structured report view with drill-down, AI insight, table/chart output, missing-data notes, and downloads."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl px-4 py-2 text-sm font-extrabold hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.18)", color: "#1252a0" }}
            >
              Back to reports
            </button>
          </div>
        }
      />

      <div className="rounded-[32px] shadow-sm" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(59,130,246,0.15)", overflow: "hidden" }}>
        <div className="px-5 py-4" style={{ background: accent, color: "white" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold" style={{ color: accent }}>
                Reports ID: {report.reportId}
              </div>
              <div className="mt-2 text-xl font-extrabold">{report.name}</div>
              <div className="mt-1 text-sm font-semibold text-white/80">Reports &gt; {report.domain}</div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDownloadMenuOpen((v) => !v)}
                className="rounded-2xl bg-white px-5 py-2 text-sm font-extrabold shadow-sm hover:opacity-95"
                style={{ color: "#0f172a" }}
              >
                Download Report <span className="ml-2">v</span>
              </button>
              {downloadMenuOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border bg-white shadow-xl" style={{ borderColor: "rgba(59,130,246,0.18)" }}>
                  <button type="button" onClick={() => doDownload("pdf")} className="block w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-50" style={{ color: "#0f172a" }}>Download as PDF</button>
                  <button type="button" onClick={() => doDownload("xls")} className="block w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-50" style={{ color: "#0f172a" }}>Download as Excel</button>
                  <button type="button" onClick={() => doDownload("csv")} className="block w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-50" style={{ color: "#0f172a" }}>Download as CSV</button>
                  <button type="button" onClick={() => doDownload("json")} className="block w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-50" style={{ color: "#0f172a" }}>Download as JSON</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-b px-5 py-4" style={{ borderColor: "rgba(59,130,246,0.12)", background: "rgba(248,250,252,0.84)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-base font-extrabold" style={{ color: "#0f172a" }}>View Data By</div>
            <div className="flex flex-wrap gap-2">
              {breakdownOptions.map((option) => {
                const selected = activeBreakdown?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setActiveBreakdownId(option.id);
                      setViewMode(option.id === "__trend" ? "chart" : "table");
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-extrabold transition hover:opacity-90"
                    style={selected ? { background: accent, borderColor: accent, color: "white" } : { background: "white", borderColor: "rgba(59,130,246,0.18)", color: "#1252a0" }}
                  >
                    {option.id === "__trend" ? "Year-on-Year Trend" : `${option.label} (${option.variant})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold" style={{ color: "#334155" }}>
              Showing Results for: <span className="font-extrabold" style={{ color: "#0f172a" }}>{scopeText}</span> &gt; <span className="font-extrabold" style={{ color: "#0f172a" }}>{year}</span>
            </div>
            <div className="flex flex-wrap items-end gap-2">
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

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl p-4" style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(59,130,246,0.13)" }}>
              <div className="text-xs font-extrabold uppercase tracking-[0.12em]" style={{ color: "#64748b" }}>Value</div>
              <div className="mt-1 text-2xl font-extrabold" style={{ color: "#0f172a" }}>{fmtValue(kpi, value)}</div>
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>{year}</div>
            </div>
            <div className="rounded-3xl p-4" style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(59,130,246,0.13)" }}>
              <div className="text-xs font-extrabold uppercase tracking-[0.12em]" style={{ color: "#64748b" }}>YoY change</div>
              <div className="mt-1 text-2xl font-extrabold" style={{ color: "#0f172a" }}>{formatYoYForCard(kpi, value, prevValue)}</div>
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>vs {prevYear ?? "previous year"}</div>
            </div>
            <div className="rounded-3xl p-4" style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(59,130,246,0.13)" }}>
              <div className="text-xs font-extrabold uppercase tracking-[0.12em]" style={{ color: "#64748b" }}>Data rows</div>
              <div className="mt-1 text-2xl font-extrabold" style={{ color: "#0f172a" }}>{formatCompact(rowsYear.length)}</div>
              <div className="mt-1 text-xs" style={{ color: "#64748b" }}>{totalRowsLabel}</div>
            </div>
            <div className="rounded-3xl p-4" style={{ background: missingInstituteIds.length ? "rgba(254,242,242,0.72)" : "rgba(240,253,244,0.58)", border: missingInstituteIds.length ? "1px solid rgba(248,113,113,0.28)" : "1px solid rgba(34,197,94,0.22)" }}>
              <div className="text-xs font-extrabold uppercase tracking-[0.12em]" style={{ color: missingInstituteIds.length ? "#b91c1c" : "#15803d" }}>Data completeness</div>
              <div className="mt-1 text-sm font-bold" style={{ color: missingInstituteIds.length ? "#7f1d1d" : "#14532d" }}>{missingInstituteIds.length ? `${missingInstituteIds.length} missing` : "Available"}</div>
              <div className="mt-1 line-clamp-2 text-xs" style={{ color: missingInstituteIds.length ? "#991b1b" : "#166534" }}>{dataQualityCopy}</div>
            </div>
          </div>

          <div className="rounded-3xl p-4" style={{ background: "rgba(25,117,190,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <div className="text-sm font-extrabold" style={{ color: "#1975be" }}>AI Report Insight</div>
            <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: "#334155" }}>
              {interpretation.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl" style={{ border: "1px solid rgba(59,130,246,0.14)", overflow: "hidden", background: "rgba(255,255,255,0.94)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(59,130,246,0.12)" }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>{activeBreakdown?.id === "__trend" ? "Year-on-Year trend" : `Report output by ${activeBreakdown?.label}`}</div>
                <div className="mt-0.5 text-xs" style={{ color: "#64748b" }}>{dataQualityCopy}</div>
              </div>
              <div className="flex rounded-full bg-slate-100 p-1">
                {[
                  { id: "table", label: "Table" },
                  { id: "chart", label: "Chart" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setViewMode(item.id)}
                    className="rounded-full px-4 py-1.5 text-xs font-extrabold"
                    style={viewMode === item.id ? { background: accent, color: "white" } : { color: "#64748b" }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3">
              {viewMode === "table" ? (
                <DataTable columns={detailTable.columns} rows={detailTable.rows} maxHeight={560} accent={accent} />
              ) : chartData.length ? (
                activeBreakdown?.id === "__trend" ? (
                  <BreakdownLine
                    data={chartData}
                    format={kpi.format}
                    accent={accent}
                    yLabel={kpi.label}
                    height={520}
                    drillHint="Switch to table for YoY growth values and source-row counts."
                  />
                ) : (
                  <BreakdownBar
                    data={chartData}
                    format={kpi.format}
                    accent={accent}
                    xLabel={activeBreakdown?.label ?? report.breakdownLabel}
                    yLabel={kpi.label}
                    height={560}
                    forceHorizontal={chartData.length > 7}
                  />
                )
              ) : (
                <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">
                  No chart data available for the selected scope and view.
                </div>
              )}
            </div>
          </div>

          <div className="text-xs" style={{ color: "#64748b" }}>
            Evidence (demo): {EVIDENCE_LINKS.map((x) => x.label).join(" | ")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsHubPage({ facts, config, accent, role, instituteId, onOpenFilters, onOpenSource, onOpenInstructions, onBack, focusKpiId, autoOpenKey = 0 }) {
  const [qDraft, setQDraft] = useState("");
  const [domainDraft, setDomainDraft] = useState("All");
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");
  const [nlDraft, setNlDraft] = useState("");
  const [nlStatus, setNlStatus] = useState("");

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
      const okQ = !qq ? true : r.name.toLowerCase().includes(qq) || r.domain.toLowerCase().includes(qq) || String(r.reportId).includes(qq);
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
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const [activeReport, setActiveReport] = useState(null);
  const [reportInitialYear, setReportInitialYear] = useState(null);

  useEffect(() => {
    if (!focusKpiId) return;
    const first = catalog.find((item) => item.kpiId === focusKpiId && item.reportType !== "trend") ?? catalog.find((item) => item.kpiId === focusKpiId);
    if (first) {
      setReportInitialYear(null);
      setActiveReport(first);
    }
  }, [focusKpiId, autoOpenKey, catalog]);

  function openReport(report, year = null) {
    bumpUsage(report.reportId);
    setReportInitialYear(year);
    setActiveReport(report);
  }

  function downloadYearlyPdf() {
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
          <h1 style="font-size:18px;font-weight:900;">IITMIS Yearly Report</h1>
          <div class="muted" style="font-size:12px;margin-top:4px;">Year: ${escHtml(yearlyYear)} | Scope: ${escHtml(scopeText)}</div>
        </div>

        <div style="height:10px;"></div>

        <div class="card">
          <h2 style="font-size:14px;font-weight:900;margin-bottom:8px;">KPI summary with AI-style one-line explanations</h2>
          ${htmlTable(columns, rows)}
        </div>

        <div style="height:10px;"></div>
        <div class="muted" style="font-size:11px;">Evidence (demo): ${EVIDENCE_LINKS.map((x) => escHtml(x.label)).join(" | ")}</div>
      </div>
    `;

    downloadHtmlAsPdf({
      title: `IITMIS Yearly Report ${yearlyYear}`,
      html,
      orientation: "portrait",
      pageSize: "A4",
    });
  }

  function handleNaturalLanguageReport() {
    const result = resolveNaturalLanguageReport({ text: nlDraft, catalog, yearsInRange });
    setNlStatus(result.reason);
    if (result.report) openReport(result.report, result.year);
  }

  function rowsForReportsTable(reports) {
    return reports.map((r, idx) => ({
      Sno: idx + 1,
      Id: r.reportId,
      Name: r.name,
      Tags: r.tag ?? r.domain,
      Type: r.reportType === "trend" ? "YoY Trend" : "Breakdown",
      Action: r,
    }));
  }

  const reportColumns = useMemo(
    () => [
      { key: "Sno", label: "S.no" },
      { key: "Id", label: "Id" },
      { key: "Name", label: "Report Name" },
      { key: "Tags", label: "Tags" },
      { key: "Type", label: "View" },
      {
        key: "Action",
        label: "Action",
        format: (r) => (
          <div className="flex justify-end">
            <IconButton
              title="View report"
              onClick={() => openReport(r)}
            >
              +-+
            </IconButton>
          </div>
        ),
      },
    ],
    [catalog]
  );

  if (activeReport) {
    return (
      <ReportDetailPage
        report={activeReport}
        facts={facts}
        config={config}
        accent={accent}
        role={role}
        instituteId={instituteId}
        initialYear={reportInitialYear}
        onBack={() => {
          setActiveReport(null);
          setReportInitialYear(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Reports"
        subtitle="Browse UDISE-style report catalogues, open full report pages, switch table/chart views, and export official-style outputs."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl px-4 py-2 text-sm hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.18)", color: "#1252a0" }}
            >
              Back
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
        <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Search For Reports</div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Search</span>
              <input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="Try: students, placement, budget, trend..."
                className="h-9 rounded-xl px-3 text-sm shadow-sm outline-none"
                style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(255,255,255,0.9)", color: "#334155" }}
              />
            </label>

            <Select
              label="Tags"
              value={domainDraft}
              onChange={setDomainDraft}
              options={domains.map((d) => ({ value: d, label: d === "All" ? "All Reports" : d }))}
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
            Active scope: <span className="font-bold" style={{ color: "#1252a0" }}>{scopeText}</span> | Years: <span className="font-bold" style={{ color: "#1252a0" }}>{yrFrom}-{yrTo}</span>
            {activeKpiSet ? <span> | KPI filter: <span className="font-bold" style={{ color: "#1252a0" }}>{activeKpiSet.size}</span> selected</span> : null}
          </div>
        </div>

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
            Generates a PDF with KPI values and AI-style explanations for the selected scope.
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Ask for a Report</div>
            <div className="mt-1 text-xs" style={{ color: "#64748b" }}>
              Natural-language request path. The app maps your question to the closest governed report, then opens it in the same report-page format.
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-end">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Question</span>
            <input
              value={nlDraft}
              onChange={(e) => setNlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNaturalLanguageReport();
              }}
              placeholder="Example: Show year-on-year growth in placements for the last five years"
              className="h-10 rounded-xl px-3 text-sm shadow-sm outline-none"
              style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(255,255,255,0.9)", color: "#334155" }}
            />
          </label>
          <button
            type="button"
            onClick={handleNaturalLanguageReport}
            className="h-10 rounded-2xl px-5 text-sm font-extrabold text-white hover:opacity-90"
            style={{ background: accent }}
          >
            GENERATE REPORT
          </button>
        </div>
        {nlStatus ? <div className="mt-2 text-xs font-semibold" style={{ color: "#1252a0" }}>{nlStatus}</div> : null}
      </div>

      <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Frequently Used Reports</div>
        <div className="mt-3">
          <DataTable columns={reportColumns} rows={rowsForReportsTable(frequent)} maxHeight={360} accent={accent} />
        </div>
      </div>

      {byDomain.length ? (
        byDomain.map(([dom, reports]) => (
          <div key={dom} className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>{dom}</div>
              <div className="text-xs font-semibold" style={{ color: "#64748b" }}>{reports.length} reports</div>
            </div>
            <div className="mt-3">
              <DataTable
                columns={reportColumns}
                rows={rowsForReportsTable(reports)}
                maxHeight={520}
                accent={accent}
                onRowClick={(row) => openReport(row.Action)}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-3xl p-4" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)", color: "#64748b" }}>
          No reports match your search.
        </div>
      )}
    </div>
  );
}
