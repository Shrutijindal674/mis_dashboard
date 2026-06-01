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
    enrollment: [
      "InstituteId",
      "Institute",
      "State",
      "Year",
      "Program",
      "Discipline",
      "Gender",
      "Category",
      "Students",
    ],
    placements: [
      "InstituteId",
      "Institute",
      "Year",
      "Program",
      "Registered",
      "Placed",
      "AvgCTC_LPA",
      "MedianCTC_LPA",
    ],
    publications: [
      "InstituteId",
      "Institute",
      "Year",
      "Type",
      "Discipline",
      "Count",
    ],
    patents: ["InstituteId", "Institute", "Year", "Status", "Count"],
    budget: [
      "InstituteId",
      "Institute",
      "Year",
      "Head",
      "Allocated_Cr",
      "Utilised_Cr",
    ],
    collaborations: [
      "InstituteId",
      "Institute",
      "Year",
      "Geography",
      "Type",
      "Count",
    ],
    intlStudents: ["InstituteId", "Institute", "Year", "Level", "Students"],
  };
  const cols = templates[factName] ?? [
    "InstituteId",
    "Institute",
    "Year",
    "Value",
  ];
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
  if (kpi?.fact === "budget" || label.includes("(cr)"))
    return `Rs ${fmtPlain(v, 1)} Cr`;
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
  if (ids.length >= allIds.length && allIds.every((id) => idSet.has(id)))
    return "All IITs";
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
      defaultView: "table",
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
    return {
      distinct: new Set(
        rows.map((r) => r[kpi.distinctField || kpi.valueField]).filter(Boolean),
      ).size,
    };
  }

  if (kpi.kind === "sum") return { sum: sumBy(rows, kpi.valueField) };

  return {};
}

function groupLabelForRow(row, groupFields) {
  const parts = groupFields.map((field) => {
    const value = row?.[field];
    if (value === null || value === undefined || value === "")
      return "Data not available";
    return String(value);
  });
  return parts.join(" > ");
}

function computeGroupMetrics(kpi, rawRows, groupFieldsInput) {
  const groupFields = Array.isArray(groupFieldsInput)
    ? groupFieldsInput.filter(Boolean)
    : [groupFieldsInput].filter(Boolean);
  if (!groupFields.length) return [];

  const rows = applyKpiRowFilter(kpi, rawRows);
  const m = new Map();

  for (const r of rows) {
    const key = groupLabelForRow(r, groupFields);
    const prev = m.get(key) ?? {
      sum: 0,
      num: 0,
      den: 0,
      wsum: 0,
      w: 0,
      distinct: new Set(),
      records: 0,
    };
    prev.records += 1;

    if (kpi.kind === "sum") {
      prev.sum += Number(r[kpi.valueField] ?? 0);
    } else if (kpi.kind === "sum_where") {
      if (kpi.where?.(r)) prev.sum += Number(r[kpi.valueField] ?? 0);
    } else if (kpi.kind === "count_distinct") {
      const value = r[kpi.distinctField || kpi.valueField];
      if (value !== null && value !== undefined && value !== "")
        prev.distinct.add(value);
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
    if (kpi.kind === "ratio" || kpi.kind === "share")
      value = agg.den ? agg.num / agg.den : null;
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

  const base = [
    { label: "Institute", field: "Institute" },
    ...(kpi.levels ?? []),
  ];
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
      groupFields:
        item.field === "Institute"
          ? ["State", "Institute"]
          : [item.field, "Institute"],
      chartKind: "bar",
    });
  }

  const defaultId =
    report?.reportType === "trend"
      ? "__trend"
      : `${report?.breakdownField ?? "Institute"}__broad`;
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
    if (
      String(kpi.label ?? "")
        .toLowerCase()
        .includes("placement") &&
      parts?.num != null &&
      parts?.den != null
    ) {
      return `${label} is ${formatPct(value)} - about ${fmtPlain(parts.num)} placed out of ${fmtPlain(parts.den)} registered.`;
    }
    if (
      kpi.id === "kpi_female_share" &&
      parts?.num != null &&
      parts?.den != null
    ) {
      return `${label} is ${formatPct(value)} - about ${fmtPlain(parts.num)} female students out of ${fmtPlain(parts.den)} total.`;
    }
    return `${label} is ${formatPct(value)} - roughly ${outOf100} out of every 100.`;
  }

  if (
    String(kpi.label ?? "")
      .toLowerCase()
      .includes("ctc")
  ) {
    const placed = parts?.w
      ? ` (based on ${fmtPlain(parts.w)} placed students)`
      : "";
    return `${label} is ${fmtPlain(value, 1)} LPA${placed}. Median means half are below and half are above this value.`;
  }

  return `${label} is ${fmtValue(kpi, value)} in the selected scope.`;
}

function buildInterpretation({
  kpi,
  report,
  year,
  scopeText,
  value,
  prevValue,
  parts,
  groups,
  activeBreakdown,
  missingInstitutes,
}) {
  const lines = [];
  const breakdownLabel =
    activeBreakdown?.id === "__trend"
      ? "year-on-year trend"
      : `${activeBreakdown?.label ?? report.breakdownLabel} ${activeBreakdown?.variant ?? ""}`.trim();

  lines.push(`What this report is: ${report.name}.`);
  lines.push(`Scope: ${scopeText} | Year: ${year} | View: ${breakdownLabel}.`);
  lines.push(oneSentenceMeaning(kpi, parts, value));

  if (value != null && prevValue != null) {
    if (kpi.format === "pct") {
      const pp = (value - prevValue) * 100;
      lines.push(
        `Compared to ${year - 1}, it is ${pp >= 0 ? "up" : "down"} by ${Math.abs(pp).toFixed(1)} percentage points.`,
      );
    } else {
      const d = safeDelta(value, prevValue);
      if (d != null)
        lines.push(
          `Compared to ${year - 1}, it is ${d >= 0 ? "up" : "down"} by ${(Math.abs(d) * 100).toFixed(1)}%.`,
        );
    }
  }

  if (groups?.length && activeBreakdown?.id !== "__trend") {
    const top = groups[0];
    if (
      kpi.kind === "sum" ||
      kpi.kind === "sum_where" ||
      kpi.kind === "count_distinct"
    ) {
      const total =
        value ?? groups.reduce((s, g) => s + Number(g.value ?? 0), 0);
      const share = total ? (top.value ?? 0) / total : null;
      lines.push(
        `Largest ${activeBreakdown?.label ?? report.breakdownLabel}: ${top.name} with ${fmtValue(kpi, top.value)}${share != null ? ` (${(share * 100).toFixed(1)}% of the total).` : "."}`,
      );
    } else {
      const bottom = groups[groups.length - 1];
      lines.push(
        `Highest ${activeBreakdown?.label ?? report.breakdownLabel}: ${top.name} (${kpi.format === "pct" ? formatPct(top.value) : fmtValue(kpi, top.value)}).`,
      );
      if (bottom && bottom.name !== top.name) {
        lines.push(
          `Lowest ${activeBreakdown?.label ?? report.breakdownLabel}: ${bottom.name} (${kpi.format === "pct" ? formatPct(bottom.value) : fmtValue(kpi, bottom.value)}).`,
        );
      }
    }
  }

  if (missingInstitutes?.length) {
    lines.push(
      `Data is not available for ${missingInstitutes.length} selected institute(s): ${missingInstitutes.map(instituteName).join(", ")}.`,
    );
  }

  lines.push(
    `Simple way to say it aloud: In ${year}, for ${scopeText}, ${oneSentenceMeaning(kpi, parts, value)}`,
  );
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
          .join("")}</tr>`,
    )
    .join("")}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

function trendDataForReport({
  facts,
  report,
  kpi,
  yearsInRange,
  scopedInstituteIds,
}) {
  return yearsInRange.map((y, index) => {
    const rows = rowsForYear({ facts, report, year: y, scopedInstituteIds });
    const value = kpiValue(kpi, rows);
    const prev =
      index > 0
        ? kpiValue(
            kpi,
            rowsForYear({
              facts,
              report,
              year: yearsInRange[index - 1],
              scopedInstituteIds,
            }),
          )
        : null;
    let yoy = null;
    if (value != null && prev != null) {
      yoy =
        kpi.format === "pct" ? (value - prev) * 100 : safeDelta(value, prev);
    }
    return {
      name: String(y),
      year: y,
      value,
      formattedValue:
        kpi.format === "pct" ? formatPct(value) : fmtValue(kpi, value),
      yoy,
      formattedYoY:
        yoy == null
          ? "-"
          : kpi.format === "pct"
            ? `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)} pp`
            : `${yoy >= 0 ? "+" : ""}${(yoy * 100).toFixed(1)}%`,
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
  const haystack =
    `${report.name} ${report.domain} ${kpi?.label ?? ""} ${kpi?.fact ?? ""} ${(kpi?.levels ?? []).map((x) => x.label).join(" ")}`.toLowerCase();
  let score = 0;
  for (const token of questionTokens) {
    if (haystack.includes(token)) score += token.length > 6 ? 4 : 2;
  }

  const rules = [
    {
      words: ["student", "students", "enrolment", "enrollment", "admission"],
      boost: "People & Student Life",
    },
    {
      words: ["placement", "placed", "ctc", "recruiter"],
      boost: "People & Student Life",
    },
    {
      words: ["publication", "publications", "research", "patent", "patents"],
      boost: "Research & Innovation",
    },
    {
      words: ["budget", "funding", "finance", "utilisation", "utilization"],
      boost: "Infrastructure & Finance",
    },
    {
      words: ["collaboration", "collaborations", "outreach", "alumni"],
      boost: "Collaboration & Outreach",
    },
    {
      words: [
        "ranking",
        "rankings",
        "accreditation",
        "governance",
        "audit",
        "legal",
      ],
      boost: "Institution & Governance",
    },
  ];

  for (const rule of rules) {
    if (
      rule.words.some((w) => questionText.includes(w)) &&
      report.domain === rule.boost
    )
      score += 8;
  }

  if (questionText.includes(String(report.reportId))) score += 50;
  if (questionText.includes(report.name.toLowerCase())) score += 30;
  return score;
}

function resolveNaturalLanguageReport({ text, catalog, yearsInRange }) {
  const query = String(text ?? "").trim();
  if (!query)
    return { report: null, reason: "Please type a report question first." };

  const lowered = query.toLowerCase();
  const tokens = tokenize(query);
  const yearMatch = lowered.match(/\b(20\d{2})\b/);
  const requestedYear = yearMatch ? Number(yearMatch[1]) : null;
  const year =
    requestedYear && yearsInRange.includes(requestedYear)
      ? requestedYear
      : yearsInRange[yearsInRange.length - 1];
  const wantsTrend =
    /trend|growth|year\s*on\s*year|year-on-year|last\s+\d+\s+years|over\s+time|increase|decrease/.test(
      lowered,
    );

  let best = null;
  for (const report of catalog) {
    const kpi = KPI_DEFS.find((x) => x.id === report.kpiId);
    let score = scoreReportForQuestion(report, kpi, tokens, lowered);
    if (wantsTrend && report.reportType === "trend") score += 14;
    if (!wantsTrend && report.reportType === "trend") score -= 3;
    if (!best || score > best.score) best = { report, score };
  }

  if (!best || best.score <= 0)
    return {
      report: null,
      reason:
        "No matching report was found. Try a metric such as students, placements, research, budget, rankings or collaborations.",
    };

  let report = best.report;
  if (wantsTrend && report.reportType !== "trend") {
    report =
      catalog.find(
        (r) => r.kpiId === report.kpiId && r.reportType === "trend",
      ) ?? report;
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

const REPORT_LEGACY_IITS = ["IITD", "IITB", "IITKGP", "IITM", "IITK"];
const REPORT_LABEL_ACRONYMS = new Set([
  "ai",
  "api",
  "cgpa",
  "gpa",
  "iit",
  "iits",
  "iqac",
  "ip",
  "ipr",
  "iso",
  "mooc",
  "naac",
  "nba",
  "nirf",
  "phd",
  "qa",
  "ugc",
]);

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
  return humanizeReportLabel(
    item?.kpiLabel ?? item?.label ?? item?.kpi?.label ?? item?.id ?? "",
  );
}

function instituteShortLabel(id) {
  const inst = IITs.find((item) => item.id === id);
  if (!inst) return id;
  return (
    inst.name?.replace(/^Indian Institute of Technology\s*/i, "IIT ") ?? id
  );
}

function uniqueReportIds(values = []) {
  return Array.from(new Set((values ?? []).filter(Boolean)));
}

function sortReportIitsAlphabetically(values = []) {
  return uniqueReportIds(values).sort((left, right) =>
    instituteShortLabel(left).localeCompare(instituteShortLabel(right)),
  );
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
        })),
      ),
    ),
  );
}

function firstActiveIdInReportList(items = [], activeIds = []) {
  const active = new Set(activeIds ?? []);
  return items.find((item) => active.has(item.id))?.id ?? null;
}

function firstReportItemFromModuleEntity(module) {
  return (
    (module?.submodules ?? [])
      .flatMap((submodule) =>
        (submodule.sheets ?? []).flatMap((sheet) => sheet.kpis ?? []),
      )
      .find(Boolean) ?? null
  );
}

function firstReportItemFromSubmoduleEntity(submodule) {
  return (
    (submodule?.sheets ?? [])
      .flatMap((sheet) => sheet.kpis ?? [])
      .find(Boolean) ?? null
  );
}

function firstReportItemFromSheetEntity(sheet) {
  return (sheet?.kpis ?? []).find(Boolean) ?? null;
}

function buildReportHierarchyMaps(hierarchy = []) {
  const moduleMap = Object.fromEntries(
    (hierarchy ?? []).map((module) => [module.id, module]),
  );
  const submoduleMap = Object.fromEntries(
    (hierarchy ?? []).flatMap((module) =>
      (module.submodules ?? []).map((submodule) => [
        submodule.id,
        {
          ...submodule,
          moduleId: submodule.moduleId ?? module.id,
          moduleLabel: submodule.moduleLabel ?? module.label,
        },
      ]),
    ),
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
        ]),
      ),
    ),
  );
  const itemMap = Object.fromEntries(
    flattenReportHierarchy(hierarchy).map((item) => [item.id, item]),
  );
  return { moduleMap, submoduleMap, sheetMap, itemMap };
}

function ReportCloseIcon({ tone = "#ffffff" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12"
        stroke={tone}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 6 6 18"
        stroke={tone}
        strokeWidth="2"
        strokeLinecap="round"
      />
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
    iits:
      role === "iit"
        ? [instituteId].filter(Boolean)
        : uniqueReportIds(value?.iits),
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
  return normalizeReportSelection(
    {
      ...prev,
      modules: [item.moduleId].filter(Boolean),
      submodules: [item.submoduleId].filter(Boolean),
      sheets: [item.sheetId].filter(Boolean),
      items: [item.id].filter(Boolean),
      kpiIds: [item.kpiId].filter(Boolean),
    },
    role,
    instituteId,
  );
}

function makeReportSelectionFromConfig({
  config,
  role,
  instituteId,
  allItems,
}) {
  const configuredKpiIds = uniqueReportIds(config?.KpiIds);
  const selectedItem = configuredKpiIds.length
    ? allItems.find((item) => configuredKpiIds.includes(item.kpiId))
    : null;
  const fromRaw = Number(config?.YearRange?.from ?? YEARS[0]);
  const toRaw = Number(config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearFrom = Math.min(fromRaw, toRaw);
  const yearTo = Math.max(fromRaw, toRaw);
  return normalizeReportSelection(
    {
      modules: selectedItem?.moduleId ? [selectedItem.moduleId] : [],
      submodules: selectedItem?.submoduleId ? [selectedItem.submoduleId] : [],
      sheets: selectedItem?.sheetId ? [selectedItem.sheetId] : [],
      items: selectedItem?.id ? [selectedItem.id] : [],
      kpiIds: selectedItem?.kpiId ? [selectedItem.kpiId] : configuredKpiIds,
      iits:
        role === "iit"
          ? [instituteId].filter(Boolean)
          : [...(config?.InstituteId ?? [])],
      yearFrom,
      yearTo,
      focusYear: yearTo,
    },
    role,
    instituteId,
  );
}

function ReportSelectionActionButton({
  label = "Advanced filters",
  onClick,
  title,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      disabled={disabled}
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100",
        disabled ? "cursor-not-allowed opacity-50" : "",
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
        background: active
          ? "rgba(239,246,255,0.96)"
          : "rgba(248,250,252,0.95)",
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
    updateSource((prev) => ({
      ...prev,
      yearFrom: year,
      yearTo: year,
      focusYear: year,
    }));
  }

  function setRangeBoundary(kind, yearValue) {
    const year = Number(yearValue);
    updateSource((prev) => {
      if (kind === "from") {
        const nextFrom = Math.min(year, prev.yearTo);
        const nextFocus = Math.min(
          Math.max(prev.focusYear, nextFrom),
          prev.yearTo,
        );
        return { ...prev, yearFrom: nextFrom, focusYear: nextFocus };
      }
      const nextTo = Math.max(year, prev.yearFrom);
      const nextFocus = Math.min(
        Math.max(prev.focusYear, prev.yearFrom),
        nextTo,
      );
      return { ...prev, yearTo: nextTo, focusYear: nextFocus };
    });
  }

  return (
    <div className="grid flex-1 content-start gap-3">
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl border p-1"
        style={{
          background: "rgba(248,250,252,0.78)",
          borderColor: "rgba(59,130,246,0.14)",
        }}
      >
        {modes.map((mode) => {
          const active = mode.id === "single" ? singleYear : !singleYear;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                if (mode.id === "single")
                  setSingleYear(source.focusYear ?? source.yearTo);
                else if (singleYear) {
                  updateSource((prev) => ({
                    ...prev,
                    yearFrom:
                      years[
                        Math.max(0, years.indexOf(Number(prev.yearTo)) - 4)
                      ] ?? years[0],
                    yearTo: Number(prev.yearTo),
                    focusYear: Number(prev.yearTo),
                  }));
                }
              }}
              className="min-h-9 rounded-xl px-2 text-[11px] font-extrabold leading-tight transition"
              style={{
                background: active ? accent : "transparent",
                color: active ? "white" : "#475569",
              }}
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
          options={years.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
        />
      ) : (
        <div className="grid gap-3 xl:grid-cols-1 2xl:grid-cols-2">
          <Select
            label="From"
            value={String(source.yearFrom)}
            onChange={(value) => setRangeBoundary("from", value)}
            options={years.map((year) => ({
              value: String(year),
              label: String(year),
            }))}
          />
          <Select
            label="To"
            value={String(source.yearTo)}
            onChange={(value) => setRangeBoundary("to", value)}
            options={years.map((year) => ({
              value: String(year),
              label: String(year),
            }))}
          />
        </div>
      )}
    </div>
  );
}

function ReportTableActionIcon({ accent = "#1252a0" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect
        x="4.5"
        y="5"
        width="15"
        height="14"
        rx="2.5"
        stroke={accent}
        strokeWidth="1.8"
      />
      <path
        d="M4.5 9.5h15M4.5 14h15M9.5 5v14M14.5 5v14"
        stroke={accent}
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UdiseReportTable({
  columns,
  rows,
  footerRow = null,
  maxHeight = 560,
  hiddenKeys = [],
}) {
  const hidden = new Set(hiddenKeys ?? []);
  const displayColumns = (columns ?? []).filter(
    (column) => !hidden.has(column.key),
  );

  return (
    <div className="overflow-auto bg-white" style={{ maxHeight }}>
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead className="sticky top-0 z-20">
          <tr>
            {displayColumns.map((column, index) => (
              <th
                key={column.key}
                className="border border-slate-400 px-3 py-3 text-left align-middle font-extrabold text-slate-950"
                style={{
                  background: "#ece9ff",
                  minWidth: index === 0 ? 250 : 150,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{column.label ?? column.key}</span>
                  <span
                    className="flex items-center gap-2 text-slate-700"
                    aria-hidden="true"
                  >
                    <span className="h-4 border-l border-slate-400" />
                    <span className="text-lg leading-none">⋮</span>
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).length ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {displayColumns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={cx(
                      "border border-slate-400 px-3 py-3 align-middle text-slate-950",
                      colIndex === 0 ? "text-left font-medium" : "text-left",
                    )}
                  >
                    {column.format
                      ? column.format(row?.[column.key])
                      : String(row?.[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="border border-slate-400 px-3 py-12 text-center text-sm font-semibold text-slate-500"
                colSpan={displayColumns.length || 1}
              >
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
                  {index === 0 && !footerRow?.[column.key]
                    ? "Total"
                    : String(footerRow?.[column.key] ?? "")}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

function ReportDetailPage({
  report,
  catalog = [],
  facts,
  config,
  accent,
  role,
  instituteId,
  initialYear,
  onBack,
  onChangeReport,
}) {
  const kpi = useMemo(
    () => KPI_DEFS.find((x) => x.id === report?.kpiId),
    [report],
  );

  const yrFrom = Math.min(
    config?.YearRange?.from ?? YEARS[0],
    config?.YearRange?.to ?? YEARS[YEARS.length - 1],
  );
  const yrTo = Math.max(
    config?.YearRange?.from ?? YEARS[0],
    config?.YearRange?.to ?? YEARS[YEARS.length - 1],
  );
  const yearsInRange = useMemo(
    () => YEARS.filter((y) => y >= yrFrom && y <= yrTo),
    [yrFrom, yrTo],
  );

  const configuredInstituteIds = useMemo(() => {
    if (role === "iit") return [instituteId].filter(Boolean);
    return uniqueReportIds(config?.InstituteId ?? []);
  }, [role, instituteId, config]);

  const breakdownOptions = useMemo(
    () => buildBreakdownOptions(kpi, report),
    [kpi, report],
  );
  const defaultBreakdownId =
    report?.reportType === "trend"
      ? "__trend"
      : `${report?.breakdownField ?? "Institute"}__broad`;

  const [year, setYear] = useState(
    initialYear ??
      yearsInRange[yearsInRange.length - 1] ??
      YEARS[YEARS.length - 1],
  );
  const [topN, setTopN] = useState(
    Number(config?.MaxRows ?? 100) > 200 ? 200 : 50,
  );
  const [detailInstituteIds, setDetailInstituteIds] = useState(
    configuredInstituteIds,
  );
  const [activeBreakdownId, setActiveBreakdownId] =
    useState(defaultBreakdownId);
  const [selectedBucketNames, setSelectedBucketNames] = useState([]);
  const [viewMode, setViewMode] = useState(report?.defaultView ?? "table");
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  useEffect(() => {
    setYear(
      initialYear ??
        yearsInRange[yearsInRange.length - 1] ??
        YEARS[YEARS.length - 1],
    );
    setTopN(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
    setDetailInstituteIds(configuredInstituteIds);
    setActiveBreakdownId(defaultBreakdownId);
    setSelectedBucketNames([]);
    setViewMode(report?.defaultView ?? "table");
    setDownloadMenuOpen(false);
    setFilterPanelOpen(false);
  }, [
    report?.reportId,
    initialYear,
    yearsInRange,
    config?.MaxRows,
    configuredInstituteIds,
    defaultBreakdownId,
    report?.defaultView,
  ]);

  useEffect(() => {
    setSelectedBucketNames([]);
  }, [activeBreakdownId]);

  const activeBreakdown = useMemo(() => {
    return (
      breakdownOptions.find((x) => x.id === activeBreakdownId) ??
      breakdownOptions[0]
    );
  }, [breakdownOptions, activeBreakdownId]);

  const expectedInstituteIds = useMemo(() => {
    if (role === "iit") return [instituteId].filter(Boolean);
    return detailInstituteIds.length
      ? detailInstituteIds
      : IITs.map((x) => x.id);
  }, [role, instituteId, detailInstituteIds]);

  const scopeText = useMemo(
    () => instituteLabel(detailInstituteIds),
    [detailInstituteIds],
  );

  const rowsYear = useMemo(
    () =>
      rowsForYear({
        facts,
        report,
        year,
        scopedInstituteIds: detailInstituteIds,
      }),
    [facts, report, year, detailInstituteIds],
  );
  const prevYear = useMemo(() => {
    const idx = yearsInRange.indexOf(year);
    if (idx <= 0) return null;
    return yearsInRange[idx - 1];
  }, [yearsInRange, year]);

  const rowsPrev = useMemo(() => {
    if (!prevYear) return [];
    return rowsForYear({
      facts,
      report,
      year: prevYear,
      scopedInstituteIds: detailInstituteIds,
    });
  }, [facts, report, prevYear, detailInstituteIds]);

  const value = useMemo(
    () => (kpi ? kpiValue(kpi, rowsYear) : null),
    [kpi, rowsYear],
  );
  const prevValue = useMemo(
    () => (kpi && prevYear ? kpiValue(kpi, rowsPrev) : null),
    [kpi, prevYear, rowsPrev],
  );
  const parts = useMemo(
    () => (kpi ? computeOverallParts(kpi, rowsYear) : {}),
    [kpi, rowsYear],
  );

  const missingInstituteIds = useMemo(() => {
    if (!kpi || !expectedInstituteIds.length) return [];
    const dataRows = metricRowsForMissingCheck(kpi, rowsYear);
    const available = new Set(
      dataRows.map((r) => r.InstituteId).filter(Boolean),
    );
    return expectedInstituteIds.filter((id) => !available.has(id));
  }, [kpi, expectedInstituteIds, rowsYear]);

  const groups = useMemo(() => {
    if (!kpi || !activeBreakdown || activeBreakdown.id === "__trend") return [];
    return computeGroupMetrics(kpi, rowsYear, activeBreakdown.groupFields);
  }, [kpi, rowsYear, activeBreakdown]);

  const selectedBucketSet = useMemo(
    () => new Set(selectedBucketNames),
    [selectedBucketNames],
  );
  const visibleGroups = useMemo(() => {
    if (!selectedBucketSet.size) return groups;
    return groups.filter((item) => selectedBucketSet.has(item.name));
  }, [groups, selectedBucketSet]);

  const bucketOptions = useMemo(
    () => groups.map((item) => item.name),
    [groups],
  );

  const trendData = useMemo(() => {
    if (!kpi) return [];
    return trendDataForReport({
      facts,
      report,
      kpi,
      yearsInRange,
      scopedInstituteIds: detailInstituteIds,
    });
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
  }, [
    kpi,
    report,
    year,
    scopeText,
    value,
    prevValue,
    parts,
    visibleGroups,
    activeBreakdown,
    missingInstituteIds,
  ]);

  const detailTable = useMemo(() => {
    if (!kpi || !report || !activeBreakdown) return { columns: [], rows: [] };

    if (activeBreakdown.id === "__trend") {
      return {
        columns: [
          { key: "Year", label: "Year" },
          { key: "Value", label: kpi.label },
          {
            key: "YoY",
            label: kpi.format === "pct" ? "YoY Change" : "YoY Growth",
          },
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

    const isSumLike =
      kpi.kind === "sum" ||
      kpi.kind === "sum_where" ||
      kpi.kind === "count_distinct";
    const cols = [
      { key: "Rank", label: "S.no" },
      {
        key: "Bucket",
        label: `${activeBreakdown.label}${activeBreakdown.variant === "Detailed View" ? " (Detailed)" : ""}`,
      },
    ];

    if (kpi.kind === "ratio") {
      cols.push(
        {
          key: "Num",
          label: kpi.numField === "Placed" ? "Placed" : kpi.numField,
        },
        {
          key: "Den",
          label: kpi.denField === "Registered" ? "Registered" : kpi.denField,
        },
        { key: "Value", label: kpi.label },
      );
    } else if (kpi.kind === "share") {
      cols.push(
        { key: "Num", label: "Numerator" },
        { key: "Den", label: "Total" },
        { key: "Value", label: kpi.label },
      );
    } else if (kpi.kind === "avg_weighted") {
      cols.push(
        { key: "Weight", label: kpi.weightField },
        { key: "Value", label: kpi.label },
      );
    } else {
      cols.push({ key: "Value", label: kpi.label });
      cols.push({ key: "Share", label: "Share" });
    }

    cols.push({ key: "Availability", label: "Availability" });

    const visibleTotal = isSumLike
      ? visibleGroups.reduce((s, g) => s + Number(g.value ?? 0), 0)
      : null;
    const rows = visibleGroups
      .slice(0, Math.max(5, Math.min(200, topN)))
      .map((g, idx) => {
        const base = {
          Rank: idx + 1,
          Bucket: g.name,
          Availability: g.value == null ? "Data not available" : "Available",
        };

        if (kpi.kind === "ratio" || kpi.kind === "share") {
          base.Num = fmtPlain(g._num);
          base.Den = fmtPlain(g._den);
          base.Value =
            kpi.format === "pct" ? formatPct(g.value) : fmtValue(kpi, g.value);
          return base;
        }

        if (kpi.kind === "avg_weighted") {
          base.Weight = fmtPlain(g._w);
          base.Value = fmtValue(kpi, g.value);
          return base;
        }

        base.Value = fmtValue(kpi, g.value);
        base.Share = visibleTotal
          ? `${((Number(g.value ?? 0) / visibleTotal) * 100).toFixed(1)}%`
          : "-";
        return base;
      });

    if (
      activeBreakdown.groupFields?.includes("Institute") &&
      missingInstituteIds.length &&
      !selectedBucketSet.size
    ) {
      for (const id of missingInstituteIds) {
        const base = {
          Rank: "-",
          Bucket:
            activeBreakdown.groupFields.length > 1
              ? `Data not available > ${instituteName(id)}`
              : instituteName(id),
          Availability: "Data not available",
        };
        for (const col of cols) {
          if (!(col.key in base)) base[col.key] = "-";
        }
        rows.push(base);
      }
    }

    return { columns: cols, rows };
  }, [
    kpi,
    report,
    activeBreakdown,
    trendData,
    visibleGroups,
    topN,
    missingInstituteIds,
    selectedBucketSet,
  ]);

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

  const relatedReports = useMemo(() => {
    const activeFamily = report?.discoveryMeta?.familyId ?? null;
    return reportOptions
      .filter((item) => item.reportId !== report?.reportId)
      .map((item) => {
        let score = 0;
        if (item.domain === report?.domain) score += 6;
        if (item.kpiId === report?.kpiId) score += 4;
        if (item.discoveryMeta?.familyId && item.discoveryMeta.familyId === activeFamily) score += 5;
        if (item.fact === report?.fact) score += 3;
        return { item, score };
      })
      .sort((left, right) => right.score - left.score || String(left.item.name).localeCompare(String(right.item.name)))
      .slice(0, 4)
      .map((entry) => entry.item);
  }, [reportOptions, report]);

  const reportHierarchyMaps = useMemo(
    () => buildReportHierarchyMaps(COMPARE_HIERARCHY),
    [],
  );
  const selectedHierarchyItem = useMemo(
    () =>
      Object.values(reportHierarchyMaps.itemMap).find(
        (item) => item.kpiId === report?.kpiId,
      ) ?? null,
    [reportHierarchyMaps, report?.kpiId],
  );
  const selectedCategoryId =
    selectedHierarchyItem?.moduleId ??
    Object.keys(reportHierarchyMaps.moduleMap)[0] ??
    "";
  const selectedModuleId =
    selectedHierarchyItem?.submoduleId ??
    reportHierarchyMaps.moduleMap[selectedCategoryId]?.submodules?.[0]?.id ??
    "";
  const selectedSheetId =
    selectedHierarchyItem?.sheetId ??
    reportHierarchyMaps.submoduleMap[selectedModuleId]?.sheets?.[0]?.id ??
    "";
  const selectedItemId =
    selectedHierarchyItem?.id ??
    reportHierarchyMaps.sheetMap[selectedSheetId]?.kpis?.[0]?.id ??
    "";
  const reportCategoryOptions = useMemo(
    () =>
      COMPARE_HIERARCHY.map((module) => ({
        value: module.id,
        label: humanizeReportLabel(module.label ?? module.id),
      })),
    [],
  );
  const reportModuleOptions = useMemo(
    () =>
      (reportHierarchyMaps.moduleMap[selectedCategoryId]?.submodules ?? []).map(
        (submodule) => ({
          value: submodule.id,
          label: humanizeReportLabel(submodule.label ?? submodule.id),
        }),
      ),
    [reportHierarchyMaps, selectedCategoryId],
  );
  const reportSheetOptions = useMemo(
    () =>
      (reportHierarchyMaps.submoduleMap[selectedModuleId]?.sheets ?? []).map(
        (sheet) => ({
          value: sheet.id,
          label: humanizeReportLabel(sheet.label ?? sheet.id),
        }),
      ),
    [reportHierarchyMaps, selectedModuleId],
  );
  const reportKpiOptions = useMemo(
    () =>
      (reportHierarchyMaps.sheetMap[selectedSheetId]?.kpis ?? []).map(
        (item) => ({ value: item.id, label: reportItemLabel(item) }),
      ),
    [reportHierarchyMaps, selectedSheetId],
  );

  function changeReportByHierarchyItem(item) {
    if (!item?.kpiId) return;
    const nextReport =
      catalog.find(
        (candidate) =>
          candidate.kpiId === item.kpiId &&
          candidate.reportType === report?.reportType,
      ) ??
      catalog.find(
        (candidate) =>
          candidate.kpiId === item.kpiId && candidate.reportType !== "trend",
      ) ??
      catalog.find((candidate) => candidate.kpiId === item.kpiId);
    if (nextReport) onChangeReport?.(nextReport);
  }

  function changeReportCategory(moduleId) {
    changeReportByHierarchyItem(
      firstReportItemFromModuleEntity(reportHierarchyMaps.moduleMap[moduleId]),
    );
  }

  function changeReportModule(submoduleId) {
    changeReportByHierarchyItem(
      firstReportItemFromSubmoduleEntity(
        reportHierarchyMaps.submoduleMap[submoduleId],
      ),
    );
  }

  function changeReportSheet(sheetId) {
    changeReportByHierarchyItem(
      firstReportItemFromSheetEntity(reportHierarchyMaps.sheetMap[sheetId]),
    );
  }

  function changeReportKpi(itemId) {
    changeReportByHierarchyItem(reportHierarchyMaps.itemMap[itemId]);
  }

  function doDownload(fmt) {
    if (!kpi || !report) return;
    setDownloadMenuOpen(false);
    const filenameBase = `${report.name}`
      .replace(/[^a-z0-9\-_ ]/gi, "")
      .replace(/\s+/g, "_");

    if (fmt === "csv") {
      downloadText(
        `${filenameBase}_${year}.csv`,
        toCsv(detailTable.rows, detailTable.columns),
        "text/csv;charset=utf-8",
      );
      return;
    }
    if (fmt === "xls") {
      downloadExcelHtml(
        `${filenameBase}_${year}.xls`,
        detailTable.columns,
        detailTable.rows,
      );
      return;
    }
    if (fmt === "json") {
      downloadText(
        `${filenameBase}_${year}.json`,
        JSON.stringify(detailTable.rows, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }

    const html = `
      <div style="padding: 18px;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <h1 style="font-size:18px;font-weight:900;">${escHtml(report.name)}</h1>
              <div class="muted" style="font-size:12px;margin-top:4px;">Category: ${escHtml(report.domain)} | Year: ${escHtml(year)}</div>
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
    setYear(
      initialYear ??
        yearsInRange[yearsInRange.length - 1] ??
        YEARS[YEARS.length - 1],
    );
    setTopN(Number(config?.MaxRows ?? 100) > 200 ? 200 : 50);
    setDetailInstituteIds(configuredInstituteIds);
    setActiveBreakdownId(defaultBreakdownId);
    setSelectedBucketNames([]);
    setViewMode(report?.defaultView ?? "table");
  }

  function rankedIitsForDetail(direction = "top") {
    if (!kpi) return [...REPORT_LEGACY_IITS];
    const rows = IITs.map((iit) => {
      const scopedRows = (facts?.[kpi.fact] ?? []).filter(
        (row) =>
          row.InstituteId === iit.id && Number(row.Year ?? 0) === Number(year),
      );
      return { id: iit.id, value: kpiValue(kpi, scopedRows) };
    }).filter(
      (item) => item.value != null && Number.isFinite(Number(item.value)),
    );
    rows.sort((a, b) =>
      direction === "bottom"
        ? Number(a.value) - Number(b.value)
        : Number(b.value) - Number(a.value),
    );
    return rows.slice(0, 10).map((item) => item.id);
  }

  function toggleBucket(bucket) {
    setSelectedBucketNames((prev) =>
      prev.includes(bucket)
        ? prev.filter((item) => item !== bucket)
        : [...prev, bucket],
    );
  }

  function toggleInstitute(iid) {
    if (role === "iit") return;
    setDetailInstituteIds((prev) => {
      const base = prev.length ? prev : IITs.map((item) => item.id);
      const next = base.includes(iid)
        ? base.filter((item) => item !== iid)
        : [...base, iid];
      if (!next.length || next.length === IITs.length) return [];
      return sortReportIitsAlphabetically(next);
    });
  }

  function changeReport(reportId) {
    const next = catalog.find(
      (item) => String(item.reportId) === String(reportId),
    );
    if (next) onChangeReport?.(next);
  }

  function FilterIcon({ tone = "#ffffff" }) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 7h10" stroke={tone} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M4 12h16"
          stroke={tone}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M4 17h7" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  function renderFloatingFilterPanel() {
    const allIitIds = IITs.map((iit) => iit.id);
    const oldKey = REPORT_LEGACY_IITS.join("|");
    const selectedKey = (detailInstituteIds ?? []).join("|");
    const currentInstituteScope =
      role === "iit"
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
      {
        value: "__custom",
        label: detailInstituteIds.length
          ? `${detailInstituteIds.length} selected IITs`
          : "Custom selection",
      },
      ...IITs.map((iit) => ({
        value: iit.id,
        label: instituteShortLabel(iit.id),
      })),
    ];

    function applyInstituteScope(nextValue) {
      if (role === "iit") return;
      if (nextValue === "__all") setDetailInstituteIds([]);
      else if (nextValue === "__old")
        setDetailInstituteIds([...REPORT_LEGACY_IITS]);
      else if (nextValue === "__top")
        setDetailInstituteIds(rankedIitsForDetail("top"));
      else if (nextValue === "__bottom")
        setDetailInstituteIds(rankedIitsForDetail("bottom"));
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
              style={{
                top: "11.75rem",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 text-white"
                style={{ background: "#173f91" }}
              >
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
                    options={reportOptions
                      .slice(0, 200)
                      .map((item) => ({
                        value: String(item.reportId),
                        label: item.name,
                      }))}
                  />
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="Select Year"
                    value={String(year)}
                    onChange={(value) => setYear(Number(value))}
                    options={yearsInRange.map((item) => ({
                      value: String(item),
                      label: String(item),
                    }))}
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
                    <summary className="cursor-pointer text-xs font-extrabold text-slate-700">
                      Select multiple IITs
                    </summary>
                    <div className="mt-3 grid max-h-44 gap-2 overflow-auto">
                      {IITs.map((iit) => {
                        const selected =
                          role === "iit"
                            ? iit.id === instituteId
                            : !detailInstituteIds.length ||
                              detailInstituteIds.includes(iit.id);
                        return (
                          <button
                            key={iit.id}
                            type="button"
                            onClick={() => toggleInstitute(iit.id)}
                            disabled={role === "iit"}
                            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span>{instituteShortLabel(iit.id)}</span>
                            <span
                              className={cx(
                                "h-3 w-3 rounded-sm border",
                                selected
                                  ? "border-blue-700 bg-blue-700"
                                  : "border-slate-300 bg-white",
                              )}
                            />
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
                      label:
                        option.id === "__trend"
                          ? "Year-on-Year Trend"
                          : `${option.label} (${option.variant})`,
                    }))}
                  />
                  {activeBreakdown?.id !== "__trend" && bucketOptions.length ? (
                    <Select
                      label="Filter Visible Value"
                      value={
                        selectedBucketNames.length === 1
                          ? selectedBucketNames[0]
                          : "__all"
                      }
                      onChange={(value) =>
                        setSelectedBucketNames(value === "__all" ? [] : [value])
                      }
                      options={[
                        { value: "__all", label: "All values" },
                        ...bucketOptions
                          .slice(0, 100)
                          .map((bucket) => ({ value: bucket, label: bucket })),
                      ]}
                      className="mt-3"
                    />
                  ) : null}
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Select
                    label="Rows to Show"
                    value={String(topN)}
                    onChange={(value) => setTopN(Number(value))}
                    options={[10, 25, 50, 100, 200].map((item) => ({
                      value: String(item),
                      label: String(item),
                    }))}
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
        reportHierarchyMaps.submoduleMap[selectedHierarchyItem.submoduleId]
          ?.label,
        reportHierarchyMaps.sheetMap[selectedHierarchyItem.sheetId]?.label,
      ]
        .filter(Boolean)
        .map(humanizeReportLabel)
        .join(" > ")
    : report.domain;

  const tableFooterRow =
    activeBreakdown?.id === "__trend"
      ? null
      : (() => {
          const row = Object.fromEntries(
            (detailTable.columns ?? []).map((column) => [column.key, ""]),
          );
          if ("Rank" in row) row.Rank = "";
          if ("Bucket" in row) row.Bucket = "Total";
          if ("Num" in row) row.Num = fmtPlain(parts?.num);
          if ("Den" in row) row.Den = fmtPlain(parts?.den);
          if ("Weight" in row) row.Weight = fmtPlain(parts?.w);
          if ("Value" in row) row.Value = fmtValue(kpi, value);
          if ("Share" in row) row.Share = value == null ? "-" : "100%";
          if ("Availability" in row)
            row.Availability = missingInstituteIds.length
              ? "Partial"
              : rowsYear.length
                ? "Available"
                : "Data not available";
          return row;
        })();

  const insightLead =
    interpretation.find(
      (line) => line && !line.startsWith("What this report is:"),
    ) ??
    interpretation[0] ??
    "AI insight is generated from the selected report data.";

  const detailMeta = report.discoveryMeta ?? {};
  const detailFamilyLabel = detailMeta.familyLabel ?? reportFamilyLabel(reportFamilyForDiscovery(report, kpi, selectedHierarchyItem));
  const detailSourceTable = detailMeta.sourceTable ?? reportHubSourceLabel(kpi);
  const detailGranularity = detailMeta.granularity ?? reportHubGranularity(report, kpi);
  const detailColumnCount = detailMeta.columnsCount ?? reportHubColumnCount(kpi);
  const detailDefinition = detailMeta.summary ?? reportHubDiscoverySummary(report, kpi, selectedHierarchyItem);

  return (
    <div
      className="overflow-hidden rounded-[26px] bg-white shadow-sm"
      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
    >
      <div
        className="border-b border-slate-100 bg-white px-6 py-5"
        data-export-hide="true"
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-black"
              style={{
                color: "#173f91",
                border: "1px solid rgba(23,63,145,0.16)",
              }}
            >
              MIS
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Department of Higher Education
              </div>
              <div className="text-2xl font-black leading-tight text-slate-950">
                IITMIS Reports
              </div>
              <div className="text-sm font-semibold text-slate-500">
                Ministry of Education style analytical reporting
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              Reports <span className="px-1 text-slate-400">›</span>
              <span
                className="rounded-full px-3 py-1 text-white"
                style={{ background: "#173f91" }}
              >
                {report.domain}
              </span>
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
            <div className="min-w-0 text-xl font-black leading-tight">
              {report.name}
            </div>
          </div>

          <div className="relative" data-export-hide="true">
            <button
              type="button"
              onClick={() => setDownloadMenuOpen((value) => !value)}
              className="min-w-[190px] rounded-full bg-white px-5 py-2 text-left text-sm font-extrabold text-slate-950 shadow-sm transition hover:opacity-95"
            >
              <span className="flex items-center justify-between gap-3">
                Download Report <span>⌄</span>
              </span>
            </button>
            {downloadMenuOpen ? (
              <div className="absolute right-0 z-40 mt-1 w-[230px] overflow-hidden border border-slate-300 bg-white shadow-xl">
                <button
                  type="button"
                  onClick={() => doDownload("pdf")}
                  className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-950 hover:bg-slate-50"
                >
                  Download as PDF
                </button>
                <button
                  type="button"
                  onClick={() => doDownload("xls")}
                  className="block w-full bg-[#1d62c7] px-4 py-2.5 text-left text-sm font-semibold text-white"
                >
                  Download as Excel
                </button>
                <button
                  type="button"
                  onClick={() => doDownload("csv")}
                  className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-950 hover:bg-slate-50"
                >
                  Download as CSV
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-b border-blue-100 bg-blue-50/60 px-6 py-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Report category", value: detailFamilyLabel, note: "Discovery category" },
            { label: "Definition", value: detailDefinition, note: "User-facing meaning", wide: true },
            { label: "Scope", value: scopeText, note: `${year} focus year` },
            { label: "Source table", value: detailSourceTable, note: `${detailColumnCount} columns indexed` },
            { label: "Granularity", value: detailGranularity, note: "Lineage kept as provenance" },
          ].map((item) => (
            <div
              key={item.label}
              className={cx(
                "rounded-2xl border border-blue-100 bg-white px-4 py-3",
                item.wide ? "md:col-span-2 xl:col-span-1" : "",
              )}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
              <div className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-950">{item.value}</div>
              <div className="mt-1 text-[11px] font-semibold text-slate-500">{item.note}</div>
            </div>
          ))}
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
                  style={
                    selected
                      ? { background: "#e8e6ff", color: "#173f91" }
                      : { background: "#ffffff", color: "#0f172a" }
                  }
                >
                  {option.id === "__trend"
                    ? "Year-on-Year Trend"
                    : `${option.label} (${option.variant})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-white px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-base font-semibold text-slate-950">
            Showing Results for: <span className="font-black">{scopeText}</span>{" "}
            <span className="px-1">›</span>{" "}
            <span className="font-black">{year}</span>
            {selectedBucketNames.length ? (
              <span>
                {" "}
                <span className="px-1">›</span>{" "}
                <span className="font-black">
                  {selectedBucketNames.length} selected value
                </span>
              </span>
            ) : null}
          </div>
          <div
            className="flex rounded-full bg-slate-50 p-1 shadow-sm"
            data-export-hide="true"
          >
            {[
              { id: "table", label: "▦ Table" },
              { id: "chart", label: "◔ Chart" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setViewMode(item.id)}
                className="rounded-full px-4 py-2 text-sm font-black transition"
                style={
                  viewMode === item.id
                    ? { background: "#e8e6ff", color: "#173f91" }
                    : { color: "#8b8b8b" }
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
          <div className="text-sm font-black text-slate-950">AI Insight</div>
          <div className="mt-1 text-sm font-medium leading-6 text-slate-700">
            {insightLead}
          </div>
        </div>

        {missingInstituteIds.length || !rowsYear.length ? (
          <div
            className="rounded-[14px] px-4 py-3 text-sm font-bold"
            style={{
              background: missingInstituteIds.length
                ? "rgba(254,242,242,0.85)"
                : "rgba(248,250,252,0.95)",
              border: missingInstituteIds.length
                ? "1px solid rgba(248,113,113,0.38)"
                : "1px solid rgba(148,163,184,0.28)",
              color: missingInstituteIds.length ? "#991b1b" : "#475569",
            }}
          >
            {dataQualityCopy}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[14px] border border-slate-300 bg-white">
          {viewMode === "table" ? (
            <UdiseReportTable
              columns={detailTable.columns}
              rows={detailTable.rows}
              footerRow={tableFooterRow}
              hiddenKeys={["Rank"]}
              maxHeight={560}
            />
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

        <details className="rounded-[18px] border border-sky-100 bg-sky-50/50 p-4">
          <summary
            className="cursor-pointer text-sm font-black"
            style={{ color: "#173f91" }}
          >
            Full AI report interpretation and data notes
          </summary>
          <div className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {breadcrumbTrail}
          </div>
          <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700">
            {interpretation.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-slate-500">
            Evidence (demo):{" "}
            {EVIDENCE_LINKS.map((item) => item.label).join(" | ")}
          </div>
        </details>

        {relatedReports.length ? (
          <div className="rounded-[18px] border border-blue-100 bg-blue-50/40 p-4" data-export-hide="true">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">Related reports</div>
                <div className="text-xs font-semibold text-slate-500">Cross-links help users discover nearby reports without going back to the hierarchy.</div>
              </div>
              <button type="button" onClick={onBack} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-blue-700">Back to discovery</button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {relatedReports.map((item) => (
                <button
                  key={item.reportId}
                  type="button"
                  onClick={() => onChangeReport?.(item)}
                  className="rounded-2xl border border-blue-100 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-700">{item.discoveryMeta?.familyLabel ?? item.domain}</div>
                  <div className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-950">{item.name}</div>
                  <div className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.discoveryMeta?.summary ?? item.originalName ?? "Open related report"}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {renderFloatingFilterPanel()}
    </div>
  );
}

const REPORTS_PAGE_SIZE = 6;
const REPORT_HUB_SORT_OPTIONS = [
  { value: "relevance", label: "Sort: Relevance" },
  { value: "name", label: "Sort: Report Name" },
  { value: "module", label: "Sort: Module" },
  { value: "type", label: "Sort: View Type" },
  { value: "updated", label: "Sort: Latest Data" },
  { value: "used", label: "Sort: Frequently Used" },
];

const REPORT_DISCOVERY_FAMILIES = [
  {
    id: "all",
    label: "All",
    hint: "Search the complete governed report catalogue",
    tone: "#1d4ed8",
  },
  {
    id: "student",
    label: "Student Intake & Diversity",
    hint: "Admissions, enrolment, diversity, and student composition",
    tone: "#7c3aed",
  },
  {
    id: "faculty",
    label: "Faculty & Staffing",
    hint: "Faculty strength, vacancy, staffing, and teaching capacity",
    tone: "#0f766e",
  },
  {
    id: "research",
    label: "Research & Innovation",
    hint: "Publications, patents, grants, and research output",
    tone: "#16a34a",
  },
  {
    id: "infrastructure",
    label: "Infrastructure & Finance",
    hint: "Budget, utilisation, labs, hostels, and capacity",
    tone: "#b45309",
  },
  {
    id: "governance",
    label: "Governance & Compliance",
    hint: "Rankings, accreditation, audit, legal, and grievance reports",
    tone: "#1d4ed8",
  },
  {
    id: "placement",
    label: "Placements & Outcomes",
    hint: "Placement rate, CTC, outcomes, and career trends",
    tone: "#db2777",
  },
];

const REPORT_DISCOVERY_SUGGESTIONS = [
  "female student trend",
  "faculty vacancy by institute",
  "research funding source mix",
  "ranking trajectory",
  "hostel capacity",
  "audit observations open",
];

const REPORT_HUB_PRIORITY = [
  { kpiId: "kpi_inst_profile_mix", reportType: "trend" },
  { kpiId: "kpi_inst_profile_mix", breakdownField: "Institute" },
  { kpiId: "kpi_inst_profile_mix", breakdownField: "DegreeCategory" },
  { kpiId: "kpi_psl_placement_statistics", reportType: "trend" },
  { kpiId: "kpi_placement_rate", reportType: "trend" },
  { kpiId: "kpi_inst_program_portfolio", breakdownField: "ModeOfDelivery" },
  { kpiId: "kpi_inst_program_portfolio", breakdownField: "Department" },
  { kpiId: "kpi_inst_program_portfolio", breakdownField: "Degree" },
  { kpiId: "kpi_outreach_events", reportType: "trend" },
  { kpiId: "kpi_outreach_students", reportType: "breakdown" },
];

function reportHubPriority(report) {
  const index = REPORT_HUB_PRIORITY.findIndex((item) => {
    if (item.kpiId && item.kpiId !== report?.kpiId) return false;
    if (item.reportType && item.reportType !== report?.reportType) return false;
    if (item.breakdownField && item.breakdownField !== report?.breakdownField)
      return false;
    return true;
  });
  return index >= 0 ? index : 1000;
}

function normalizeDiscoveryText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function reportFamilyForDiscovery(report, kpi, hierarchyItem) {
  const text = normalizeDiscoveryText(
    `${report?.name ?? ""} ${report?.domain ?? ""} ${kpi?.label ?? ""} ${kpi?.fact ?? ""} ${hierarchyItem?.sheetLabel ?? ""} ${hierarchyItem?.submoduleLabel ?? ""}`,
  );
  if (/placement|ctc|career|outcome|recruit/.test(text)) return "placement";
  if (/faculty|staff|teaching|vacancy|recruitment/.test(text)) return "faculty";
  if (
    /research|publication|patent|grant|innovation|phd|doctoral|startup|ipr/.test(
      text,
    )
  )
    return "research";
  if (
    /budget|finance|fund|expenditure|utilisation|utilization|infrastructure|hostel|lab|capacity|asset|estate/.test(
      text,
    )
  )
    return "infrastructure";
  if (
    /audit|legal|court|grievance|ranking|accreditation|governance|quality|qa|iqac|compliance/.test(
      text,
    )
  )
    return "governance";
  if (
    /student|enrol|enroll|admission|intake|gender|category|diversity|international/.test(
      text,
    )
  )
    return "student";
  return "governance";
}

function reportFamilyLabel(familyId) {
  return (
    REPORT_DISCOVERY_FAMILIES.find((item) => item.id === familyId)?.label ??
    "Institutional Reports"
  );
}

function reportFamilyTone(familyId) {
  return (
    REPORT_DISCOVERY_FAMILIES.find((item) => item.id === familyId)?.tone ??
    "#1d4ed8"
  );
}

function shortKpiLabel(label) {
  return humanizeReportLabel(label ?? "Metric")
    .replace(/\s*\(Legacy\)\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function reportHubDiscoveryTitle(report, kpi, hierarchyItem) {
  const base = shortKpiLabel(kpi?.label ?? report?.name ?? "Report");
  const breakdown = humanizeReportLabel(report?.breakdownLabel ?? "");
  const sheet = humanizeReportLabel(hierarchyItem?.sheetLabel ?? "");
  const text = normalizeDiscoveryText(
    `${base} ${breakdown} ${sheet} ${kpi?.fact ?? ""}`,
  );

  if (/audit/.test(text) && /status/.test(text))
    return "Audit Observations by Current Status";
  if (/ranking/.test(text))
    return report?.reportType === "trend"
      ? "Institutional Ranking Trajectory"
      : `Institutional Rankings by ${breakdown || "Scheme"}`;
  if (/accreditation/.test(text))
    return report?.reportType === "trend"
      ? "Accreditation Status Over Time"
      : `Accreditation Records by ${breakdown || "Status"}`;
  if (/grievance/.test(text))
    return report?.reportType === "trend"
      ? "Grievance Resolution Trend"
      : `Grievance Resolution by ${breakdown || "Status"}`;
  if (/female|gender|diversity/.test(text))
    return report?.reportType === "trend"
      ? "Student Diversity Trend"
      : `Student Diversity by ${breakdown || "Group"}`;
  if (/total students|enrol|enroll|intake/.test(text))
    return report?.reportType === "trend"
      ? "Student Intake and Enrolment Trend"
      : `Student Intake by ${breakdown || "Institute"}`;
  if (/international students/.test(text))
    return report?.reportType === "trend"
      ? "International Student Trend"
      : `International Students by ${breakdown || "Level"}`;
  if (/faculty|staff/.test(text))
    return report?.reportType === "trend"
      ? "Faculty and Staffing Trend"
      : `Faculty and Staffing by ${breakdown || "Institute"}`;
  if (/publication/.test(text))
    return report?.reportType === "trend"
      ? "Research Publications Over Time"
      : `Research Publications by ${breakdown || "Discipline"}`;
  if (/patent/.test(text))
    return report?.reportType === "trend"
      ? "Patent and IPR Trend"
      : `Patent and IPR by ${breakdown || "Status"}`;
  if (/budget|finance|fund|expenditure/.test(text))
    return report?.reportType === "trend"
      ? "Finance and Budget Utilisation Trend"
      : `Finance and Budget by ${breakdown || "Head"}`;
  if (/hostel|infrastructure|lab|capacity/.test(text))
    return report?.reportType === "trend"
      ? "Infrastructure Capacity Trend"
      : `Infrastructure Capacity by ${breakdown || "Institute"}`;
  if (/placement rate/.test(text))
    return report?.reportType === "trend"
      ? "Placement Rate Trend"
      : `Placement Rate by ${breakdown || "Program"}`;
  if (/placement/.test(text))
    return report?.reportType === "trend"
      ? "Placement Statistics Trend"
      : `Placement Statistics by ${breakdown || "Institute"}`;
  if (
    /academic program|degree portfolio|program portfolio/.test(text) &&
    /mode/.test(text)
  )
    return "Academic Programme Delivery Mode";
  if (
    /academic program|degree portfolio|program portfolio/.test(text) &&
    /department|discipline/.test(text)
  )
    return "Academic Programmes by Department";
  if (/academic program|degree portfolio|program portfolio/.test(text))
    return report?.reportType === "trend"
      ? "Academic Programme Portfolio Over Time"
      : `Academic Programme Portfolio by ${breakdown || "Institute"}`;
  if (/institutional snapshot/.test(text))
    return report?.reportType === "trend"
      ? "Institutional Snapshot Over Time"
      : `Institutional Snapshot by ${breakdown || "Institute"}`;

  if (report?.reportType === "trend") return `${base} Over Time`;
  if (breakdown && !/^institute$/i.test(breakdown))
    return `${base} by ${breakdown}`;
  return `${base} by Institute`;
}

function reportHubDiscoverySummary(report, kpi, hierarchyItem) {
  const family = reportFamilyForDiscovery(report, kpi, hierarchyItem);
  const title = reportHubDiscoveryTitle(report, kpi, hierarchyItem);
  const breakdown = humanizeReportLabel(report?.breakdownLabel ?? "Institute");
  if (family === "student")
    return "Find student intake, composition, diversity, and enrolment movement across institutes, years, and groups.";
  if (family === "faculty")
    return "Review staffing capacity, faculty strength, vacancy patterns, and institute-wise workforce signals.";
  if (family === "research")
    return "Track research output, grants, patents, publications, and innovation indicators with drill-down evidence.";
  if (family === "infrastructure")
    return "Monitor financial utilisation, infrastructure capacity, source rows, and availability across IITs.";
  if (family === "placement")
    return "Compare placement outcomes, rates, salary indicators, and programme-level movement across years.";
  if (family === "governance" && /audit/i.test(title))
    return "See which observations are open, closed, or in progress and who needs to act next.";
  if (family === "governance")
    return "Review governance, compliance, ranking, accreditation, audit, and quality signals with source metadata.";
  return `Explore ${shortKpiLabel(kpi?.label)} by ${breakdown} with report-ready table, chart, and download options.`;
}

function reportHubOutputTypes(report, type) {
  const visual =
    report?.reportType === "trend"
      ? "Trend chart"
      : type?.label === "Distribution"
        ? "Distribution chart"
        : "Breakdown chart";
  return ["Table", visual, "CSV", "PDF-ready"];
}

function reportHubGranularity(report, kpi) {
  const bits = ["Institute", "Year"];
  const breakdown = humanizeReportLabel(report?.breakdownLabel ?? "");
  if (breakdown && !/^year|institute$/i.test(breakdown)) bits.push(breakdown);
  if (/state|location|geograph/i.test(`${breakdown} ${kpi?.label ?? ""}`))
    bits.push("Location");
  return Array.from(new Set(bits)).join(" / ");
}

function reportHubSourceLabel(kpi) {
  return humanizeReportLabel(kpi?.fact ?? "source table");
}

function reportHubColumnCount(kpi) {
  return buildTemplateForFact(kpi?.fact).cols.length;
}

function reportHubAliases(report, kpi, hierarchyItem) {
  const family = reportFamilyForDiscovery(report, kpi, hierarchyItem);
  const common = [
    report?.name,
    kpi?.label,
    kpi?.fact,
    hierarchyItem?.sheetLabel,
    hierarchyItem?.submoduleLabel,
    hierarchyItem?.moduleLabel,
    report?.breakdownLabel,
  ];
  const familyAliases = {
    student: [
      "admission",
      "admissions",
      "enrolment",
      "enrollment",
      "student mix",
      "diversity",
      "gender",
      "category",
      "intake",
    ],
    faculty: [
      "faculty vacancy",
      "staffing",
      "teachers",
      "workforce",
      "teaching load",
      "faculty strength",
    ],
    research: [
      "research funding",
      "publications",
      "patents",
      "innovation",
      "ipr",
      "grants",
      "doctoral",
    ],
    infrastructure: [
      "hostel",
      "capacity",
      "budget",
      "finance",
      "expenditure",
      "utilisation",
      "labs",
    ],
    governance: [
      "ranking",
      "accreditation",
      "audit",
      "legal",
      "grievance",
      "compliance",
      "quality",
    ],
    placement: ["placement", "ctc", "career", "outcomes", "salary", "placed"],
  };
  return [...common, ...(familyAliases[family] ?? [])]
    .filter(Boolean)
    .map(String);
}

function scoreDiscoverySearch(row, query) {
  const q = normalizeDiscoveryText(query);
  if (!q) return 1;
  const tokens = tokenize(q);
  const title = normalizeDiscoveryText(row.name);
  const summary = normalizeDiscoveryText(row.description);
  const aliases = normalizeDiscoveryText((row.aliases ?? []).join(" "));
  const metadata = normalizeDiscoveryText(
    `${row.familyLabel} ${row.moduleLabel} ${row.domainLabel} ${row.sheetPrimary} ${row.sheetSecondary} ${row.sourceTable} ${row.granularity} ${row.outputTypes?.join(" ")}`,
  );
  let score = 0;
  if (title.includes(q)) score += 80;
  if (summary.includes(q)) score += 28;
  if (aliases.includes(q)) score += 34;
  if (metadata.includes(q)) score += 18;
  for (const token of tokens) {
    if (title.includes(token)) score += 16;
    if (aliases.includes(token)) score += 10;
    if (summary.includes(token)) score += 7;
    if (metadata.includes(token)) score += 5;
  }
  if (String(row.report?.reportId ?? "").includes(q)) score += 100;
  return score;
}

function reportHubDisplayModule(report, hierarchyItem, kpi) {
  const submodule = humanizeReportLabel(
    hierarchyItem?.submoduleLabel ?? hierarchyItem?.submodule ?? "",
  );
  const sheet = humanizeReportLabel(
    hierarchyItem?.sheetLabel ?? hierarchyItem?.sheet ?? "",
  );
  const domain = humanizeReportLabel(
    kpi?.module ?? report?.domain ?? "Reports",
  );

  if (/academic programs/i.test(sheet)) return "Academic Programs";
  if (submodule) return submodule;
  return domain;
}

function reportHubSheetParts(report, hierarchyItem, kpi) {
  const sheet = humanizeReportLabel(
    hierarchyItem?.sheetLabel ?? hierarchyItem?.sheet ?? "",
  );
  const kpiLabel = humanizeReportLabel(kpi?.label ?? report?.name ?? "KPI");
  const breakdown = humanizeReportLabel(report?.breakdownLabel ?? "");

  if (report?.reportType === "trend") {
    return {
      primary: sheet || kpiLabel,
      secondary: kpiLabel && kpiLabel !== sheet ? kpiLabel : "",
      multi: false,
    };
  }

  if (breakdown && !/^institute$/i.test(breakdown) && breakdown !== sheet) {
    return { primary: sheet || kpiLabel, secondary: breakdown, multi: true };
  }

  return {
    primary: sheet || kpiLabel,
    secondary: /^institute$/i.test(breakdown) ? "Institute breakdown" : "",
    multi: false,
  };
}

function reportHubDescription(report, kpi, hierarchyItem) {
  const breakdown = humanizeReportLabel(report?.breakdownLabel ?? "");
  const helper = humanizeReportLabel(hierarchyItem?.helper ?? "");
  const label = humanizeReportLabel(kpi?.label ?? "metric");

  if (report?.reportType === "trend") {
    return "Trend visual and summary metrics over time";
  }
  if (/^institute$/i.test(breakdown)) {
    return "Institute-wise breakdown with visuals and numbers";
  }
  if (/degree/i.test(breakdown)) return "Degree category distribution";
  if (/discipline|department/i.test(breakdown))
    return "Distribution across disciplines";
  if (/mode/i.test(breakdown)) return "Comparison by delivery mode";
  if (/state|ut|geograph/i.test(breakdown))
    return "Geographic coverage summary";
  if (helper)
    return helper.length > 78 ? `${helper.slice(0, 76).trim()}...` : helper;
  return `${breakdown || label} distribution and report-ready summary`;
}

function reportHubType(report) {
  const breakdown = String(
    report?.breakdownLabel ?? report?.breakdownField ?? "",
  ).toLowerCase();
  if (report?.reportType === "trend") return { id: "trend", label: "Trend" };
  if (/degree|category|share|status|gender|mode/.test(breakdown))
    return { id: "donut", label: "Distribution" };
  if (/state|ut|records|observation|case/.test(breakdown))
    return { id: "table", label: "Table" };
  return { id: "bar", label: "Breakdown" };
}

function reportHubModuleTone(moduleLabel, domain) {
  const text = `${moduleLabel ?? ""} ${domain ?? ""}`.toLowerCase();
  if (/people|student|placement|alumni/.test(text))
    return { accent: "#7c3aed", soft: "#f1eaff", kind: "people" };
  if (/academic|degree|program|discipline/.test(text))
    return { accent: "#1252a0", soft: "#eaf5ff", kind: "academic" };
  if (/outreach|collaboration|admission|event|international/.test(text))
    return { accent: "#ec4899", soft: "#fdf2f8", kind: "outreach" };
  if (/research|innovation|patent|publication/.test(text))
    return { accent: "#16a34a", soft: "#ecfdf5", kind: "research" };
  if (/finance|infrastructure|budget|fund/.test(text))
    return { accent: "#7c3aed", soft: "#f5f3ff", kind: "finance" };
  return { accent: "#1252a0", soft: "#eaf5ff", kind: "institution" };
}

function ReportHubModuleIcon({ tone }) {
  const common = {
    stroke: tone.accent,
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (tone.kind === "people") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <circle {...common} cx="9" cy="8" r="3" />
        <path {...common} d="M3.5 19c.9-3.4 2.8-5.1 5.5-5.1s4.6 1.7 5.5 5.1" />
        <path {...common} d="M15.5 11.2a2.7 2.7 0 1 0-.2-5.2" />
        <path {...common} d="M17 14c1.9.5 3 2.1 3.5 5" />
      </svg>
    );
  }
  if (tone.kind === "academic") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path {...common} d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" />
        <path {...common} d="M7 11v4.2c1.4 1.5 3.1 2.3 5 2.3s3.6-.8 5-2.3V11" />
        <path {...common} d="M20 9v5" />
      </svg>
    );
  }
  if (tone.kind === "outreach") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path {...common} d="M5 13h3l8 4V7l-8 4H5v2Z" />
        <path {...common} d="M8 13l1.5 5" />
        <path {...common} d="M19 9.5c.8.6 1.2 1.5 1.2 2.5s-.4 1.9-1.2 2.5" />
      </svg>
    );
  }
  if (tone.kind === "research") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path {...common} d="M9 3h6" />
        <path
          {...common}
          d="M10 3v5.5l-4.5 8A3 3 0 0 0 8.1 21h7.8a3 3 0 0 0 2.6-4.5l-4.5-8V3"
        />
        <path {...common} d="M8 15h8" />
      </svg>
    );
  }
  if (tone.kind === "finance") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path {...common} d="M4 19V9" />
        <path {...common} d="M10 19V5" />
        <path {...common} d="M16 19v-8" />
        <path {...common} d="M22 19H2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path {...common} d="M4 20V8l8-4 8 4v12" />
      <path {...common} d="M8 20v-7h8v7" />
      <path {...common} d="M9 9h.01" />
      <path {...common} d="M15 9h.01" />
    </svg>
  );
}

function ReportHubTypeIcon({ type, accent = "#1d4ed8" }) {
  const common = {
    stroke: accent,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (type === "trend") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path {...common} d="M4 18V6" />
        <path {...common} d="M4 18h16" />
        <path {...common} d="M7 15l3.5-4 3 2.4L18 8" />
      </svg>
    );
  }
  if (type === "donut") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path {...common} d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
        <path {...common} d="M14 3.25A9 9 0 0 1 20.75 10H14V3.25Z" />
      </svg>
    );
  }
  if (type === "table") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <rect x="4" y="5" width="16" height="14" rx="2" {...common} />
        <path {...common} d="M4 10h16M4 15h16M10 5v14" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path {...common} d="M5 19V9" />
      <path {...common} d="M12 19V5" />
      <path {...common} d="M19 19v-7" />
    </svg>
  );
}

function ReportHubSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m16.2 16.2 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReportHubFilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 6h16l-6.2 7.1V19l-3.6 1.5v-7.4L4 6Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReportHubSparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.3 4.2L17.5 8l-4.2 1.3L12 13.5l-1.3-4.2L6.5 8l4.2-1.3L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 13l.8 2.3 2.2.7-2.2.7-.8 2.3-.8-2.3-2.2-.7 2.2-.7.8-2.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 13l.7 1.8L8 15.5l-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReportHubEyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function ReportHubDownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 4v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m8 10 4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SortGlyph() {
  return (
    <span className="ml-1 align-middle text-[10px] font-black text-[#85a1c7]">
      ↕
    </span>
  );
}

function slugFileName(value) {
  const slug = String(value ?? "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return slug || "report";
}
export default function ReportsHubPage({
  facts,
  config,
  accent: dashboardAccent,
  role,
  instituteId,
  onOpenFilters,
  onOpenSource,
  onOpenInstructions,
  onBack,
  focusKpiId,
  autoOpenKey = 0,
}) {
  const accent = dashboardAccent || "#1d4ed8";
  const [searchTerm, setSearchTerm] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState("relevance");
  const [resultLayout, setResultLayout] = useState("table");
  const [nlDraft, setNlDraft] = useState("");
  const [nlStatus, setNlStatus] = useState("");
  const [askPanelOpen, setAskPanelOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const reportHierarchyMaps = useMemo(
    () => buildReportHierarchyMaps(COMPARE_HIERARCHY),
    [],
  );
  const allReportItems = useMemo(
    () => Object.values(reportHierarchyMaps.itemMap),
    [reportHierarchyMaps],
  );
  const [reportSelection, setReportSelection] = useState(() =>
    makeReportSelectionFromConfig({
      config,
      role,
      instituteId,
      allItems: allReportItems,
    }),
  );
  const [reportFilterModalOpen, setReportFilterModalOpen] = useState(false);

  useEffect(() => {
    setReportSelection(
      makeReportSelectionFromConfig({
        config,
        role,
        instituteId,
        allItems: allReportItems,
      }),
    );
  }, [config, role, instituteId, allReportItems]);

  function updateReportSelectionSource(updater) {
    setReportSelection((prev) =>
      normalizeReportSelection(
        typeof updater === "function" ? updater(prev) : updater,
        role,
        instituteId,
      ),
    );
  }

  function applyReportItemSelection(itemId) {
    const item = reportHierarchyMaps.itemMap[itemId];
    if (!item) return;
    setReportSelection((prev) =>
      reportSelectionFromItem(item, prev, role, instituteId),
    );
  }

  function toggleReportModule(moduleId) {
    const item = firstReportItemFromModuleEntity(
      reportHierarchyMaps.moduleMap[moduleId],
    );
    if (item?.id) applyReportItemSelection(item.id);
  }

  function toggleReportSubmodule(submoduleId) {
    const item = firstReportItemFromSubmoduleEntity(
      reportHierarchyMaps.submoduleMap[submoduleId],
    );
    if (item?.id) applyReportItemSelection(item.id);
  }

  function toggleReportSheet(sheetId) {
    const item = firstReportItemFromSheetEntity(
      reportHierarchyMaps.sheetMap[sheetId],
    );
    if (item?.id) applyReportItemSelection(item.id);
  }

  function rankedIitsForReportSelection(direction = "top") {
    const selectedKpiId =
      reportSelection.kpiIds?.[0] ??
      reportHierarchyMaps.itemMap[reportSelection.items?.[0]]?.kpiId;
    const selectedKpi =
      KPI_DEFS.find((item) => item.id === selectedKpiId) ?? KPI_DEFS[0];
    if (!selectedKpi) return [...REPORT_LEGACY_IITS];
    const rankingYear = Number(
      reportSelection.focusYear ??
        reportSelection.yearTo ??
        YEARS[YEARS.length - 1],
    );
    const rows = IITs.map((iit) => {
      const scopedRows = (facts?.[selectedKpi.fact] ?? []).filter(
        (row) =>
          row.InstituteId === iit.id && Number(row.Year ?? 0) === rankingYear,
      );
      return { id: iit.id, value: kpiValue(selectedKpi, scopedRows) };
    }).filter(
      (item) => item.value != null && Number.isFinite(Number(item.value)),
    );
    rows.sort((a, b) =>
      direction === "bottom"
        ? Number(a.value) - Number(b.value)
        : Number(b.value) - Number(a.value),
    );
    return rows.slice(0, 10).map((item) => item.id);
  }

  const scopedInstituteIds = useMemo(() => {
    if (role === "iit") return [instituteId].filter(Boolean);
    if (reportSelection.iits?.length) return reportSelection.iits;
    return getScopeInstituteIds({ role, instituteId, config });
  }, [role, instituteId, reportSelection.iits, config]);
  const scopeText = useMemo(
    () => instituteLabel(scopedInstituteIds),
    [scopedInstituteIds],
  );

  const yrFrom = Number(
    reportSelection.yearFrom ??
      Math.min(
        config?.YearRange?.from ?? YEARS[0],
        config?.YearRange?.to ?? YEARS[YEARS.length - 1],
      ),
  );
  const yrTo = Number(
    reportSelection.yearTo ??
      Math.max(
        config?.YearRange?.from ?? YEARS[0],
        config?.YearRange?.to ?? YEARS[YEARS.length - 1],
      ),
  );
  const yearsInRange = useMemo(
    () => YEARS.filter((y) => y >= yrFrom && y <= yrTo),
    [yrFrom, yrTo],
  );

  const activeKpiSet = useMemo(() => {
    const configIds = config?.KpiIds ?? [];
    const selectionIds = reportSelection?.kpiIds ?? [];
    const configSet = configIds.length ? new Set(configIds) : null;
    const selectionSet = selectionIds.length ? new Set(selectionIds) : null;
    return selectionSet ?? configSet;
  }, [config, reportSelection?.kpiIds]);

  const catalog = useMemo(() => {
    const kpis = activeKpiSet
      ? KPI_DEFS.filter((k) => activeKpiSet.has(k.id))
      : KPI_DEFS;
    return buildReportCatalog(kpis);
  }, [activeKpiSet]);

  const [usage, setUsage] = useState(() => safeGetUsage());
  function bumpUsage(reportId) {
    setUsage((prev) => {
      const next = { ...prev, [reportId]: Number(prev?.[reportId] ?? 0) + 1 };
      safeSetUsage(next);
      return next;
    });
  }

  const [activeReport, setActiveReport] = useState(null);
  const [reportInitialYear, setReportInitialYear] = useState(null);

  useEffect(() => {
    if (!focusKpiId || !autoOpenKey) return;
    const first =
      catalog.find(
        (item) => item.kpiId === focusKpiId && item.reportType !== "trend",
      ) ?? catalog.find((item) => item.kpiId === focusKpiId);
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

  function changeActiveReport(nextReport) {
    if (!nextReport) return;
    bumpUsage(nextReport.reportId);
    setReportInitialYear(null);
    setActiveReport(nextReport);
  }

  function runNaturalLanguageReport() {
    const discoveryCatalog = hubRows.length
      ? hubRows.map((row) => row.report)
      : catalog;
    const resolved = resolveNaturalLanguageReport({
      text: nlDraft,
      catalog: discoveryCatalog,
      yearsInRange,
    });
    setNlStatus(resolved.reason ?? "");
    if (resolved.report) openReport(resolved.report, resolved.year);
  }

  const reportCarouselCategoryItems = useMemo(
    () =>
      COMPARE_HIERARCHY.map((module) => ({
        id: module.id,
        label: humanizeReportLabel(module.label ?? module.id),
        tooltip: humanizeReportLabel(
          module.description ?? module.label ?? module.id,
        ),
      })),
    [],
  );

  const reportCarouselModuleItems = useMemo(() => {
    const sourceModules = (reportSelection.modules ?? [])
      .map((id) => reportHierarchyMaps.moduleMap[id])
      .filter(Boolean);
    return sourceModules.flatMap((module) =>
      (module.submodules ?? []).map((submodule) => ({
        id: submodule.id,
        label: humanizeReportLabel(submodule.label ?? submodule.id),
        tooltip: `${humanizeReportLabel(module.label ?? module.id)} > ${humanizeReportLabel(submodule.label ?? submodule.id)}`,
      })),
    );
  }, [reportSelection.modules, reportHierarchyMaps]);

  const reportCarouselSheetItems = useMemo(() => {
    const sourceSubmodules = (reportSelection.submodules ?? [])
      .map((id) => reportHierarchyMaps.submoduleMap[id])
      .filter(Boolean);
    return sourceSubmodules.flatMap((submodule) =>
      (submodule.sheets ?? []).map((sheet) => ({
        id: sheet.id,
        label: humanizeReportLabel(sheet.label ?? sheet.id),
        tooltip: `${humanizeReportLabel(reportHierarchyMaps.moduleMap[submodule.moduleId]?.label ?? submodule.moduleId)} > ${humanizeReportLabel(submodule.label ?? submodule.id)} > ${humanizeReportLabel(sheet.label ?? sheet.id)}`,
      })),
    );
  }, [reportSelection.submodules, reportHierarchyMaps]);

  const reportCarouselKpiItems = useMemo(() => {
    const sourceSheets = (reportSelection.sheets ?? [])
      .map((id) => reportHierarchyMaps.sheetMap[id])
      .filter(Boolean);
    return sourceSheets.flatMap((sheet) =>
      (sheet.kpis ?? []).map((item) => ({
        id: item.id,
        label: reportItemLabel(item),
        tooltip: `${humanizeReportLabel(reportHierarchyMaps.moduleMap[sheet.moduleId]?.label ?? sheet.moduleId)} > ${humanizeReportLabel(reportHierarchyMaps.submoduleMap[sheet.submoduleId]?.label ?? sheet.submoduleId)} > ${humanizeReportLabel(sheet.label ?? sheet.id)} > ${reportItemLabel(item)}`,
      })),
    );
  }, [reportSelection.sheets, reportHierarchyMaps]);

  const hierarchyItemsByKpi = useMemo(() => {
    const map = new Map();
    for (const item of allReportItems) {
      if (!item?.kpiId || map.has(item.kpiId)) continue;
      map.set(item.kpiId, item);
    }
    return map;
  }, [allReportItems]);

  const hubRows = useMemo(() => {
    return catalog.map((report) => {
      const kpi = KPI_DEFS.find((item) => item.id === report.kpiId);
      const hierarchyItem = hierarchyItemsByKpi.get(report.kpiId) ?? null;
      const moduleLabel = reportHubDisplayModule(report, hierarchyItem, kpi);
      const sheetParts = reportHubSheetParts(report, hierarchyItem, kpi);
      const type = reportHubType(report);
      const familyId = reportFamilyForDiscovery(report, kpi, hierarchyItem);
      const familyLabel = reportFamilyLabel(familyId);
      const title = reportHubDiscoveryTitle(report, kpi, hierarchyItem);
      const summary = reportHubDiscoverySummary(report, kpi, hierarchyItem);
      const tone = reportHubModuleTone(moduleLabel, report.domain);
      const sourceTable = reportHubSourceLabel(kpi);
      const aliases = reportHubAliases(report, kpi, hierarchyItem);
      const columnsCount = reportHubColumnCount(kpi);
      const outputTypes = reportHubOutputTypes(report, type);
      const displayReport = {
        ...report,
        name: title,
        originalName: report.name,
        discoveryMeta: {
          title,
          summary,
          familyId,
          familyLabel,
          familyTone: reportFamilyTone(familyId),
          sourceTable,
          outputTypes,
          granularity: reportHubGranularity(report, kpi),
          updateFrequency: "Annual",
          columnsCount,
        },
      };
      return {
        report: displayReport,
        kpi,
        hierarchyItem,
        name: title,
        originalName: report.name,
        description: summary,
        moduleLabel,
        domainLabel: humanizeReportLabel(report.domain),
        sheetPrimary: sheetParts.primary,
        sheetSecondary: sheetParts.secondary,
        sheetMulti: sheetParts.multi,
        familyId,
        familyLabel,
        familyTone: reportFamilyTone(familyId),
        type,
        tone,
        sourceTable,
        columnsCount,
        updateFrequency: "Annual",
        lastUpdated: `Data through ${yrTo}`,
        availableYears: `${yrFrom}-${yrTo}`,
        iitCoverage: `${scopedInstituteIds.length || IITs.length}/${IITs.length} IITs`,
        granularity: reportHubGranularity(report, kpi),
        outputTypes,
        aliases,
        priority: reportHubPriority(report),
        searchText:
          `${title} ${summary} ${aliases.join(" ")} ${report.domain} ${moduleLabel} ${sheetParts.primary} ${sheetParts.secondary} ${report.breakdownLabel ?? ""} ${kpi?.label ?? ""} ${sourceTable}`.toLowerCase(),
      };
    });
  }, [catalog, hierarchyItemsByKpi, yrFrom, yrTo, scopedInstituteIds]);

  const moduleOptions = useMemo(() => {
    const labels = Array.from(
      new Set(hubRows.map((row) => row.moduleLabel).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...labels];
  }, [hubRows]);

  const typeOptions = useMemo(() => {
    const labels = Array.from(
      new Map(hubRows.map((row) => [row.type.id, row.type.label])).entries(),
    );
    return [
      { value: "all", label: "All views" },
      ...labels.map(([value, label]) => ({ value, label })),
    ];
  }, [hubRows]);

  const familyCounts = useMemo(() => {
    const counts = Object.fromEntries(
      REPORT_DISCOVERY_FAMILIES.map((item) => [item.id, 0]),
    );
    counts.all = hubRows.length;
    for (const row of hubRows)
      counts[row.familyId] = Number(counts[row.familyId] ?? 0) + 1;
    return counts;
  }, [hubRows]);

  const visibleRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const rows = hubRows
      .map((row) => ({ ...row, searchScore: scoreDiscoverySearch(row, query) }))
      .filter((row) => {
        const okFamily =
          familyFilter === "all" || row.familyId === familyFilter;
        const okModule =
          moduleFilter === "All" || row.moduleLabel === moduleFilter;
        const okType = typeFilter === "all" || row.type.id === typeFilter;
        const okSearch =
          !query ||
          row.searchScore > 0 ||
          String(row.report.reportId).includes(query);
        return okFamily && okModule && okType && okSearch;
      });

    const sorted = [...rows].sort((left, right) => {
      if (searchTerm.trim()) {
        const searchDelta =
          Number(right.searchScore ?? 0) - Number(left.searchScore ?? 0);
        if (searchDelta) return searchDelta;
      }
      if (sortMode === "used") {
        const usedDelta =
          Number(usage?.[right.report.reportId] ?? 0) -
          Number(usage?.[left.report.reportId] ?? 0);
        if (usedDelta) return usedDelta;
      }
      if (sortMode === "name") return left.name.localeCompare(right.name);
      if (sortMode === "module")
        return (
          left.moduleLabel.localeCompare(right.moduleLabel) ||
          left.name.localeCompare(right.name)
        );
      if (sortMode === "type")
        return (
          left.type.label.localeCompare(right.type.label) ||
          left.name.localeCompare(right.name)
        );
      if (sortMode === "updated")
        return (
          String(right.lastUpdated).localeCompare(String(left.lastUpdated)) ||
          left.name.localeCompare(right.name)
        );

      const priorityDelta = left.priority - right.priority;
      if (priorityDelta) return priorityDelta;
      return (
        left.familyLabel.localeCompare(right.familyLabel) ||
        left.name.localeCompare(right.name)
      );
    });
    return sorted;
  }, [
    hubRows,
    searchTerm,
    familyFilter,
    moduleFilter,
    typeFilter,
    sortMode,
    usage,
  ]);

  const selectionSignature = reportSelectionSignature(reportSelection);
  useEffect(() => {
    setPageIndex(0);
  }, [
    searchTerm,
    familyFilter,
    moduleFilter,
    typeFilter,
    sortMode,
    resultLayout,
    selectionSignature,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleRows.length / REPORTS_PAGE_SIZE),
  );
  useEffect(() => {
    if (pageIndex > totalPages - 1) setPageIndex(totalPages - 1);
  }, [pageIndex, totalPages]);

  const pageStart = pageIndex * REPORTS_PAGE_SIZE;
  const pageRows = visibleRows.slice(pageStart, pageStart + REPORTS_PAGE_SIZE);
  const showingFrom = visibleRows.length ? pageStart + 1 : 0;
  const showingTo = visibleRows.length ? pageStart + pageRows.length : 0;

  function buildHubExportData(report) {
    const kpi = KPI_DEFS.find((item) => item.id === report?.kpiId);
    const exportYear = Number(
      reportSelection.focusYear ?? yrTo ?? YEARS[YEARS.length - 1],
    );
    if (!report || !kpi) return { columns: [], rows: [] };

    if (report.reportType === "trend") {
      const trendRows = trendDataForReport({
        facts,
        report,
        kpi,
        yearsInRange,
        scopedInstituteIds,
      });
      return {
        columns: [
          { key: "Year", label: "Year" },
          { key: "Value", label: kpi.label },
          { key: "YoY", label: "YoY" },
          { key: "Records", label: "Source rows" },
        ],
        rows: trendRows.map((row) => ({
          Year: row.year,
          Value: row.formattedValue,
          YoY: row.formattedYoY,
          Records: row.Records,
        })),
      };
    }

    const rows = rowsForYear({
      facts,
      report,
      year: exportYear,
      scopedInstituteIds,
    });
    const groups = computeGroupMetrics(kpi, rows, [
      report.breakdownField ?? "Institute",
    ]).slice(0, Number(config?.MaxRows ?? 1000));
    return {
      columns: [
        { key: "Rank", label: "Rank" },
        { key: "Breakdown", label: report.breakdownLabel ?? "Breakdown" },
        { key: "Value", label: kpi.label },
        { key: "Records", label: "Source rows" },
        { key: "Year", label: "Year" },
      ],
      rows: groups.map((row, index) => ({
        Rank: index + 1,
        Breakdown: row.name,
        Value: fmtValue(kpi, row.value),
        Records: row._records,
        Year: exportYear,
      })),
    };
  }

  function downloadHubReport(row) {
    const { columns, rows } = buildHubExportData(row.report);
    const metadata = [
      { Field: "Report", Value: row.name },
      { Field: "Module", Value: row.moduleLabel },
      {
        Field: "Sheet / KPI",
        Value: [row.sheetPrimary, row.sheetSecondary]
          .filter(Boolean)
          .join(" / "),
      },
      { Field: "Scope", Value: scopeText },
      { Field: "Years", Value: `${yrFrom}-${yrTo}` },
      { Field: "Type", Value: row.type.label },
      { Field: "", Value: "" },
    ];
    const metadataCsv = toCsv(metadata, [
      { key: "Field", label: "Field" },
      { key: "Value", label: "Value" },
    ]);
    const tableCsv = rows.length
      ? toCsv(rows, columns)
      : "No rows available for the selected filters.";
    downloadText(
      `${slugFileName(row.name)}.csv`,
      `${metadataCsv}\n\n${tableCsv}`,
      "text/csv;charset=utf-8",
    );
  }

  function renderReportAdvancedFilterModal() {
    if (!reportFilterModalOpen) return null;

    const activeCategoryId =
      reportSelection.modules?.[0] ?? reportCarouselCategoryItems[0]?.id ?? "";
    const activeModuleId =
      reportSelection.submodules?.[0] ??
      reportHierarchyMaps.moduleMap[activeCategoryId]?.submodules?.[0]?.id ??
      "";
    const activeSheetId =
      reportSelection.sheets?.[0] ??
      reportHierarchyMaps.submoduleMap[activeModuleId]?.sheets?.[0]?.id ??
      "";
    const activeItemId =
      reportSelection.items?.[0] ??
      reportHierarchyMaps.sheetMap[activeSheetId]?.kpis?.[0]?.id ??
      "";
    const categoryOptions = reportCarouselCategoryItems.map((item) => ({
      value: item.id,
      label: item.label,
    }));
    const moduleOptionsInner = (
      reportHierarchyMaps.moduleMap[activeCategoryId]?.submodules ?? []
    ).map((item) => ({
      value: item.id,
      label: humanizeReportLabel(item.label ?? item.id),
    }));
    const sheetOptions = (
      reportHierarchyMaps.submoduleMap[activeModuleId]?.sheets ?? []
    ).map((item) => ({
      value: item.id,
      label: humanizeReportLabel(item.label ?? item.id),
    }));
    const kpiOptions = (
      reportHierarchyMaps.sheetMap[activeSheetId]?.kpis ?? []
    ).map((item) => ({ value: item.id, label: reportItemLabel(item) }));
    const allIitIds = IITs.map((iit) => iit.id);
    const selectedIitCount = reportSelection.iits.filter((iid) =>
      allIitIds.includes(iid),
    ).length;
    const allIitsSelected =
      selectedIitCount === allIitIds.length && allIitIds.length > 0;
    const someIitsSelected = selectedIitCount > 0 && !allIitsSelected;

    const SelectAllIitsButton = () => (
      <button
        type="button"
        onClick={() =>
          updateReportSelectionSource((prev) => ({
            ...prev,
            iits: allIitsSelected ? [] : allIitIds,
          }))
        }
        disabled={role === "iit"}
        className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-checked={someIitsSelected ? "mixed" : allIitsSelected}
        role="checkbox"
      >
        <span
          className="grid h-4 w-4 place-items-center rounded border text-[11px] leading-none"
          style={{
            borderColor:
              allIitsSelected || someIitsSelected ? "#1d4ed8" : "#94a3b8",
            background:
              allIitsSelected || someIitsSelected ? "#1d4ed8" : "#ffffff",
            color:
              allIitsSelected || someIitsSelected ? "#ffffff" : "transparent",
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
            <div>
              <div className="text-[1.25rem] font-extrabold text-slate-900">
                Advanced report filters
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-500">
                Choose KPI, reporting period, and IIT coverage for the report
                table.
              </div>
            </div>
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
                  <div className="text-[1.02rem] font-extrabold text-slate-900">
                    Select KPI
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateReportSelectionSource({
                        modules: [],
                        submodules: [],
                        sheets: [],
                        items: [],
                        kpiIds: [],
                        iits: reportSelection.iits,
                        yearFrom: reportSelection.yearFrom,
                        yearTo: reportSelection.yearTo,
                        focusYear: reportSelection.focusYear,
                      })
                    }
                    className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select
                    label="Category"
                    value={activeCategoryId}
                    onChange={toggleReportModule}
                    options={
                      categoryOptions.length
                        ? categoryOptions
                        : [{ value: "", label: "No category available" }]
                    }
                    disabled={!categoryOptions.length}
                  />
                  <Select
                    label="Module"
                    value={activeModuleId}
                    onChange={toggleReportSubmodule}
                    options={
                      moduleOptionsInner.length
                        ? moduleOptionsInner
                        : [{ value: "", label: "Select category first" }]
                    }
                    disabled={!moduleOptionsInner.length}
                  />
                  <Select
                    label="Sheet"
                    value={activeSheetId}
                    onChange={toggleReportSheet}
                    options={
                      sheetOptions.length
                        ? sheetOptions
                        : [{ value: "", label: "Select module first" }]
                    }
                    disabled={!sheetOptions.length}
                  />
                  <Select
                    label="KPI"
                    value={activeItemId}
                    onChange={applyReportItemSelection}
                    options={
                      kpiOptions.length
                        ? kpiOptions
                        : [{ value: "", label: "Select sheet first" }]
                    }
                    disabled={!kpiOptions.length}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">
                    Select Date
                  </div>
                  <ReportDateSelector
                    source={reportSelection}
                    updateSource={updateReportSelectionSource}
                    years={YEARS}
                    accent={accent}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">
                    Select IITs
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <SelectAllIitsButton />
                        <button
                          type="button"
                          onClick={() =>
                            updateReportSelectionSource((prev) => ({
                              ...prev,
                              iits: [],
                            }))
                          }
                          disabled={role === "iit"}
                          className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <ReportSelectionActionButton
                          label="OLD IITs"
                          onClick={() =>
                            updateReportSelectionSource((prev) => ({
                              ...prev,
                              iits: [...REPORT_LEGACY_IITS],
                            }))
                          }
                          disabled={role === "iit"}
                        />
                        <ReportSelectionActionButton
                          label="Top 10 by KPI"
                          onClick={() =>
                            updateReportSelectionSource((prev) => ({
                              ...prev,
                              iits: rankedIitsForReportSelection("top"),
                            }))
                          }
                          disabled={role === "iit"}
                        />
                        <ReportSelectionActionButton
                          label="Bottom 10 by KPI"
                          onClick={() =>
                            updateReportSelectionSource((prev) => ({
                              ...prev,
                              iits: rankedIitsForReportSelection("bottom"),
                            }))
                          }
                          disabled={role === "iit"}
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {IITs.map((iit) => (
                        <ReportFilterChoiceChip
                          key={iit.id}
                          label={instituteShortLabel(iit.id)}
                          active={reportSelection.iits.includes(iit.id)}
                          onClick={() =>
                            updateReportSelectionSource((prev) => ({
                              ...prev,
                              iits: prev.iits.includes(iit.id)
                                ? prev.iits.filter((item) => item !== iit.id)
                                : sortReportIitsAlphabetically([
                                    ...prev.iits,
                                    iit.id,
                                  ]),
                            }))
                          }
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
            <button
              type="button"
              onClick={() => setReportFilterModalOpen(false)}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setReportFilterModalOpen(false)}
              className="rounded-2xl bg-[#3ac778] px-5 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeReport) {
    return (
      <ReportDetailPage
        report={activeReport}
        catalog={hubRows.map((row) => row.report)}
        facts={facts}
        config={{
          ...config,
          InstituteId: scopedInstituteIds,
          YearRange: { from: yrFrom, to: yrTo },
        }}
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
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[2rem] font-black leading-tight tracking-[-0.03em] text-slate-950">
            IITMIS Report Discovery
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
          </p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="self-start rounded-2xl px-4 py-2 text-sm font-extrabold transition hover:-translate-y-0.5 hover:opacity-90 md:self-auto"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(59,130,246,0.18)",
              color: "#1252a0",
            }}
          >
            ← Back
          </button>
        ) : null}
      </div>

      <div
        className="overflow-hidden rounded-[26px] border bg-white shadow-[0_18px_42px_rgba(37,99,235,0.08)]"
        style={{ borderColor: "rgba(59,130,246,0.16)" }}
      >
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_480px]">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Search → report category → view
              </div>
              <div className="mt-1 text-lg font-black text-slate-950">
                Find the report you need by topic, KPI, module or keyword
              </div>
            </div>
            <label className="relative block">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                <ReportHubSearchIcon />
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search all reports, sheets, KPIs, modules, source tables, and keywords"
                className="h-16 w-full rounded-2xl border bg-white pl-14 pr-4 text-[15px] font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                style={{ borderColor: "rgba(59,130,246,0.22)" }}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Try
              </span>
              {REPORT_DISCOVERY_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSearchTerm(item)}
                  className="rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Reports indexed",
                value: catalog.length,
                note: "from registry + KPI catalogue",
              },
              {
                label: "Report categories",
                value: REPORT_DISCOVERY_FAMILIES.length - 1,
                note: "topic-led discovery",
              },
              { label: "Latest data", value: yrTo, note: "visible report set" },
              {
                label: "Source tables",
                value: new Set(hubRows.map((row) => row.sourceTable)).size,
                note: "machine-readable backbone",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {card.label}
                </div>
                <div className="mt-1 text-2xl font-black text-slate-950">
                  {card.value}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-slate-500">
                  {card.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-blue-100 bg-slate-50/70 px-5 py-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-slate-950">
                Explore by topic
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Browse popular analytical themes
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {REPORT_DISCOVERY_FAMILIES.map((family) => {
              const active = familyFilter === family.id;
              const count = familyCounts[family.id] ?? 0;
              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => setFamilyFilter(family.id)}
                  className="min-h-[88px] rounded-2xl border bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: active ? family.tone : "rgba(59,130,246,0.16)",
                    boxShadow: active
                      ? "0 12px 28px rgba(37,99,235,0.10)"
                      : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-black leading-4 text-slate-950">
                      {family.label}
                    </div>
                    <div
                      className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black"
                      style={{ color: family.tone }}
                    >
                      {count}
                    </div>
                  </div>
                  <div className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-slate-500">
                    {family.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="rounded-[22px] border bg-white/95 p-4 shadow-[0_12px_34px_rgba(37,99,235,0.06)]"
        style={{ borderColor: "rgba(59,130,246,0.14)" }}
      >
        <div className="grid gap-3 xl:grid-cols-[minmax(180px,1fr)_180px_170px_170px_170px_220px]">
          <select
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            className="h-12 rounded-xl border bg-white px-4 text-sm font-extrabold text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            style={{ borderColor: "rgba(59,130,246,0.18)" }}
            aria-label="Filter reports by module"
          >
            {moduleOptions.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All modules" : item}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-12 rounded-xl border bg-white px-4 text-sm font-extrabold text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            style={{ borderColor: "rgba(59,130,246,0.18)" }}
            aria-label="Filter reports by output view"
          >
            {typeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="h-12 rounded-xl border bg-white px-4 text-sm font-extrabold text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            style={{ borderColor: "rgba(59,130,246,0.18)" }}
            aria-label="Sort reports"
          >
            {REPORT_HUB_SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="flex h-12 rounded-xl border border-blue-100 bg-slate-50 p-1">
            {[
              { id: "cards", label: "Cards" },
              { id: "table", label: "Table" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setResultLayout(item.id)}
                className="flex-1 rounded-lg text-xs font-black transition"
                style={
                  resultLayout === item.id
                    ? { background: "#1d4ed8", color: "#ffffff" }
                    : { color: "#475569" }
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setReportFilterModalOpen(true)}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border bg-white px-4 text-sm font-extrabold text-[#1252a0] transition hover:-translate-y-0.5 hover:bg-blue-50"
            style={{ borderColor: "rgba(59,130,246,0.18)" }}
          >
            <ReportHubFilterIcon />
            More filters
          </button>

          <button
            type="button"
            onClick={() => setAskPanelOpen((value) => !value)}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border px-4 text-left text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50"
            style={{
              borderColor: "rgba(59,130,246,0.18)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.92))",
            }}
          >
            <span className="text-[#1d4ed8]">
              <ReportHubSparkIcon />
            </span>
            <span className="leading-tight">
              Can’t find a report?
              <br />
              <span className="text-[#1d4ed8]">Ask AI to suggest one</span>
            </span>
          </button>
        </div>

        {askPanelOpen ? (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-slate-950">
                  Ask for a report in plain language
                </div>
                <input
                  value={nlDraft}
                  onChange={(event) => setNlDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runNaturalLanguageReport();
                  }}
                  placeholder="Example: show faculty vacancy by institute or research funding trend"
                  className="mt-2 h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={runNaturalLanguageReport}
                className="h-11 rounded-xl px-5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
                style={{ background: accent }}
              >
                Suggest report
              </button>
            </div>
            {nlStatus ? (
              <div className="mt-2 text-xs font-semibold text-slate-500">
                {nlStatus}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {renderReportAdvancedFilterModal()}

      <div
        className="overflow-hidden rounded-[22px] border bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
        style={{ borderColor: "rgba(59,130,246,0.14)" }}
      >
        <div
          className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(226,232,240,0.95)" }}
        >
          <div>
            <div className="text-sm font-black text-slate-950">
              Search results
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing {showingFrom} to {showingTo} of {visibleRows.length}{" "}
              reports · {scopeText}, {yrFrom}-{yrTo}
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Lineage is shown as provenance, not as the main navigation path.
          </div>
        </div>

        {resultLayout === "cards" ? (
          <div className="grid gap-4 p-5 lg:grid-cols-2 2xl:grid-cols-3">
            {pageRows.length ? (
              pageRows.map((row) => (
                <article
                  key={row.report.reportId}
                  className="flex min-h-[300px] flex-col rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-black"
                      style={{
                        color: row.familyTone,
                        background: `${row.familyTone}14`,
                      }}
                    >
                      {row.familyLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReport(row.report)}
                    className="mt-3 text-left text-lg font-black leading-6 text-slate-950 transition hover:text-blue-700"
                  >
                    {row.name}
                  </button>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                    {row.description}
                  </p>

                  <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>
                        <b className="text-slate-900">Collection:</b>{" "}
                        {row.domainLabel} · {row.moduleLabel}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>
                        <b className="text-slate-900">Matching indicators:</b>{" "}
                        {row.sheetPrimary}
                        {row.sheetSecondary ? ` / ${row.sheetSecondary}` : ""}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>
                        <b className="text-slate-900">Granularity:</b>{" "}
                        {row.granularity}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>
                        <b className="text-slate-900">Source:</b>{" "}
                        {row.sourceTable} · {row.columnsCount} columns ·{" "}
                        {row.updateFrequency}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {row.outputTypes.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="text-xs font-semibold text-slate-500">
                      {row.availableYears} · {row.iitCoverage}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openReport(row.report)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-white px-4 text-xs font-black text-[#1d4ed8] transition hover:-translate-y-0.5 hover:bg-blue-50"
                        style={{ borderColor: "rgba(37,99,235,0.35)" }}
                      >
                        <ReportHubEyeIcon />
                        Open report
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadHubReport(row)}
                        className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-[#1d4ed8] transition hover:-translate-y-0.5 hover:bg-blue-50"
                        style={{ borderColor: "rgba(37,99,235,0.35)" }}
                        title="Download CSV"
                        aria-label={`Download ${row.name}`}
                      >
                        <ReportHubDownloadIcon />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full px-6 py-16 text-center">
                <div className="text-base font-black text-slate-800">
                  No reports match your filters.
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-500">
                  Try a broader search term, switch to All, or use Ask AI to
                  suggest a report.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead>
                <tr
                  className="border-b bg-slate-50"
                  style={{ borderColor: "rgba(148,163,184,0.28)" }}
                >
                  <th className="w-[72px] px-5 py-5 text-left text-xs font-black text-slate-950">
                    S.No
                  </th>
                  <th className="px-5 py-5 text-left text-xs font-black text-slate-950">
                    Report
                  </th>
                  <th className="px-5 py-5 text-left text-xs font-black text-slate-950">
                    What it answers
                  </th>
                  <th className="px-5 py-5 text-left text-xs font-black text-slate-950">
                    Category
                  </th>
                  <th className="px-5 py-5 text-left text-xs font-black text-slate-950">
                    Metadata
                  </th>
                  <th className="px-5 py-5 text-left text-xs font-black text-slate-950">
                    Lineage
                  </th>
                  <th className="w-[210px] px-5 py-5 text-center text-xs font-black text-slate-950">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length ? (
                  pageRows.map((row, index) => (
                    <tr
                      key={row.report.reportId}
                      className="border-b transition hover:bg-blue-50/50"
                      style={{
                        borderColor: "rgba(226,232,240,0.9)",
                        background:
                          index % 2 === 1
                            ? "rgba(248,250,252,0.74)"
                            : "rgba(255,255,255,0.98)",
                      }}
                    >
                      <td className="px-5 py-5 text-center font-semibold text-slate-800">
                        {pageStart + index + 1}
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <button
                          type="button"
                          onClick={() => openReport(row.report)}
                          className="max-w-[270px] text-left text-[13px] font-black leading-5 text-slate-950 transition hover:text-blue-700"
                        >
                          {row.name}
                        </button>
                        <div className="mt-1 text-[11px] font-semibold text-slate-400">
                          Original KPI view: {row.originalName}
                        </div>
                      </td>
                      <td className="px-5 py-5 align-middle text-[13px] font-semibold leading-5 text-slate-700">
                        <div className="max-w-[300px]">{row.description}</div>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <span
                          className="rounded-full px-3 py-1 text-[11px] font-black"
                          style={{
                            color: row.familyTone,
                            background: `${row.familyTone}14`,
                          }}
                        >
                          {row.familyLabel}
                        </span>
                      </td>
                      <td className="px-5 py-5 align-middle text-[12px] font-semibold leading-5 text-slate-600">
                        <div>
                          {row.lastUpdated} · {row.updateFrequency}
                        </div>
                        <div>
                          {row.iitCoverage} · {row.granularity}
                        </div>
                        <div>
                          {row.sourceTable} · {row.columnsCount} columns
                        </div>
                      </td>
                      <td className="px-5 py-5 align-middle text-[13px] font-semibold text-slate-800">
                        <div className="max-w-[260px] leading-5">
                          <span>
                            {row.domainLabel} / {row.moduleLabel}
                          </span>
                          <br />
                          <span>{row.sheetPrimary}</span>
                          {row.sheetSecondary ? (
                            <>
                              <span className="px-1 text-slate-400">/</span>
                              <span>{row.sheetSecondary}</span>
                            </>
                          ) : null}
                          {row.sheetMulti ? (
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                              Multiple
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => openReport(row.report)}
                            className="inline-flex h-9 min-w-[116px] items-center justify-center gap-2 rounded-lg border bg-white px-4 text-xs font-black text-[#1d4ed8] transition hover:-translate-y-0.5 hover:bg-blue-50"
                            style={{ borderColor: "rgba(37,99,235,0.35)" }}
                          >
                            <ReportHubEyeIcon />
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadHubReport(row)}
                            className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-[#1d4ed8] transition hover:-translate-y-0.5 hover:bg-blue-50"
                            style={{ borderColor: "rgba(37,99,235,0.35)" }}
                            title="Download CSV"
                            aria-label={`Download ${row.name}`}
                          >
                            <ReportHubDownloadIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="text-base font-black text-slate-800">
                        No reports match your filters.
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-500">
                        Try a broader search term, switch to All, or use Ask AI.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(226,232,240,0.95)" }}
        >
          <div className="text-sm font-semibold text-slate-500">
            Showing {showingFrom} to {showingTo} of {visibleRows.length} reports
            <span className="ml-2 text-xs text-slate-400">
              ({scopeText}, {yrFrom}-{yrTo})
            </span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
              disabled={pageIndex === 0}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl font-black text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Previous page"
            >
              ‹
            </button>
            <div className="grid h-10 min-w-10 place-items-center rounded-xl border border-blue-500 bg-white px-3 text-sm font-black text-blue-700 shadow-sm">
              {pageIndex + 1}
            </div>
            <button
              type="button"
              onClick={() =>
                setPageIndex((value) => Math.min(totalPages - 1, value + 1))
              }
              disabled={pageIndex >= totalPages - 1}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl font-black text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
