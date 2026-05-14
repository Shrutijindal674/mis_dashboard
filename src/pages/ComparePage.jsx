
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  ComposedChart,
  CartesianGrid,
  Line,
  LineChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  copyToClipboard,
  downloadElementImage,
  downloadElementPdf,
  downloadElementSvg,
  downloadTableSvg,
  downloadText,
  formatCompact,
  formatPct,
  toCsv,
} from "../utils/helpers";
import { IITs, THEME_COLORS, YEARS } from "../constants";
import { COMPARE_HIERARCHY, KPI_BY_ID } from "../data/compareHierarchy";
import { kpiBreakdown, kpiValue, scopeRowsForKpi } from "../data/kpiDefs";
import DataTable from "../components/ui/DataTable";
import Drawer from "../components/ui/Drawer";
import Select from "../components/ui/Select";
import CombinedKpiSelector from "../components/ui/CombinedKpiSelector";
import VisualToolbar from "../components/ui/VisualToolbar";

const LEGACY_IITS = ["IITD", "IITB", "IITKGP", "IITM", "IITK"];
const PALETTE = ["#0f3d91", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1e40af", "#38bdf8"];
const IIT_BLUE_PALETTE = ["#0f3d91", "#1e40af", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#0e7490", "#0284c7"];
const COMPARE_SERIES_TONE_STEPS = [-0.26, -0.08, 0.12, 0.28, 0.42, -0.42, 0.56, -0.56];
const COMPARE_BREAKDOWN_SCAN_ITEM_LIMIT = 6;
const COMPARE_BREAKDOWN_KPI_LIMIT = 3;
const COMPARE_MAX_CHART_SERIES = 18;
const COMPARE_MAX_SMALL_MULTIPLE_CARDS = 12;

function clampColorChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex) {
  const normalized = String(hex || "#2563eb").replace("#", "");
  if (normalized.length !== 6) return { r: 37, g: 99, b: 235 };
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((channel) => clampColorChannel(channel).toString(16).padStart(2, "0")).join("")}`;
}

function mixHexColor(source, target, weight = 0) {
  const left = hexToRgb(source);
  const right = hexToRgb(target);
  const amount = Math.max(0, Math.min(1, Math.abs(weight)));
  return rgbToHex({
    r: left.r + (right.r - left.r) * amount,
    g: left.g + (right.g - left.g) * amount,
    b: left.b + (right.b - left.b) * amount,
  });
}

function compareSeriesColor(itemIndex = 0, breakdownIndex = 0, breakdownCount = 1) {
  const baseColor = PALETTE[itemIndex % PALETTE.length];
  if (breakdownCount <= 1) return baseColor;
  const tone = COMPARE_SERIES_TONE_STEPS[breakdownIndex % COMPARE_SERIES_TONE_STEPS.length];
  return tone < 0 ? mixHexColor(baseColor, "#0f172a", tone) : mixHexColor(baseColor, "#ffffff", tone);
}
const TOP_TABS = ["Compare View", "Filters", "Compare Mode", "Saved Sets"];
const VIEW_OPTIONS = [
  { id: "grouped", label: "Bar graph", help: "Compare selected values year-wise across IITs." },
  { id: "smallBars", label: "Small bars", help: "Show year-wise small multiple bar cards." },
  { id: "smallLines", label: "Small lines", help: "Show year-wise small multiple line cards." },
  { id: "table", label: "Table", help: "Show the broadest structurally valid comparison in tabular form." },
];
const TOTAL_COMPARISON_KEY = "__total__";
const TOTAL_COMPARISON_LABEL = "Total";
const SCALE_OPTIONS = [
  { id: "raw", label: "Raw" },
  { id: "indexed", label: "Percent" },
];
const COMPARE_LABEL_ACRONYMS = new Set([
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

function humanizeCompareLabel(value) {
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
      if (COMPARE_LABEL_ACRONYMS.has(lower)) return lower.toUpperCase();
      if (/^\(?unknown\)?$/i.test(word)) return "Unknown";
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;
      return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function compareBreakdownLabel(key) {
  if (!key || key === TOTAL_COMPARISON_KEY) return TOTAL_COMPARISON_LABEL;
  return humanizeCompareLabel(key);
}

function compareItemLabel(item) {
  return humanizeCompareLabel(item?.kpiLabel ?? item?.label ?? item?.kpi?.label ?? item?.id ?? "");
}

function compareSeriesLegendId(itemId, breakdownKey = TOTAL_COMPARISON_KEY) {
  return normalizeSeriesKey(`${itemId || "item"}__${breakdownKey || TOTAL_COMPARISON_KEY}`);
}

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function dedupeList(values) {
  return Array.from(new Set((values ?? []).filter(Boolean)));
}

function valueForKpi(facts, kpi, instituteId, year) {
  const rows = (facts?.[kpi.fact] ?? []).filter((row) => row.InstituteId === instituteId && row.Year === year);
  return kpiValue(kpi, rows);
}
function scopedRowsForKpi(facts, kpi, instituteId, year) {
  if (!kpi?.fact) return [];
  return scopeRowsForKpi(kpi, facts?.[kpi.fact] ?? []).filter(
    (row) => row.InstituteId === instituteId && Number(row.Year ?? 0) === Number(year),
  );
}

function valueForBreakdownKey(facts, kpi, instituteId, year, breakdownKey = TOTAL_COMPARISON_KEY) {
  if (!kpi) return null;
  const rows = scopedRowsForKpi(facts, kpi, instituteId, year);
  if (!breakdownKey || breakdownKey === TOTAL_COMPARISON_KEY || !kpi?.levels?.length) return kpiValue(kpi, rows);
  const match = kpiBreakdown(kpi, rows, []).find((item) => String(item.name ?? "Unknown") === String(breakdownKey));
  return match?.value ?? null;
}

function aggregateCompareSeriesYearValue(facts, series, instituteIds = [], year) {
  const values = (instituteIds ?? [])
    .map((iid) => valueForBreakdownKey(facts, series.kpi, iid, year, series.breakdownKey))
    .filter((value) => value != null && Number.isFinite(Number(value)))
    .map(Number);

  if (!values.length) return null;
  if (series?.kpi?.format === "pct") {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  return values.reduce((sum, value) => sum + value, 0);
}

function itemSupportsBreakdown(item) {
  return Boolean(item?.kpi?.levels?.length);
}

function breakdownOptionsForItems(items, facts, iits, years, limit = 80) {
  const keySet = new Set();
  const scanItems = items.filter(itemSupportsBreakdown).slice(0, COMPARE_BREAKDOWN_SCAN_ITEM_LIMIT);
  const scanIits = (iits?.length ? iits : LEGACY_IITS).slice(0, 10);
  const scanYears = years?.length ? years : YEARS;

  scanItems.forEach((item) => {
    const kpi = item.kpi;
    scanIits.forEach((iid) => {
      scanYears.forEach((year) => {
        const rows = scopedRowsForKpi(facts, kpi, iid, year);
        kpiBreakdown(kpi, rows, []).forEach((entry) => {
          const key = String(entry.name ?? "Unknown");
          if (key && key !== "Unknown") keySet.add(key);
        });
      });
    });
  });
  return Array.from(keySet).sort((left, right) => left.localeCompare(right)).slice(0, limit);
}

function normalizeSeriesKey(value) {
  return String(value ?? "series").replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "series";
}

function compareSeriesLabel({ item, breakdownKey, iid }) {
  const parts = [
    compareItemLabel(item),
    breakdownKey && breakdownKey !== TOTAL_COMPARISON_KEY ? compareBreakdownLabel(breakdownKey) : null,
    instituteShortLabel(iid),
  ].filter(Boolean);
  return parts.join(" · ");
}


function fmtRaw(kpi, value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  if (kpi?.format === "pct") return `${(Number(value) * 100).toFixed(1)}%`;
  const hasFraction = Math.abs(Number(value) % 1) > 0.0001;
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: hasFraction ? 2 : 0 }).format(Number(value));
}

function fmtDisplay(kpi, value, scale = "raw") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  if (scale === "indexed") return `${Number(value).toFixed(1)}%`;
  if (kpi?.format === "pct") return `${Number(value).toFixed(1)}%`;
  return formatCompact(value);
}

function normalizeToLeader(values) {
  const valid = values.filter((item) => item != null && Number.isFinite(Number(item)));
  const leader = valid.length ? Math.max(...valid.map(Number)) : null;
  return values.map((item) => {
    if (item == null || !Number.isFinite(Number(item))) return null;
    if (!leader || leader === 0) return 0;
    return (Number(item) / leader) * 100;
  });
}

function normalizeToBase(values) {
  const base = values.find((item) => item != null && Number.isFinite(Number(item)) && Number(item) !== 0);
  return values.map((item) => {
    if (item == null || !Number.isFinite(Number(item))) return null;
    if (!base) return 0;
    return (Number(item) / Number(base)) * 100;
  });
}

function truncate(text, max = 40) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function splitLabelAcrossTwoLines(text) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  const words = normalized.split(" ");
  if (words.length === 1) {
    if (words[0].length <= 18) return [words[0]];
    const midpoint = Math.ceil(words[0].length / 2);
    return [words[0].slice(0, midpoint), words[0].slice(midpoint)].filter(Boolean);
  }

  let bestPair = [normalized];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(" ");
    const secondLine = words.slice(index).join(" ");
    const longestLine = Math.max(firstLine.length, secondLine.length);
    const imbalance = Math.abs(firstLine.length - secondLine.length);
    const score = longestLine * 2 + imbalance;

    if (score < bestScore) {
      bestPair = [firstLine, secondLine];
      bestScore = score;
    }
  }

  return bestPair;
}

function WrappedWorksheetTick({ x = 0, y = 0, payload, onClick, title }) {
  const lines = splitLabelAcrossTwoLines(payload?.value);
  const clickable = typeof onClick === "function";

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={clickable ? () => onClick(payload?.value) : undefined}
      style={{ cursor: clickable ? "pointer" : "default" }}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? title ?? `Filter by ${payload?.value}` : undefined}
    >
      <title>{title ?? String(payload?.value ?? "")}</title>
      <text textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">
        {lines.map((line, index) => (
          <tspan key={`${payload?.value ?? "label"}-${index}`} x="0" dy={index === 0 ? 18 : 15}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function GroupedYearIitTick({ x = 0, y = 0, payload, index = 0, onClick, onYearClick, yearLabelKeyByYear = {}, fontSize = 11, rotate = false, alternateRows = false }) {
  const rawValue = String(payload?.value ?? "");
  if (!rawValue || rawValue.startsWith("__gap__")) return null;

  const [year, iid] = rawValue.split("__");
  const label = instituteShortLabel(iid);
  const fullLabel = instituteNameById(iid);
  const showYear = yearLabelKeyByYear?.[year] === rawValue;
  const clickable = typeof onClick === "function" && iid;
  const yearClickable = showYear && typeof onYearClick === "function";
  const lowerRow = alternateRows && index % 2 === 1;
  const labelDy = alternateRows ? (lowerRow ? 31 : 12) : 14;
  const yearDy = alternateRows ? (lowerRow ? 19 : 38) : (rotate ? 42 : Math.max(12, fontSize + 4));

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={clickable ? () => onClick(iid) : undefined}
      style={{ cursor: clickable ? "pointer" : "default" }}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? `Drill down to ${fullLabel}` : undefined}
    >
      <title>{clickable ? `Click IIT to drill down to ${fullLabel}; click year to compare IITs in that year` : fullLabel}</title>
      <text textAnchor="middle" fill="#475569" fontSize={fontSize} fontWeight="800">
        <tspan x="0" dy={labelDy} transform={!alternateRows && rotate ? "rotate(-55 0 14)" : undefined}>{label}</tspan>
        <tspan
          x="0"
          dy={yearDy}
          fill={showYear ? "#2563eb" : "transparent"}
          fontSize={Math.max(9, fontSize - 1)}
          fontWeight="900"
          style={{ cursor: yearClickable ? "pointer" : "default" }}
          onClick={yearClickable ? (event) => {
            event.stopPropagation();
            onYearClick(year);
          } : undefined}
        >
          {showYear ? year : "·"}
        </tspan>
      </text>
    </g>
  );
}


function YearPanelCompareChart({
  panels,
  seriesList,
  scaleMode,
  activeSegment,
  onIitClick,
  onYearClick,
  onSegmentHover,
  onSegmentClick,
  onChartLeave,
  onDetailClose,
}) {
  const visibleSeries = seriesList ?? [];
  const validPanels = (panels ?? []).map((panel) => ({
    ...panel,
    rows: (panel.rows ?? []).filter((row) => !row?.isGap),
  })).filter((panel) => panel.rows.length);

  const positiveRawValue = (row, series) => {
    const value = Number(row?.[`raw_${series.id}`] ?? 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  const rowRawTotal = (row) => visibleSeries.reduce((sum, series) => sum + positiveRawValue(row, series), 0);
  const rowTotals = validPanels.flatMap((panel) => panel.rows.map(rowRawTotal)).filter((value) => value > 0);
  const maxRawTotal = rowTotals.length ? Math.max(...rowTotals) : 0;
  const rawAxisMax = maxRawTotal || 1;
  const axisMax = scaleMode === "indexed" ? 100 : rawAxisMax;
  const axisTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => axisMax * ratio);

  const axisLabel = (value) => {
    if (scaleMode === "indexed") return String(Math.round(value));
    const rounded = Math.abs(value) >= 1000 ? formatCompact(value) : new Intl.NumberFormat("en-IN", { maximumFractionDigits: value % 1 ? 1 : 0 }).format(value);
    return rounded;
  };

  const preparedSegmentRow = (row, series, rawValue, rawTotal) => {
    const shareDisplay = rawTotal > 0 ? (rawValue / rawTotal) * 100 : 0;
    const displayValue = scaleMode === "indexed"
      ? shareDisplay
      : (series.kpi?.format === "pct" ? rawValue * 100 : rawValue);
    const stackTotal = scaleMode === "indexed" ? 100 : rawTotal;
    return {
      ...row,
      [`display_${series.id}`]: displayValue,
      [`raw_${series.id}`]: rawValue,
      [`displayTotal_${series.itemId}`]: stackTotal,
      displayTotal_all: stackTotal,
    };
  };

  if (!validPanels.length || !visibleSeries.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6 text-center text-sm font-semibold text-slate-500">
        No chartable comparison values are available for the selected IITs and years.
      </div>
    );
  }

  return (
    <div className="relative" onMouseLeave={onChartLeave}>
      {activeSegment?.pinned ? (
        <div className="absolute right-3 top-3 z-20">
          <BarSegmentDetailCard segment={activeSegment} scaleMode={scaleMode} onClose={onDetailClose} />
        </div>
      ) : null}

      <div className="rounded-[28px] border border-sky-100 bg-white px-4 py-4 shadow-[0_14px_32px_rgba(37,99,235,0.08)]">
        <div className="mb-3 grid grid-cols-[3.6rem_4.8rem_minmax(0,1fr)] items-end gap-3 px-1 text-[11px] font-black text-slate-500">
          <div />
          <div className="text-right uppercase tracking-[0.14em]">IIT</div>
          <div className="relative h-7 border-b border-slate-200">
            {axisTicks.map((tick, index) => {
              const left = axisMax ? (Number(tick) / axisMax) * 100 : 0;
              return (
                <div key={`axis-${index}`} className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${left}%` }}>
                  <span className="mb-1 text-[10px] font-extrabold text-slate-500">{axisLabel(tick)}</span>
                  <span className="h-2 border-l border-slate-300" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {validPanels.map((panel) => (
            <div key={panel.year} className="grid grid-cols-[3.6rem_4.8rem_minmax(0,1fr)] gap-3 py-3">
              <button
                type="button"
                className="flex min-h-full items-center justify-center rounded-2xl text-xs font-black text-blue-700 transition hover:bg-sky-50"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                onClick={() => onYearClick?.(panel.year)}
                title={`Compare selected IITs in ${panel.year}`}
              >
                {panel.year}
              </button>

              <div className="space-y-2">
                {panel.rows.map((row) => (
                  <button
                    key={`label-${row.xKey}`}
                    type="button"
                    className="flex h-7 w-full items-center justify-end truncate rounded-lg px-1.5 text-right text-[11px] font-black text-slate-700 transition hover:bg-sky-50 hover:text-blue-700"
                    title={`Drill down to ${row.instituteName}`}
                    onClick={() => onIitClick?.(row.instituteId)}
                  >
                    {row.shortName}
                  </button>
                ))}
              </div>

              <div className="relative space-y-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
                  {axisTicks.map((tick, index) => {
                    const left = axisMax ? (Number(tick) / axisMax) * 100 : 0;
                    return (
                      <span
                        key={`grid-${panel.year}-${index}`}
                        className={cn(
                          "absolute inset-y-0 border-l",
                          index === 0 ? "border-slate-300" : "border-sky-200 border-dashed",
                        )}
                        style={{ left: `${left}%` }}
                      />
                    );
                  })}
                </div>

                {panel.rows.map((row) => {
                  const rawTotal = rowRawTotal(row);
                  const trackWidth = scaleMode === "indexed"
                    ? (rawTotal > 0 ? 100 : 0)
                    : Math.max(0, Math.min(100, (rawTotal / rawAxisMax) * 100));

                  return (
                    <div key={`bar-${row.xKey}`} className="relative h-7">
                      <div className="absolute inset-y-0 left-0 flex items-center" style={{ width: `${trackWidth}%` }}>
                        <div className="flex h-5 w-full overflow-hidden rounded-sm bg-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
                          {visibleSeries.map((series) => {
                            const rawValue = positiveRawValue(row, series);
                            if (rawValue <= 0 || rawTotal <= 0) return null;
                            const segmentWidth = scaleMode === "indexed"
                              ? (rawValue / rawTotal) * 100
                              : (rawValue / rawTotal) * 100;
                            const shareLabel = rawTotal > 0 ? (rawValue / rawTotal) * 100 : 0;
                            const label = scaleMode === "indexed"
                              ? shareLabel.toFixed(1)
                              : fmtDisplay(series.kpi, series.kpi?.format === "pct" ? rawValue * 100 : rawValue, "raw");
                            const segmentRow = preparedSegmentRow(row, series, rawValue, rawTotal);
                            return (
                              <button
                                key={`${row.xKey}-${series.id}`}
                                type="button"
                                className="group relative flex h-full items-center justify-center border-r border-white/70 text-[9px] font-black text-white/90 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                style={{ width: `${segmentWidth}%`, background: series.color }}
                                title={`${row.instituteName} · ${panel.year} · ${series.fullLabel ?? series.label}: ${scaleMode === "indexed" ? `${shareLabel.toFixed(1)}%` : fmtRaw(series.kpi, rawValue)}`}
                                onMouseEnter={() => onSegmentHover?.(series, segmentRow)}
                                onClick={(event) => onSegmentClick?.(series, segmentRow, event)}
                              >
                                {segmentWidth >= 10 ? <span className="truncate px-1">{label}</span> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-600">
          {visibleSeries.slice(0, 10).map((series) => (
            <button
              key={`legend-${series.id}`}
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-sky-50"
              title={series.fullLabel ?? series.label}
            >
              <span className="h-3 w-7 rounded-sm" style={{ background: series.color }} />
              <span className="max-w-[180px] truncate">{series.legendLabel ?? series.shortLabel ?? series.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-center text-[11px] font-semibold text-slate-500">
        Year-wise horizontal stacked comparison for selected IITs
      </div>
    </div>
  );
}

function summarizeList(values, max = 3) {
  if (!values?.length) return "None selected";
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} +${values.length - max} more`;
}

function instituteNameById(iid) {
  return IITs.find((item) => item.id === iid)?.name ?? iid;
}

function instituteShortLabel(iid) {
  return IITs.find((item) => item.id === iid)?.id ?? iid;
}

function sortIitsAlphabetically(iids = []) {
  return [...iids].sort((left, right) => instituteShortLabel(left).localeCompare(instituteShortLabel(right)));
}

function sameMembers(left = [], right = []) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((item) => rightSet.has(item));
}

function compareIitScopeLabel(iids = []) {
  if (!iids?.length) return "No IITs selected";
  if (iids.length === 1) return instituteShortLabel(iids[0]);
  if (sameMembers(iids, LEGACY_IITS)) return "OLD IITs";
  if (sameMembers(iids, IITs.map((iit) => iit.id))) return "ALL IITs";
  return `Comparing ${iids.length} IIT${iids.length === 1 ? "" : "s"}`;
}

function cloneCompareSelection(selection = {}) {
  return {
    ...selection,
    modules: [...(selection.modules ?? [])],
    submodules: [...(selection.submodules ?? [])],
    sheets: [...(selection.sheets ?? [])],
    items: [...(selection.items ?? [])],
    breakdowns: [...(selection.breakdowns ?? [])],
    iits: [...(selection.iits ?? [])],
  };
}

function sameCompareSelection(left, right) {
  if (!left || !right) return false;
  return sameMembers(left.iits ?? [], right.iits ?? [])
    && sameMembers(left.items ?? [], right.items ?? [])
    && Number(left.yearFrom) === Number(right.yearFrom)
    && Number(left.yearTo) === Number(right.yearTo);
}

function compareDrillCrumbLabel(selection, previousSelection = null) {
  if (!selection) return "";
  const nextIits = selection.iits ?? [];
  const previousIits = previousSelection?.iits ?? [];
  const singleYear = Number(selection.yearFrom) === Number(selection.yearTo);
  const yearChanged = !previousSelection
    || Number(selection.yearFrom) !== Number(previousSelection.yearFrom)
    || Number(selection.yearTo) !== Number(previousSelection.yearTo);
  const iitChanged = !sameMembers(nextIits, previousIits);

  if (iitChanged && nextIits.length === 1) return instituteShortLabel(nextIits[0]);
  if (yearChanged && singleYear) return String(selection.yearTo);
  if (nextIits.length === 1) return instituteShortLabel(nextIits[0]);
  return compareIitScopeLabel(nextIits);
}

function firstActiveIdInList(items = [], activeIds = []) {
  const activeSet = new Set(activeIds ?? []);
  return items.find((item) => activeSet.has(item.id))?.id ?? items[0]?.id ?? null;
}

function compareIitColor(iid, fallbackIndex = 0) {
  const index = IITs.findIndex((item) => item.id === iid);
  return IIT_BLUE_PALETTE[(index >= 0 ? index : fallbackIndex) % IIT_BLUE_PALETTE.length];
}

function compareYearKey(year) {
  return `year_${year}`;
}


function formatCompareTimestamp(value) {
  if (!value) return "Not recorded yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded yet";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function compareIcon(kind, active = false, tone = "#2563eb") {
  const stroke = active ? "white" : tone;
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const wrappers = {
    grouped: (
      <>
        <path {...common} d="M5 19V10" />
        <path {...common} d="M11 19V6" />
        <path {...common} d="M17 19V13" />
        <path {...common} d="M21 19V8" />
      </>
    ),
    smallBars: (
      <>
        <rect {...common} x="4" y="4" width="7" height="7" rx="1.6" />
        <rect {...common} x="13" y="4" width="7" height="7" rx="1.6" />
        <path {...common} d="M6 19v-4" />
        <path {...common} d="M10 19v-7" />
        <path {...common} d="M15 19v-5" />
        <path {...common} d="M19 19v-8" />
      </>
    ),
    smallLines: (
      <>
        <rect {...common} x="4" y="4" width="7" height="7" rx="1.6" />
        <rect {...common} x="13" y="4" width="7" height="7" rx="1.6" />
        <path {...common} d="M5 18l4-4 4 2 6-6" />
        <circle {...common} cx="5" cy="18" r="1" />
        <circle {...common} cx="9" cy="14" r="1" />
        <circle {...common} cx="13" cy="16" r="1" />
        <circle {...common} cx="19" cy="10" r="1" />
      </>
    ),
    smallMultiples: (
      <>
        <rect {...common} x="4" y="4" width="6" height="6" rx="1.5" />
        <rect {...common} x="14" y="4" width="6" height="6" rx="1.5" />
        <rect {...common} x="4" y="14" width="6" height="6" rx="1.5" />
        <rect {...common} x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    table: (
      <>
        <rect {...common} x="3.5" y="5" width="17" height="14" rx="2" />
        <path {...common} d="M3.5 10h17" />
        <path {...common} d="M9 5v14" />
        <path {...common} d="M15 5v14" />
      </>
    ),
    edit: (
      <>
        <path {...common} d="M4 20h4l9.5-9.5-4-4L4 16v4Z" />
        <path {...common} d="m12.5 6.5 4 4" />
      </>
    ),
    close: (
      <>
        <path {...common} d="M6 6l12 12" />
        <path {...common} d="M18 6 6 18" />
      </>
    ),
    build: (
      <>
        <rect {...common} x="4" y="5" width="16" height="14" rx="3" />
        <path {...common} d="M8 12h8" />
        <path {...common} d="M12 8v8" />
      </>
    ),
    compare: (
      <>
        <path {...common} d="M6 7h12" />
        <path {...common} d="M6 12h9" />
        <path {...common} d="M6 17h6" />
        <circle {...common} cx="18" cy="12" r="2.5" />
      </>
    ),
    filters: (
      <>
        <path {...common} d="M4 6h16" />
        <path {...common} d="M7 12h10" />
        <path {...common} d="M10 18h4" />
      </>
    ),
    iit: (
      <>
        <path {...common} d="M4 10 12 5l8 5" />
        <path {...common} d="M6.5 10v8" />
        <path {...common} d="M10 10v8" />
        <path {...common} d="M14 10v8" />
        <path {...common} d="M17.5 10v8" />
        <path {...common} d="M4 18h16" />
      </>
    ),
    save: (
      <>
        <path {...common} d="M6 4h10l4 4v12H6z" />
        <path {...common} d="M9 4v5h6V4" />
        <path {...common} d="M9 20v-6h6v6" />
      </>
    ),
    fullscreen: (
      <>
        <path {...common} d="M8 4H4v4" />
        <path {...common} d="M16 4h4v4" />
        <path {...common} d="M20 16v4h-4" />
        <path {...common} d="M4 16v4h4" />
      </>
    ),
    share: (
      <>
        <circle {...common} cx="6" cy="12" r="2" />
        <circle {...common} cx="18" cy="6" r="2" />
        <circle {...common} cx="18" cy="18" r="2" />
        <path {...common} d="M8 11l8-4" />
        <path {...common} d="M8 13l8 4" />
      </>
    ),
    image: (
      <>
        <rect {...common} x="4" y="5" width="16" height="14" rx="2" />
        <circle {...common} cx="9" cy="10" r="1.5" />
        <path {...common} d="M20 15l-4-4-5 5-2-2-5 5" />
      </>
    ),
    download: (
      <>
        <path {...common} d="M12 4v11" />
        <path {...common} d="M8.5 11.5 12 15l3.5-3.5" />
        <path {...common} d="M5 19h14" />
      </>
    ),
    copy: (
      <>
        <rect {...common} x="8" y="8" width="11" height="11" rx="2" />
        <path {...common} d="M5 15V7a2 2 0 0 1 2-2h8" />
      </>
    ),
    details: (
      <>
        <rect {...common} x="4" y="5" width="16" height="14" rx="2" />
        <path {...common} d="M8 9h8" />
        <path {...common} d="M8 13h3" />
        <path {...common} d="M13 13h3" />
        <path {...common} d="M8 17h8" />
      </>
    ),
    ai: (
      <>
        <path {...common} d="M12 3l1.6 3.8L17 8.4l-3.4 1.6L12 14l-1.6-4L7 8.4l3.4-1.6L12 3Z" />
        <path {...common} d="M19 13l.9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13Z" />
        <path {...common} d="M6 14l.7 1.7L8.4 16l-1.7.7L6 18.4l-.7-1.7L3.6 16l1.7-.7L6 14Z" />
      </>
    ),
  }[kind];

  if (!wrappers) return null;
  return <svg viewBox="0 0 24 24" className="h-5 w-5">{wrappers}</svg>;
}

function compareToolbarIcon(kind, active = false, tone = "#2563eb") {
  const stroke = active ? "#ffffff" : tone;
  const softStroke = active ? "rgba(255,255,255,0.82)" : "#2563eb";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (kind === "grouped") {
    const barFill = active
      ? ["#ffffff", "#dbeafe", "#bfdbfe", "#ffffff"]
      : ["#93c5fd", "#60a5fa", "#22c55e", "#f59e0b"];
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="5" y="10" width="3.2" height="8" rx="1" fill={barFill[0]} />
        <rect x="9.7" y="6" width="3.2" height="12" rx="1" fill={barFill[1]} />
        <rect x="14.4" y="8" width="3.2" height="10" rx="1" fill={barFill[2]} />
        <rect x="19.1" y="4" width="3.2" height="14" rx="1" fill={barFill[3]} />
        <path d="M4 19h18" stroke={active ? "rgba(255,255,255,0.72)" : "#94a3b8"} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "smallBars") {
    const fills = active ? ["#ffffff", "#dbeafe", "#bfdbfe", "#ffffff"] : ["#93c5fd", "#60a5fa", "#22c55e", "#f59e0b"];
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="4.2" y="4.2" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="13" y="4.2" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="4.2" y="13" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="13" y="13" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="5.8" y="7.5" width="1.1" height="1.8" rx="0.4" fill={fills[0]} />
        <rect x="7.4" y="6" width="1.1" height="3.3" rx="0.4" fill={fills[1]} />
        <rect x="9" y="6.8" width="1.1" height="2.5" rx="0.4" fill={fills[2]} />
        <rect x="14.6" y="7.1" width="1.1" height="2.2" rx="0.4" fill={fills[1]} />
        <rect x="16.2" y="5.9" width="1.1" height="3.4" rx="0.4" fill={fills[2]} />
        <rect x="17.8" y="6.7" width="1.1" height="2.6" rx="0.4" fill={fills[3]} />
        <rect x="5.8" y="16.5" width="1.1" height="1.8" rx="0.4" fill={fills[0]} />
        <rect x="7.4" y="15.1" width="1.1" height="3.2" rx="0.4" fill={fills[1]} />
        <rect x="9" y="15.8" width="1.1" height="2.5" rx="0.4" fill={fills[2]} />
        <rect x="14.6" y="16" width="1.1" height="2.3" rx="0.4" fill={fills[1]} />
        <rect x="16.2" y="14.9" width="1.1" height="3.4" rx="0.4" fill={fills[2]} />
        <rect x="17.8" y="15.7" width="1.1" height="2.6" rx="0.4" fill={fills[3]} />
      </svg>
    );
  }

  if (kind === "smallLines") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="4.2" y="4.2" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="13" y="4.2" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="4.2" y="13" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <rect x="13" y="13" width="6.8" height="6.8" rx="1.4" fill="none" stroke={stroke} strokeWidth="1.35" opacity={active ? 0.9 : 0.8} />
        <path d="M5.8 8.8l1.5-1.4 1.4 1 1.2-2.2" fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 8.8l1.4-2 1.3 1.2 1.4-2.1" fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.8 17.9l1.4-1.3 1.3.8 1.5-2" fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 17.8l1.3-2 1.4 1.2 1.4-2.2" fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        {[ [5.8,8.8], [7.3,7.4], [8.7,8.4], [9.9,6.2], [14.5,8.8], [15.9,6.8], [17.2,8], [18.6,5.9], [5.8,17.9], [7.2,16.6], [8.5,17.4], [10,15.4], [14.5,17.8], [15.8,15.8], [17.2,17], [18.6,14.8] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.55" fill={active ? "#ffffff" : tone} />
        ))}
      </svg>
    );
  }

  if (kind === "table") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect {...common} x="5" y="5" width="14" height="14" rx="1.8" />
        <path {...common} d="M5 9.7h14M5 14.3h14M9.7 5v14M14.3 5v14" />
      </svg>
    );
  }

  if (kind === "ai") {
    const sparkleFill = active ? "#ffffff" : tone;
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3.5l1.8 4.4 4.4 1.8-4.4 1.8L12 16l-1.8-4.5-4.4-1.8 4.4-1.8L12 3.5Z" fill={sparkleFill} stroke={sparkleFill} strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M18.5 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" fill={sparkleFill} stroke={sparkleFill} strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    );
  }

  return compareIcon(kind, active, tone);
}

function PillTab({ label, active, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition"
      style={{
        background: active ? "#e8f0ff" : "rgba(255,255,255,0.92)",
        border: `1px solid ${active ? "rgba(37,99,235,0.28)" : "rgba(148,163,184,0.18)"}`,
        color: active ? "#1d4ed8" : "#475569",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SummaryRow({ title, summary, onEdit }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</div>
        <div className="mt-0.5 truncate text-sm font-semibold text-slate-700">{summary}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900"
        title={`Edit ${title}`}
      >
        {compareIcon("edit", false, "#475569")}
      </button>
    </div>
  );
}

function SearchField({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-sky-300"
      />
    </div>
  );
}

function ToolbarSelect({
  label,
  value,
  options,
  onChange,
  minWidth = 110,
  className = "",
  labelClassName = "",
  selectClassName = "",
}) {
  return (
    <label className={cn("flex shrink-0 flex-col gap-1", className)} style={{ minWidth }}>
      <span className={cn("px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500", labelClassName)}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 text-sm font-extrabold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-sky-300 focus:shadow-[0_0_0_4px_rgba(191,219,254,0.4)]",
          selectClassName,
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function CompareViewToolbar({ value, onChange, disabledMap = {} }) {
  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-[18px] border bg-white shadow-[0_10px_28px_rgba(37,99,235,0.12)]"
      style={{
        borderColor: "rgba(191,219,254,0.95)",
      }}
    >
      {VIEW_OPTIONS.map((option, index) => {
        const active = option.id === value;
        const disabled = Boolean(disabledMap[option.id]);
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "grid h-11 w-11 place-items-center text-base transition",
              disabled ? "cursor-not-allowed opacity-45" : "hover:bg-sky-50/80",
            )}
            style={{
              borderLeft: index !== 0 ? "1px solid rgba(191,219,254,0.95)" : undefined,
              background: active ? "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)" : "transparent",
              color: active ? "#fff" : "#2563eb",
            }}
            title={option.label}
            aria-label={option.label}
          >
            {compareIcon(option.id, active, active ? "#ffffff" : "#1252a0")}
          </button>
        );
      })}
    </div>
  );
}

function CompareDateSelector({ source, updateSource, years, accent }) {
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

function TreeCheck({ checked, partial = false }) {
  return (
    <span
      className="grid h-4 w-4 shrink-0 place-items-center rounded border text-[11px] font-bold leading-none"
      style={{
        borderColor: checked || partial ? "#1d4ed8" : "#cbd5e1",
        background: checked || partial ? "#1d4ed8" : "white",
        color: "white",
      }}
    >
      {checked ? "✓" : partial ? "—" : null}
    </span>
  );
}

function TreeNodeRow({
  level = 0,
  label,
  subtitle,
  checked,
  partial = false,
  hasChildren = false,
  expanded = false,
  onToggleExpand,
  onToggleCheck,
  badge,
}) {
  return (
    <div
      className="group flex items-start gap-2 rounded-[18px] border border-transparent px-2.5 py-2.5 transition hover:border-sky-100 hover:bg-sky-50/70"
      style={{ paddingLeft: `${8 + level * 18}px` }}
    >
      <button
        type="button"
        onClick={hasChildren ? onToggleExpand : undefined}
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-slate-500",
          hasChildren ? "hover:bg-slate-100" : "pointer-events-none opacity-0",
        )}
      >
        {hasChildren ? (
          <svg
            viewBox="0 0 20 20"
            className={cn("h-3.5 w-3.5 transition-transform", expanded ? "rotate-90" : "")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 4 6 6-6 6" />
          </svg>
        ) : null}
      </button>
      <button type="button" onClick={onToggleCheck} className="mt-0.5 shrink-0">
        <TreeCheck checked={checked} partial={partial} />
      </button>
      <button type="button" onClick={onToggleCheck} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-slate-800">{label}</div>
          {badge ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {badge}
            </span>
          ) : null}
        </div>
        {subtitle ? <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div> : null}
      </button>
    </div>
  );
}

function SimpleChip({ children, tone = "#2563eb", removable = false, onRemove, onClick, title = "" }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        onClick ? "cursor-pointer transition hover:-translate-y-0.5" : "",
      )}
      onClick={onClick}
      style={{
        background: `${tone}10`,
        borderColor: `${tone}26`,
        color: tone,
      }}
    >
      <span className="truncate">{children}</span>
      {removable ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
          className="grid h-4 w-4 place-items-center rounded-full bg-white/80 text-[10px] leading-none"
          style={{ color: tone }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

function SelectionActionButton({ label = "More filters", onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100"
    >
      {label}
    </button>
  );
}

function FilterChoiceChip({ label, active = false, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className="inline-flex min-h-[42px] items-center gap-2 rounded-[12px] border px-3 py-2 text-left text-sm font-medium transition"
      style={{
        borderColor: active ? 'rgba(37,99,235,0.32)' : 'rgba(226,232,240,0.95)',
        background: active ? 'rgba(239,246,255,0.96)' : 'rgba(248,250,252,0.95)',
        color: '#0f172a',
      }}
    >
      <span
        className="grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border text-[11px] leading-none"
        style={{
          borderColor: active ? '#1d4ed8' : '#94a3b8',
          background: active ? '#1d4ed8' : '#ffffff',
          color: active ? '#ffffff' : 'transparent',
        }}
      >
        ✓
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function EmptyStateCard({ onBuild }) {
  return (
    <div
      className="rounded-[32px] border bg-white px-6 py-12 text-center shadow-sm"
      style={{ borderColor: "rgba(59,130,246,0.15)" }}
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-sky-100 bg-sky-50 text-sky-600">
        {compareIcon("compare", false, "#2563eb")}
      </div>
      <div className="mt-5 text-lg font-semibold text-slate-900">Select filters to start comparing</div>
      <div className="mt-2 text-sm text-slate-500">Build a comparison only when you need it. The page stays calm until valid inputs are selected.</div>
      <button
        type="button"
        onClick={onBuild}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-sm"
        style={{ background: "#1d4ed8" }}
      >
        {compareIcon("build", true, "#ffffff")}
        <span>Build Comparison</span>
      </button>
    </div>
  );
}


function BarSegmentDetailCard({ segment, scaleMode, onClose }) {
  if (!segment) return null;
  const valueLabel = fmtDisplay(segment.kpi, segment.displayValue, scaleMode);
  const rawLabel = fmtRaw(segment.kpi, segment.rawValue);
  const previousLabel = segment.previousYear ? fmtRaw(segment.kpi, segment.previousRawValue) : "—";
  const changeLabel = segment.changePct == null || !Number.isFinite(Number(segment.changePct))
    ? "—"
    : `${Number(segment.changePct) >= 0 ? "+" : ""}${formatPct(segment.changePct)}`;
  const shareLabel = segment.sharePct == null || !Number.isFinite(Number(segment.sharePct))
    ? "—"
    : `${(Number(segment.sharePct) * 100).toFixed(1)}%`;

  return (
    <div className="min-w-[300px] max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs shadow-xl">
      <div className="border-b border-slate-100 px-4 py-3 text-center">
        <div className="text-sm font-extrabold text-slate-900">{segment.instituteName}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Selected bar segment</div>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start justify-between gap-5">
          <span className="shrink-0 font-bold uppercase tracking-[0.12em] text-slate-400">Series</span>
          <span className="min-w-0 text-right font-extrabold text-slate-900" style={{ color: segment.color }}>
            {segment.seriesLabel}
          </span>
        </div>
        <div className="flex items-start justify-between gap-5">
          <span className="shrink-0 font-bold uppercase tracking-[0.12em] text-slate-400">Path</span>
          <span className="min-w-0 text-right font-semibold text-slate-600">{segment.fullLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Year</span>
          <span className="font-extrabold text-slate-700">{segment.year}</span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Value</span>
          <span className="font-extrabold text-slate-900">{valueLabel}</span>
        </div>
        {scaleMode === "indexed" ? (
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Raw value</span>
            <span className="font-extrabold text-slate-900">{rawLabel}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-5">
          <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Share in stack</span>
          <span className="font-extrabold text-slate-900">{shareLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Previous year</span>
          <span className="font-extrabold text-slate-900">{segment.previousYear ? `${segment.previousYear}: ${previousLabel}` : "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="font-bold uppercase tracking-[0.12em] text-slate-400">YoY change</span>
          <span className={cn("font-extrabold", Number(segment.changePct) >= 0 ? "text-emerald-600" : "text-rose-600")}>{changeLabel}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        <span>{segment.pinned ? "Pinned selection" : "Click segment to pin"}</span>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-extrabold text-slate-600">
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CompareTooltip({ active, payload, label, mode, metricLookup, seriesLookup, scaleMode, activeSegment }) {
  if (!active || !payload?.length) return null;
  if (mode === "grouped") {
    if (activeSegment) {
      return <BarSegmentDetailCard segment={activeSegment} scaleMode={scaleMode} />;
    }
    const row = payload[0]?.payload;
    const seenMetricIds = new Set();
    const visibleEntries = payload
      .map((entry) => {
        const metricId = String(entry.dataKey).replace(/^display_/, "");
        if (seenMetricIds.has(metricId)) return null;
        seenMetricIds.add(metricId);
        const metric = metricLookup?.[metricId];
        const value = row?.[`display_${metricId}`] ?? entry.value;
        const numericValue = Number(value);
        if (!metric || value == null || !Number.isFinite(numericValue)) return null;
        return {
          id: metricId,
          metric,
          value: numericValue,
          raw: row?.[`raw_${metricId}`],
          color: entry.color ?? metric.color,
          label: metric.legendLabel ?? metric.shortLabel ?? metric.label,
        };
      })
      .filter(Boolean);
    const total = visibleEntries.reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
    const topEntry = visibleEntries.reduce((best, entry) => (!best || Number(entry.value) > Number(best.value) ? entry : best), null);
    const trendStart = Number(row?.trendStartValue);
    const trendEnd = Number(row?.trendEndValue);
    const trendDelta = row?.trendDeltaPct;

    return (
      <div className="min-w-[280px] max-w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs shadow-xl">
        <div className="border-b border-slate-100 px-4 py-3 text-center">
          <div className="text-sm font-extrabold text-slate-900">{row?.instituteName ?? label}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Year summary</div>
        </div>
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Year</span>
            <span className="font-extrabold text-slate-700">{row?.focusYear ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Visible total</span>
            <span className="font-extrabold text-slate-900">{Number.isFinite(total) ? formatCompact(total) : "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Top series</span>
            <span className="max-w-[170px] truncate text-right font-extrabold text-slate-900" style={{ color: topEntry?.color }}>
              {topEntry ? `${topEntry.label} · ${fmtDisplay(topEntry.metric?.kpi, topEntry.value, scaleMode)}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Range change</span>
            <span className="font-extrabold text-slate-900">
              {Number.isFinite(trendStart) && Number.isFinite(trendEnd)
                ? `${formatCompact(trendStart)} → ${formatCompact(trendEnd)}`
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Change %</span>
            <span className={cn("font-extrabold", Number(trendDelta) >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {trendDelta == null || !Number.isFinite(Number(trendDelta)) ? "—" : `${Number(trendDelta) >= 0 ? "+" : ""}${formatPct(trendDelta)}`}
            </span>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Hover or click a colored bar segment for exact details
        </div>
      </div>
    );
  }
  if (mode === "yearTrend") {
    return (
      <div className="max-w-[340px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
        <div className="font-semibold text-slate-900">Year {label}</div>
        <div className="mt-2 max-h-64 space-y-1.5 overflow-auto pr-1">
          {payload.map((entry) => {
            const seriesId = String(entry.dataKey).replace("display_", "");
            const series = metricLookup?.[seriesId];
            return (
              <div key={seriesId} className="flex items-center justify-between gap-4">
                <span className="min-w-0 truncate" style={{ color: entry.color }}>{series?.legendLabel ?? series?.shortLabel ?? series?.label ?? humanizeCompareLabel(seriesId)}</span>
                <span className="shrink-0 font-semibold text-slate-800">{fmtDisplay(series?.kpi, entry.value, scaleMode)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (mode === "smallMultiples") {
    if (activeSegment) {
      return <BarSegmentDetailCard segment={activeSegment} scaleMode={scaleMode} />;
    }
    const row = payload[0]?.payload;
    const visibleEntries = payload
      .map((entry) => {
        const seriesId = String(entry.dataKey).replace("display_", "");
        const series = seriesLookup?.[seriesId];
        const value = row?.[`display_${seriesId}`] ?? entry.value;
        if (!series || value == null || !Number.isFinite(Number(value))) return null;
        return {
          id: seriesId,
          series,
          value: Number(value),
          raw: row?.[`raw_${seriesId}`],
          color: entry.color ?? series.color,
          label: series.legendLabel ?? series.shortLabel ?? series.label,
        };
      })
      .filter(Boolean);
    const total = visibleEntries.reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
    const topEntry = visibleEntries.reduce((best, entry) => (!best || Number(entry.value) > Number(best.value) ? entry : best), null);

    return (
      <div className="max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs shadow-xl">
        <div className="border-b border-slate-100 px-4 py-3 text-center">
          <div className="text-sm font-extrabold text-slate-900">{row?.instituteName ?? label}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{row?.year ? `Year ${row.year}` : "Small multiple summary"}</div>
        </div>
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Visible total</span>
            <span className="font-extrabold text-slate-900">{Number.isFinite(total) ? formatCompact(total) : "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">Top series</span>
            <span className="max-w-[170px] truncate text-right font-extrabold text-slate-900" style={{ color: topEntry?.color }}>
              {topEntry ? `${topEntry.label} · ${fmtDisplay(topEntry.series?.kpi, topEntry.value, scaleMode)}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-400">{row?.instituteName ? "IIT" : "Year"}</span>
            <span className="font-extrabold text-slate-700">{row?.instituteName ?? row?.year ?? row?.label ?? "—"}</span>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Hover or click a colored bar segment for exact details
        </div>
      </div>
    );
  }
  return null;
}

function CompareBreakdownTooltip({ active, payload, label, kpi, scaleMode }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-slate-900">{row?.instituteName ?? label}</div>
      <div className="mt-1 text-slate-500">Breakdown by institute</div>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{compareBreakdownLabel(entry.name)}</span>
            <span className="font-semibold text-slate-800">
              {fmtDisplay(kpi, entry.value, scaleMode)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackTotalLabel({ x = 0, y = 0, width = 0, payload, item, scaleMode }) {
  const value = payload?.[`displayTotal_${item?.id}`];
  if (value == null || !Number.isFinite(Number(value)) || Number(value) <= 0) return null;
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 7}
      textAnchor="middle"
      fill="#0f172a"
      fontSize="12"
      fontWeight="800"
    >
      {fmtDisplay(item?.kpi, value, scaleMode)}
    </text>
  );
}

function InteractiveCompareLegend({
  items = [],
  activeIds = [],
  title = "",
  helper = "",
  compact = false,
  maxVisible = 10,
  onToggle,
  onMore,
}) {
  if (!items.length) return null;
  const activeSet = new Set(activeIds?.length ? activeIds : items.map((item) => item.id));
  const orderedItems = [
    ...items.filter((item) => activeSet.has(item.id)),
    ...items.filter((item) => !activeSet.has(item.id)),
  ];
  const visibleItems = orderedItems.slice(0, maxVisible);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", compact ? "" : "")}> 
      {helper ? (
        <div className="max-w-[260px] text-left text-[11px] font-extrabold leading-snug text-[#2563eb]">
          {helper}
        </div>
      ) : title ? (
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{title}</div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {visibleItems.map((item) => {
          const active = activeSet.has(item.id);
          const fullLabel = item.title ?? item.fullLabel ?? item.label;
          return (
            <button
              key={item.id ?? item.label}
              type="button"
              onClick={() => onToggle?.(item.id)}
              className={cn(
                "inline-flex max-w-[250px] cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50",
                active ? "border-slate-200 bg-white text-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.05)]" : "border-slate-100 bg-white text-slate-400 opacity-60",
              )}
              title={`${active ? "Deselect / hide" : "Select / show"} ${fullLabel}`}
              aria-label={`${active ? "Deselect / hide" : "Select / show"} ${fullLabel}`}
              aria-pressed={active}
            >
              <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: item.color }} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
        {hiddenCount > 0 || onMore ? (
          <button
            type="button"
            onClick={onMore}
            className="inline-flex cursor-pointer items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-extrabold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100"
            title="Open more filters"
          >
            {hiddenCount > 0 ? `More filters (+${hiddenCount})` : "More filters"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SmallMultipleBarCard({
  series,
  scaleMode,
  activeLegendIds = [],
  sharedYMax = null,
  detailSegment = null,
  onSegmentHover,
  onSegmentClick,
  onChartLeave,
  onDetailClose,
}) {
  const { rows, lines, label, subtitle } = series;
  const activeSet = new Set(activeLegendIds?.length ? activeLegendIds : (lines ?? []).map((line) => line.legendId ?? line.id));
  const visibleLines = (lines ?? []).filter((line) => activeSet.has(line.legendId ?? line.id));
  const barMaxSize = visibleLines.length > 8 ? 12 : visibleLines.length > 5 ? 16 : 22;

  return (
    <div className="relative rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
      {detailSegment ? (
        <div className="absolute right-4 top-4 z-20" data-export-hide="true">
          <BarSegmentDetailCard segment={detailSegment} scaleMode={scaleMode} onClose={onDetailClose} />
        </div>
      ) : null}
      <div className="mb-3 pr-2">
        <div className="text-sm font-semibold text-slate-900">{humanizeCompareLabel(label)}</div>
        {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
      </div>
      <div className="relative" style={{ height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 18, right: 16, left: 6, bottom: 34 }}
            barCategoryGap={visibleLines.length > 6 ? "18%" : "26%"}
            barGap={visibleLines.length > 6 ? 2 : 4}
            onMouseLeave={onChartLeave}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} width={70} domain={sharedYMax ? [0, sharedYMax] : [0, "auto"]} />
            <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={() => null} />
            {visibleLines.map((line) => (
              <Bar
                key={line.id}
                dataKey={`display_${line.id}`}
                name={line.fullLabel ?? line.label}
                fill={line.color}
                radius={[7, 7, 0, 0]}
                maxBarSize={barMaxSize}
                isAnimationActive={false}
                onMouseEnter={(entry) => onSegmentHover?.(line, entry?.payload ?? entry)}
                onClick={(entry, index, event) => onSegmentClick?.(line, entry?.payload ?? entry, event)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-center text-[11px] font-semibold text-slate-500">Year</div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {visibleLines.slice(0, 8).map((line) => (
          <span key={`legend-${line.id}`} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: line.color }} />
            {line.label}
          </span>
        ))}
        {visibleLines.length > 8 ? <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">+{visibleLines.length - 8}</span> : null}
      </div>
    </div>
  );
}

function SmallMultipleLineCard({ series, scaleMode, sharedYMax = null }) {
  const { rows, lines, label, subtitle } = series;
  const seriesLookup = useMemo(
    () => Object.fromEntries((lines ?? []).map((line) => [line.id, line])),
    [lines],
  );

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">{humanizeCompareLabel(label)}</div>
        {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
      </div>
      <div className="relative" style={{ height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 18, right: 16, left: 6, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} width={70} domain={sharedYMax ? [0, sharedYMax] : [0, "auto"]} />
            <Tooltip content={<CompareTooltip seriesLookup={seriesLookup} scaleMode={scaleMode} mode="smallMultiples" />} />
            {(lines ?? []).map((line, lineIndex) => (
              <Line
                key={line.id}
                type="monotone"
                dataKey={`display_${line.id}`}
                name={line.label}
                stroke={line.color}
                strokeWidth={2.4}
                strokeDasharray={lineIndex % 3 === 1 ? "6 4" : lineIndex % 3 === 2 ? "2 4" : undefined}
                dot={{ r: 3, fill: line.color, stroke: lineIndex % 2 ? "#ffffff" : line.color, strokeWidth: lineIndex % 2 ? 1.5 : 0 }}
                activeDot={{ r: 5 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-center text-[11px] font-semibold text-slate-500">Year</div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {(lines ?? []).slice(0, 8).map((line) => (
          <span key={`legend-${line.id}`} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: line.color }} />
            {line.label}
          </span>
        ))}
        {(lines ?? []).length > 8 ? <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">+{lines.length - 8}</span> : null}
      </div>
    </div>
  );
}

function BuilderSectionHeader({ step, title, helper }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Step {step}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{title}</div>
      {helper ? <div className="mt-1 text-sm text-slate-500">{helper}</div> : null}
    </div>
  );
}

function CheckboxRow({ checked, disabled = false, title, subtitle, onChange, badge }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition",
        disabled ? "cursor-not-allowed opacity-60" : "hover:border-sky-200 hover:bg-sky-50/50",
      )}
      style={{
        borderColor: checked ? "rgba(37,99,235,0.28)" : "rgba(148,163,184,0.22)",
        background: checked ? "rgba(37,99,235,0.06)" : "white",
      }}
    >
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {badge ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
              {badge}
            </span>
          ) : null}
        </div>
        {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
      </div>
    </label>
  );
}

function BuilderFooter({ onBack, onClear, onApply, applyDisabled, applyLabel = "Apply Compare", showApply = true, continueLabel = "Continue" }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
        >
          Clear all
        </button>
      </div>
      {showApply ? (
        <button
          type="button"
          disabled={applyDisabled}
          onClick={onApply}
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition",
            applyDisabled ? "cursor-not-allowed opacity-50" : "",
          )}
          style={{ background: "#1d4ed8" }}
        >
          {applyLabel}
        </button>
      ) : (
        <button
          type="button"
          disabled={applyDisabled}
          onClick={onApply}
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition",
            applyDisabled ? "cursor-not-allowed opacity-50" : "",
          )}
          style={{ background: "#1d4ed8" }}
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}

function normalizeCompareView(viewId) {
  const aliases = {
    smallMultiples: "smallBars",
    smallMultipleBars: "smallBars",
    smallMultipleLines: "smallLines",
    smallBarMultiples: "smallBars",
    smallLineMultiples: "smallLines",
  };
  const normalized = aliases[viewId] ?? viewId;
  return VIEW_OPTIONS.some((option) => option.id === normalized) ? normalized : "grouped";
}

function createDefaultDraft() {
  return {
    modules: [],
    submodules: [],
    sheets: [],
    items: [],
    breakdowns: [],
    iits: [...LEGACY_IITS],
    yearFrom: YEARS[0],
    yearTo: YEARS[YEARS.length - 1],
    focusYear: YEARS[YEARS.length - 1],
    view: "grouped",
    scale: "raw",
  };
}

function createDraftFromConfig(config, moduleMap, submoduleMap, sheetMap, worksheetMap) {
  const moduleIds = Object.keys(moduleMap);
  const submoduleIds = Object.keys(submoduleMap);
  const allWorksheets = Object.values(worksheetMap);
  const firstChartableId = (items = []) => items.find((item) => item?.comparable)?.id ?? items.find((item) => item?.kpi)?.id ?? items[0]?.id ?? null;
  const firstChartableFromSheet = (sheet) => firstChartableId(sheet?.kpis ?? []);
  const firstChartableFromSubmodule = (submodule) => firstChartableId((submodule?.sheets ?? []).flatMap((sheet) => sheet.kpis ?? [])) ?? firstChartableId(submodule?.worksheets ?? []);
  const firstChartableFromModule = (module) => (module?.submodules ?? []).map(firstChartableFromSubmodule).find(Boolean) ?? null;

  let moduleId = config?.CompareModule && moduleMap[config.CompareModule] ? config.CompareModule : null;
  let submoduleId = config?.CompareSubmoduleId && submoduleMap[config.CompareSubmoduleId] ? config.CompareSubmoduleId : null;

  const resolveCompareItemId = (rawId) => {
    if (!rawId) return null;
    if (worksheetMap[rawId]) return rawId;
    const scopedMatch = submoduleId
      ? (submoduleMap[submoduleId]?.worksheets ?? []).find((worksheet) => worksheet.kpiId === rawId || worksheet.id === rawId || worksheet.sheetId === rawId)
      : null;
    return scopedMatch?.id ?? allWorksheets.find((worksheet) => worksheet.kpiId === rawId || worksheet.id === rawId || worksheet.sheetId === rawId)?.id ?? null;
  };

  let items = dedupeList([...(config?.CompareMetricIds ?? []), config?.MetricId]).map(resolveCompareItemId).filter(Boolean).slice(0, 1);
  let sheets = dedupeList(config?.CompareSheetIds ?? []).filter((id) => sheetMap[id]);
  if (items[0] && !worksheetMap[items[0]]?.comparable) {
    const item = worksheetMap[items[0]];
    const fallback = firstChartableFromSheet(sheetMap[item?.sheetId])
      ?? firstChartableFromSubmodule(submoduleMap[item?.submoduleId])
      ?? firstChartableFromModule(moduleMap[item?.moduleId])
      ?? firstChartableId(allWorksheets);
    items = fallback ? [fallback] : items;
  }

  if (!sheets.length && items.length) sheets = dedupeList(items.map((id) => worksheetMap[id]?.sheetId).filter(Boolean));
  if (!submoduleId && sheets[0]) submoduleId = sheetMap[sheets[0]]?.submoduleId ?? null;
  if (!submoduleId && items[0]) submoduleId = worksheetMap[items[0]]?.submoduleId ?? null;
  if (!moduleId && submoduleId) moduleId = submoduleMap[submoduleId]?.moduleId ?? null;
  if (!moduleId && sheets[0]) moduleId = sheetMap[sheets[0]]?.moduleId ?? null;
  if (!moduleId && items[0]) moduleId = worksheetMap[items[0]]?.moduleId ?? null;
  if (!moduleId) moduleId = moduleIds[0] ?? null;
  if (!submoduleId) submoduleId = moduleMap[moduleId]?.submodules?.[0]?.id ?? submoduleIds[0] ?? null;

  if (!sheets.length) {
    sheets = (submoduleMap[submoduleId]?.sheets ?? []).map((sheet) => sheet.id).filter(Boolean).slice(0, 1);
  }
  if (!items.length) {
    const sheetItems = sheets.flatMap((sheetId) => sheetMap[sheetId]?.kpis ?? []);
    const fallbackItem = firstChartableId(sheetItems)
      ?? firstChartableFromSubmodule(submoduleMap[submoduleId])
      ?? firstChartableFromModule(moduleMap[moduleId])
      ?? firstChartableId(allWorksheets);
    items = fallbackItem ? [fallbackItem] : [];
  }

  if (items[0] && worksheetMap[items[0]]) {
    const selectedItem = worksheetMap[items[0]];
    moduleId = selectedItem.moduleId ?? moduleId;
    submoduleId = selectedItem.submoduleId ?? submoduleId;
    sheets = [selectedItem.sheetId].filter(Boolean);
    items = [selectedItem.id];
  }

  const rangeFrom = Number(config?.YearRange?.from ?? YEARS[0]);
  const rangeTo = Number(config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearFrom = Math.min(rangeFrom, rangeTo);
  const yearTo = Math.max(rangeFrom, rangeTo);
  const focusYear = Number(config?.ActiveYear ?? yearTo);

  return {
    modules: moduleId ? [moduleId] : [],
    submodules: submoduleId ? [submoduleId] : [],
    sheets,
    items,
    breakdowns: dedupeList(config?.CompareBreakdowns ?? []),
    iits: dedupeList(config?.InstituteId?.length ? config.InstituteId : LEGACY_IITS),
    yearFrom,
    yearTo,
    focusYear: focusYear >= yearFrom && focusYear <= yearTo ? focusYear : yearTo,
    view: normalizeCompareView(config?.CompareView),
    scale: SCALE_OPTIONS.some((option) => option.id === config?.CompareScale) ? config.CompareScale : "raw",
  };
}

function deriveModeValidity(items, iits, yearFrom, yearTo) {
  const years = YEARS.filter((year) => year >= yearFrom && year <= yearTo);
  const selected = items.filter(Boolean);
  const chartable = selected.filter((item) => item.comparable);
  const tableOnlyItems = selected.filter((item) => !item.comparable);

  return {
    grouped: {
      valid: chartable.length >= 1 && iits.length >= 1,
      reason: chartable.length < 1
        ? "Select at least one chartable KPI."
        : iits.length < 1
          ? "Select at least one IIT."
          : "",
    },
    smallBars: {
      valid: chartable.length >= 1 && iits.length >= 1,
      reason: chartable.length < 1 ? "Select at least one chartable KPI." : "",
    },
    smallLines: {
      valid: chartable.length >= 1 && iits.length >= 1 && years.length >= 1,
      reason: chartable.length < 1 ? "Select at least one chartable KPI." : "",
    },
    smallMultiples: {
      valid: chartable.length >= 1 && iits.length >= 1,
      reason: chartable.length < 1 ? "Select at least one chartable KPI." : "",
    },
    table: {
      valid: selected.length >= 1 && iits.length >= 1,
      reason: selected.length < 1 ? "Select at least one KPI." : "",
    },
    chartableCount: chartable.length,
    tableOnlyCount: tableOnlyItems.length,
    years,
  };
}

export default function ComparePage({
  facts,
  config,
  accent,
  role,
  onConfigChange,
}) {
  const hierarchy = COMPARE_HIERARCHY;
  const moduleMap = useMemo(() => Object.fromEntries(hierarchy.map((module) => [module.id, module])), [hierarchy]);
  const submoduleMap = useMemo(
    () => Object.fromEntries(
      hierarchy.flatMap((module) =>
        module.submodules.map((submodule) => [
          submodule.id,
          {
            ...submodule,
            moduleId: module.id,
          },
        ]),
      ),
    ),
    [hierarchy],
  );
  const sheetMap = useMemo(
    () => Object.fromEntries(
      hierarchy.flatMap((module) =>
        module.submodules.flatMap((submodule) =>
          (submodule.sheets ?? []).map((sheet) => [
            sheet.id,
            {
              ...sheet,
              categoryLabel: module.label ?? module.id,
              moduleLabel: module.label ?? module.id,
              moduleId: module.id,
              submoduleId: submodule.id,
              submoduleLabel: submodule.label ?? submodule.id,
            },
          ]),
        ),
      ),
    ),
    [hierarchy],
  );
  const worksheetMap = useMemo(
    () => Object.fromEntries(
      hierarchy.flatMap((module) =>
        module.submodules.flatMap((submodule) =>
          (submodule.sheets ?? []).flatMap((sheet) =>
            (sheet.kpis ?? []).map((worksheet) => [
              worksheet.id,
              {
                ...worksheet,
                categoryLabel: module.label ?? module.id,
                moduleLabel: module.label ?? module.id,
                moduleId: module.id,
                submoduleId: submodule.id,
                submoduleLabel: submodule.label ?? submodule.id,
                sheetId: sheet.id,
                sheetLabel: sheet.label ?? worksheet.sheetLabel ?? worksheet.label,
                kpiLabel: worksheet.kpiLabel ?? worksheet.label ?? worksheet.kpi?.label,
              },
            ]),
          ),
        ),
      ),
    ),
    [hierarchy],
  );

  const [builderOpen, setBuilderOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [draft, setDraft] = useState(() => createDefaultDraft());
  const [applied, setApplied] = useState(null);
  const [search, setSearch] = useState({ modules: "", submodules: "", items: "", iits: "" });
  const [notice, setNotice] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState(null);
  const [lastDownloadedAt, setLastDownloadedAt] = useState(null);
  const [toolbarSearch, setToolbarSearch] = useState("");
  const [visibleCompareLegendIds, setVisibleCompareLegendIds] = useState([]);
  const [activeBarSegment, setActiveBarSegment] = useState(null);
  const [drillReturnSelection, setDrillReturnSelection] = useState(null);
  const [drillBreadcrumbTrail, setDrillBreadcrumbTrail] = useState([]);
  const [moduleSearch, setModuleSearch] = useState("");
  const [submoduleSearch, setSubmoduleSearch] = useState("");
  const [iitSearch, setIitSearch] = useState("");
  const [sortBy, setSortBy] = useState("selected");
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubmodules, setExpandedSubmodules] = useState({});
  const chartRef = useRef(null);
  const fullscreenRef = useRef(null);
  const lastConfigRequestRef = useRef(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (Object.keys(expandedModules).length) return;
    setExpandedModules(Object.fromEntries(hierarchy.map((module) => [module.id, true])));
  }, [expandedModules, hierarchy]);

  useEffect(() => {
    if (!openPopover) return;
    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-compare-toolbar]') || target.closest('[data-compare-popover]')) return;
      setOpenPopover(null);
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setOpenPopover(null);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openPopover]);

  const selectedModules = useMemo(() => draft.modules.map((id) => moduleMap[id]).filter(Boolean), [draft.modules, moduleMap]);
  const availableSubmodules = useMemo(() => selectedModules.flatMap((module) => module.submodules), [selectedModules]);
  const selectedSubmodules = useMemo(() => draft.submodules.map((id) => submoduleMap[id]).filter(Boolean), [draft.submodules, submoduleMap]);
  const availableSheets = useMemo(() => selectedSubmodules.flatMap((submodule) => submodule.sheets ?? []), [selectedSubmodules]);
  const selectedSheets = useMemo(() => draft.sheets.map((id) => sheetMap[id]).filter(Boolean), [draft.sheets, sheetMap]);
  const availableItems = useMemo(() => selectedSheets.flatMap((sheet) => sheet.kpis ?? []), [selectedSheets]);
  const selectedItems = useMemo(() => draft.items.map((id) => worksheetMap[id]).filter(Boolean), [draft.items, worksheetMap]);
  const draftYears = useMemo(() => YEARS.filter((year) => year >= draft.yearFrom && year <= draft.yearTo), [draft.yearFrom, draft.yearTo]);
  const draftBreakdownOptions = useMemo(
    () => breakdownOptionsForItems(selectedItems, facts, draft.iits, draftYears, 80),
    [selectedItems, facts, draft.iits, draftYears],
  );

  const modeValidity = useMemo(
    () => deriveModeValidity(selectedItems, draft.iits, draft.yearFrom, draft.yearTo),
    [draft.iits, draft.yearFrom, draft.yearTo, selectedItems],
  );

  useEffect(() => {
    if (draft.focusYear < draft.yearFrom || draft.focusYear > draft.yearTo) {
      setDraft((prev) => ({ ...prev, focusYear: prev.yearTo }));
    }
  }, [draft.focusYear, draft.yearFrom, draft.yearTo]);

  useEffect(() => {
    if (!draft.breakdowns?.length) return;
    const allowed = new Set(draftBreakdownOptions);
    const nextBreakdowns = draft.breakdowns.filter((item) => allowed.has(item));
    if (nextBreakdowns.length !== draft.breakdowns.length) {
      setDraft((prev) => ({ ...prev, breakdowns: nextBreakdowns }));
    }
  }, [draft.breakdowns, draftBreakdownOptions]);

  useEffect(() => {
    if (!modeValidity[draft.view]?.valid) {
      const fallback = VIEW_OPTIONS.find((option) => modeValidity[option.id]?.valid)?.id ?? "table";
      setDraft((prev) => ({ ...prev, view: fallback, scale: fallback === "table" ? "raw" : prev.scale }));
    }
  }, [draft.view, modeValidity]);

  useEffect(() => {
    const requestKey = config?.CompareRequestKey ?? "__initial__";
    if (lastConfigRequestRef.current === requestKey) return;

    const nextDraft = createDraftFromConfig(config, moduleMap, submoduleMap, sheetMap, worksheetMap);
    lastConfigRequestRef.current = requestKey;
    setDraft(nextDraft);
    setToolbarSearch(config?.CompareKeyword ?? "");
    setSearch({ modules: "", submodules: "", items: "", iits: "" });
    setSortBy("selected");
    setOpenPopover(null);
    setBuilderOpen(false);
    setVisibleCompareLegendIds([]);
    setActiveBarSegment(null);

    if (config?.CompareAutoApply || config?.__compareApplied || requestKey === "__initial__") {
      setApplied(nextDraft);
    }
  }, [config, moduleMap, submoduleMap, sheetMap, worksheetMap]);

  if (role !== "ministry") {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
        Compare is available for Ministry access in this build.
      </div>
    );
  }

  const appliedItems = (applied?.items ?? []).map((id) => worksheetMap[id]).filter(Boolean);
  const appliedYears = YEARS.filter((year) => year >= (applied?.yearFrom ?? YEARS[0]) && year <= (applied?.yearTo ?? YEARS[YEARS.length - 1]));
  const appliedIITs = applied?.iits ?? [];
  const appliedModeValidity = deriveModeValidity(appliedItems, appliedIITs, applied?.yearFrom ?? YEARS[0], applied?.yearTo ?? YEARS[YEARS.length - 1]);
  const uiAccent = accent || "#1d4ed8";
  const lastUpdatedLabel = formatCompareTimestamp(facts?.meta?.generatedAt);
  const lastDownloadedLabel = formatCompareTimestamp(lastDownloadedAt);

  const appliedMetricLookup = useMemo(
    () =>
      Object.fromEntries(
        appliedItems.map((item) => [
          item.id,
          {
            ...item,
            kpi: item.kpi ?? KPI_BY_ID[item.kpiId],
          },
        ]),
      ),
    [appliedItems],
  );

  const chartableAppliedItems = appliedItems.filter((item) => item.comparable);
  const primaryChartableAppliedItem = chartableAppliedItems[0] ?? null;
  const groupedIITs = useMemo(() => sortIitsAlphabetically(appliedIITs ?? []), [appliedIITs]);
  const compareChartCrowded = groupedIITs.length > 10;
  const compareKpiCrowded = chartableAppliedItems.length > 10;
  const appliedBreakdownOptions = useMemo(
    () => breakdownOptionsForItems(appliedItems, facts, appliedIITs, appliedYears, 80),
    [appliedItems, facts, appliedIITs, appliedYears],
  );
  const appliedBreakdownKeys = useMemo(() => {
    const allowed = new Set(appliedBreakdownOptions);
    const selected = (applied?.breakdowns ?? []).filter((item) => allowed.has(item));
    if (selected.length) return selected;
    return appliedBreakdownOptions.slice(0, Math.min(6, appliedBreakdownOptions.length));
  }, [applied, appliedBreakdownOptions]);

  const groupedStackSeries = useMemo(() => {
    if (!applied) return [];
    const series = [];
    const useBreakdownSeries = chartableAppliedItems.length <= COMPARE_BREAKDOWN_KPI_LIMIT;
    chartableAppliedItems.forEach((item, itemIndex) => {
      const itemBreakdowns = useBreakdownSeries && itemSupportsBreakdown(item) && appliedBreakdownKeys.length
        ? appliedBreakdownKeys
        : [TOTAL_COMPARISON_KEY];
      itemBreakdowns.forEach((breakdownKey, breakdownIndex) => {
        const id = compareSeriesLegendId(item.id, breakdownKey);
        const breakdownLabel = compareBreakdownLabel(breakdownKey);
        const itemLabel = compareItemLabel(item);
        const fullLabel = breakdownKey === TOTAL_COMPARISON_KEY ? itemLabel : `${itemLabel} > ${breakdownLabel}`;
        const visibleLabel = breakdownKey === TOTAL_COMPARISON_KEY ? itemLabel : breakdownLabel;
        series.push({
          id,
          itemId: item.id,
          item,
          kpi: item.kpi,
          breakdownKey,
          label: fullLabel,
          shortLabel: visibleLabel,
          fullLabel,
          legendLabel: visibleLabel,
          color: compareSeriesColor(itemIndex, breakdownIndex, itemBreakdowns.length),
          stackId: `stack_${normalizeSeriesKey(item.id)}`,
        });
      });
    });
    return series;
  }, [applied, appliedBreakdownKeys, chartableAppliedItems]);

  const comparisonLegendItems = useMemo(
    () => groupedStackSeries.map((series) => ({
      id: series.id,
      label: series.legendLabel ?? series.shortLabel,
      title: series.fullLabel ?? series.label,
      color: series.color,
    })),
    [groupedStackSeries],
  );
  const allComparisonLegendIds = useMemo(() => comparisonLegendItems.map((item) => item.id), [comparisonLegendItems]);
  const activeComparisonLegendIds = useMemo(() => {
    const allowed = new Set(allComparisonLegendIds);
    const selected = visibleCompareLegendIds.filter((id) => allowed.has(id));
    return selected.length ? selected : allComparisonLegendIds;
  }, [allComparisonLegendIds, visibleCompareLegendIds]);
  const activeComparisonLegendIdSet = useMemo(() => new Set(activeComparisonLegendIds), [activeComparisonLegendIds]);
  const activeGroupedStackSeries = useMemo(
    () => groupedStackSeries.filter((series) => activeComparisonLegendIdSet.has(series.id)),
    [groupedStackSeries, activeComparisonLegendIdSet],
  );
  const renderedGroupedStackSeries = useMemo(
    () => activeGroupedStackSeries.slice(0, COMPARE_MAX_CHART_SERIES),
    [activeGroupedStackSeries],
  );
  const renderedGroupedStackSeriesIdSet = useMemo(
    () => new Set(renderedGroupedStackSeries.map((series) => series.id)),
    [renderedGroupedStackSeries],
  );
  const compareRenderSeriesLimitHit = activeGroupedStackSeries.length > renderedGroupedStackSeries.length;
  const singleSlotBreakdownView = appliedYears.length === 1 && groupedIITs.length === 1 && renderedGroupedStackSeries.length > 1;
  const groupedTopStackSeriesByItem = useMemo(() => {
    const lookup = {};
    renderedGroupedStackSeries.forEach((series) => {
      lookup[series.itemId] = series;
    });
    return lookup;
  }, [renderedGroupedStackSeries]);

  useEffect(() => {
    setVisibleCompareLegendIds((prev) => prev.filter((id) => allComparisonLegendIds.includes(id)));
  }, [allComparisonLegendIds.join("|")]);

  useEffect(() => {
    setActiveBarSegment(null);
  }, [activeComparisonLegendIds.join("|"), applied?.focusYear, applied?.scale]);

  const groupedStackRows = useMemo(() => {
    if (!applied) return [];
    const rawValuesBySeries = Object.fromEntries(
      groupedStackSeries.map((series) => [
        series.id,
        groupedIITs.map((iid) => valueForBreakdownKey(facts, series.kpi, iid, applied.focusYear, series.breakdownKey)),
      ]),
    );
    const displayValuesBySeries = Object.fromEntries(
      groupedStackSeries.map((series) => {
        const rawValues = rawValuesBySeries[series.id] ?? [];
        return [
          series.id,
          applied.scale === "indexed"
            ? normalizeToLeader(rawValues)
            : rawValues.map((value) => (series.kpi?.format === "pct" && value != null ? Number(value) * 100 : value)),
        ];
      }),
    );

    const rows = groupedIITs.map((iid, instituteIndex) => {
      const row = {
        instituteId: iid,
        instituteName: instituteNameById(iid),
        shortName: instituteShortLabel(iid),
        label: instituteShortLabel(iid),
      };
      groupedStackSeries.forEach((series) => {
        row[`display_${series.id}`] = displayValuesBySeries[series.id]?.[instituteIndex] ?? null;
        row[`raw_${series.id}`] = rawValuesBySeries[series.id]?.[instituteIndex] ?? null;
      });
      chartableAppliedItems.forEach((item) => {
        const itemSeries = groupedStackSeries.filter((series) => series.itemId === item.id);
        row[`displayTotal_${item.id}`] = itemSeries.reduce((sum, series) => sum + Number(row[`display_${series.id}`] ?? 0), 0);
        row[`rawTotal_${item.id}`] = itemSeries.reduce((sum, series) => sum + Number(row[`raw_${series.id}`] ?? 0), 0);
      });
      return row;
    });

    return rows.sort((left, right) => {
      const primaryId = chartableAppliedItems[0]?.id;
      const leftValue = Number(left?.[`rawTotal_${primaryId}`]);
      const rightValue = Number(right?.[`rawTotal_${primaryId}`]);
      const leftValid = Number.isFinite(leftValue);
      const rightValid = Number.isFinite(rightValue);
      if (leftValid && rightValid && rightValue !== leftValue) return rightValue - leftValue;
      if (leftValid !== rightValid) return leftValid ? -1 : 1;
      return String(left.label).localeCompare(String(right.label));
    });
  }, [applied, chartableAppliedItems, facts, groupedIITs, groupedStackSeries]);

  const groupedRows = groupedStackRows;
  const groupedChartRows = useMemo(() => {
    if (!applied || !appliedYears.length || !groupedIITs.length) return [];

    return appliedYears.flatMap((year, yearIndex) => {
      const rawValuesBySeries = Object.fromEntries(
        groupedStackSeries.map((series) => [
          series.id,
          groupedIITs.map((iid) => valueForBreakdownKey(facts, series.kpi, iid, year, series.breakdownKey)),
        ]),
      );
      const displayValuesBySeries = Object.fromEntries(
        renderedGroupedStackSeries.map((series) => {
          const rawValues = rawValuesBySeries[series.id] ?? [];
          return [
            series.id,
            applied.scale === "indexed"
              ? normalizeToLeader(rawValues)
              : rawValues.map((value) => (series.kpi?.format === "pct" && value != null ? Number(value) * 100 : value)),
          ];
        }),
      );

      const rowsForYear = groupedIITs.map((iid, instituteIndex) => {
        const row = {
          xKey: `${year}__${iid}`,
          year,
          focusYear: year,
          instituteId: iid,
          instituteName: instituteNameById(iid),
          shortName: instituteShortLabel(iid),
          label: instituteShortLabel(iid),
          isYearStart: instituteIndex === 0,
        };

        renderedGroupedStackSeries.forEach((series) => {
          row[`display_${series.id}`] = displayValuesBySeries[series.id]?.[instituteIndex] ?? null;
          row[`raw_${series.id}`] = rawValuesBySeries[series.id]?.[instituteIndex] ?? null;
        });

        chartableAppliedItems.forEach((item) => {
          const visibleItemSeries = renderedGroupedStackSeries.filter((series) => series.itemId === item.id && renderedGroupedStackSeriesIdSet.has(series.id));
          let cumulativeDisplayValue = 0;
          let cumulativeRawValue = 0;
          visibleItemSeries.forEach((series) => {
            const displayValue = row[`display_${series.id}`];
            const rawValue = row[`raw_${series.id}`];
            const hasDisplayValue = displayValue != null && Number.isFinite(Number(displayValue));
            const hasRawValue = rawValue != null && Number.isFinite(Number(rawValue));
            if (hasDisplayValue) cumulativeDisplayValue += Number(displayValue);
            if (hasRawValue) cumulativeRawValue += Number(rawValue);
            row[`tip_${series.id}`] = hasDisplayValue ? cumulativeDisplayValue : null;
            row[`rawTip_${series.id}`] = hasRawValue ? cumulativeRawValue : null;
          });
          row[`displayTotal_${item.id}`] = visibleItemSeries.reduce((sum, series) => sum + Number(row[`display_${series.id}`] ?? 0), 0);
          row[`rawTotal_${item.id}`] = visibleItemSeries.reduce((sum, series) => sum + Number(row[`raw_${series.id}`] ?? 0), 0);
        });

        const trendStartYear = appliedYears[0] ?? year;
        const trendEndYear = year;
        const valueForTrendYear = (trendYear) => renderedGroupedStackSeries.reduce((sum, series) => {
          const raw = valueForBreakdownKey(facts, series.kpi, row.instituteId, trendYear, series.breakdownKey);
          if (raw == null || !Number.isFinite(Number(raw))) return sum;
          return sum + (series.kpi?.format === "pct" ? Number(raw) * 100 : Number(raw));
        }, 0);

        const trendStartValue = valueForTrendYear(trendStartYear);
        const trendEndValue = valueForTrendYear(trendEndYear);
        row.trendStartYear = trendStartYear;
        row.trendEndYear = trendEndYear;
        row.trendStartValue = trendStartValue;
        row.trendEndValue = trendEndValue;
        row.trendDeltaPct = trendStartValue ? (trendEndValue - trendStartValue) / trendStartValue : null;
        return row;
      });

      return rowsForYear;
    });
  }, [renderedGroupedStackSeries, renderedGroupedStackSeriesIdSet, applied, appliedYears, chartableAppliedItems, facts, groupedIITs]);

  const groupedYearLabelKeyByYear = useMemo(() => {
    const rowsByYear = {};
    groupedChartRows.forEach((row) => {
      if (row?.isGap) return;
      if (!rowsByYear[row.year]) rowsByYear[row.year] = [];
      rowsByYear[row.year].push(row.xKey);
    });
    const lookup = {};
    Object.entries(rowsByYear).forEach(([year, keys]) => {
      lookup[year] = keys[Math.floor((keys.length - 1) / 2)] ?? keys[0];
    });
    return lookup;
  }, [groupedChartRows]);

  const groupedYearSeparatorRows = useMemo(
    () => groupedChartRows.filter((row) => !row?.isGap && row?.isYearStart && Number(row.year) !== Number(appliedYears[0])),
    [appliedYears, groupedChartRows],
  );

  const groupedBarMaxSize = useMemo(() => {
    const slotCount = Math.max(1, groupedChartRows.length);
    const visibleStackCount = Math.max(1, dedupeList(renderedGroupedStackSeries.map((series) => series.itemId)).length);
    if (slotCount > 80 || visibleStackCount > 8) return 10;
    if (slotCount > 55 || visibleStackCount > 5) return 14;
    if (slotCount > 35 || visibleStackCount > 3) return 18;
    if (slotCount > 20 || visibleStackCount > 2) return 24;
    return 34;
  }, [renderedGroupedStackSeries, groupedChartRows]);

  const groupedTickFontSize = useMemo(() => {
    const visibleSlots = groupedChartRows.filter((row) => !row?.isGap).length;
    if (visibleSlots > 80 || groupedIITs.length > 14) return 8;
    if (visibleSlots > 55 || groupedIITs.length > 10) return 9;
    if (visibleSlots > 35 || groupedIITs.length > 6) return 10;
    return 11;
  }, [groupedChartRows, groupedIITs.length]);

  const groupedChartHeight = useMemo(() => {
    const base = 400 + Math.min(160, appliedYears.length * 24 + groupedIITs.length * 5);
    return Math.max(460, Math.min(640, base));
  }, [appliedYears.length, groupedIITs.length]);

  const groupedChartMinWidth = useMemo(() => "100%", []);
  const useYearPanelLayout = applied?.view === "grouped" && groupedIITs.length > 10;

  const yearPanelData = useMemo(() => {
    if (!useYearPanelLayout || !groupedChartRows.length) return [];
    return appliedYears.map((year) => ({
      year,
      rows: groupedChartRows.filter((row) => Number(row.year) === Number(year)),
    }));
  }, [useYearPanelLayout, groupedChartRows, appliedYears]);

  const yearPanelMaxValue = useMemo(() => {
    if (!useYearPanelLayout) return 0;
    const totals = [];
    yearPanelData.forEach((panel) => {
      panel.rows.forEach((row) => {
        const total = renderedGroupedStackSeries.reduce((sum, series) => {
          const value = Number(row[`display_${series.id}`] ?? 0);
          return Number.isFinite(value) && value > 0 ? sum + value : sum;
        }, 0);
        if (total > 0) totals.push(total);
      });
    });
    return totals.length ? Math.max(...totals) : 0;
  }, [useYearPanelLayout, yearPanelData, renderedGroupedStackSeries]);

  const yearTrendRows = useMemo(() => {
    if (!applied || !appliedYears.length || !renderedGroupedStackSeries.length) return [];

    const rawValuesBySeries = Object.fromEntries(
      renderedGroupedStackSeries.map((series) => [
        series.id,
        appliedYears.map((year) => aggregateCompareSeriesYearValue(facts, series, groupedIITs, year)),
      ]),
    );
    const displayValuesBySeries = Object.fromEntries(
      renderedGroupedStackSeries.map((series) => {
        const rawValues = rawValuesBySeries[series.id] ?? [];
        return [
          series.id,
          applied.scale === "indexed"
            ? normalizeToBase(rawValues)
            : rawValues.map((value) => (series.kpi?.format === "pct" && value != null ? Number(value) * 100 : value)),
        ];
      }),
    );

    return appliedYears.map((year, yearIndex) => {
      const row = { year, label: String(year) };
      renderedGroupedStackSeries.forEach((series) => {
        row[`raw_${series.id}`] = rawValuesBySeries[series.id]?.[yearIndex] ?? null;
        row[`display_${series.id}`] = displayValuesBySeries[series.id]?.[yearIndex] ?? null;
      });
      return row;
    });
  }, [renderedGroupedStackSeries, applied, appliedYears, facts, groupedIITs]);

  const smallMultipleBarSeries = useMemo(() => {
    if (!applied || !appliedYears.length || !groupedIITs.length || !renderedGroupedStackSeries.length) return [];

    return renderedGroupedStackSeries.slice(0, COMPARE_MAX_SMALL_MULTIPLE_CARDS).map((series) => {
      const iitBars = groupedIITs.map((iid, instituteIndex) => ({
        id: normalizeSeriesKey(`${series.id}_${iid}`),
        legendId: series.id,
        iid,
        itemId: series.itemId,
        breakdownKey: series.breakdownKey,
        label: instituteShortLabel(iid),
        fullLabel: `${series.fullLabel ?? series.label} · ${instituteNameById(iid)}`,
        kpi: series.kpi,
        color: compareIitColor(iid, instituteIndex),
      }));

      const rawValuesByIit = Object.fromEntries(
        iitBars.map((bar) => [
          bar.id,
          appliedYears.map((year) => valueForBreakdownKey(facts, series.kpi, bar.iid, year, series.breakdownKey)),
        ]),
      );
      const displayValuesByIit = Object.fromEntries(
        iitBars.map((bar) => {
          const rawValues = rawValuesByIit[bar.id] ?? [];
          return [
            bar.id,
            applied.scale === "indexed"
              ? normalizeToBase(rawValues)
              : rawValues.map((value) => (series.kpi?.format === "pct" && value != null ? Number(value) * 100 : value)),
          ];
        }),
      );

      const rows = appliedYears.map((year, yearIndex) => {
        const row = {
          year,
          label: String(year),
          cardId: `year-bars-${series.id}`,
        };
        iitBars.forEach((bar) => {
          row[`raw_${bar.id}`] = rawValuesByIit[bar.id]?.[yearIndex] ?? null;
          row[`display_${bar.id}`] = displayValuesByIit[bar.id]?.[yearIndex] ?? null;
        });
        row.displayTotal_all = iitBars.reduce((sum, bar) => sum + Number(row[`display_${bar.id}`] ?? 0), 0);
        row.rawTotal_all = iitBars.reduce((sum, bar) => sum + Number(row[`raw_${bar.id}`] ?? 0), 0);
        row[`displayTotal_${series.itemId}`] = row.displayTotal_all;
        row[`rawTotal_${series.itemId}`] = row.rawTotal_all;
        return row;
      });

      return {
        id: `year-bars-${series.id}`,
        chartKind: "yearBars",
        label: series.legendLabel ?? series.shortLabel,
        subtitle: "",
        lines: iitBars,
        rows,
      };
    });
  }, [renderedGroupedStackSeries, applied, appliedYears, facts, groupedIITs]);

  const smallMultipleLineSeries = useMemo(() => {
    if (!applied || !appliedYears.length || !groupedIITs.length || !renderedGroupedStackSeries.length) return [];

    return renderedGroupedStackSeries.slice(0, COMPARE_MAX_SMALL_MULTIPLE_CARDS).map((series) => {
      const iitLines = groupedIITs.map((iid, instituteIndex) => ({
        id: normalizeSeriesKey(`${series.id}_${iid}`),
        legendId: series.id,
        iid,
        itemId: series.itemId,
        breakdownKey: series.breakdownKey,
        label: instituteShortLabel(iid),
        fullLabel: `${series.fullLabel ?? series.label} · ${instituteNameById(iid)}`,
        kpi: series.kpi,
        color: compareIitColor(iid, instituteIndex),
      }));
      const rawValuesByIit = Object.fromEntries(
        iitLines.map((line) => [
          line.id,
          appliedYears.map((year) => valueForBreakdownKey(facts, series.kpi, line.iid, year, series.breakdownKey)),
        ]),
      );
      const displayValuesByIit = Object.fromEntries(
        iitLines.map((line) => {
          const rawValues = rawValuesByIit[line.id] ?? [];
          return [
            line.id,
            applied.scale === "indexed"
              ? normalizeToBase(rawValues)
              : rawValues.map((value) => (series.kpi?.format === "pct" && value != null ? Number(value) * 100 : value)),
          ];
        }),
      );

      const rows = appliedYears.map((year, yearIndex) => {
        const row = { year, label: String(year), seriesId: series.id };
        iitLines.forEach((line) => {
          row[`raw_${line.id}`] = rawValuesByIit[line.id]?.[yearIndex] ?? null;
          row[`display_${line.id}`] = displayValuesByIit[line.id]?.[yearIndex] ?? null;
        });
        return row;
      });

      return {
        id: `year-lines-${series.id}`,
        chartKind: "yearLines",
        label: series.legendLabel ?? series.shortLabel,
        subtitle: "",
        lines: iitLines,
        rows,
      };
    });
  }, [renderedGroupedStackSeries, applied, appliedYears, facts, groupedIITs]);

  const smallMultipleSharedYMax = useMemo(() => {
    const values = [];
    smallMultipleBarSeries.forEach((card) => {
      (card.rows ?? []).forEach((row) => {
        (card.lines ?? []).forEach((line) => {
          const value = row?.[`display_${line.id}`];
          if (value != null && Number.isFinite(Number(value))) values.push(Number(value));
        });
      });
    });
    smallMultipleLineSeries.forEach((card) => {
      (card.rows ?? []).forEach((row) => {
        (card.lines ?? []).forEach((line) => {
          const value = row?.[`display_${line.id}`];
          if (value != null && Number.isFinite(Number(value))) values.push(Number(value));
        });
      });
    });
    const maxValue = values.length ? Math.max(...values) : 0;
    if (!maxValue || !Number.isFinite(maxValue)) return null;
    return Math.ceil(maxValue * 1.12);
  }, [smallMultipleBarSeries, smallMultipleLineSeries]);

  const tableRows = useMemo(() => {
    if (!applied) return [];
    return appliedIITs.flatMap((iid) => {
      const institute = IITs.find((entry) => entry.id === iid)?.name ?? iid;
      return appliedItems.flatMap((item) => {
        const selectedBreakdowns = itemSupportsBreakdown(item) && appliedBreakdownKeys.length
          ? appliedBreakdownKeys
          : [];
        const breakdownsForItem = selectedBreakdowns.length
          ? [TOTAL_COMPARISON_KEY, ...selectedBreakdowns]
          : [TOTAL_COMPARISON_KEY];
        return breakdownsForItem.map((breakdownKey) => {
          const row = {
            Institute: institute,
            InstituteCode: iid,
            CompareItem: compareItemLabel(item),
            CompareBy: compareBreakdownLabel(breakdownKey),
            _item: item,
          };
          appliedYears.forEach((year) => {
            row[compareYearKey(year)] = valueForBreakdownKey(facts, item.kpi, iid, year, breakdownKey);
          });
          return row;
        });
      });
    });
  }, [applied, appliedIITs, appliedItems, appliedYears, facts, appliedBreakdownKeys]);

  const compareDetailColumns = useMemo(
    () => [
      { key: "Institute", label: "Institute" },
      { key: "CompareItem", label: "KPI" },
      { key: "CompareBy", label: "Category / Status" },
      ...appliedYears.map((year) => ({ key: compareYearKey(year), label: String(year) })),
    ],
    [appliedYears],
  );

  const compareDetailRows = useMemo(
    () =>
      tableRows.map((row) => {
        const next = { ...row };
        appliedYears.forEach((year) => {
          next[compareYearKey(year)] = fmtRaw(row._item?.kpi, row[compareYearKey(year)]);
        });
        return next;
      }),
    [appliedYears, tableRows],
  );

  const compareInterpretation = useMemo(() => {
    if (!applied) return "Build a comparison to see an interpretation.";

    const lines = [
      `This comparison covers ${appliedItems.length} compare item(s) across ${appliedIITs.length} IIT(s) from ${applied.yearFrom} to ${applied.yearTo}.`,
      `Current visual: ${VIEW_OPTIONS.find((option) => option.id === applied.view)?.label ?? applied.view}. Scale: Raw. Years: ${applied.yearFrom}-${applied.yearTo}.`,
      `Selected IITs: ${summarizeList(appliedIITs.map((iid) => instituteShortLabel(iid)), 4)}.`,
    ];

    if (applied.view === "grouped" && groupedRows.length) {
      let strongest = null;
      groupedRows.forEach((row) => {
        chartableAppliedItems.forEach((item) => {
          const value = row[`raw_${item.id}`];
          if (value == null || !Number.isFinite(Number(value))) return;
          if (!strongest || Number(value) > Number(strongest.value)) {
            strongest = {
              iid: row.instituteId,
              label: compareItemLabel(item),
              value,
              kpi: item.kpi,
            };
          }
        });
      });
      if (strongest) {
        lines.push(
          `In the grouped view, the strongest visible point is ${strongest.label} for ${instituteShortLabel(strongest.iid)} at ${fmtRaw(strongest.kpi, strongest.value)} in ${applied.focusYear}.`,
        );
      }
    }

    if ((applied.view === "smallBars" || applied.view === "smallLines") && (smallMultipleBarSeries.length || smallMultipleLineSeries.length)) {
      let strongest = null;
      smallMultipleBarSeries.forEach((tile) => {
        tile.rows.forEach((row) => {
          (tile.lines ?? []).forEach((line) => {
            const value = row[`raw_${line.id}`];
            if (value == null || !Number.isFinite(Number(value))) return;
            if (!strongest || Number(value) > Number(strongest.value)) {
              strongest = { tile, line, value, year: row.year };
            }
          });
        });
      });
      if (strongest) {
        lines.push(
          `In small multiples, ${strongest.line.shortLabel ?? strongest.line.label} is strongest for ${strongest.tile.label} at ${fmtRaw(strongest.line.kpi, strongest.value)} in ${strongest.year}.`,
        );
      }
    }

    if (applied.view === "table") {
      lines.push(`The tabular view currently expands to ${tableRows.length} institute-item row(s).`);
    }

    return lines.join("\n\n");
  }, [applied, appliedItems, appliedIITs, appliedMetricLookup, chartableAppliedItems, groupedIITs, groupedRows, smallMultipleBarSeries, smallMultipleLineSeries, tableRows]);

  const canApply = Boolean(
    draft.modules.length &&
      draft.submodules.length &&
      (draft.sheets ?? []).length &&
      draft.items.length &&
      draft.iits.length &&
      draft.yearFrom <= draft.yearTo &&
      modeValidity[draft.view]?.valid,
  );

  function openBuilder(step = 1) {
    setBuilderOpen(true);
    setActiveStep(step);
  }

  function closeBuilder() {
    setBuilderOpen(false);
  }

  function clearDraft() {
    setDraft(createDefaultDraft());
    setSearch({ modules: "", submodules: "", items: "", iits: "" });
    setModuleSearch("");
    setSubmoduleSearch("");
    setIitSearch("");
    setActiveStep(1);
  }

  function applyCompare() {
    const payload = {
      ...draft,
      modules: [...draft.modules],
      submodules: [...draft.submodules],
      sheets: [...(draft.sheets ?? [])],
      items: [...draft.items].slice(0, 1),
      breakdowns: [...(draft.breakdowns ?? [])],
      iits: [...draft.iits],
    };
    setApplied(payload);
    setBuilderOpen(false);
    onConfigChange?.((prev) => ({
      ...prev,
      CompareModule: payload.modules[0] ?? prev.CompareModule,
      CompareSubmoduleId: payload.submodules[0] ?? prev.CompareSubmoduleId,
      CompareSheetIds: payload.sheets,
      CompareMetricIds: payload.items.slice(0, 1),
      CompareBreakdowns: payload.breakdowns,
      MetricId: worksheetMap[payload.items[0]]?.kpiId ?? payload.items[0] ?? prev.MetricId,
      CompareView: payload.view,
      CompareScale: payload.scale,
      ActiveYear: payload.focusYear,
      InstituteId: payload.iits,
      YearRange: { from: payload.yearFrom, to: payload.yearTo },
      __compareApplied: true,
    }));
  }

  function removeFromApplied(kind, id) {
    updateSelectionSummarySource((prev) => {
      const next = { ...prev, sheets: [...(prev.sheets ?? [])], breakdowns: [...(prev.breakdowns ?? [])] };
      if (kind === "module") {
        next.modules = next.modules.filter((item) => item !== id);
        const allowedSubmodules = next.modules.flatMap((moduleId) => moduleMap[moduleId]?.submodules.map((submodule) => submodule.id) ?? []);
        next.submodules = next.submodules.filter((item) => allowedSubmodules.includes(item));
        const allowedSheets = next.submodules.flatMap((submoduleId) => submoduleMap[submoduleId]?.sheets?.map((sheet) => sheet.id) ?? []);
        next.sheets = next.sheets.filter((item) => allowedSheets.includes(item));
        const allowedItems = next.sheets.flatMap((sheetId) => sheetMap[sheetId]?.kpis?.map((worksheet) => worksheet.id) ?? []);
        next.items = next.items.filter((item) => allowedItems.includes(item));
      }
      if (kind === "submodule") {
        next.submodules = next.submodules.filter((item) => item !== id);
        const keepModule = next.submodules.some((submoduleId) => submoduleMap[submoduleId]?.moduleId === submoduleMap[id]?.moduleId);
        if (!keepModule) next.modules = next.modules.filter((moduleId) => moduleId !== submoduleMap[id]?.moduleId);
        const allowedSheets = next.submodules.flatMap((submoduleId) => submoduleMap[submoduleId]?.sheets?.map((sheet) => sheet.id) ?? []);
        next.sheets = next.sheets.filter((item) => allowedSheets.includes(item));
        const allowedItems = next.sheets.flatMap((sheetId) => sheetMap[sheetId]?.kpis?.map((worksheet) => worksheet.id) ?? []);
        next.items = next.items.filter((item) => allowedItems.includes(item));
      }
      if (kind === "sheet") {
        next.sheets = next.sheets.filter((item) => item !== id);
        const removedItemIds = sheetMap[id]?.kpis?.map((item) => item.id) ?? [];
        next.items = next.items.filter((item) => !removedItemIds.includes(item));
      }
      if (kind === "item") {
        next.items = next.items.filter((item) => item !== id);
        const item = worksheetMap[id];
        const keepSheet = next.items.some((itemId) => worksheetMap[itemId]?.sheetId === item?.sheetId);
        if (!keepSheet) next.sheets = next.sheets.filter((sheetId) => sheetId !== item?.sheetId);
        const keepSubmodule = next.sheets.some((sheetId) => sheetMap[sheetId]?.submoduleId === item?.submoduleId);
        if (!keepSubmodule) next.submodules = next.submodules.filter((submoduleId) => submoduleId !== item?.submoduleId);
        const keepModule = next.submodules.some((submoduleId) => submoduleMap[submoduleId]?.moduleId === item?.moduleId);
        if (!keepModule) next.modules = next.modules.filter((moduleId) => moduleId !== item?.moduleId);
      }
      if (kind === "breakdown") next.breakdowns = next.breakdowns.filter((item) => item !== id);
      if (kind === "iit") next.iits = next.iits.filter((item) => item !== id);
      if (kind === "mode") next.view = VIEW_OPTIONS.find((option) => option.id !== next.view && deriveModeValidity(next.items.map((item) => worksheetMap[item]).filter(Boolean), next.iits, next.yearFrom, next.yearTo)[option.id]?.valid)?.id ?? next.view;
      if (kind === "scale") next.scale = "raw";
      return next;
    });
  }

  function markDownloaded(message, timestamp = new Date().toISOString()) {
    setLastDownloadedAt(timestamp);
    setNotice(message);
  }

  async function handleShare() {
    if (!applied) return;
    const summary = [
      "IIT MIS Compare",
      `Categories: ${(applied.modules ?? []).map((id) => humanizeCompareLabel(moduleMap[id]?.label ?? id)).join(", ")}`,
      `Modules: ${(applied.submodules ?? []).map((id) => humanizeCompareLabel(submoduleMap[id]?.label ?? id)).join(", ")}`,
      `Sheets: ${(applied.sheets ?? []).map((id) => humanizeCompareLabel(sheetMap[id]?.label ?? id)).join(", ")}`,
      `KPIs: ${(applied.items ?? []).map((id) => compareItemLabel(worksheetMap[id] ?? { id })).join(", ")}`,
      `Compare by: ${(applied.breakdowns ?? []).length ? applied.breakdowns.map(compareBreakdownLabel).join(", ") : "Default breakdown / total"}`,
      `IITs: ${(applied.iits ?? []).join(", ")}`,
      `Years: ${applied.yearFrom}-${applied.yearTo}`,
      `Ranking year: ${applied.focusYear}`,
      `Mode: ${applied.view}`,
      `Scale: ${applied.scale}`,
    ].join("\n");
    if (navigator.share) {
      try {
        await navigator.share({ title: "IIT MIS Compare", text: summary });
        setNotice("Comparison summary shared.");
        return;
      } catch {
        // fall through to clipboard
      }
    }
    const ok = await copyToClipboard(summary);
    setNotice(ok ? "Copied comparison summary." : "Copy failed.");
  }

  async function handleDownloadPng() {
    const target = isFullscreen ? fullscreenRef.current : chartRef.current;
    await downloadElementImage(target, `iitmis_compare_${applied?.view ?? "compare"}.png`, "png");
    markDownloaded("PNG downloaded.");
  }

  async function handleDownloadSvg() {
    const target = isFullscreen ? fullscreenRef.current : chartRef.current;
    await downloadElementSvg(target, `iitmis_compare_${applied?.view ?? "compare"}.svg`, { preserveLayout: true });
    markDownloaded("SVG downloaded.");
  }

  async function handleDownloadPdf() {
    const target = isFullscreen ? fullscreenRef.current : chartRef.current;
    await downloadElementPdf(target, `IIT MIS Compare ${applied?.focusYear ?? ""}`);
    markDownloaded("PDF downloaded.");
  }

  function handleDownloadCsv() {
    downloadText(
      "iitmis_compare.csv",
      toCsv(compareDetailRows, compareDetailColumns),
      "text/csv;charset=utf-8",
    );
    markDownloaded("CSV downloaded.");
  }

  function openDetailsDrawer() {
    setSpeedDialOpen(false);
    if (isFullscreen) {
      setIsFullscreen(false);
      window.setTimeout(() => setDetailsOpen(true), 120);
      return;
    }
    setDetailsOpen(true);
  }

  function openAiDrawer() {
    setSpeedDialOpen(false);
    if (isFullscreen) {
      setIsFullscreen(false);
      window.setTimeout(() => setAiPanelOpen(true), 120);
      return;
    }
    setAiPanelOpen(true);
  }

  async function handleCopyAiInterpretation() {
    const ok = await copyToClipboard(compareInterpretation);
    setToast(ok ? "AI interpretation copied." : "Copy failed. Select and copy the text manually.");
  }

  function openWorksheetFilters() {
    setSpeedDialOpen(false);
    if (isFullscreen) {
      setIsFullscreen(false);
      window.setTimeout(() => {
        setBuilderOpen(true);
        setOpenPopover("filters");
      }, 120);
      return;
    }
    setBuilderOpen(true);
    setOpenPopover("filters");
  }

  const speedDialItems = [
    {
      id: "share",
      label: "Share / Embed",
      icon: "share",
      action: handleShare,
    },
    {
      id: "download",
      label: applied?.view === "table" ? "Download CSV" : "Download SVG",
      icon: "download",
      action: applied?.view === "table" ? handleDownloadCsv : handleDownloadSvg,
    },
    {
      id: "raw-data",
      label: "Details",
      icon: "details",
      action: openDetailsDrawer,
    },
    {
      id: "ai",
      label: "AI interpretation",
      icon: "ai",
      action: openAiDrawer,
    },
  ];

  function openBuilder(step = 1) {
    setBuilderOpen(true);
    setActiveStep(step);
    setOpenPopover(step === 4 ? "mode" : "filters");
  }

  function openCompareByFilters() {
    setBuilderOpen(true);
    setActiveStep(1);
    setOpenPopover("filters");
    window.setTimeout(() => {
      document.getElementById("compare-by-filter-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function toggleComparisonLegendItem(itemId) {
    setVisibleCompareLegendIds((prev) => {
      const validPrev = prev.filter((id) => allComparisonLegendIds.includes(id));
      if (!validPrev.length) return [itemId];
      if (validPrev.includes(itemId)) {
        const next = validPrev.filter((id) => id !== itemId);
        return next.length ? next : [];
      }
      return [...validPrev, itemId];
    });
  }

  function closeBuilder() {
    setBuilderOpen(false);
    setActiveStep(1);
    setOpenPopover(null);
  }

  function clearDraft() {
    setDraft(createDefaultDraft());
    setSearch({ modules: "", submodules: "", items: "", iits: "" });
    setToolbarSearch("");
    setModuleSearch("");
    setSubmoduleSearch("");
    setIitSearch("");
    setSortBy("selected");
    setOpenPopover("filters");
  }

  function applyCompare() {
    const payload = {
      ...draft,
      modules: [...draft.modules],
      submodules: [...draft.submodules],
      sheets: [...(draft.sheets ?? [])],
      items: [...draft.items].slice(0, 1),
      breakdowns: [...(draft.breakdowns ?? [])],
      iits: [...draft.iits],
    };
    setApplied(payload);
    setDrillReturnSelection(null);
    setDrillBreadcrumbTrail([]);
    setActiveBarSegment(null);
    setBuilderOpen(false);
    setActiveStep(1);
    setOpenPopover(null);
    onConfigChange?.((prev) => ({
      ...prev,
      CompareModule: payload.modules[0] ?? prev.CompareModule,
      CompareSubmoduleId: payload.submodules[0] ?? prev.CompareSubmoduleId,
      CompareSheetIds: payload.sheets,
      CompareMetricIds: payload.items.slice(0, 1),
      CompareBreakdowns: payload.breakdowns,
      MetricId: worksheetMap[payload.items[0]]?.kpiId ?? payload.items[0] ?? prev.MetricId,
      CompareView: payload.view,
      CompareScale: payload.scale,
      ActiveYear: payload.focusYear,
      InstituteId: payload.iits,
      YearRange: { from: payload.yearFrom, to: payload.yearTo },
      __compareApplied: true,
    }));
  }

  function commitAppliedSelection(next) {
    if (!next) return;
    setActiveBarSegment(null);
    const normalizedNext = {
      ...next,
      modules: [...(next.modules ?? [])],
      submodules: [...(next.submodules ?? [])],
      sheets: [...(next.sheets ?? [])],
      items: [...(next.items ?? [])].slice(0, 1),
      breakdowns: [...(next.breakdowns ?? [])],
      iits: [...(next.iits ?? [])],
    };
    if (!normalizedNext.modules.length || !normalizedNext.submodules.length || !(normalizedNext.sheets ?? []).length || !normalizedNext.items.length || !normalizedNext.iits.length) {
      setApplied(null);
      setDraft(normalizedNext);
      return;
    }
    setApplied(normalizedNext);
    setDraft(normalizedNext);
  }

  function syncCompareConfig(next) {
    if (!next) return;
    onConfigChange?.((prev) => ({
      ...prev,
      CompareModule: next.modules?.[0] ?? prev.CompareModule,
      CompareSubmoduleId: next.submodules?.[0] ?? prev.CompareSubmoduleId,
      CompareSheetIds: next.sheets ?? [],
      CompareMetricIds: (next.items ?? []).slice(0, 1),
      CompareBreakdowns: next.breakdowns ?? [],
      MetricId: worksheetMap[next.items?.[0]]?.kpiId ?? next.items?.[0] ?? prev.MetricId,
      CompareView: next.view,
      CompareScale: next.scale,
      ActiveYear: next.focusYear,
      InstituteId: next.iits ?? [],
      YearRange: { from: next.yearFrom, to: next.yearTo },
      __compareApplied: true,
    }));
  }


  function selectCompareFocusYear(yearValue) {
    const nextYear = Number(yearValue);
    if (!Number.isFinite(nextYear)) return;
    setActiveBarSegment(null);
    if (applied) {
      const nextApplied = { ...applied, focusYear: nextYear };
      commitAppliedSelection(nextApplied);
      onConfigChange?.((prev) => ({
        ...prev,
        ActiveYear: nextYear,
        YearRange: { from: nextApplied.yearFrom, to: nextApplied.yearTo },
        __compareApplied: true,
      }));
      return;
    }
    setDraft((prev) => ({ ...prev, focusYear: nextYear }));
  }

  function nextDrillTrailFrom(selection = applied) {
    const baseTrail = drillBreadcrumbTrail.length
      ? drillBreadcrumbTrail.map(cloneCompareSelection)
      : drillReturnSelection
        ? [cloneCompareSelection(drillReturnSelection)]
        : [];
    if (!selection) return baseTrail;
    const clonedSelection = cloneCompareSelection(selection);
    const lastCrumb = baseTrail[baseTrail.length - 1];
    if (lastCrumb && sameCompareSelection(lastCrumb, clonedSelection)) return baseTrail;
    return [...baseTrail, clonedSelection];
  }

  function setDrillTrail(nextTrail = []) {
    const normalizedTrail = nextTrail.map(cloneCompareSelection);
    setDrillBreadcrumbTrail(normalizedTrail);
    setDrillReturnSelection(normalizedTrail[0] ?? null);
  }

  function goToDrillBreadcrumbLevel(index) {
    if (!applied) return;
    const trail = drillBreadcrumbTrail.length
      ? drillBreadcrumbTrail.map(cloneCompareSelection)
      : drillReturnSelection
        ? [cloneCompareSelection(drillReturnSelection)]
        : [];
    const selections = [...trail, cloneCompareSelection(applied)];
    const target = selections[index];
    if (!target || index === selections.length - 1) return;
    setDrillTrail(trail.slice(0, index));
    commitAppliedSelection(target);
    syncCompareConfig(target);
  }

  function drillToIitFromAxisLabel(axisValue) {
    if (!applied) return;
    const parsedIid = String(axisValue ?? "").includes("__") ? String(axisValue).split("__")[1] : axisValue;
    const match = groupedIITs.find((iid) => iid === parsedIid || instituteShortLabel(iid) === axisValue || instituteNameById(iid) === axisValue);
    if (!match || sameMembers(applied.iits ?? [], [match])) return;
    setDrillTrail(nextDrillTrailFrom(applied));
    const nextApplied = { ...applied, iits: [match] };
    commitAppliedSelection(nextApplied);
    syncCompareConfig(nextApplied);
  }

  function drillToYearFromAxisLabel(yearValue) {
    if (!applied) return;
    const year = Number(yearValue);
    if (!Number.isFinite(year)) return;
    if (Number(applied.yearFrom) === year && Number(applied.yearTo) === year) return;
    setDrillTrail(nextDrillTrailFrom(applied));
    const nextApplied = {
      ...applied,
      iits: [...(applied.iits ?? [])],
      items: [...(applied.items ?? [])].slice(0, 1),
      breakdowns: [...(applied.breakdowns ?? [])],
      modules: [...(applied.modules ?? [])],
      submodules: [...(applied.submodules ?? [])],
      sheets: [...(applied.sheets ?? [])],
      yearFrom: year,
      yearTo: year,
      focusYear: year,
    };
    commitAppliedSelection(nextApplied);
    syncCompareConfig(nextApplied);
  }

  function returnFromIitDrill() {
    goToDrillBreadcrumbLevel(0);
  }

  function buildBarSegment(series, row, pinned = false) {
    if (!series || !row) return null;
    const year = Number(row?.year ?? row?.focusYear ?? applied?.focusYear ?? appliedYears[appliedYears.length - 1]);
    const previousYear = appliedYears.filter((item) => Number(item) < year).slice(-1)[0] ?? null;
    const instituteId = series.iid ?? row.instituteId;
    const instituteName = instituteId ? instituteNameById(instituteId) : (row.instituteName ?? row.label);
    const rawValue = row[`raw_${series.id}`];
    const displayValue = row[`display_${series.id}`];
    const stackTotal = row[`displayTotal_${series.itemId}`] ?? row.displayTotal_all;
    const previousRawValue = previousYear && instituteId
      ? valueForBreakdownKey(facts, series.kpi, instituteId, previousYear, series.breakdownKey)
      : null;
    const changePct = previousRawValue != null && Number(previousRawValue) !== 0 && rawValue != null
      ? (Number(rawValue) - Number(previousRawValue)) / Number(previousRawValue)
      : null;
    const sharePct = stackTotal != null && Number(stackTotal) !== 0 && displayValue != null
      ? Number(displayValue) / Number(stackTotal)
      : null;

    return {
      pinned,
      seriesId: series.id,
      cardId: row.cardId ?? null,
      instituteId,
      instituteName,
      year,
      previousYear,
      seriesLabel: series.legendLabel ?? series.shortLabel ?? series.label,
      fullLabel: series.fullLabel ?? series.label,
      color: series.color,
      kpi: series.kpi,
      rawValue,
      displayValue,
      previousRawValue,
      changePct,
      sharePct,
    };
  }

  function handleBarSegmentHover(series, row) {
    setActiveBarSegment((prev) => {
      if (prev?.pinned) return prev;
      return buildBarSegment(series, row, false);
    });
  }

  function handleBarSegmentClick(series, row, event) {
    event?.stopPropagation?.();
    const nextSegment = buildBarSegment(series, row, true);
    setActiveBarSegment((prev) => {
      if (prev?.pinned && prev.seriesId === nextSegment?.seriesId && prev.instituteId === nextSegment?.instituteId && Number(prev.year) === Number(nextSegment?.year) && (prev.cardId ?? null) === (nextSegment?.cardId ?? null)) return null;
      return nextSegment;
    });
  }

  function handleBarChartMouseLeave() {
    setActiveBarSegment((prev) => (prev?.pinned ? prev : null));
  }

  function firstChartableItemId(items = []) {
    return items.find((item) => item?.comparable)?.id ?? items.find((item) => item?.kpi)?.id ?? items[0]?.id ?? null;
  }

  function firstItemIdFromSheetEntity(sheet) {
    return firstChartableItemId(sheet?.kpis ?? []);
  }

  function firstItemIdFromSubmoduleEntity(submodule) {
    const sheetItems = (submodule?.sheets ?? []).flatMap((sheet) => sheet.kpis ?? []);
    return firstChartableItemId(sheetItems)
      ?? firstChartableItemId(submodule?.worksheets ?? [])
      ?? null;
  }

  function firstItemIdFromModuleEntity(module) {
    return (module?.submodules ?? []).map(firstItemIdFromSubmoduleEntity).find(Boolean) ?? null;
  }

  function singleKpiSelection(prev, itemId) {
    const item = worksheetMap[itemId];
    if (!item) return prev;
    return {
      ...prev,
      modules: [item.moduleId].filter(Boolean),
      submodules: [item.submoduleId].filter(Boolean),
      sheets: [item.sheetId].filter(Boolean),
      items: [item.id],
      breakdowns: [],
    };
  }

  function updateSelectionSummarySource(updater) {
    if (applied) {
      const next = typeof updater === "function" ? updater(applied) : updater;
      setDrillReturnSelection(null);
      setDrillBreadcrumbTrail([]);
      commitAppliedSelection(next);
      syncCompareConfig(next);
      return;
    }
    setDraft((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }

  function sortEntities(list, getLabel, getPriority = () => 0) {
    return list
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        if (sortBy === "selected") {
          const priorityDelta = getPriority(right.item) - getPriority(left.item);
          if (priorityDelta) return priorityDelta;
          return left.index - right.index;
        }
        const labelA = getLabel(left.item);
        const labelB = getLabel(right.item);
        const labelDelta = sortBy === "zToA" ? labelB.localeCompare(labelA) : labelA.localeCompare(labelB);
        return labelDelta || left.index - right.index;
      })
      .map(({ item }) => item);
  }

  function handleRangeChange(kind, value) {
    const year = Number(value);
    setDraft((prev) => {
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

  function rankedIitsForDraft(source = draft, limit = 10, direction = "top") {
    const item = worksheetMap[source.items?.[0]];
    const kpi = item?.kpi ?? KPI_BY_ID[item?.kpiId];
    if (!kpi) return [];

    return IITs.map((iit) => ({
      iid: iit.id,
      label: instituteShortLabel(iit.id),
      value: valueForKpi(facts, kpi, iit.id, source.focusYear ?? source.yearTo),
    }))
      .filter((item) => item.value != null && Number.isFinite(Number(item.value)))
      .sort((left, right) => {
        const delta = direction === "bottom"
          ? Number(left.value) - Number(right.value)
          : Number(right.value) - Number(left.value);
        return delta || left.label.localeCompare(right.label);
      })
      .slice(0, limit)
      .map((item) => item.iid);
  }

  function applyRankedIits(direction = "top") {
    const nextIits = rankedIitsForDraft(draft, 10, direction);
    if (!nextIits.length) {
      setNotice("No ranked IITs available for the selected KPI and ranking year.");
      return;
    }
    setDraft((prev) => ({ ...prev, iits: nextIits }));
  }

  function toggleModuleExpand(moduleId) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }

  function toggleSubmoduleExpand(submoduleId) {
    setExpandedSubmodules((prev) => ({ ...prev, [submoduleId]: !prev[submoduleId] }));
  }

  function toggleModuleSelection(moduleId) {
    const module = moduleMap[moduleId];
    const itemId = firstItemIdFromModuleEntity(module);
    if (!itemId) return;
    setDraft((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleSubmoduleSelection(submoduleId) {
    const submodule = submoduleMap[submoduleId];
    const itemId = firstItemIdFromSubmoduleEntity(submodule);
    if (!itemId) return;
    setDraft((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleSheetSelection(sheetId) {
    const sheet = sheetMap[sheetId];
    const itemId = firstItemIdFromSheetEntity(sheet);
    if (!itemId) return;
    setDraft((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleItemSelection(itemId) {
    if (!worksheetMap[itemId]) return;
    setDraft((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleBreakdownSelection(key) {
    setDraft((prev) => ({
      ...prev,
      breakdowns: (prev.breakdowns ?? []).includes(key)
        ? prev.breakdowns.filter((item) => item !== key)
        : [...(prev.breakdowns ?? []), key],
    }));
  }

  function getModuleSelectionState(module) {
    const subIds = module.submodules.map((submodule) => submodule.id);
    const itemIds = module.submodules.flatMap((submodule) => submodule.worksheets.map((worksheet) => worksheet.id));
    const selectedSubCount = subIds.filter((id) => draft.submodules.includes(id)).length;
    const selectedItemCount = itemIds.filter((id) => draft.items.includes(id)).length;
    const checked = draft.modules.includes(module.id) && selectedSubCount === subIds.length && selectedItemCount === itemIds.length;
    const partial = !checked && (selectedSubCount > 0 || selectedItemCount > 0 || draft.modules.includes(module.id));
    return { checked, partial };
  }

  function getSubmoduleSelectionState(submodule) {
    const itemIds = submodule.worksheets.map((worksheet) => worksheet.id);
    const selectedItemCount = itemIds.filter((id) => draft.items.includes(id)).length;
    const checked = draft.submodules.includes(submodule.id) && selectedItemCount === itemIds.length;
    const partial = !checked && (selectedItemCount > 0 || draft.submodules.includes(submodule.id));
    return { checked, partial };
  }

  function getSheetSelectionState(sheet) {
    const itemIds = (sheet.kpis ?? []).map((item) => item.id);
    const selectedItemCount = itemIds.filter((id) => draft.items.includes(id)).length;
    const checked = (draft.sheets ?? []).includes(sheet.id) && selectedItemCount === itemIds.length;
    const partial = !checked && (selectedItemCount > 0 || (draft.sheets ?? []).includes(sheet.id));
    return { checked, partial };
  }

  const filteredHierarchy = useMemo(() => {
    const query = toolbarSearch.trim().toLowerCase();
    const matches = (...values) => !query || values.some((value) => String(value || "").toLowerCase().includes(query));

    return sortEntities(
      hierarchy
        .map((module) => {
          const moduleMatches = matches(module.id, module.label, module.description);
          const sortedSubmodules = sortEntities(
            module.submodules,
            (submodule) => submodule.label,
            (submodule) => {
              const state = getSubmoduleSelectionState(submodule);
              return state.checked ? 2 : state.partial ? 1 : 0;
            },
          );
          const visibleSubmodules = sortedSubmodules
            .map((submodule) => {
              const submoduleMatches = matches(submodule.label, submodule.helper);
              const sortedItems = sortEntities(
                submodule.worksheets,
                (item) => item.label,
                (item) => (draft.items.includes(item.id) ? 2 : 0),
              );
              const visibleItems = sortedItems.filter((item) => moduleMatches || submoduleMatches || matches(item.label, item.helper));
              if (!moduleMatches && !submoduleMatches && !visibleItems.length) return null;
              return {
                ...submodule,
                worksheets: moduleMatches || submoduleMatches ? sortedItems : visibleItems,
              };
            })
            .filter(Boolean);
          if (!moduleMatches && !visibleSubmodules.length) return null;
          return {
            ...module,
            submodules: moduleMatches ? sortedSubmodules.map((submodule) => ({
              ...submodule,
              worksheets: sortEntities(submodule.worksheets, (item) => item.label, (item) => (draft.items.includes(item.id) ? 2 : 0)),
            })) : visibleSubmodules,
          };
        })
        .filter(Boolean),
      (module) => module.id,
      (module) => {
        const state = getModuleSelectionState(module);
        return state.checked ? 2 : state.partial ? 1 : 0;
      },
    );
  }, [draft.items, draft.modules, draft.submodules, hierarchy, sortBy, toolbarSearch]);

  const filteredIITs = useMemo(() => {
    const query = toolbarSearch.trim().toLowerCase();
    const list = query
      ? IITs.filter((item) => `${item.id} ${item.name} ${item.state || ""}`.toLowerCase().includes(query))
      : IITs;
    return sortEntities(list, (item) => `${item.id} ${item.name}`, (item) => (draft.iits.includes(item.id) ? 2 : 0));
  }, [draft.iits, sortBy, toolbarSearch]);

  const activeFilterCount = [
    draft.modules.length > 0,
    draft.submodules.length > 0,
    (draft.sheets ?? []).length > 0,
    draft.items.length > 0,
    draft.iits.length > 0,
    (draft.breakdowns ?? []).length > 0,
    Boolean(toolbarSearch),
    draft.yearFrom !== YEARS[0] || draft.yearTo !== YEARS[YEARS.length - 1],
  ].filter(Boolean).length;

  const selectionSource = applied ?? draft;
  const selectionIitSummary = selectionSource?.iits?.length === IITs.length
    ? 'ALL'
    : selectionSource?.iits?.length === LEGACY_IITS.length && LEGACY_IITS.every((iid) => selectionSource.iits.includes(iid))
      ? "OLD IITs"
      : selectionSource?.iits?.length
        ? `${selectionSource.iits.length} selected`
        : 'None';

  const compareCarouselModuleItems = useMemo(
    () => hierarchy.map((module) => ({
      id: module.id,
      label: humanizeCompareLabel(module.label ?? module.id),
      tooltip: humanizeCompareLabel(module.description ?? module.label ?? module.id),
    })),
    [hierarchy],
  );

  const compareCarouselSubmoduleItems = useMemo(() => {
    const sourceModules = (selectionSource.modules ?? []).map((id) => moduleMap[id]).filter(Boolean);
    return sourceModules.flatMap((module) =>
      module.submodules.map((submodule) => ({
        id: submodule.id,
        label: humanizeCompareLabel(submodule.label ?? submodule.id),
        tooltip: `${humanizeCompareLabel(module.label ?? module.id)} > ${humanizeCompareLabel(submodule.label ?? submodule.id)}`,
      })),
    );
  }, [selectionSource.modules, moduleMap]);

  const compareCarouselSheetItems = useMemo(() => {
    const sourceSubmodules = (selectionSource.submodules ?? []).map((id) => submoduleMap[id]).filter(Boolean);
    return sourceSubmodules.flatMap((submodule) =>
      (submodule.sheets ?? []).map((sheet) => ({
        id: sheet.id,
        label: humanizeCompareLabel(sheet.label ?? sheet.id),
        tooltip: `${humanizeCompareLabel(moduleMap[submodule.moduleId]?.label ?? submodule.moduleId)} > ${humanizeCompareLabel(submodule.label ?? submodule.id)} > ${humanizeCompareLabel(sheet.label ?? sheet.id)}`,
      })),
    );
  }, [selectionSource.submodules, submoduleMap, moduleMap]);

  const compareCarouselKpiItems = useMemo(() => {
    const sourceSheets = (selectionSource.sheets ?? []).map((id) => sheetMap[id]).filter(Boolean);
    return sourceSheets.flatMap((sheet) =>
      (sheet.kpis ?? []).map((item) => ({
        id: item.id,
        label: compareItemLabel(item),
        tooltip: `${humanizeCompareLabel(moduleMap[sheet.moduleId]?.label ?? sheet.moduleId)} > ${humanizeCompareLabel(submoduleMap[sheet.submoduleId]?.label ?? sheet.submoduleId)} > ${humanizeCompareLabel(sheet.label ?? sheet.id)} > ${compareItemLabel(item)}`,
      })),
    );
  }, [selectionSource.sheets, sheetMap, submoduleMap, moduleMap]);

  function toggleCompareModule(moduleId) {
    const module = moduleMap[moduleId];
    const itemId = firstItemIdFromModuleEntity(module);
    if (!itemId) return;
    updateSelectionSummarySource((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleCompareSubmodule(submoduleId) {
    const submodule = submoduleMap[submoduleId];
    const itemId = firstItemIdFromSubmoduleEntity(submodule);
    if (!itemId) return;
    updateSelectionSummarySource((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleCompareSheet(sheetId) {
    const sheet = sheetMap[sheetId];
    const itemId = firstItemIdFromSheetEntity(sheet);
    if (!itemId) return;
    updateSelectionSummarySource((prev) => singleKpiSelection(prev, itemId));
  }

  function toggleCompareKpi(itemId) {
    if (!worksheetMap[itemId]) return;
    updateSelectionSummarySource((prev) => singleKpiSelection(prev, itemId));
  }

  function renderCompareCarouselSelector() {
    return (
        <CombinedKpiSelector
          title={(
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Select filters</span>
              <SelectionActionButton label="Advanced filters" onClick={() => openBuilder(1)} title="Open advanced compare filters" />
            </div>
          )}
          helper="Choose one category, module, sheet, and KPI for the comparison. Use the carousel arrows only to scroll through choices."
          accent={uiAccent}
          soft={`${uiAccent}12`}
          rows={[
          {
            id: "compare-module",
            label: "Category",
            items: compareCarouselModuleItems,
            activeIds: selectionSource.modules ?? [],
            activeId: firstActiveIdInList(compareCarouselModuleItems, selectionSource.modules ?? []),
            autoScrollTargetId: firstActiveIdInList(compareCarouselModuleItems, selectionSource.modules ?? []),
            onPick: toggleCompareModule,
          },
          {
            id: "compare-submodule",
            label: "Module",
            items: compareCarouselSubmoduleItems,
            activeIds: selectionSource.submodules ?? [],
            activeId: firstActiveIdInList(compareCarouselSubmoduleItems, selectionSource.submodules ?? []),
            autoScrollTargetId: firstActiveIdInList(compareCarouselSubmoduleItems, selectionSource.submodules ?? []),
            onPick: toggleCompareSubmodule,
          },
          {
            id: "compare-sheet",
            label: "Sheet",
            items: compareCarouselSheetItems,
            activeIds: selectionSource.sheets ?? [],
            activeId: firstActiveIdInList(compareCarouselSheetItems, selectionSource.sheets ?? []),
            autoScrollTargetId: firstActiveIdInList(compareCarouselSheetItems, selectionSource.sheets ?? []),
            onPick: toggleCompareSheet,
          },
          {
            id: "compare-kpi",
            label: "KPI",
            items: compareCarouselKpiItems,
            activeIds: selectionSource.items ?? [],
            activeId: firstActiveIdInList(compareCarouselKpiItems, selectionSource.items ?? []),
            autoScrollTargetId: firstActiveIdInList(compareCarouselKpiItems, selectionSource.items ?? []),
            onPick: toggleCompareKpi,
          },
          ]}
        />
    );
  }

  function renderSelectionLine() {
    const source = applied ?? draft;
    const sourceModules = source.modules.map((id) => moduleMap[id]).filter(Boolean);
    const visibleModules = sourceModules.slice(0, 4);
    const hiddenCount = Math.max(sourceModules.length - visibleModules.length, 0);

    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {visibleModules.length ? visibleModules.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => openBuilder(1)}
            title={humanizeCompareLabel(module.label ?? module.id)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition hover:border-sky-200 hover:bg-sky-50/40"
          >
            {humanizeCompareLabel(module.label ?? module.id)}
          </button>
        )) : (
          <span className="text-sm text-slate-500">No module selected.</span>
        )}
        <SelectionActionButton
          label={hiddenCount > 0 ? `More filters (+${hiddenCount})` : 'More filters'}
          onClick={() => openBuilder(1)}
          title="Open module filters"
        />
      </div>
    );
  }

  function renderSubKpiLine() {
    const source = applied ?? draft;
    const sourceSubmodules = source.submodules
      .map((id) => {
        const submodule = submoduleMap[id];
        if (!submodule) return null;
        return {
          ...submodule,
          moduleLabel: moduleMap[submodule.moduleId]?.label ?? moduleMap[submodule.moduleId]?.id ?? submodule.moduleId,
        };
      })
      .filter(Boolean);
    const visibleSubmodules = sourceSubmodules.slice(0, 4);
    const hiddenCount = Math.max(sourceSubmodules.length - visibleSubmodules.length, 0);

    if (!sourceSubmodules.length) {
      return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">No module selected.</span>
          <SelectionActionButton label="More filters" onClick={() => openBuilder(1)} title="Open module filters" />
        </div>
      );
    }

    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {visibleSubmodules.map((submodule) => (
          <button
            key={submodule.id}
            type="button"
            onClick={() => openBuilder(1)}
            title={`${humanizeCompareLabel(submodule.moduleLabel)} > ${humanizeCompareLabel(submodule.label)}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition hover:border-sky-200 hover:bg-sky-50/40"
          >
            {humanizeCompareLabel(submodule.label)}
          </button>
        ))}
        <SelectionActionButton
          label={hiddenCount > 0 ? `More filters (+${hiddenCount})` : 'More filters'}
          onClick={() => openBuilder(1)}
          title="Open module filters"
        />
      </div>
    );
  }

  function renderIitSelectionPanel() {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(148,163,184,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">IIT selection</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, iits: IITs.map((iit) => iit.id) }))}
              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, iits: [] }))}
              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
            >
              Clear
            </button>
          </div>
        </div>
        {draft.iits.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {draft.iits.slice(0, 8).map((iid) => (
              <SimpleChip key={iid} tone="#ea580c" removable onRemove={() => setDraft((prev) => ({ ...prev, iits: prev.iits.filter((item) => item !== iid) }))}>
                {instituteShortLabel(iid)}
              </SimpleChip>
            ))}
            {draft.iits.length > 8 ? <SimpleChip tone="#64748b">+{draft.iits.length - 8} more</SimpleChip> : null}
          </div>
        ) : null}
        <div className="mt-3 grid max-h-44 gap-2 overflow-auto pr-1">
          {filteredIITs.map((iit) => (
            <label key={iit.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/35 px-3 py-2 transition hover:border-sky-100 hover:bg-sky-50/65">
              <input
                type="checkbox"
                checked={draft.iits.includes(iit.id)}
                onChange={() => setDraft((prev) => ({
                  ...prev,
                  iits: prev.iits.includes(iit.id)
                    ? prev.iits.filter((item) => item !== iit.id)
                    : [...prev.iits, iit.id],
                }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-800">{iit.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{iit.state}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function renderFilterPopover() {
    if (openPopover !== 'filters') return null;

    const moduleQuery = moduleSearch.trim().toLowerCase();
    const submoduleQuery = submoduleSearch.trim().toLowerCase();
    const iitQuery = iitSearch.trim().toLowerCase();

    const visibleModules = sortEntities(
      hierarchy.filter((module) => {
        if (!moduleQuery) return true;
        return [module.id, module.label, module.description].some((value) => String(value || '').toLowerCase().includes(moduleQuery));
      }),
      (module) => module.label ?? module.id,
      (module) => (draft.modules.includes(module.id) ? 2 : 0),
    );

    const selectedModuleEntities = draft.modules.map((id) => moduleMap[id]).filter(Boolean);
    const selectedSubmoduleEntities = draft.submodules.map((id) => submoduleMap[id]).filter(Boolean);
    const selectedSheetEntities = (draft.sheets ?? []).map((id) => sheetMap[id]).filter(Boolean);
    const submodulePool = selectedModuleEntities.flatMap((module) =>
      (module.submodules ?? []).map((submodule) => ({
        ...submodule,
        moduleLabel: module.label ?? module.id,
      })),
    );

    const visibleSubmodules = sortEntities(
      submodulePool.filter((submodule) => {
        if (!submoduleQuery) return true;
        return [submodule.label, submodule.helper, submodule.moduleLabel].some((value) => String(value || '').toLowerCase().includes(submoduleQuery));
      }),
      (submodule) => `${submodule.moduleLabel} ${submodule.label}`,
      (submodule) => (draft.submodules.includes(submodule.id) ? 2 : 0),
    );

    const visibleSheets = sortEntities(
      selectedSubmoduleEntities.flatMap((submodule) => (submodule.sheets ?? []).map((sheet) => ({
        ...sheet,
        moduleLabel: moduleMap[submodule.moduleId]?.label ?? submodule.moduleId,
        submoduleLabel: submodule.label ?? submodule.id,
      }))),
      (sheet) => `${sheet.moduleLabel} ${sheet.submoduleLabel} ${sheet.label}`,
      (sheet) => ((draft.sheets ?? []).includes(sheet.id) ? 2 : 0),
    );

    const visibleKpis = sortEntities(
      selectedSheetEntities.flatMap((sheet) => (sheet.kpis ?? []).map((item) => ({
        ...item,
        sheetLabel: sheet.label ?? item.sheetLabel,
      }))),
      (item) => `${item.sheetLabel} ${item.kpiLabel ?? item.label}`,
      (item) => (draft.items.includes(item.id) ? 2 : 0),
    );

    const visibleIITs = sortEntities(
      IITs.filter((iit) => {
        if (!iitQuery) return true;
        return `${iit.id} ${iit.name} ${iit.state || ''}`.toLowerCase().includes(iitQuery);
      }),
      (iit) => `${iit.id} ${iit.name}`,
      (iit) => (draft.iits.includes(iit.id) ? 2 : 0),
    );

    const selectAllModules = () => {
      const itemId = firstItemIdFromModuleEntity(visibleModules[0] ?? hierarchy[0]);
      if (!itemId) return;
      setDraft((prev) => singleKpiSelection(prev, itemId));
    };

    const resetModules = () => {
      setDraft((prev) => ({ ...prev, modules: [], submodules: [], sheets: [], items: [], breakdowns: [] }));
    };

    const selectAllVisibleSubmodules = () => {
      const itemId = firstItemIdFromSubmoduleEntity(visibleSubmodules[0] ?? selectedModuleEntities.flatMap((module) => module.submodules)[0]);
      if (!itemId) return;
      setDraft((prev) => singleKpiSelection(prev, itemId));
    };

    const resetSubmodules = () => {
      const selectedModuleSet = new Set(draft.modules);
      setDraft((prev) => ({
        ...prev,
        submodules: prev.submodules.filter((submoduleId) => !selectedModuleSet.has(submoduleMap[submoduleId]?.moduleId)),
        sheets: (prev.sheets ?? []).filter((sheetId) => !selectedModuleSet.has(sheetMap[sheetId]?.moduleId)),
        items: prev.items.filter((itemId) => !selectedModuleSet.has(worksheetMap[itemId]?.moduleId)),
        breakdowns: [],
      }));
    };

    const selectAllVisibleSheets = () => {
      const itemId = firstItemIdFromSheetEntity(visibleSheets[0]);
      if (!itemId) return;
      setDraft((prev) => singleKpiSelection(prev, itemId));
    };

    const resetSheets = () => {
      const selectedSubmoduleSet = new Set(draft.submodules);
      setDraft((prev) => ({
        ...prev,
        sheets: (prev.sheets ?? []).filter((sheetId) => !selectedSubmoduleSet.has(sheetMap[sheetId]?.submoduleId)),
        items: prev.items.filter((itemId) => !selectedSubmoduleSet.has(worksheetMap[itemId]?.submoduleId)),
        breakdowns: [],
      }));
    };

    const selectAllVisibleKpis = () => {
      const itemId = visibleKpis[0]?.id;
      if (!itemId) return;
      setDraft((prev) => singleKpiSelection(prev, itemId));
    };

    const resetKpis = () => {
      setDraft((prev) => ({ ...prev, items: [], breakdowns: [] }));
    };

    return (
      <div className="fixed inset-0 z-[260] bg-slate-950/18 px-4 py-5 backdrop-blur-[2px]">
        <div
          data-compare-popover
          className="mx-auto flex h-full w-full max-w-[1180px] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[#f3f4f6] shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
        >
          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div>
              <div className="text-[1.25rem] font-extrabold text-slate-900">Compare filters</div>
              <div className="mt-1 text-sm text-slate-500">Refine category, module, sheet, one KPI, date, and IIT filters, then apply them to refresh the compare view.</div>
            </div>
            <button
              type="button"
              onClick={() => setOpenPopover(null)}
              className="grid h-8 w-8 place-items-center rounded-full bg-sky-700 text-white shadow-sm"
              aria-label="Close advanced filters"
            >
              {compareIcon('close', true, '#ffffff')}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-5 pb-5">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Category</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px] flex-1 max-w-[320px]">
                        <SearchField value={moduleSearch} onChange={setModuleSearch} placeholder="Search category" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={resetModules} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                        <SelectionActionButton label="Use first" onClick={selectAllModules} title="Use the first visible category" />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {visibleModules.length ? visibleModules.map((module) => (
                        <FilterChoiceChip
                          key={module.id}
                          label={humanizeCompareLabel(module.label ?? module.id)}
                          active={draft.modules.includes(module.id)}
                          onClick={() => toggleModuleSelection(module.id)}
                          title={humanizeCompareLabel(module.description || module.label || module.id)}
                        />
                      )) : (
                        <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No matching categories found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Module</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px] flex-1 max-w-[320px]">
                        <SearchField value={submoduleSearch} onChange={setSubmoduleSearch} placeholder="Search module" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={resetSubmodules} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                        <SelectionActionButton label="Use first" onClick={selectAllVisibleSubmodules} title="Select the first visible module for the current category" />
                      </div>
                    </div>
                    {selectedModuleEntities.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {visibleSubmodules.length ? visibleSubmodules.map((submodule) => (
                          <FilterChoiceChip
                            key={submodule.id}
                            label={humanizeCompareLabel(submodule.label)}
                            active={draft.submodules.includes(submodule.id)}
                            onClick={() => toggleSubmoduleSelection(submodule.id)}
                            title={`${humanizeCompareLabel(submodule.moduleLabel)} > ${humanizeCompareLabel(submodule.label)}`}
                          />
                        )) : (
                          <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No matching modules found for the selected category.</div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">Select at least one category to view its modules here.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Sheet</div>
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                      <button type="button" onClick={resetSheets} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                      <SelectionActionButton label="Use first" onClick={selectAllVisibleSheets} title="Select the first visible sheet for the selected module" />
                    </div>
                    {selectedSubmoduleEntities.length ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {visibleSheets.length ? visibleSheets.map((sheet) => (
                          <FilterChoiceChip
                            key={`sheet-${sheet.id}`}
                            label={humanizeCompareLabel(sheet.label)}
                            active={(draft.sheets ?? []).includes(sheet.id)}
                            onClick={() => toggleSheetSelection(sheet.id)}
                            title={`${humanizeCompareLabel(sheet.submoduleLabel)} > ${humanizeCompareLabel(sheet.label)}`}
                          />
                        )) : (
                          <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No matching sheets found for the selected module.</div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">Select at least one module to view sheets here.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">KPI</div>
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                      <button type="button" onClick={resetKpis} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                      <SelectionActionButton label="Use first" onClick={selectAllVisibleKpis} title="Select the first visible KPI for the selected sheet" />
                    </div>
                    {selectedSheetEntities.length ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {visibleKpis.length ? visibleKpis.map((item) => (
                            <FilterChoiceChip
                              key={`kpi-${item.id}`}
                              label={compareItemLabel(item)}
                              active={draft.items.includes(item.id)}
                              onClick={() => toggleItemSelection(item.id)}
                              title={`${humanizeCompareLabel(item.sheetLabel ?? item.sheetId)} > ${compareItemLabel(item)}`}
                            />
                          )) : (
                            <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No KPI found for the selected sheet.</div>
                          )}
                        </div>
                        {draft.items.length > 10 ? (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                            Compare supports one KPI at a time. Pick a different KPI to replace the current selection.
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">Select at least one sheet to view KPIs here.</div>
                    )}
                  </div>
                </div>
              </div>

              <div id="compare-by-filter-section" className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Compare by</div>
                  <div>
                    {draftBreakdownOptions.length ? (
                      <>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm text-slate-500">Choose the internal breakdown values to compare inside selected KPIs.</div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, breakdowns: [] }))} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Use defaults</button>
                            <SelectionActionButton label="Select all" onClick={() => setDraft((prev) => ({ ...prev, breakdowns: [...draftBreakdownOptions] }))} title="Select all available breakdown values" />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {draftBreakdownOptions.map((key) => (
                            <FilterChoiceChip
                              key={`breakdown-${key}`}
                              label={compareBreakdownLabel(key)}
                              active={(draft.breakdowns ?? []).includes(key)}
                              onClick={() => toggleBreakdownSelection(key)}
                              title={`Compare by ${compareBreakdownLabel(key)}`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">The selected KPI do not expose an internal breakdown. The comparison will use the total value.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Date</div>
                  <CompareDateSelector
                    source={draft}
                    updateSource={setDraft}
                    years={YEARS}
                    accent={uiAccent}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">IIT(s)</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px] flex-1 max-w-[320px]">
                        <SearchField value={iitSearch} onChange={setIitSearch} placeholder="Search IIT" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => setDraft((prev) => ({ ...prev, iits: [] }))} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                        <SelectionActionButton label="Select all" onClick={() => setDraft((prev) => ({ ...prev, iits: IITs.map((iit) => iit.id) }))} title="Select all IITs" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <SelectionActionButton label="OLD IITs" onClick={() => setDraft((prev) => ({ ...prev, iits: [...LEGACY_IITS] }))} title="Select old IITs" />
                      <SelectionActionButton label="ALL" onClick={() => setDraft((prev) => ({ ...prev, iits: IITs.map((iit) => iit.id) }))} title="Select all IITs" />
                      <SelectionActionButton label="Top 10" onClick={() => applyRankedIits("top")} title="Select top 10 IITs for the selected KPI and ranking year" />
                      <SelectionActionButton label="Bottom 10" onClick={() => applyRankedIits("bottom")} title="Select bottom 10 IITs for the selected KPI and ranking year" />
                    </div>
                    {draft.iits.length > 10 ? (
                      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        More than 10 IITs are selected. The chart packs IIT bars within each year, separates year groups, and alternates IIT labels to keep the full comparison readable.
                      </div>
                    ) : null}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {visibleIITs.length ? visibleIITs.map((iit) => (
                        <FilterChoiceChip
                          key={iit.id}
                          label={instituteShortLabel(iit.id)}
                          active={draft.iits.includes(iit.id)}
                          onClick={() => setDraft((prev) => ({
                            ...prev,
                            iits: prev.iits.includes(iit.id)
                              ? prev.iits.filter((item) => item !== iit.id)
                              : [...prev.iits, iit.id],
                          }))}
                          title={iit.name}
                        />
                      )) : (
                        <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No matching IITs found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-[#f3f4f6] px-6 py-4">
            <button type="button" onClick={() => setOpenPopover(null)} className="rounded-2xl px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-white">Cancel</button>
            <button type="button" onClick={applyCompare} className="rounded-2xl bg-[#3ac778] px-5 py-2.5 text-sm font-bold text-white shadow-sm">
              Apply filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderIitPopover() {
    if (openPopover !== 'iits') return null;
    return (
      <div data-compare-popover className="absolute left-0 top-full z-40 mt-2 w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
        <div>
          <div className="text-sm font-semibold text-slate-900">Select IITs</div>
          <div className="mt-0.5 text-xs text-slate-500">Choose the IITs directly from the toolbar without opening the larger filter panel.</div>
        </div>

        <div className="mt-4">
          {renderIitSelectionPanel()}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setOpenPopover(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          <button type="button" onClick={() => setOpenPopover(null)} className="rounded-2xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: '#1d4ed8' }}>Save</button>
        </div>
      </div>
    );
  }

  function renderModePopover() {
    if (openPopover !== 'mode') return null;
    return (
      <div data-compare-popover className="absolute left-0 top-full z-40 mt-2 w-full max-w-[360px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
        <div>
          <div className="text-sm font-semibold text-slate-900">Compare mode</div>
          <div className="mt-0.5 text-xs text-slate-500">Set the view and ranking year without opening the full filter panel.</div>
        </div>

        <div className="mt-4 rounded-[24px] border border-slate-200 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">View</div>
          <div className="mt-3 grid gap-2">
            {VIEW_OPTIONS.map((option) => {
              const state = modeValidity[option.id];
              const active = draft.view === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={!state.valid}
                  onClick={() => setDraft((prev) => ({ ...prev, view: option.id, scale: option.id === 'table' ? 'raw' : prev.scale }))}
                  className={cn('rounded-[20px] border px-3 py-3 text-left transition', !state.valid ? 'cursor-not-allowed opacity-55' : '')}
                  style={{
                    borderColor: active ? 'rgba(37,99,235,0.28)' : 'rgba(148,163,184,0.22)',
                    background: active ? 'rgba(37,99,235,0.06)' : 'white',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: active ? '#1d4ed8' : '#eef5ff' }}>
                      {compareIcon(option.id, active, active ? '#ffffff' : '#2563eb')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{option.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{option.help}</div>
                      {!state.valid ? <div className="mt-1.5 text-xs font-semibold text-amber-700">{state.reason}</div> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-[24px] border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Scale</div>
            <ToolbarSelect
              label="Ranking year"
              value={String(draft.focusYear)}
              onChange={(value) => setDraft((prev) => ({ ...prev, focusYear: Number(value) }))}
              minWidth={100}
              options={YEARS.filter((year) => year >= draft.yearFrom && year <= draft.yearTo).map((year) => ({ value: String(year), label: String(year) }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SCALE_OPTIONS.map((option) => {
              const disabled = option.id === 'indexed' && (!modeValidity[draft.view]?.valid || draft.view === 'table' || modeValidity.chartableCount < 1);
              const active = draft.scale === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setDraft((prev) => ({ ...prev, scale: option.id }))}
                  className={cn('rounded-2xl border px-3 py-3 text-sm font-semibold transition', disabled ? 'cursor-not-allowed opacity-50' : '')}
                  style={{
                    borderColor: active ? 'rgba(37,99,235,0.28)' : 'rgba(148,163,184,0.22)',
                    background: active ? 'rgba(37,99,235,0.06)' : 'white',
                    color: active ? '#1d4ed8' : '#475569',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setOpenPopover(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          <button type="button" onClick={() => setOpenPopover(null)} className="rounded-2xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: '#1d4ed8' }}>Save</button>
        </div>
      </div>
    );
  }

  function renderChartCard(targetRef, fullscreen = false) {
    if (!applied) return null;
    const appliedCompareLabels = appliedItems.map((item) => compareItemLabel(item));
    const appliedCompareLabel = appliedCompareLabels.length > 1
      ? `${appliedCompareLabels[0]} +${appliedCompareLabels.length - 1} more`
      : appliedCompareLabels[0] ?? "Compare";
    const appliedYearsLabel = Number(applied.yearFrom) === Number(applied.yearTo) ? String(applied.yearTo) : `${applied.yearFrom}–${applied.yearTo}`;
    const appliedIitsLabel = compareIitScopeLabel(appliedIITs);
    const drillBreadcrumbSelections = drillBreadcrumbTrail.length ? [...drillBreadcrumbTrail, cloneCompareSelection(applied)] : [];
    const drillBreadcrumbItems = drillBreadcrumbSelections.length > 1
      ? drillBreadcrumbSelections.map((selection, index) => ({
        selection,
        label: index === 0 ? compareIitScopeLabel(selection.iits ?? []) : compareDrillCrumbLabel(selection, drillBreadcrumbSelections[index - 1]),
      }))
      : [];
    const compareAccent = "#2563eb";
    const compactToolbarOptions = [
      { id: "grouped", label: "Bar graph" },
      { id: "smallBars", label: "Small multiple bars" },
      { id: "smallLines", label: "Small multiple lines" },
      { id: "table", label: "Table" },
    ];
    const visualToolbarItems = [
      ...compactToolbarOptions
        .filter((option) => appliedModeValidity[option.id]?.valid)
        .map((option) => ({
          id: option.id,
          label: option.label,
          icon: compareToolbarIcon(option.id, option.id === applied.view, option.id === applied.view ? "#ffffff" : compareAccent),
        })),
      {
        id: "ai-interpretation",
        label: "AI interpretation",
        icon: compareToolbarIcon("ai", false, compareAccent),
        action: openAiDrawer,
      },
    ];
    const comparisonSeriesLookup = Object.fromEntries(groupedStackSeries.map((series) => [series.id, series]));
    const compareLegendTitle = "";
    const viewInstruction = {
      grouped: ["Click a bar, axis label, or legend label to drill down."],
      smallBars: ["Click a bar, axis label, or legend label to drill down."],
      smallLines: ["Click a line point, axis label, or legend label to drill down."],
    }[applied.view] ?? [];
    const smallBarDetailTargetId = activeBarSegment?.cardId?.startsWith?.("year-bars-")
      ? activeBarSegment.cardId
      : null;

    return (
      <div
        ref={targetRef}
        className={cn("rounded-[32px] border bg-white shadow-sm", fullscreen ? "h-full" : "")}
        style={{ borderColor: "rgba(59,130,246,0.15)" }}
      >
        <div className={cn("relative", fullscreen ? "h-full p-5" : "p-4")}>
          <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {SCALE_OPTIONS.map((option) => {
                  const disabled = option.id === "indexed" && (applied.view === "table" || !appliedModeValidity[applied.view]?.valid);
                  const active = applied.scale === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => { const next = { ...applied, scale: option.id }; commitAppliedSelection(next); syncCompareConfig(next); }}
                      className={cn("rounded-full px-4 py-2 text-[0.78rem] font-bold transition", disabled ? "cursor-not-allowed opacity-50" : "")}
                      style={{
                        background: "rgba(255,255,255,0.98)",
                        border: `1px solid ${active ? compareAccent : "rgba(203,213,225,0.9)"}`,
                        color: active ? compareAccent : "#475569",
                        boxShadow: active ? "0 8px 24px rgba(59,130,246,0.14)" : "0 2px 10px rgba(15,23,42,0.04)",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {viewInstruction.length ? (
                <div className="mt-2 max-w-[560px] text-[11px] font-extrabold leading-5 text-[#2563eb]">
                  {viewInstruction.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 text-center lg:px-4">
              <div className="text-[1.08rem] font-extrabold leading-tight text-slate-900">{appliedCompareLabel}</div>
              <div className="mt-2 text-sm font-semibold text-[#1252a0]">{appliedIitsLabel} · {appliedYearsLabel}</div>
              {drillBreadcrumbItems.length > 1 ? (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold" data-export-hide="true">
                  {drillBreadcrumbItems.map((crumb, index) => {
                    const current = index === drillBreadcrumbItems.length - 1;
                    return (
                      <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                        {index > 0 ? <span className="px-0.5 text-[14px] font-extrabold text-slate-400">&gt;</span> : null}
                        {current ? (
                          <span className="rounded-[7px] bg-slate-100 px-3 py-1.5 text-[12px] font-extrabold text-[#1252a0]">{crumb.label}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => goToDrillBreadcrumbLevel(index)}
                            className="rounded-[7px] bg-slate-100 px-3 py-1.5 text-[12px] font-extrabold text-[#1252a0] transition hover:bg-sky-100"
                            title={`Return to ${crumb.label}`}
                          >
                            {crumb.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className={cn("flex flex-wrap items-center justify-start gap-3 lg:justify-end", fullscreen ? "pt-12 lg:pt-12" : "")}>
              {visualToolbarItems.length > 1 ? (
                <VisualToolbar
                  items={visualToolbarItems}
                  value={applied.view}
                  onChange={(nextView) => {
                    const nextState = appliedModeValidity[nextView];
                    if (!nextState?.valid) return;
                    commitAppliedSelection({ ...applied, view: nextView, scale: nextView === "table" ? "raw" : applied.scale });
                  }}
                  accent={compareAccent}
                  orientation="horizontal"
                  exportHidden
                  style={{ position: "static", transform: "none" }}
                />
              ) : null}
              {!fullscreen ? (
                <button
                  type="button"
                  onClick={() => setIsFullscreen((value) => !value)}
                  className="grid h-11 w-11 place-items-center rounded-[16px] border bg-white text-sky-700 shadow-[0_10px_24px_rgba(37,99,235,0.10)]"
                  style={{ borderColor: "rgba(191,219,254,0.95)" }}
                  title={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}
                >
                  {compareIcon("fullscreen", false, compareAccent)}
                </button>
              ) : null}
            </div>
          </div>

          {compareChartCrowded && applied.view !== "table" && !useYearPanelLayout ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
              Compact labels are active for this IIT comparison.
            </div>
          ) : null}

          {compareRenderSeriesLimitHit && applied.view !== "table" ? (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
              Showing the first {renderedGroupedStackSeries.length} active breakdown series in the visual to keep Compare responsive. Use More filters or Table view to inspect all breakdowns.
            </div>
          ) : null}

          <div className="mt-4 bg-white pt-2">
            {applied.view !== "table" && !appliedModeValidity[applied.view]?.valid ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {appliedModeValidity[applied.view]?.reason}
              </div>
            ) : null}

            {applied.view === "grouped" && appliedModeValidity.grouped.valid ? (
              <>
                <div className="mb-3">
                  <InteractiveCompareLegend
                    items={comparisonLegendItems}
                    activeIds={activeComparisonLegendIds}
                    title={compareLegendTitle}
                    helper=""
                    maxVisible={fullscreen ? 16 : 10}
                    onToggle={toggleComparisonLegendItem}
                    onMore={openCompareByFilters}
                  />
                </div>
                {useYearPanelLayout ? (
                  <YearPanelCompareChart
                    panels={yearPanelData}
                    seriesList={renderedGroupedStackSeries}
                    scaleMode={applied.scale}
                    maxValue={yearPanelMaxValue}
                    activeSegment={activeBarSegment}
                    onIitClick={drillToIitFromAxisLabel}
                    onYearClick={drillToYearFromAxisLabel}
                    onSegmentHover={handleBarSegmentHover}
                    onSegmentClick={handleBarSegmentClick}
                    onChartLeave={handleBarChartMouseLeave}
                    onDetailClose={() => setActiveBarSegment(null)}
                  />
                ) : (
                  <div className="relative overflow-x-hidden overflow-y-hidden pb-2" style={{ height: fullscreen ? Math.max(620, groupedChartHeight) : groupedChartHeight }}>
                    {activeBarSegment?.pinned ? (
                      <div className="absolute right-4 top-3 z-20">
                        <BarSegmentDetailCard
                          segment={activeBarSegment}
                          scaleMode={applied.scale}
                          onClose={() => setActiveBarSegment(null)}
                        />
                      </div>
                    ) : null}
                    <div style={{ minWidth: groupedChartMinWidth, height: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={groupedChartRows}
                        margin={{ top: 42, right: 18, left: 18, bottom: groupedIITs.length > 10 ? 128 : 112 }}
                        barCategoryGap="0%"
                        barGap={0}
                        onMouseLeave={handleBarChartMouseLeave}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical stroke="#e5e7eb" />
                        <XAxis
                          dataKey="xKey"
                          tick={(props) => <GroupedYearIitTick {...props} onClick={drillToIitFromAxisLabel} onYearClick={drillToYearFromAxisLabel} yearLabelKeyByYear={groupedYearLabelKeyByYear} fontSize={groupedTickFontSize} rotate={false} alternateRows={groupedIITs.length > 10} />}
                          axisLine={{ stroke: "#cbd5e1" }}
                          tickLine={false}
                          interval={0}
                          height={groupedIITs.length > 10 ? 108 : 90}
                        />
                        <YAxis tick={{ fontSize: 13, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} width={78} />
                        <Tooltip
                          content={<CompareTooltip metricLookup={comparisonSeriesLookup} scaleMode={applied.scale} mode="grouped" activeSegment={activeBarSegment} />}
                        />
                        {groupedYearSeparatorRows.map((row) => (
                          <ReferenceLine key={`separator-${row.xKey}`} x={row.xKey} stroke="#93c5fd" strokeWidth={1.2} ifOverflow="visible" />
                        ))}
                        {renderedGroupedStackSeries.map((series) => {
                          const topSeries = groupedTopStackSeriesByItem[series.itemId];
                          const isTopVisibleSeries = topSeries?.id === series.id;
                          return (
                            <Bar
                              key={series.id}
                              dataKey={`display_${series.id}`}
                              name={series.fullLabel ?? series.label}
                              stackId={singleSlotBreakdownView ? series.id : series.stackId}
                              fill={series.color}
                              radius={singleSlotBreakdownView || isTopVisibleSeries ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                              maxBarSize={groupedBarMaxSize}
                              onMouseEnter={(entry) => handleBarSegmentHover(series, entry?.payload ?? entry)}
                              onClick={(entry, index, event) => handleBarSegmentClick(series, entry?.payload ?? entry, event)}
                            >
                              {isTopVisibleSeries && !compareRenderSeriesLimitHit && groupedChartRows.length <= 45 ? (
                                <LabelList content={(props) => <StackTotalLabel {...props} item={series.item} scaleMode={applied.scale} />} />
                              ) : null}
                            </Bar>
                          );
                        })}
                      </ComposedChart>
                    </ResponsiveContainer>
                    </div>
                    <div className="pointer-events-none sticky bottom-6 left-0 right-0 text-center text-[11px] font-semibold text-slate-500">Year-wise IIT comparison</div>
                  </div>
                )}
              </>
            ) : null}

            {applied.view === "smallBars" && appliedModeValidity.smallBars.valid ? (
              <>
                <div className="mb-4">
                  <InteractiveCompareLegend
                    items={comparisonLegendItems}
                    activeIds={activeComparisonLegendIds}
                    title={compareLegendTitle}
                    helper=""
                    maxVisible={fullscreen ? 16 : 10}
                    onToggle={toggleComparisonLegendItem}
                    onMore={openCompareByFilters}
                  />
                </div>
                {activeGroupedStackSeries.length > smallMultipleBarSeries.length ? (
                  <div className="mb-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
                    Showing {smallMultipleBarSeries.length} small-multiple cards for responsiveness. Use legend filters to narrow the series shown.
                  </div>
                ) : null}
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {smallMultipleBarSeries.map((series) => (
                    <SmallMultipleBarCard
                      key={series.id}
                      series={series}
                      scaleMode={applied.scale}
                      activeLegendIds={activeComparisonLegendIds}
                      sharedYMax={smallMultipleSharedYMax}
                      detailSegment={smallBarDetailTargetId === series.id ? activeBarSegment : null}
                      onSegmentHover={handleBarSegmentHover}
                      onSegmentClick={handleBarSegmentClick}
                      onChartLeave={handleBarChartMouseLeave}
                      onDetailClose={handleBarChartMouseLeave}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {applied.view === "smallLines" && appliedModeValidity.smallLines.valid ? (
              <>
                <div className="mb-4">
                  <InteractiveCompareLegend
                    items={comparisonLegendItems}
                    activeIds={activeComparisonLegendIds}
                    title={compareLegendTitle}
                    helper=""
                    maxVisible={fullscreen ? 16 : 10}
                    onToggle={toggleComparisonLegendItem}
                    onMore={openCompareByFilters}
                  />
                </div>
                {activeGroupedStackSeries.length > smallMultipleLineSeries.length ? (
                  <div className="mb-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
                    Showing {smallMultipleLineSeries.length} small-multiple cards for responsiveness. Use legend filters to narrow the series shown.
                  </div>
                ) : null}
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {smallMultipleLineSeries.map((series) => (
                    <SmallMultipleLineCard
                      key={series.id}
                      series={series}
                      scaleMode={applied.scale}
                      sharedYMax={smallMultipleSharedYMax}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {applied.view === "table" && appliedModeValidity.table.valid ? (
              <DataTable
                columns={compareDetailColumns}
                rows={compareDetailRows}
                maxHeight={520}
                accent={uiAccent}
              />
            ) : null}
          </div>

          <div
            data-export-hide="true"
            className={`${fullscreen ? "fixed bottom-8 right-8 z-[340]" : "fixed bottom-6 right-6 z-[260]"} flex flex-col items-end gap-2`}
          >
            {speedDialOpen
              ? speedDialItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      item.action();
                      setSpeedDialOpen(false);
                    }}
                    className="dashboard-speed-action group relative z-[141] grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-lg transition hover:-translate-y-0.5"
                    style={{ color: uiAccent, border: `1px solid ${uiAccent}1f` }}
                  >
                    <span className="dashboard-speed-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[142] -translate-y-1/2 whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 opacity-0 shadow-sm transition">
                      {item.label}
                    </span>
                    <span>{compareIcon(item.icon, false, uiAccent)}</span>
                  </button>
                ))
              : null}
            <button
              type="button"
              onClick={() => setSpeedDialOpen((value) => !value)}
              className="dashboard-speed-action group relative z-[141] grid h-12 w-12 place-items-center rounded-2xl text-3xl text-white shadow-lg"
              style={{ background: uiAccent, lineHeight: 1 }}
            >
              <span className="dashboard-speed-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[142] -translate-y-1/2 whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 opacity-0 shadow-sm transition">
                {speedDialOpen ? "Close actions" : "Open actions"}
              </span>
              <span style={{ transform: speedDialOpen ? "translateY(-1px)" : "translateY(-2px)" }}>
                {speedDialOpen ? "×" : "+"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notice ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.95fr]">
        <div className="min-w-0">
          {renderCompareCarouselSelector()}
        </div>

        <div
          className="rounded-[28px] border p-3 shadow-sm"
          style={{
            borderColor: 'rgba(59,130,246,0.15)',
            background: 'rgba(255,255,255,0.94)',
          }}
        >
          <div className="text-sm font-bold" style={{ color: '#0f172a' }}>Date</div>
          <div className="mt-3">
            <CompareDateSelector
              source={selectionSource}
              updateSource={updateSelectionSummarySource}
              years={YEARS}
              accent={uiAccent}
            />
          </div>

          <div className="mt-5 text-sm font-bold" style={{ color: '#0f172a' }}>IIT(s):</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateSelectionSummarySource((prev) => ({ ...prev, iits: [...LEGACY_IITS] }))}
              className="rounded-full border px-4 py-2 text-sm font-extrabold transition"
              style={{
                borderColor: selectionSource.iits.length === LEGACY_IITS.length && LEGACY_IITS.every((iid) => selectionSource.iits.includes(iid)) ? 'rgba(37,99,235,0.28)' : 'rgba(148,163,184,0.22)',
                background: selectionSource.iits.length === LEGACY_IITS.length && LEGACY_IITS.every((iid) => selectionSource.iits.includes(iid)) ? 'rgba(37,99,235,0.08)' : 'white',
                color: selectionSource.iits.length === LEGACY_IITS.length && LEGACY_IITS.every((iid) => selectionSource.iits.includes(iid)) ? '#1d4ed8' : '#475569',
              }}
            >
              OLD IITs
            </button>
            <button
              type="button"
              onClick={() => updateSelectionSummarySource((prev) => ({ ...prev, iits: IITs.map((iit) => iit.id) }))}
              className="rounded-full border px-4 py-2 text-sm font-extrabold transition"
              style={{
                borderColor: selectionSource.iits.length === IITs.length ? 'rgba(37,99,235,0.28)' : 'rgba(148,163,184,0.22)',
                background: selectionSource.iits.length === IITs.length ? 'rgba(37,99,235,0.08)' : 'white',
                color: selectionSource.iits.length === IITs.length ? '#1d4ed8' : '#475569',
              }}
            >
              ALL
            </button>
            <SelectionActionButton label="Top 10" onClick={() => updateSelectionSummarySource((prev) => ({ ...prev, iits: rankedIitsForDraft(prev, 10, "top") }))} title="Select top 10 IITs for the selected KPI and ranking year" />
            <SelectionActionButton label="Bottom 10" onClick={() => updateSelectionSummarySource((prev) => ({ ...prev, iits: rankedIitsForDraft(prev, 10, "bottom") }))} title="Select bottom 10 IITs for the selected KPI and ranking year" />
            <SelectionActionButton
              label="More filters"
              onClick={() => openBuilder(1)}
              title="Open IIT filters"
            />
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-500"></div>
        </div>
      </div>

      {renderFilterPopover()}

      {!applied ? <EmptyStateCard onBuild={() => setOpenPopover('filters')} /> : null}

      {!applied && canApply ? (
        <div className="rounded-[24px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
          Selections are ready. Open More filters to refine them or keep the current defaults.
        </div>
      ) : null}

      {applied ? renderChartCard(chartRef, false) : null}

      {isFullscreen && applied ? (
        <div className="fixed inset-0 z-[270] bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="relative flex h-full flex-col rounded-[36px] border border-white/30 bg-white p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-xl text-white"
              style={{ background: "#2563eb" }}
            >
              {compareIcon('close', true, '#ffffff')}
            </button>
            <div className="min-h-0 flex-1 overflow-auto">{renderChartCard(fullscreenRef, true)}</div>
          </div>
        </div>
      ) : null}

      <Drawer
        open={detailsOpen}
        title="Compare - Detail Report"
        onClose={() => setDetailsOpen(false)}
      >
        <div className="text-sm text-slate-700">
          Current context: {summarizeList(appliedIITs.map((iid) => instituteShortLabel(iid)), 4)} - {applied?.yearFrom ?? YEARS[0]}-{applied?.yearTo ?? YEARS[YEARS.length - 1]} - {VIEW_OPTIONS.find((option) => option.id === applied?.view)?.label ?? "Compare"}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Last updated: {lastUpdatedLabel} - Last downloaded: {lastDownloadedLabel}
        </div>
        <div className="mt-4">
          <DataTable
            columns={compareDetailColumns}
            rows={compareDetailRows}
            maxHeight={620}
            accent={uiAccent}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            style={{ border: `1px solid ${uiAccent}`, background: uiAccent }}
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => {
              const downloadStamp = new Date().toISOString();
              downloadTableSvg(
                `iitmis_compare_${applied?.view ?? "compare"}_details.svg`,
                compareDetailColumns,
                compareDetailRows,
                {
                  title: "IIT MIS Compare Detail Report",
                  subtitle: `${applied?.yearFrom ?? YEARS[0]}-${applied?.yearTo ?? YEARS[YEARS.length - 1]} - ${summarizeList(appliedIITs.map((iid) => instituteShortLabel(iid)), 4)}`,
                  lastUpdatedAt: facts?.meta?.generatedAt,
                  lastDownloadedAt: downloadStamp,
                },
              );
              markDownloaded("SVG downloaded.", downloadStamp);
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            style={{ border: `1px solid ${uiAccent}`, background: uiAccent }}
          >
            Download SVG
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            style={{ border: `1px solid ${uiAccent}`, background: uiAccent }}
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            style={{ border: `1px solid ${uiAccent}`, background: uiAccent }}
          >
            PDF
          </button>
        </div>
      </Drawer>

      <Drawer
        open={aiPanelOpen}
        title="AI interpretation - Compare"
        onClose={() => setAiPanelOpen(false)}
      >
        <div className="text-sm text-slate-700">
          Current context: {summarizeList(appliedIITs.map((iid) => instituteShortLabel(iid)), 4)} - {applied?.yearFrom ?? YEARS[0]}-{applied?.yearTo ?? YEARS[YEARS.length - 1]} - {VIEW_OPTIONS.find((option) => option.id === applied?.view)?.label ?? "Compare"}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Last updated: {lastUpdatedLabel} - Last downloaded: {lastDownloadedLabel}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              downloadText(
                `iitmis_compare_${applied?.view ?? "compare"}_ai_interpretation.txt`,
                `AI interpretation\n\n${compareInterpretation}`,
              );
              markDownloaded("AI interpretation downloaded.");
            }}
            className="grid h-10 w-10 place-items-center rounded-2xl border bg-white text-sky-700 shadow-sm transition hover:bg-sky-50"
            style={{ borderColor: "rgba(59,130,246,0.18)" }}
            title="Download AI interpretation"
            aria-label="Download AI interpretation"
          >
            {compareIcon("download", false, "#2563eb")}
          </button>
          <button
            type="button"
            onClick={handleCopyAiInterpretation}
            className="grid h-10 w-10 place-items-center rounded-2xl border bg-white text-sky-700 shadow-sm transition hover:bg-sky-50"
            style={{ borderColor: "rgba(59,130,246,0.18)" }}
            title="Copy AI interpretation"
            aria-label="Copy AI interpretation"
          >
            {compareIcon("copy", false, "#2563eb")}
          </button>
        </div>
        <div className="mt-3 whitespace-pre-line rounded-[24px] border p-4 text-sm text-slate-700" style={{ borderColor: "rgba(59,130,246,0.12)", background: "rgba(248,250,252,0.85)" }}>
          {compareInterpretation}
        </div>
      </Drawer>
    </div>
  );

}



