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
import SectionTitle from "../components/ui/SectionTitle";
import CombinedKpiSelector from "../components/ui/CombinedKpiSelector";
import BreakdownBar from "../components/charts/BreakdownBar";
import BreakdownLine from "../components/charts/BreakdownLine";
import { COMPARE_HIERARCHY } from "../data/compareHierarchy";

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
  const allIds = IITs.map((x) => x.id);
  const idSet = new Set(ids);
  if (ids.length >= allIds.length && allIds.every((id) => idSet.has(id))) return "All IITs";
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

function stableReportBaseId(kpi) {
  const idx = KPI_DEFS.findIndex((item) => item.id === kpi?.id);
  return 1000 + ((idx >= 0 ? idx + 1 : 999) * 100);
}

function buildReportCatalog(kpis) {
  const out = [];

  for (const kpi of kpis) {
    if (!kpi?.id) continue;
    const baseId = stableReportBaseId(kpi);
    let reportOrdinal = 0;
    const pushReport = (item) => {
      reportOrdinal += 1;
      out.push({ reportId: baseId + reportOrdinal, ...item });
    };

    pushReport({
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

    pushReport({
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
      pushReport({
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

function questionWantsTrend(text) {
  return /trend|growth|year\s*on\s*year|year-on-year|last\s+\d+\s+years|over\s+time|increase|decrease|from\s+20\d{2}\s+to\s+20\d{2}|between\s+20\d{2}\s+and\s+20\d{2}/.test(String(text ?? "").toLowerCase());
}

function clampReportYear(year, availableYears = YEARS) {
  const numericYear = Number(year);
  if (!Number.isFinite(numericYear)) return availableYears[availableYears.length - 1] ?? YEARS[YEARS.length - 1];
  const sorted = [...availableYears].sort((a, b) => a - b);
  if (!sorted.length) return numericYear;
  if (numericYear <= sorted[0]) return sorted[0];
  if (numericYear >= sorted[sorted.length - 1]) return sorted[sorted.length - 1];
  return sorted.reduce((best, item) => Math.abs(item - numericYear) < Math.abs(best - numericYear) ? item : best, sorted[0]);
}

function resolveNaturalLanguageYearRange(text, availableYears = YEARS) {
  const lowered = String(text ?? "").toLowerCase();
  const sorted = [...availableYears].sort((a, b) => a - b);
  const firstYear = sorted[0] ?? YEARS[0];
  const latestYear = sorted[sorted.length - 1] ?? YEARS[YEARS.length - 1];
  const wantsTrend = questionWantsTrend(lowered);
  const lastYearsMatch = lowered.match(/last\s+(\d+)\s+years?/);

  if (lastYearsMatch) {
    const count = Math.max(1, Math.min(sorted.length, Number(lastYearsMatch[1]) || sorted.length));
    const selected = sorted.slice(-count);
    return {
      yearFrom: selected[0] ?? firstYear,
      yearTo: selected[selected.length - 1] ?? latestYear,
      focusYear: selected[selected.length - 1] ?? latestYear,
      wantsTrend: true,
    };
  }

  const years = Array.from(new Set((lowered.match(/\b20\d{2}\b/g) ?? []).map((item) => clampReportYear(Number(item), sorted)))).sort((a, b) => a - b);
  if (years.length >= 2) {
    return { yearFrom: years[0], yearTo: years[years.length - 1], focusYear: years[years.length - 1], wantsTrend: true };
  }
  if (years.length === 1) {
    if (wantsTrend) return { yearFrom: firstYear, yearTo: years[0], focusYear: years[0], wantsTrend: true };
    return { yearFrom: years[0], yearTo: years[0], focusYear: years[0], wantsTrend: false };
  }
  if (wantsTrend) return { yearFrom: firstYear, yearTo: latestYear, focusYear: latestYear, wantsTrend: true };
  return { yearFrom: firstYear, yearTo: latestYear, focusYear: latestYear, wantsTrend: false };
}

const REPORT_IIT_REGION_GROUPS = {
  north: ["IITD", "IITR", "IITRPR", "IITMD", "IITJ", "IITJMU", "IITK", "IITBHU"],
  south: ["IITM", "IITH", "IITPKD", "IITT", "IITDH"],
  east: ["IITKGP", "IITBBS", "IITP", "IITISM"],
  west: ["IITB", "IITGN", "IITI", "IITGOA", "IITJ"],
  northeast: ["IITG"],
};

function resolveNaturalLanguageScope(text) {
  const lowered = String(text ?? "").toLowerCase();
  const normalized = lowered.replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ").trim();

  if (/\ball\s+iits?\b|\ball\s+institutes?\b|\bacross\s+all\b|\bnational\b/.test(normalized)) {
    return { instituteIds: [], label: "All IITs" };
  }
  if (/\bold\s+iits?\b|\blegacy\s+iits?\b/.test(normalized)) {
    return { instituteIds: [...REPORT_LEGACY_IITS], label: "Old IITs" };
  }
  if (/north\s*east|northeast/.test(normalized)) {
    return { instituteIds: REPORT_IIT_REGION_GROUPS.northeast, label: "North-East IITs" };
  }
  if (/north\s*(india|indian)?|northern\s+india/.test(normalized)) {
    return { instituteIds: REPORT_IIT_REGION_GROUPS.north, label: "North India IITs" };
  }
  if (/south\s*(india|indian)?|southern\s+india/.test(normalized)) {
    return { instituteIds: REPORT_IIT_REGION_GROUPS.south, label: "South India IITs" };
  }
  if (/east\s*(india|indian)?|eastern\s+india/.test(normalized)) {
    return { instituteIds: REPORT_IIT_REGION_GROUPS.east, label: "East India IITs" };
  }
  if (/west\s*(india|indian)?|western\s+india/.test(normalized)) {
    return { instituteIds: REPORT_IIT_REGION_GROUPS.west, label: "West India IITs" };
  }

  const matched = IITs.filter((iit) => {
    const short = instituteShortLabel(iit.id).toLowerCase();
    const name = String(iit.name ?? "").toLowerCase();
    const id = String(iit.id ?? "").toLowerCase();
    const compactId = id.replace(/^iit/, "iit ");
    const city = name.replace(/^iit\s*/i, "").replace(/^indian institute of technology\s*/i, "").trim();
    return [short, name, id, compactId, city]
      .filter((item) => item && item.length >= 3)
      .some((item) => normalized.includes(item.replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ").trim()));
  }).map((iit) => iit.id);

  if (matched.length) return { instituteIds: uniqueReportIds(matched), label: instituteLabel(matched) };
  return { instituteIds: null, label: "Current IIT scope" };
}

function resolveNaturalLanguageReport({ text, catalog, yearsInRange }) {
  const query = String(text ?? "").trim();
  if (!query) return { report: null, reason: "Please type a report question first." };

  const lowered = query.toLowerCase();
  const tokens = tokenize(query);
  const yearInfo = resolveNaturalLanguageYearRange(query, yearsInRange?.length ? yearsInRange : YEARS);
  const wantsTrend = yearInfo.wantsTrend || questionWantsTrend(lowered);

  let best = null;
  for (const report of catalog) {
    const kpi = KPI_DEFS.find((x) => x.id === report.kpiId);
    let score = scoreReportForQuestion(report, kpi, tokens, lowered);
    if (wantsTrend && report.reportType === "trend") score += 14;
    if (!wantsTrend && report.reportType === "trend") score -= 3;
    if (/highest|lowest|top|bottom|rank|compare|comparison|which\s+iit/.test(lowered) && report.breakdownField === "Institute") score += 10;
    if (/institute|iit|iits/.test(lowered) && report.breakdownField === "Institute") score += 4;
    if (/placement|placed|ctc|recruiter/.test(lowered) && String(kpi?.label ?? "").toLowerCase().includes("placement")) score += 12;
    if (/student|students|enrolment|enrollment|admission/.test(lowered) && String(kpi?.label ?? "").toLowerCase().includes("student")) score += 12;
    if (/fund|funding|budget|grant|utilisation|utilization/.test(lowered) && /fund|budget|utilisation|utilization/.test(String(kpi?.label ?? "").toLowerCase())) score += 12;
    if (/research|publication|paper|patent/.test(lowered) && /research|publication|patent/.test(String(kpi?.label ?? "").toLowerCase())) score += 12;
    if (!best || score > best.score) best = { report, score };
  }

  if (!best || best.score <= 0) return { report: null, reason: "No matching report was found. Try a metric such as students, placements, research, budget, rankings or collaborations." };

  let report = best.report;
  if (wantsTrend && report.reportType !== "trend") {
    report = catalog.find((r) => r.kpiId === report.kpiId && r.reportType === "trend") ?? report;
  }
  if (!wantsTrend && /highest|lowest|top|bottom|rank|compare|comparison|which\s+iit/.test(lowered) && report.breakdownField !== "Institute") {
    report = catalog.find((r) => r.kpiId === report.kpiId && r.breakdownField === "Institute" && r.reportType !== "trend") ?? report;
  }

  return {
    report,
    year: yearInfo.focusYear,
    yearFrom: yearInfo.yearFrom,
    yearTo: yearInfo.yearTo,
    wantsTrend,
    reason: `Matched to ${report.name}. Filters from the question were applied where possible.`,
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


const REPORT_LEGACY_IITS = ["IITD", "IITB", "IITKGP", "IITM", "IITK"];
const REPORT_LABEL_ACRONYMS = new Set(["ai", "api", "cgpa", "gpa", "iit", "iits", "iqac", "ip", "ipr", "iso", "mooc", "naac", "nba", "nirf", "phd", "qa", "ugc"]);

function humanizeReportLabel(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const spaced = raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return raw;
  return spaced
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (REPORT_LABEL_ACRONYMS.has(lower)) return lower.toUpperCase();
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;
      return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function reportItemLabel(item) {
  return humanizeReportLabel(item?.kpiLabel ?? item?.label ?? item?.kpi?.label ?? item?.id ?? "");
}

function instituteShortLabel(id) {
  const inst = IITs.find((item) => item.id === id);
  if (!inst) return id;
  return inst.name?.replace(/^Indian Institute of Technology\s*/i, "IIT ") ?? id;
}

function uniqueReportIds(values = []) {
  return Array.from(new Set((values ?? []).filter(Boolean)));
}

function sortReportIitsAlphabetically(values = []) {
  return uniqueReportIds(values).sort((left, right) => instituteShortLabel(left).localeCompare(instituteShortLabel(right)));
}

function flattenReportHierarchy(hierarchy = []) {
  return hierarchy.flatMap((module) =>
    (module.submodules ?? []).flatMap((submodule) =>
      (submodule.sheets ?? []).flatMap((sheet) =>
        (sheet.kpis ?? []).map((item) => ({
          ...item,
          moduleId: item.moduleId ?? module.id,
          moduleLabel: item.moduleLabel ?? module.label,
          submoduleId: item.submoduleId ?? submodule.id,
          submoduleLabel: item.submoduleLabel ?? submodule.label,
          sheetId: item.sheetId ?? sheet.id,
          sheetLabel: item.sheetLabel ?? sheet.label,
        }))
      )
    )
  );
}

function firstActiveIdInReportList(items = [], activeIds = []) {
  const active = new Set(activeIds ?? []);
  return items.find((item) => active.has(item.id))?.id ?? null;
}

function firstValidReportItem(items = []) {
  return (items ?? []).find((item) => item?.kpiId) ?? (items ?? []).find(Boolean) ?? null;
}

function firstReportItemFromModuleEntity(module) {
  return firstValidReportItem(
    (module?.submodules ?? []).flatMap((submodule) => (submodule.sheets ?? []).flatMap((sheet) => sheet.kpis ?? []))
  );
}

function firstReportItemFromSubmoduleEntity(submodule) {
  return firstValidReportItem((submodule?.sheets ?? []).flatMap((sheet) => sheet.kpis ?? []));
}

function firstReportItemFromSheetEntity(sheet) {
  return firstValidReportItem(sheet?.kpis ?? []);
}

function buildReportHierarchyMaps(hierarchy = []) {
  const moduleMap = Object.fromEntries((hierarchy ?? []).map((module) => [module.id, module]));
  const submoduleMap = Object.fromEntries(
    (hierarchy ?? []).flatMap((module) =>
      (module.submodules ?? []).map((submodule) => [
        submodule.id,
        {
          ...submodule,
          moduleId: submodule.moduleId ?? module.id,
          moduleLabel: submodule.moduleLabel ?? module.label,
        },
      ])
    )
  );
  const sheetMap = Object.fromEntries(
    (hierarchy ?? []).flatMap((module) =>
      (module.submodules ?? []).flatMap((submodule) =>
        (submodule.sheets ?? []).map((sheet) => [
          sheet.id,
          {
            ...sheet,
            moduleId: sheet.moduleId ?? module.id,
            moduleLabel: sheet.moduleLabel ?? module.label,
            submoduleId: sheet.submoduleId ?? submodule.id,
            submoduleLabel: sheet.submoduleLabel ?? submodule.label,
          },
        ])
      )
    )
  );
  const itemMap = Object.fromEntries(flattenReportHierarchy(hierarchy).map((item) => [item.id, item]));
  return { moduleMap, submoduleMap, sheetMap, itemMap };
}

function ReportCloseIcon({ tone = "#ffffff" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M6 6l12 12" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6 6 18" stroke={tone} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function normalizeReportSelection(value, role, instituteId) {
  const from = Number(value?.yearFrom ?? YEARS[0]);
  const to = Number(value?.yearTo ?? YEARS[YEARS.length - 1]);
  const yearFrom = Math.min(from, to);
  const yearTo = Math.max(from, to);
  const focusRaw = Number(value?.focusYear ?? yearTo);
  const focusYear = Math.min(Math.max(focusRaw, yearFrom), yearTo);
  return {
    modules: uniqueReportIds(value?.modules),
    submodules: uniqueReportIds(value?.submodules),
    sheets: uniqueReportIds(value?.sheets),
    items: uniqueReportIds(value?.items).slice(0, 1),
    kpiIds: uniqueReportIds(value?.kpiIds).slice(0, 1),
    iits: role === "iit" ? [instituteId].filter(Boolean) : uniqueReportIds(value?.iits),
    yearFrom,
    yearTo,
    focusYear,
  };
}

function reportSelectionSignature(value) {
  const safe = value ?? {};
  return JSON.stringify({
    modules: safe.modules ?? [],
    submodules: safe.submodules ?? [],
    sheets: safe.sheets ?? [],
    items: safe.items ?? [],
    kpiIds: safe.kpiIds ?? [],
    iits: safe.iits ?? [],
    yearFrom: safe.yearFrom,
    yearTo: safe.yearTo,
    focusYear: safe.focusYear,
  });
}

function reportSelectionFromItem(item, prev = {}, role, instituteId) {
  if (!item) return normalizeReportSelection(prev, role, instituteId);
  return normalizeReportSelection({
    ...prev,
    modules: [item.moduleId].filter(Boolean),
    submodules: [item.submoduleId].filter(Boolean),
    sheets: [item.sheetId].filter(Boolean),
    items: [item.id].filter(Boolean),
    kpiIds: [item.kpiId].filter(Boolean),
  }, role, instituteId);
}

function makeReportSelectionFromConfig({ config, role, instituteId, allItems }) {
  const configuredKpiIds = uniqueReportIds(config?.KpiIds).slice(0, 1);
  const validItems = (allItems ?? []).filter((item) => item?.kpiId);
  const selectedItem = configuredKpiIds.length
    ? (validItems.find((item) => configuredKpiIds.includes(item.kpiId)) ?? firstValidReportItem(validItems))
    : firstValidReportItem(validItems);
  const fromRaw = Number(config?.YearRange?.from ?? YEARS[0]);
  const toRaw = Number(config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearFrom = Math.min(fromRaw, toRaw);
  const yearTo = Math.max(fromRaw, toRaw);
  return normalizeReportSelection({
    modules: selectedItem?.moduleId ? [selectedItem.moduleId] : [],
    submodules: selectedItem?.submoduleId ? [selectedItem.submoduleId] : [],
    sheets: selectedItem?.sheetId ? [selectedItem.sheetId] : [],
    items: selectedItem?.id ? [selectedItem.id] : [],
    kpiIds: selectedItem?.kpiId ? [selectedItem.kpiId] : configuredKpiIds,
    iits: role === "iit" ? [instituteId].filter(Boolean) : [...(config?.InstituteId ?? [])],
    yearFrom,
    yearTo,
    focusYear: yearTo,
  }, role, instituteId);
}

function ReportSelectionActionButton({ label = "Advanced filters", onClick, title, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      disabled={disabled}
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100",
        disabled ? "cursor-not-allowed opacity-50" : ""
      )}
    >
      {label}
    </button>
  );
}

function ReportFilterChoiceChip({ label, active = false, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className="inline-flex min-h-[42px] items-center gap-2 rounded-[12px] border px-3 py-2 text-left text-sm font-medium transition"
      style={{
        borderColor: active ? "rgba(37,99,235,0.32)" : "rgba(226,232,240,0.95)",
        background: active ? "rgba(239,246,255,0.96)" : "rgba(248,250,252,0.95)",
        color: "#1d4ed8",
      }}
    >
      <span
        className="grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border text-[11px] leading-none"
        style={{
          borderColor: active ? "#1d4ed8" : "#94a3b8",
          background: active ? "#1d4ed8" : "#ffffff",
          color: active ? "#ffffff" : "transparent",
        }}
      >
        ✓
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ReportDateSelector({ source, updateSource, years, accent }) {
  const singleYear = Number(source.yearFrom) === Number(source.yearTo);
  const modes = [
    { id: "single", label: "Select Year" },
    { id: "range", label: "Select Year Range" },
  ];

  function setSingleYear(yearValue) {
    const year = Number(yearValue);
    updateSource((prev) => ({ ...prev, yearFrom: year, yearTo: year, focusYear: year }));
  }

  function setRangeBoundary(kind, yearValue) {
    const year = Number(yearValue);
    updateSource((prev) => {
      if (kind === "from") {
        const nextFrom = Math.min(year, prev.yearTo);
        const nextFocus = Math.min(Math.max(prev.focusYear, nextFrom), prev.yearTo);
        return { ...prev, yearFrom: nextFrom, focusYear: nextFocus };
      }
      const nextTo = Math.max(year, prev.yearFrom);
      const nextFocus = Math.min(Math.max(prev.focusYear, prev.yearFrom), nextTo);
      return { ...prev, yearTo: nextTo, focusYear: nextFocus };
    });
  }

  return (
    <div className="grid flex-1 content-start gap-3">
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl border p-1"
        style={{ background: "rgba(248,250,252,0.78)", borderColor: "rgba(59,130,246,0.14)" }}
      >
        {modes.map((mode) => {
          const active = mode.id === "single" ? singleYear : !singleYear;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                if (mode.id === "single") setSingleYear(source.focusYear ?? source.yearTo);
                else if (singleYear) {
                  updateSource((prev) => ({
                    ...prev,
                    yearFrom: years[Math.max(0, years.indexOf(Number(prev.yearTo)) - 4)] ?? years[0],
                    yearTo: Number(prev.yearTo),
                    focusYear: Number(prev.yearTo),
                  }));
                }
              }}
              className="min-h-9 rounded-xl px-2 text-[11px] font-extrabold leading-tight transition"
              style={{ background: active ? accent : "transparent", color: active ? "white" : "#475569" }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      {singleYear ? (
        <Select
          label="Year"
          value={String(source.yearTo)}
          onChange={setSingleYear}
          options={years.map((year) => ({ value: String(year), label: String(year) }))}
        />
      ) : (
        <div className="grid gap-3 xl:grid-cols-1 2xl:grid-cols-2">
          <Select
            label="From"
            value={String(source.yearFrom)}
            onChange={(value) => setRangeBoundary("from", value)}
            options={years.map((year) => ({ value: String(year), label: String(year) }))}
          />
          <Select
            label="To"
            value={String(source.yearTo)}
            onChange={(value) => setRangeBoundary("to", value)}
            options={years.map((year) => ({ value: String(year), label: String(year) }))}
          />
        </div>
      )}
    </div>
  );
}

function ReportTableActionIcon({ accent = "#1252a0" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="14" rx="2.5" stroke={accent} strokeWidth="1.8" />
      <path d="M4.5 9.5h15M4.5 14h15M9.5 5v14M14.5 5v14" stroke={accent} strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}


function reportTableSortableValue(value) {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  const text = String(value).trim();
  if (!text || text === "-" || text === "—") return "";
  const numeric = Number(text.replace(/rs|cr|lpa|%|,|₹/gi, "").trim());
  if (Number.isFinite(numeric)) return numeric;
  return text.toLowerCase();
}

function compareReportTableValues(left, right) {
  const a = reportTableSortableValue(left);
  const b = reportTableSortableValue(right);
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function UdiseReportTable({ columns, rows, footerRow = null, maxHeight = 560, hiddenKeys = [] }) {
  const [sortState, setSortState] = useState({ key: null, direction: null });
  const hidden = new Set(hiddenKeys ?? []);
  const displayColumns = (columns ?? []).filter((column) => !hidden.has(column.key));
  const sortedRows = useMemo(() => {
    if (!sortState.key || !sortState.direction) return rows ?? [];
    const direction = sortState.direction === "asc" ? 1 : -1;
    return [...(rows ?? [])].sort((left, right) => compareReportTableValues(left?.[sortState.key], right?.[sortState.key]) * direction);
  }, [rows, sortState]);

  function toggleSort(key) {
    setSortState((current) => {
      if (current.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }

  return (
    <div className="overflow-auto bg-white" style={{ maxHeight }}>
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead className="sticky top-0 z-20">
          <tr>
            {displayColumns.map((column, index) => {
              const active = sortState.key === column.key;
              return (
                <th
                  key={column.key}
                  className="border border-slate-400 px-3 py-3 text-left align-middle font-extrabold text-slate-950"
                  style={{ background: "#ece9ff", minWidth: index === 0 ? 250 : 150 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex min-w-0 items-center gap-2 rounded-md text-left transition hover:text-blue-800"
                      title={`Sort by ${column.label ?? column.key}`}
                      aria-label={`Sort by ${column.label ?? column.key}`}
                    >
                      <span className="truncate">{column.label ?? column.key}</span>
                      <span className="inline-flex flex-col text-[9px] leading-[8px]" aria-hidden="true">
                        <span style={{ color: active && sortState.direction === "asc" ? "#173f91" : "#94a3b8" }}>▲</span>
                        <span style={{ color: active && sortState.direction === "desc" ? "#173f91" : "#94a3b8" }}>▼</span>
                      </span>
                    </button>
                    <span className="flex shrink-0 items-center gap-2 text-slate-700" aria-hidden="true">
                      <span className="h-4 border-l border-slate-400" />
                      <span className="text-lg leading-none">⋮</span>
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length ? (
            sortedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {displayColumns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={cx(
                      "border border-slate-400 px-3 py-3 align-middle text-slate-950",
                      colIndex === 0 ? "text-left font-medium" : "text-left"
                    )}
                  >
                    {column.format ? column.format(row?.[column.key]) : String(row?.[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="border border-slate-400 px-3 py-12 text-center text-sm font-semibold text-slate-500" colSpan={displayColumns.length || 1}>
                Data not available for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
        {footerRow ? (
          <tfoot className="sticky bottom-0 z-10">
            <tr>
              {displayColumns.map((column, index) => (
                <td
                  key={column.key}
                  className="border border-slate-400 bg-white px-3 py-3 text-left font-extrabold text-slate-950"
                >
                  {index === 0 && !footerRow?.[column.key] ? "Total" : String(footerRow?.[column.key] ?? "")}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

function ReportDetailPage({ report, catalog = [], facts, config, accent, role, instituteId, initialYear, onBack, onChangeReport }) {
  const kpi = useMemo(() => KPI_DEFS.find((x) => x.id === report?.kpiId), [report]);

  const yrFrom = Math.min(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yrTo = Math.max(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearsInRange = useMemo(() => YEARS.filter((y) => y >= yrFrom && y <= yrTo), [yrFrom, yrTo]);

  const configuredInstituteIds = useMemo(() => {
    if (role === "iit") return [instituteId].filter(Boolean);
    return uniqueReportIds(config?.InstituteId ?? []);
  }, [role, instituteId, config]);

  const breakdownOptions = useMemo(() => buildBreakdownOptions(kpi, report), [kpi, report]);
  const defaultBreakdownId = report?.reportType === "trend" ? "__trend" : `${report?.breakdownField ?? "Institute"}__broad`;

  const [year, setYear] = useState(initialYear ?? yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
  const [topN, setTopN] = useState(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
  const [detailInstituteIds, setDetailInstituteIds] = useState(configuredInstituteIds);
  const [activeBreakdownId, setActiveBreakdownId] = useState(defaultBreakdownId);
  const [selectedBucketNames, setSelectedBucketNames] = useState([]);
  const [viewMode, setViewMode] = useState(report?.defaultView ?? "table");
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [reportNotesCopied, setReportNotesCopied] = useState(false);

  useEffect(() => {
    setYear(initialYear ?? yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
    setTopN(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
    setDetailInstituteIds(configuredInstituteIds);
    setActiveBreakdownId(defaultBreakdownId);
    setSelectedBucketNames([]);
    setViewMode(report?.defaultView ?? "table");
    setDownloadMenuOpen(false);
    setFilterPanelOpen(false);
    setReportNotesCopied(false);
  }, [report?.reportId, initialYear, yearsInRange, config?.MaxRows, configuredInstituteIds, defaultBreakdownId, report?.defaultView]);

  useEffect(() => {
    setSelectedBucketNames([]);
  }, [activeBreakdownId]);

  const activeBreakdown = useMemo(() => {
    return breakdownOptions.find((x) => x.id === activeBreakdownId) ?? breakdownOptions[0];
  }, [breakdownOptions, activeBreakdownId]);

  const expectedInstituteIds = useMemo(() => {
    if (role === "iit") return [instituteId].filter(Boolean);
    return detailInstituteIds.length ? detailInstituteIds : IITs.map((x) => x.id);
  }, [role, instituteId, detailInstituteIds]);

  const scopeText = useMemo(() => instituteLabel(detailInstituteIds), [detailInstituteIds]);

  const rowsYear = useMemo(() => rowsForYear({ facts, report, year, scopedInstituteIds: detailInstituteIds }), [facts, report, year, detailInstituteIds]);
  const prevYear = useMemo(() => {
    const idx = yearsInRange.indexOf(year);
    if (idx <= 0) return null;
    return yearsInRange[idx - 1];
  }, [yearsInRange, year]);

  const rowsPrev = useMemo(() => {
    if (!prevYear) return [];
    return rowsForYear({ facts, report, year: prevYear, scopedInstituteIds: detailInstituteIds });
  }, [facts, report, prevYear, detailInstituteIds]);

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

  const selectedBucketSet = useMemo(() => new Set(selectedBucketNames), [selectedBucketNames]);
  const visibleGroups = useMemo(() => {
    if (!selectedBucketSet.size) return groups;
    return groups.filter((item) => selectedBucketSet.has(item.name));
  }, [groups, selectedBucketSet]);

  const bucketOptions = useMemo(() => groups.map((item) => item.name), [groups]);

  const trendData = useMemo(() => {
    if (!kpi) return [];
    return trendDataForReport({ facts, report, kpi, yearsInRange, scopedInstituteIds: detailInstituteIds });
  }, [facts, report, kpi, yearsInRange, detailInstituteIds]);

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
      groups: visibleGroups,
      activeBreakdown,
      missingInstitutes: missingInstituteIds,
    });
  }, [kpi, report, year, scopeText, value, prevValue, parts, visibleGroups, activeBreakdown, missingInstituteIds]);

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

    const visibleTotal = isSumLike ? visibleGroups.reduce((s, g) => s + Number(g.value ?? 0), 0) : null;
    const rows = visibleGroups.slice(0, Math.max(5, Math.min(200, topN))).map((g, idx) => {
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
      base.Share = visibleTotal ? `${((Number(g.value ?? 0) / visibleTotal) * 100).toFixed(1)}%` : "-";
      return base;
    });

    if (activeBreakdown.groupFields?.includes("Institute") && missingInstituteIds.length && !selectedBucketSet.size) {
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
  }, [kpi, report, activeBreakdown, trendData, visibleGroups, topN, missingInstituteIds, selectedBucketSet]);

  const chartData = useMemo(() => {
    if (!kpi) return [];
    if (activeBreakdown?.id === "__trend") {
      return trendData
        .filter((item) => item.value != null)
        .map((item) => ({ name: item.name, value: item.value }));
    }
    return visibleGroups
      .filter((item) => item.value != null)
      .slice(0, Math.max(5, Math.min(25, topN)))
      .map((item) => ({ name: item.name, value: item.value }));
  }, [kpi, activeBreakdown, trendData, visibleGroups, topN]);

  const reportOptions = useMemo(() => {
    const sameDomain = catalog.filter((item) => item.domain === report?.domain);
    const other = catalog.filter((item) => item.domain !== report?.domain);
    return [...sameDomain, ...other];
  }, [catalog, report?.domain]);


  const reportHierarchyMaps = useMemo(() => buildReportHierarchyMaps(COMPARE_HIERARCHY), []);
  const selectedHierarchyItem = useMemo(
    () => Object.values(reportHierarchyMaps.itemMap).find((item) => item.kpiId === report?.kpiId) ?? null,
    [reportHierarchyMaps, report?.kpiId]
  );
  const selectedCategoryId = selectedHierarchyItem?.moduleId ?? Object.keys(reportHierarchyMaps.moduleMap)[0] ?? "";
  const selectedModuleId = selectedHierarchyItem?.submoduleId ?? reportHierarchyMaps.moduleMap[selectedCategoryId]?.submodules?.[0]?.id ?? "";
  const selectedSheetId = selectedHierarchyItem?.sheetId ?? reportHierarchyMaps.submoduleMap[selectedModuleId]?.sheets?.[0]?.id ?? "";
  const selectedItemId = selectedHierarchyItem?.id ?? reportHierarchyMaps.sheetMap[selectedSheetId]?.kpis?.[0]?.id ?? "";
  const reportCategoryOptions = useMemo(
    () => COMPARE_HIERARCHY.map((module) => ({ value: module.id, label: humanizeReportLabel(module.label ?? module.id) })),
    []
  );
  const reportModuleOptions = useMemo(
    () => (reportHierarchyMaps.moduleMap[selectedCategoryId]?.submodules ?? []).map((submodule) => ({ value: submodule.id, label: humanizeReportLabel(submodule.label ?? submodule.id) })),
    [reportHierarchyMaps, selectedCategoryId]
  );
  const reportSheetOptions = useMemo(
    () => (reportHierarchyMaps.submoduleMap[selectedModuleId]?.sheets ?? []).map((sheet) => ({ value: sheet.id, label: humanizeReportLabel(sheet.label ?? sheet.id) })),
    [reportHierarchyMaps, selectedModuleId]
  );
  const reportKpiOptions = useMemo(
    () => (reportHierarchyMaps.sheetMap[selectedSheetId]?.kpis ?? []).map((item) => ({ value: item.id, label: reportItemLabel(item) })),
    [reportHierarchyMaps, selectedSheetId]
  );

  function changeReportByHierarchyItem(item) {
    if (!item?.kpiId) return;
    const nextReport = catalog.find((candidate) => candidate.kpiId === item.kpiId && candidate.reportType === report?.reportType)
      ?? catalog.find((candidate) => candidate.kpiId === item.kpiId && candidate.reportType !== "trend")
      ?? catalog.find((candidate) => candidate.kpiId === item.kpiId);
    if (nextReport) onChangeReport?.(nextReport);
  }

  function changeReportCategory(moduleId) {
    changeReportByHierarchyItem(firstReportItemFromModuleEntity(reportHierarchyMaps.moduleMap[moduleId]));
  }

  function changeReportModule(submoduleId) {
    changeReportByHierarchyItem(firstReportItemFromSubmoduleEntity(reportHierarchyMaps.submoduleMap[submoduleId]));
  }

  function changeReportSheet(sheetId) {
    changeReportByHierarchyItem(firstReportItemFromSheetEntity(reportHierarchyMaps.sheetMap[sheetId]));
  }

  function changeReportKpi(itemId) {
    changeReportByHierarchyItem(reportHierarchyMaps.itemMap[itemId]);
  }

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

  function resetDetailFilters() {
    setYear(initialYear ?? yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
    setTopN(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
    setDetailInstituteIds(configuredInstituteIds);
    setActiveBreakdownId(defaultBreakdownId);
    setSelectedBucketNames([]);
    setViewMode(report?.defaultView ?? "table");
  }

  function rankedIitsForDetail(direction = "top") {
    if (!kpi) return [...REPORT_LEGACY_IITS];
    const rows = IITs.map((iit) => {
      const scopedRows = (facts?.[kpi.fact] ?? []).filter((row) => row.InstituteId === iit.id && Number(row.Year ?? 0) === Number(year));
      return { id: iit.id, value: kpiValue(kpi, scopedRows) };
    }).filter((item) => item.value != null && Number.isFinite(Number(item.value)));
    rows.sort((a, b) => direction === "bottom" ? Number(a.value) - Number(b.value) : Number(b.value) - Number(a.value));
    return rows.slice(0, 10).map((item) => item.id);
  }

  function toggleBucket(bucket) {
    setSelectedBucketNames((prev) => prev.includes(bucket) ? prev.filter((item) => item !== bucket) : [...prev, bucket]);
  }

  function toggleInstitute(iid) {
    if (role === "iit") return;
    setDetailInstituteIds((prev) => {
      const base = prev.length ? prev : IITs.map((item) => item.id);
      const next = base.includes(iid) ? base.filter((item) => item !== iid) : [...base, iid];
      if (!next.length || next.length === IITs.length) return [];
      return sortReportIitsAlphabetically(next);
    });
  }

  function changeReport(reportId) {
    const next = catalog.find((item) => String(item.reportId) === String(reportId));
    if (next) onChangeReport?.(next);
  }

  function FilterIcon({ tone = "#ffffff" }) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M4 7h10" stroke={tone} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12h16" stroke={tone} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 17h7" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  function renderFloatingFilterPanel() {
    const allIitIds = IITs.map((iit) => iit.id);
    const oldKey = REPORT_LEGACY_IITS.join("|");
    const selectedKey = (detailInstituteIds ?? []).join("|");
    const currentInstituteScope = role === "iit"
      ? instituteId
      : !detailInstituteIds.length
        ? "__all"
        : selectedKey === oldKey
          ? "__old"
          : detailInstituteIds.length === 1
            ? detailInstituteIds[0]
            : "__custom";

    const instituteScopeOptions = [
      { value: "__all", label: "All IITs" },
      { value: "__old", label: "Old IITs" },
      { value: "__top", label: "Top 10 by selected KPI" },
      { value: "__bottom", label: "Bottom 10 by selected KPI" },
      { value: "__custom", label: detailInstituteIds.length ? `${detailInstituteIds.length} selected IITs` : "Custom selection" },
      ...IITs.map((iit) => ({ value: iit.id, label: instituteShortLabel(iit.id) })),
    ];

    function applyInstituteScope(nextValue) {
      if (role === "iit") return;
      if (nextValue === "__all") setDetailInstituteIds([]);
      else if (nextValue === "__old") setDetailInstituteIds([...REPORT_LEGACY_IITS]);
      else if (nextValue === "__top") setDetailInstituteIds(rankedIitsForDetail("top"));
      else if (nextValue === "__bottom") setDetailInstituteIds(rankedIitsForDetail("bottom"));
      else if (nextValue !== "__custom") setDetailInstituteIds([nextValue]);
    }

    return (
      <div data-export-hide="true">
        {filterPanelOpen ? (
          <>
            <button
              type="button"
              aria-label="Close report filters backdrop"
              className="fixed inset-0 z-[250] cursor-default bg-slate-950/10"
              onClick={() => setFilterPanelOpen(false)}
            />
            <aside
              className="fixed right-4 z-[260] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[18px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.22)]"
              style={{ top: "11.75rem", border: "1px solid rgba(15,23,42,0.08)" }}
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4 text-white" style={{ background: "#173f91" }}>
                <div className="flex items-center gap-3">
                  <FilterIcon />
                  <div className="text-xl font-extrabold">Apply Filters</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                  aria-label="Close filters"
                >
                  <ReportCloseIcon />
                </button>
              </div>

              <div className="max-h-[calc(100vh-16rem)] space-y-4 overflow-auto bg-[#f7f7f7] px-5 py-5">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="Select Report"
                    value={String(report.reportId)}
                    onChange={changeReport}
                    options={reportOptions.slice(0, 200).map((item) => ({ value: String(item.reportId), label: item.name }))}
                  />
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="Select Year"
                    value={String(year)}
                    onChange={(value) => setYear(Number(value))}
                    options={yearsInRange.map((item) => ({ value: String(item), label: String(item) }))}
                  />
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="Select IIT / Group"
                    value={currentInstituteScope}
                    onChange={applyInstituteScope}
                    options={instituteScopeOptions}
                    disabled={role === "iit"}
                  />
                  <details className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-extrabold text-slate-700">Select multiple IITs</summary>
                    <div className="mt-3 grid max-h-44 gap-2 overflow-auto">
                      {IITs.map((iit) => {
                        const selected = role === "iit" ? iit.id === instituteId : (!detailInstituteIds.length || detailInstituteIds.includes(iit.id));
                        return (
                          <button
                            key={iit.id}
                            type="button"
                            onClick={() => toggleInstitute(iit.id)}
                            disabled={role === "iit"}
                            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span>{instituteShortLabel(iit.id)}</span>
                            <span className={cx("h-3 w-3 rounded-sm border", selected ? "border-blue-700 bg-blue-700" : "border-slate-300 bg-white")} />
                          </button>
                        );
                      })}
                    </div>
                  </details>
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="View Data By"
                    value={activeBreakdownId}
                    onChange={(value) => {
                      setActiveBreakdownId(value);
                      setViewMode(value === "__trend" ? "chart" : "table");
                    }}
                    options={breakdownOptions.map((option) => ({
                      value: option.id,
                      label: option.id === "__trend" ? "Year-on-Year Trend" : `${option.label} (${option.variant})`,
                    }))}
                  />
                  {activeBreakdown?.id !== "__trend" && bucketOptions.length ? (
                    <Select
                      label="Filter Visible Value"
                      value={selectedBucketNames.length === 1 ? selectedBucketNames[0] : "__all"}
                      onChange={(value) => setSelectedBucketNames(value === "__all" ? [] : [value])}
                      options={[{ value: "__all", label: "All values" }, ...bucketOptions.slice(0, 100).map((bucket) => ({ value: bucket, label: bucket }))]}
                      className="mt-3"
                    />
                  ) : null}
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="Rows to Show"
                    value={String(topN)}
                    onChange={(value) => setTopN(Number(value))}
                    options={[10, 25, 50, 100, 200].map((item) => ({ value: String(item), label: String(item) }))}
                  />
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-950">Full AI report interpretation and data notes</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-slate-500">Selectable text with copy support.</div>
                    </div>
                    <button
                      type="button"
                      onClick={copyReportNotes}
                      className="rounded-full px-3 py-1.5 text-xs font-extrabold text-white transition hover:opacity-95"
                      style={{ background: "#173f91" }}
                    >
                      {reportNotesCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={aiNotesText}
                    onFocus={(event) => event.currentTarget.select()}
                    className="mt-3 h-44 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700 outline-none focus:border-blue-300"
                    aria-label="Full AI report interpretation and data notes"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 bg-[#f7f7f7] px-5 pb-5">
                <button
                  type="button"
                  onClick={resetDetailFilters}
                  className="rounded-full px-7 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
                  style={{ background: "#173f91" }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen(false)}
                  className="rounded-full bg-[#3ac778] px-7 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
                >
                  Apply
                </button>
              </div>
            </aside>
          </>
        ) : null}

        <div className="fixed bottom-6 right-6 z-[240]">
          <button
            type="button"
            onClick={() => setFilterPanelOpen(true)}
            className="grid h-14 w-14 place-items-center rounded-full text-white shadow-2xl transition hover:-translate-y-0.5 hover:opacity-95"
            style={{ background: "#173f91" }}
            aria-label="Open report filters"
            title="Apply Filters"
          >
            <FilterIcon />
          </button>
        </div>
      </div>
    );
  }

  if (!report || !kpi) return null;

  const dataQualityCopy = missingInstituteIds.length
    ? `Showing available data. Data not available for: ${missingInstituteIds.map(instituteName).join(", ")}.`
    : rowsYear.length
      ? "All selected institute data is available for this report view."
      : "No source rows are available for the selected scope and year.";

  const breadcrumbTrail = selectedHierarchyItem
    ? [
        reportHierarchyMaps.moduleMap[selectedHierarchyItem.moduleId]?.label,
        reportHierarchyMaps.submoduleMap[selectedHierarchyItem.submoduleId]?.label,
        reportHierarchyMaps.sheetMap[selectedHierarchyItem.sheetId]?.label,
      ].filter(Boolean).map(humanizeReportLabel).join(" > ")
    : report.domain;

  const tableFooterRow = activeBreakdown?.id === "__trend" ? null : (() => {
    const row = Object.fromEntries((detailTable.columns ?? []).map((column) => [column.key, ""]));
    if ("Rank" in row) row.Rank = "";
    if ("Bucket" in row) row.Bucket = "Total";
    if ("Num" in row) row.Num = fmtPlain(parts?.num);
    if ("Den" in row) row.Den = fmtPlain(parts?.den);
    if ("Weight" in row) row.Weight = fmtPlain(parts?.w);
    if ("Value" in row) row.Value = fmtValue(kpi, value);
    if ("Share" in row) row.Share = value == null ? "-" : "100%";
    if ("Availability" in row) row.Availability = missingInstituteIds.length ? "Partial" : rowsYear.length ? "Available" : "Data not available";
    return row;
  })();

  const aiNotesText = useMemo(() => {
    const lines = [
      `Report: ${report.name}`,
      `Report ID: ${report.reportId}`,
      `Hierarchy: ${breadcrumbTrail}`,
      `Scope: ${scopeText}`,
      `Year: ${year}`,
      `View: ${activeBreakdown?.id === "__trend" ? "Year-on-Year Trend" : `${activeBreakdown?.label ?? report.breakdownLabel} ${activeBreakdown?.variant ?? ""}`.trim()}`,
      `Data note: ${dataQualityCopy}`,
      "",
      "Full AI report interpretation:",
      ...interpretation.map((text, index) => `${index + 1}. ${text}`),
      "",
      `Evidence (demo): ${EVIDENCE_LINKS.map((item) => item.label).join(" | ")}`,
    ];
    return lines.join("\n");
  }, [report, breadcrumbTrail, scopeText, year, activeBreakdown, dataQualityCopy, interpretation]);

  async function copyReportNotes() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(aiNotesText);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = aiNotesText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setReportNotesCopied(true);
      window.setTimeout(() => setReportNotesCopied(false), 1600);
    } catch {
      setReportNotesCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[26px] bg-white shadow-sm" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
      <div className="border-b border-slate-100 bg-white px-6 py-5" data-export-hide="true">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-black" style={{ color: "#173f91", border: "1px solid rgba(23,63,145,0.16)" }}>
              MIS
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Department of Higher Education</div>
              <div className="text-2xl font-black leading-tight text-slate-950">IITMIS Reports</div>
              <div className="text-sm font-semibold text-slate-500">Ministry of Education style analytical reporting</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              Reports <span className="px-1 text-slate-400">›</span>
              <span className="rounded-full px-3 py-1 text-white" style={{ background: "#173f91" }}>{report.domain}</span>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to reports
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 text-white" style={{ background: "#173f91" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-black" style={{ color: "#173f91" }}>Reports ID: {report.reportId}</span>
            <div className="min-w-0 text-xl font-black leading-tight">{report.name}</div>
          </div>

          <div className="relative" data-export-hide="true">
            <button
              type="button"
              onClick={() => setDownloadMenuOpen((value) => !value)}
              className="min-w-[190px] rounded-full bg-white px-5 py-2 text-left text-sm font-extrabold text-slate-950 shadow-sm transition hover:opacity-95"
            >
              <span className="flex items-center justify-between gap-3">Download Report <span>⌄</span></span>
            </button>
            {downloadMenuOpen ? (
              <div className="absolute right-0 z-40 mt-1 w-[230px] overflow-hidden border border-slate-300 bg-white shadow-xl">
                <button type="button" onClick={() => doDownload("pdf")} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-950 hover:bg-slate-50">Download as PDF</button>
                <button type="button" onClick={() => doDownload("xls")} className="block w-full bg-[#1d62c7] px-4 py-2.5 text-left text-sm font-semibold text-white">Download as Excel</button>
                <button type="button" onClick={() => doDownload("csv")} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-950 hover:bg-slate-50">Download as CSV</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-[#f2f0f0] px-6 py-3" data-export-hide="true">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-lg font-black text-slate-950">View Data By</div>
          <div className="flex max-w-full flex-wrap gap-2 rounded-full bg-white p-1.5 shadow-sm">
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
                  className="rounded-full px-4 py-2 text-xs font-black transition"
                  style={selected ? { background: "#e8e6ff", color: "#173f91" } : { background: "#ffffff", color: "#0f172a" }}
                >
                  {option.id === "__trend" ? "Year-on-Year Trend" : `${option.label} (${option.variant})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-white px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-base font-semibold text-slate-950">
            Showing Results for: <span className="font-black">{scopeText}</span> <span className="px-1">›</span> <span className="font-black">{year}</span>
            {selectedBucketNames.length ? <span> <span className="px-1">›</span> <span className="font-black">{selectedBucketNames.length} selected value</span></span> : null}
          </div>
          <div className="flex rounded-full bg-slate-50 p-1 shadow-sm" data-export-hide="true">
            {[
              { id: "table", label: "▦ Table" },
              { id: "chart", label: "◔ Chart" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setViewMode(item.id)}
                className="rounded-full px-4 py-2 text-sm font-black transition"
                style={viewMode === item.id ? { background: "#e8e6ff", color: "#173f91" } : { color: "#8b8b8b" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>


        {missingInstituteIds.length || !rowsYear.length ? (
          <div
            className="rounded-[14px] px-4 py-3 text-sm font-bold"
            style={{
              background: missingInstituteIds.length ? "rgba(254,242,242,0.85)" : "rgba(248,250,252,0.95)",
              border: missingInstituteIds.length ? "1px solid rgba(248,113,113,0.38)" : "1px solid rgba(148,163,184,0.28)",
              color: missingInstituteIds.length ? "#991b1b" : "#475569",
            }}
          >
            {dataQualityCopy}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[14px] border border-slate-300 bg-white">
          {viewMode === "table" ? (
            <UdiseReportTable columns={detailTable.columns} rows={detailTable.rows} footerRow={tableFooterRow} hiddenKeys={["Rank"]} maxHeight={560} />
          ) : chartData.length ? (
            <div className="bg-white p-4">
              {activeBreakdown?.id === "__trend" ? (
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
              )}
            </div>
          ) : (
            <div className="grid min-h-[320px] place-items-center bg-white text-sm font-semibold text-slate-500">
              No chart data available for the selected scope and view.
            </div>
          )}
        </div>

      </div>

      {renderFloatingFilterPanel()}
    </div>
  );
}

export default function ReportsHubPage({ facts, config, accent: dashboardAccent, role, instituteId, onOpenFilters, onOpenSource, onOpenInstructions, onBack, focusKpiId, autoOpenKey = 0 }) {
  const accent = "#1d4ed8";
  const [qDraft, setQDraft] = useState("");
  const [domainDraft, setDomainDraft] = useState("All");
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");
  const [nlDraft, setNlDraft] = useState("");
  const [nlStatus, setNlStatus] = useState("");

  const reportHierarchyMaps = useMemo(() => buildReportHierarchyMaps(COMPARE_HIERARCHY), []);
  const allReportItems = useMemo(() => Object.values(reportHierarchyMaps.itemMap), [reportHierarchyMaps]);
  const [reportSelection, setReportSelection] = useState(() => makeReportSelectionFromConfig({ config, role, instituteId, allItems: allReportItems }));
  const [reportFilterModalOpen, setReportFilterModalOpen] = useState(false);

  useEffect(() => {
    setReportSelection(makeReportSelectionFromConfig({ config, role, instituteId, allItems: allReportItems }));
  }, [config, role, instituteId, allReportItems]);

  function updateReportSelectionSource(updater) {
    setReportSelection((prev) => normalizeReportSelection(typeof updater === "function" ? updater(prev) : updater, role, instituteId));
  }

  function applyReportItemSelection(itemId) {
    const item = reportHierarchyMaps.itemMap[itemId];
    if (!item) return;
    setReportSelection((prev) => reportSelectionFromItem(item, prev, role, instituteId));
  }

  function toggleReportModule(moduleId) {
    const item = firstReportItemFromModuleEntity(reportHierarchyMaps.moduleMap[moduleId]);
    if (item?.id) applyReportItemSelection(item.id);
  }

  function toggleReportSubmodule(submoduleId) {
    const item = firstReportItemFromSubmoduleEntity(reportHierarchyMaps.submoduleMap[submoduleId]);
    if (item?.id) applyReportItemSelection(item.id);
  }

  function toggleReportSheet(sheetId) {
    const item = firstReportItemFromSheetEntity(reportHierarchyMaps.sheetMap[sheetId]);
    if (item?.id) applyReportItemSelection(item.id);
  }

  function rankedIitsForReportSelection(direction = "top") {
    const selectedKpiId = reportSelection.kpiIds?.[0] ?? reportHierarchyMaps.itemMap[reportSelection.items?.[0]]?.kpiId;
    const selectedKpi = KPI_DEFS.find((item) => item.id === selectedKpiId) ?? KPI_DEFS[0];
    if (!selectedKpi) return [...REPORT_LEGACY_IITS];
    const rankingYear = Number(reportSelection.focusYear ?? reportSelection.yearTo ?? YEARS[YEARS.length - 1]);
    const rows = IITs.map((iit) => {
      const scopedRows = (facts?.[selectedKpi.fact] ?? []).filter((row) => row.InstituteId === iit.id && Number(row.Year ?? 0) === rankingYear);
      return { id: iit.id, value: kpiValue(selectedKpi, scopedRows) };
    }).filter((item) => item.value != null && Number.isFinite(Number(item.value)));
    rows.sort((a, b) => direction === "bottom" ? Number(a.value) - Number(b.value) : Number(b.value) - Number(a.value));
    return rows.slice(0, 10).map((item) => item.id);
  }

  const scopedInstituteIds = useMemo(() => {
    if (role === "iit") return [instituteId].filter(Boolean);
    if (reportSelection.iits?.length) return reportSelection.iits;
    return getScopeInstituteIds({ role, instituteId, config });
  }, [role, instituteId, reportSelection.iits, config]);
  const scopeText = useMemo(() => instituteLabel(scopedInstituteIds), [scopedInstituteIds]);

  const yrFrom = Number(reportSelection.yearFrom ?? Math.min(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]));
  const yrTo = Number(reportSelection.yearTo ?? Math.max(config?.YearRange?.from ?? YEARS[0], config?.YearRange?.to ?? YEARS[YEARS.length - 1]));
  const yearsInRange = useMemo(() => YEARS.filter((y) => y >= yrFrom && y <= yrTo), [yrFrom, yrTo]);

  const [yearlyYear, setYearlyYear] = useState(yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);

  useEffect(() => {
    setYearlyYear(yearsInRange[yearsInRange.length - 1] ?? YEARS[YEARS.length - 1]);
  }, [yearsInRange]);

  const activeKpiSet = useMemo(() => {
    const selectionIds = uniqueReportIds(reportSelection?.kpiIds).slice(0, 1);
    if (selectionIds.length) return new Set(selectionIds);
    const configIds = uniqueReportIds(config?.KpiIds).slice(0, 1);
    return configIds.length ? new Set(configIds) : null;
  }, [config?.KpiIds, reportSelection?.kpiIds]);

  const catalog = useMemo(() => {
    const kpis = activeKpiSet ? KPI_DEFS.filter((k) => activeKpiSet.has(k.id)) : KPI_DEFS;
    return buildReportCatalog(kpis);
  }, [activeKpiSet]);

  const allCatalog = useMemo(() => buildReportCatalog(KPI_DEFS), []);

  const effectiveReportConfig = useMemo(() => ({
    ...config,
    KpiIds: activeKpiSet ? Array.from(activeKpiSet) : uniqueReportIds(config?.KpiIds),
    InstituteId: role === "iit" ? [instituteId].filter(Boolean) : uniqueReportIds(reportSelection?.iits),
    YearRange: { from: yrFrom, to: yrTo },
    MaxRows: config?.MaxRows ?? 1000,
  }), [config, activeKpiSet, role, instituteId, reportSelection?.iits, yrFrom, yrTo]);

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
    if (!focusKpiId || !autoOpenKey) return;
    const first = allCatalog.find((item) => item.kpiId === focusKpiId && item.reportType !== "trend") ?? allCatalog.find((item) => item.kpiId === focusKpiId);
    if (first) {
      setReportInitialYear(null);
      setActiveReport(first);
    }
  }, [focusKpiId, autoOpenKey, allCatalog]);

  function openReport(report, year = null) {
    bumpUsage(report.reportId);
    setReportInitialYear(year);
    setActiveReport(report);
  }

  function changeActiveReport(nextReport) {
    if (!nextReport) return;
    bumpUsage(nextReport.reportId);
    setReportInitialYear(null);
    setActiveReport(nextReport);
  }

  function runNaturalLanguageReport() {
    const resolved = resolveNaturalLanguageReport({ text: nlDraft, catalog: allCatalog, yearsInRange: YEARS });
    setNlStatus(resolved.reason ?? "");
    if (!resolved.report) return;

    const scope = resolveNaturalLanguageScope(nlDraft);
    const hierarchyItem = firstValidReportItem(allReportItems.filter((item) => item.kpiId === resolved.report.kpiId));
    const nextSelectionBase = hierarchyItem
      ? reportSelectionFromItem(hierarchyItem, reportSelection, role, instituteId)
      : normalizeReportSelection({ ...reportSelection, kpiIds: [resolved.report.kpiId] }, role, instituteId);

    setReportSelection(normalizeReportSelection({
      ...nextSelectionBase,
      iits: scope.instituteIds === null ? nextSelectionBase.iits : scope.instituteIds,
      yearFrom: resolved.yearFrom ?? nextSelectionBase.yearFrom,
      yearTo: resolved.yearTo ?? nextSelectionBase.yearTo,
      focusYear: resolved.year ?? nextSelectionBase.focusYear,
    }, role, instituteId));

    openReport(resolved.report, resolved.year);
  }

  const reportCarouselCategoryItems = useMemo(
    () => COMPARE_HIERARCHY.map((module) => ({
      id: module.id,
      label: humanizeReportLabel(module.label ?? module.id),
      tooltip: humanizeReportLabel(module.description ?? module.label ?? module.id),
    })),
    []
  );

  const reportCarouselModuleItems = useMemo(() => {
    const sourceModules = (reportSelection.modules ?? []).map((id) => reportHierarchyMaps.moduleMap[id]).filter(Boolean);
    return sourceModules.flatMap((module) =>
      (module.submodules ?? []).map((submodule) => ({
        id: submodule.id,
        label: humanizeReportLabel(submodule.label ?? submodule.id),
        tooltip: `${humanizeReportLabel(module.label ?? module.id)} > ${humanizeReportLabel(submodule.label ?? submodule.id)}`,
      }))
    );
  }, [reportSelection.modules, reportHierarchyMaps]);

  const reportCarouselSheetItems = useMemo(() => {
    const sourceSubmodules = (reportSelection.submodules ?? []).map((id) => reportHierarchyMaps.submoduleMap[id]).filter(Boolean);
    return sourceSubmodules.flatMap((submodule) =>
      (submodule.sheets ?? []).map((sheet) => ({
        id: sheet.id,
        label: humanizeReportLabel(sheet.label ?? sheet.id),
        tooltip: `${humanizeReportLabel(reportHierarchyMaps.moduleMap[submodule.moduleId]?.label ?? submodule.moduleId)} > ${humanizeReportLabel(submodule.label ?? submodule.id)} > ${humanizeReportLabel(sheet.label ?? sheet.id)}`,
      }))
    );
  }, [reportSelection.submodules, reportHierarchyMaps]);

  const reportCarouselKpiItems = useMemo(() => {
    const sourceSheets = (reportSelection.sheets ?? []).map((id) => reportHierarchyMaps.sheetMap[id]).filter(Boolean);
    return sourceSheets.flatMap((sheet) =>
      (sheet.kpis ?? []).map((item) => ({
        id: item.id,
        label: reportItemLabel(item),
        tooltip: `${humanizeReportLabel(reportHierarchyMaps.moduleMap[sheet.moduleId]?.label ?? sheet.moduleId)} > ${humanizeReportLabel(reportHierarchyMaps.submoduleMap[sheet.submoduleId]?.label ?? sheet.submoduleId)} > ${humanizeReportLabel(sheet.label ?? sheet.id)} > ${reportItemLabel(item)}`,
      }))
    );
  }, [reportSelection.sheets, reportHierarchyMaps]);

  function renderReportCarouselSelector() {
    return (
      <CombinedKpiSelector
        title={(
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Select KPI</span>
            <ReportSelectionActionButton label="Advanced filters" onClick={() => setReportFilterModalOpen(true)} title="Open advanced filters" />
          </div>
        )}
        helper="Select the Category, Module, Sheet, and KPI for report filtering."
        accent={accent}
        soft={`${accent}12`}
        rows={[
          {
            id: "report-category",
            label: "Category",
            items: reportCarouselCategoryItems,
            activeIds: reportSelection.modules ?? [],
            activeId: firstActiveIdInReportList(reportCarouselCategoryItems, reportSelection.modules ?? []),
            autoScrollTargetId: firstActiveIdInReportList(reportCarouselCategoryItems, reportSelection.modules ?? []),
            onPick: toggleReportModule,
          },
          {
            id: "report-module",
            label: "Module",
            items: reportCarouselModuleItems,
            activeIds: reportSelection.submodules ?? [],
            activeId: firstActiveIdInReportList(reportCarouselModuleItems, reportSelection.submodules ?? []),
            autoScrollTargetId: firstActiveIdInReportList(reportCarouselModuleItems, reportSelection.submodules ?? []),
            onPick: toggleReportSubmodule,
          },
          {
            id: "report-sheet",
            label: "Sheet",
            items: reportCarouselSheetItems,
            activeIds: reportSelection.sheets ?? [],
            activeId: firstActiveIdInReportList(reportCarouselSheetItems, reportSelection.sheets ?? []),
            autoScrollTargetId: firstActiveIdInReportList(reportCarouselSheetItems, reportSelection.sheets ?? []),
            onPick: toggleReportSheet,
          },
          {
            id: "report-kpi",
            label: "KPI",
            items: reportCarouselKpiItems,
            activeIds: reportSelection.items ?? [],
            activeId: firstActiveIdInReportList(reportCarouselKpiItems, reportSelection.items ?? []),
            autoScrollTargetId: firstActiveIdInReportList(reportCarouselKpiItems, reportSelection.items ?? []),
            onPick: applyReportItemSelection,
          },
        ]}
      />
    );
  }

  function renderReportAdvancedFilterModal() {
    if (!reportFilterModalOpen) return null;

    const activeCategoryId = reportSelection.modules?.[0] ?? reportCarouselCategoryItems[0]?.id ?? "";
    const activeModuleId = reportSelection.submodules?.[0] ?? reportHierarchyMaps.moduleMap[activeCategoryId]?.submodules?.[0]?.id ?? "";
    const activeSheetId = reportSelection.sheets?.[0] ?? reportHierarchyMaps.submoduleMap[activeModuleId]?.sheets?.[0]?.id ?? "";
    const activeItemId = reportSelection.items?.[0] ?? reportHierarchyMaps.sheetMap[activeSheetId]?.kpis?.[0]?.id ?? "";
    const categoryOptions = reportCarouselCategoryItems.map((item) => ({ value: item.id, label: item.label }));
    const moduleOptions = (reportHierarchyMaps.moduleMap[activeCategoryId]?.submodules ?? []).map((item) => ({ value: item.id, label: humanizeReportLabel(item.label ?? item.id) }));
    const sheetOptions = (reportHierarchyMaps.submoduleMap[activeModuleId]?.sheets ?? []).map((item) => ({ value: item.id, label: humanizeReportLabel(item.label ?? item.id) }));
    const kpiOptions = (reportHierarchyMaps.sheetMap[activeSheetId]?.kpis ?? []).map((item) => ({ value: item.id, label: reportItemLabel(item) }));
    const allIitIds = IITs.map((iit) => iit.id);
    const selectedIitCount = reportSelection.iits.filter((iid) => allIitIds.includes(iid)).length;
    const allIitsSelected = selectedIitCount === allIitIds.length && allIitIds.length > 0;
    const someIitsSelected = selectedIitCount > 0 && !allIitsSelected;

    const SelectAllIitsButton = () => (
      <button
        type="button"
        onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: allIitsSelected ? [] : allIitIds }))}
        disabled={role === "iit"}
        className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-checked={someIitsSelected ? "mixed" : allIitsSelected}
        role="checkbox"
      >
        <span
          className="grid h-4 w-4 place-items-center rounded border text-[11px] leading-none"
          style={{
            borderColor: allIitsSelected || someIitsSelected ? "#1d4ed8" : "#94a3b8",
            background: allIitsSelected || someIitsSelected ? "#1d4ed8" : "#ffffff",
            color: allIitsSelected || someIitsSelected ? "#ffffff" : "transparent",
          }}
        >
          {allIitsSelected ? "✓" : someIitsSelected ? "-" : "✓"}
        </span>
        Select all
      </button>
    );

    return (
      <div className="fixed inset-0 z-[260] bg-slate-950/18 px-4 py-5 backdrop-blur-[2px]">
        <div className="mx-auto flex h-full w-full max-w-[1040px] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[#f3f4f6] shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div className="text-[1.25rem] font-extrabold text-slate-900">Select KPI</div>
            <button
              type="button"
              onClick={() => setReportFilterModalOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-sky-700 text-white shadow-sm"
              aria-label="Close advanced filters"
            >
              <ReportCloseIcon />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-5 pb-5">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-[1.02rem] font-extrabold text-slate-900">Select KPI</div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstItem = firstValidReportItem(allReportItems);
                      setReportSelection(reportSelectionFromItem(firstItem, { ...reportSelection, iits: reportSelection.iits }, role, instituteId));
                    }}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select label="Category" value={activeCategoryId} onChange={toggleReportModule} options={categoryOptions.length ? categoryOptions : [{ value: "", label: "No category available" }]} disabled={!categoryOptions.length} />
                  <Select label="Module" value={activeModuleId} onChange={toggleReportSubmodule} options={moduleOptions.length ? moduleOptions : [{ value: "", label: "Select category first" }]} disabled={!moduleOptions.length} />
                  <Select label="Sheet" value={activeSheetId} onChange={toggleReportSheet} options={sheetOptions.length ? sheetOptions : [{ value: "", label: "Select module first" }]} disabled={!sheetOptions.length} />
                  <Select label="KPI" value={activeItemId} onChange={applyReportItemSelection} options={kpiOptions.length ? kpiOptions : [{ value: "", label: "Select sheet first" }]} disabled={!kpiOptions.length} />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Select Date</div>
                  <ReportDateSelector source={reportSelection} updateSource={updateReportSelectionSource} years={YEARS} accent={accent} />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Select IITs</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <SelectAllIitsButton />
                        <button type="button" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: [] }))} disabled={role === "iit"} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50">Clear all</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <ReportSelectionActionButton label="OLD IITs" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: [...REPORT_LEGACY_IITS] }))} disabled={role === "iit"} />
                        <ReportSelectionActionButton label="Top 10 by KPI" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: rankedIitsForReportSelection("top") }))} disabled={role === "iit"} />
                        <ReportSelectionActionButton label="Bottom 10 by KPI" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: rankedIitsForReportSelection("bottom") }))} disabled={role === "iit"} />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {IITs.map((iit) => (
                        <ReportFilterChoiceChip
                          key={iit.id}
                          label={instituteShortLabel(iit.id)}
                          active={reportSelection.iits.includes(iit.id)}
                          onClick={() => updateReportSelectionSource((prev) => ({
                            ...prev,
                            iits: prev.iits.includes(iit.id)
                              ? prev.iits.filter((item) => item !== iit.id)
                              : sortReportIitsAlphabetically([...prev.iits, iit.id]),
                          }))}
                          title={iit.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-[#f3f4f6] px-6 py-4">
            <button type="button" onClick={() => setReportFilterModalOpen(false)} className="rounded-2xl px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-white">Cancel</button>
            <button type="button" onClick={() => setReportFilterModalOpen(false)} className="rounded-2xl bg-[#3ac778] px-5 py-2.5 text-sm font-bold text-white shadow-sm">
              Apply filters
            </button>
          </div>
        </div>
      </div>
    );
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
            <button
              type="button"
              title="View report"
              onClick={() => openReport(r)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
              style={{ border: `1px solid ${accent}2b`, color: accent }}
            >
              <ReportTableActionIcon accent={accent} />
            </button>
          </div>
        ),
      },
    ],
    [accent, catalog]
  );

  if (activeReport) {
    return (
      <ReportDetailPage
        report={activeReport}
        catalog={catalog}
        facts={facts}
        config={effectiveReportConfig}
        accent={accent}
        role={role}
        instituteId={instituteId}
        initialYear={reportInitialYear}
        onChangeReport={changeActiveReport}
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
              onClick={() => setReportFilterModalOpen(true)}
              className="rounded-2xl px-4 py-2 text-sm font-extrabold hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.18)", color: "#1252a0" }}
            >
              Filters
            </button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.95fr]">
        <div className="min-w-0">
          {renderReportCarouselSelector()}
        </div>

        <div
          className="rounded-[28px] border p-3 shadow-sm"
          style={{
            borderColor: "rgba(59,130,246,0.15)",
            background: "rgba(255,255,255,0.94)",
          }}
        >
          <div className="text-sm font-bold" style={{ color: accent }}>Select Date</div>
          <div className="mt-3">
            <ReportDateSelector
              source={reportSelection}
              updateSource={updateReportSelectionSource}
              years={YEARS}
              accent={accent}
            />
          </div>

          <div className="mt-5 text-sm font-bold" style={{ color: accent }}>Select IITs</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReportSelectionActionButton label="OLD IITs" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: [...REPORT_LEGACY_IITS] }))} disabled={role === "iit"} />
            <ReportSelectionActionButton label="ALL" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: IITs.map((iit) => iit.id) }))} disabled={role === "iit"} />
            <ReportSelectionActionButton label="Top 10 by KPI" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: rankedIitsForReportSelection("top") }))} disabled={role === "iit"} />
            <ReportSelectionActionButton label="Bottom 10 by KPI" onClick={() => updateReportSelectionSource((prev) => ({ ...prev, iits: rankedIitsForReportSelection("bottom") }))} disabled={role === "iit"} />
            <ReportSelectionActionButton label="Advanced filters" onClick={() => setReportFilterModalOpen(true)} />
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-500">
            {scopeText} | {yrFrom}-{yrTo}
          </div>
        </div>
      </div>

      {renderReportAdvancedFilterModal()}

      <div className="rounded-3xl p-4 shadow-sm" style={{ background: "rgba(255,255,255,0.94)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>Ask a Report Question</div>
            <div className="mt-1 text-xs font-semibold" style={{ color: "#64748b" }}>
              Example: compare student growth, show placement trends, or find budget utilisation for the selected scope.
            </div>
          </div>
          <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700">Natural-language report generator</div>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[260px] flex-1 flex-col gap-1">
            <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Question</span>
            <input
              value={nlDraft}
              onChange={(event) => setNlDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runNaturalLanguageReport();
              }}
              placeholder="Show number of placements for the last 5 years for all IITs"
              className="h-10 rounded-xl px-3 text-sm shadow-sm outline-none"
              style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(255,255,255,0.96)", color: "#334155" }}
            />
          </label>
          <button
            type="button"
            onClick={runNaturalLanguageReport}
            className="h-10 rounded-2xl px-5 text-sm font-extrabold text-white hover:opacity-90"
            style={{ background: accent }}
          >
            GENERATE REPORT
          </button>
        </div>
        {nlStatus ? <div className="mt-3 text-xs font-semibold" style={{ color: "#64748b" }}>{nlStatus}</div> : null}
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
