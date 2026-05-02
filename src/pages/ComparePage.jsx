
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { kpiValue } from "../data/kpiDefs";
import DataTable from "../components/ui/DataTable";
import Drawer from "../components/ui/Drawer";

const LEGACY_IITS = ["IITD", "IITB", "IITKGP", "IITM", "IITK"];
const PALETTE = ["#dbeafe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"];
const TOP_TABS = ["Compare View", "Filters", "Compare Mode", "Saved Sets"];
const VIEW_OPTIONS = [
  { id: "grouped", label: "Grouped", help: "Compare the same or compatible metrics side by side for the focus year." },
  { id: "trend", label: "Trend", help: "Track one metric over the selected year range." },
  { id: "smallMultiples", label: "Small multiples", help: "Keep dense or mixed comparisons in separate tiles." },
  { id: "table", label: "Table", help: "Show the broadest structurally valid comparison in tabular form." },
];
const SCALE_OPTIONS = [
  { id: "raw", label: "Raw" },
  { id: "indexed", label: "Indexed 100" },
];
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

function fmtRaw(kpi, value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  if (kpi?.format === "pct") return `${(Number(value) * 100).toFixed(1)}%`;
  const hasFraction = Math.abs(Number(value) % 1) > 0.0001;
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: hasFraction ? 2 : 0 }).format(Number(value));
}

function fmtDisplay(kpi, value, scale = "raw") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  if (scale === "indexed") return `${Math.round(Number(value))}`;
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

function WrappedWorksheetTick({ x = 0, y = 0, payload }) {
  const lines = splitLabelAcrossTwoLines(payload?.value);

  return (
    <g transform={`translate(${x},${y})`}>
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

function summarizeList(values, max = 3) {
  if (!values?.length) return "None selected";
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} +${values.length - max} more`;
}

function instituteNameById(iid) {
  return IITs.find((item) => item.id === iid)?.name ?? iid;
}

function instituteShortLabel(iid) {
  return IITs.find((item) => item.id === iid)?.name ?? iid;
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
    trend: (
      <>
        <path {...common} d="M4 16l5-5 4 3 7-8" />
        <path {...common} d="M20 9V6h-3" />
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

function SelectionActionButton({ label = "More", onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className="rounded-full border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-sky-200"
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
        borderColor: active ? 'rgba(52,211,153,0.34)' : 'rgba(226,232,240,0.95)',
        background: active ? 'rgba(236,253,245,0.96)' : 'rgba(248,250,252,0.95)',
        color: '#0f172a',
      }}
    >
      <span
        className="grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border text-[11px] leading-none"
        style={{
          borderColor: active ? '#34d399' : '#94a3b8',
          background: active ? '#34d399' : '#ffffff',
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

function CompareTooltip({ active, payload, label, mode, metricLookup, scaleMode }) {
  if (!active || !payload?.length) return null;
  if (mode === "grouped") {
    const row = payload[0]?.payload;
    const metric = metricLookup[row?.metricId];
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="mt-1 text-slate-500">{metric?.submoduleLabel ?? metric?.module ?? "Compare item"}</div>
        <div className="mt-2 space-y-1.5">
          {payload.map((entry) => {
            const iid = String(entry.dataKey).replace("display_", "");
            return (
              <div key={iid} className="flex items-center justify-between gap-4">
                <span style={{ color: entry.color }}>{IITs.find((item) => item.id === iid)?.name ?? iid}</span>
                <span className="font-semibold text-slate-800">
                  {fmtDisplay(metric?.kpi, entry.value, scaleMode)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (mode === "trend") {
    const row = payload[0]?.payload;
    const metric = metricLookup[row?.metricId];
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="mt-2 space-y-1.5">
          {payload.map((entry) => {
            const iid = String(entry.dataKey).replace("display_", "");
            const raw = row?.[`raw_${iid}`];
            return (
              <div key={iid} className="flex items-center justify-between gap-4">
                <span style={{ color: entry.color }}>{IITs.find((item) => item.id === iid)?.name ?? iid}</span>
                <span className="font-semibold text-slate-800">
                  {fmtDisplay(metric?.kpi, entry.value, scaleMode)}
                  {scaleMode === "indexed" && raw != null ? ` - ${fmtRaw(metric?.kpi, raw)}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

function SmallMultipleCard({ series, accent, scaleMode }) {
  const { item, rows } = series;
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-3">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">{item.label}</div>
        <div className="mt-1 text-xs text-slate-500">{item.submoduleLabel}</div>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 6, right: 12, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="shortName" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              formatter={(value) => fmtDisplay(item.kpi, value, scaleMode)}
              labelFormatter={(label) => IITs.find((iit) => iit.id === label)?.name ?? label}
            />
            <Bar dataKey="display" fill={accent} radius={[10, 10, 0, 0]} maxBarSize={26} isAnimationActive={false}>
              {rows.map((row) => (
                <Cell key={`${item.id}-${row.instituteId}`} fill={row.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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

function createDefaultDraft() {
  return {
    modules: [],
    submodules: [],
    items: [],
    iits: [...LEGACY_IITS],
    yearFrom: YEARS[0],
    yearTo: YEARS[YEARS.length - 1],
    focusYear: YEARS[YEARS.length - 1],
    view: "grouped",
    scale: "raw",
  };
}

function createDraftFromConfig(config, moduleMap, submoduleMap, worksheetMap) {
  const moduleIds = Object.keys(moduleMap);
  const submoduleIds = Object.keys(submoduleMap);

  let moduleId = config?.CompareModule && moduleMap[config.CompareModule] ? config.CompareModule : null;
  let submoduleId = config?.CompareSubmoduleId && submoduleMap[config.CompareSubmoduleId] ? config.CompareSubmoduleId : null;
  let items = dedupeList([...(config?.CompareMetricIds ?? []), config?.MetricId]).filter((itemId) => worksheetMap[itemId]);

  if (!submoduleId && items[0]) submoduleId = worksheetMap[items[0]]?.submoduleId ?? null;
  if (!moduleId && submoduleId) moduleId = submoduleMap[submoduleId]?.moduleId ?? null;
  if (!moduleId && items[0]) moduleId = worksheetMap[items[0]]?.moduleId ?? null;
  if (!moduleId) moduleId = moduleIds[0] ?? null;
  if (!submoduleId) submoduleId = moduleMap[moduleId]?.submodules?.[0]?.id ?? submoduleIds[0] ?? null;
  if (!items.length) {
    items = (submoduleMap[submoduleId]?.worksheets ?? []).map((worksheet) => worksheet.kpiId).filter(Boolean).slice(0, 3);
  }

  const rangeFrom = Number(config?.YearRange?.from ?? YEARS[0]);
  const rangeTo = Number(config?.YearRange?.to ?? YEARS[YEARS.length - 1]);
  const yearFrom = Math.min(rangeFrom, rangeTo);
  const yearTo = Math.max(rangeFrom, rangeTo);
  const focusYear = Number(config?.ActiveYear ?? yearTo);

  return {
    modules: moduleId ? [moduleId] : [],
    submodules: submoduleId ? [submoduleId] : [],
    items,
    iits: dedupeList(config?.InstituteId?.length ? config.InstituteId : LEGACY_IITS),
    yearFrom,
    yearTo,
    focusYear: focusYear >= yearFrom && focusYear <= yearTo ? focusYear : yearTo,
    view: VIEW_OPTIONS.some((option) => option.id === config?.CompareView) ? config.CompareView : "grouped",
    scale: SCALE_OPTIONS.some((option) => option.id === config?.CompareScale) ? config.CompareScale : "raw",
  };
}

function deriveModeValidity(items, iits, yearFrom, yearTo) {
  const years = YEARS.filter((year) => year >= yearFrom && year <= yearTo);
  const selected = items.filter(Boolean);
  const chartable = selected.filter((item) => item.comparable);
  const formatSet = new Set(chartable.map((item) => item.kpi?.format).filter(Boolean));
  const tableOnlyItems = selected.filter((item) => !item.comparable);

  return {
    grouped: {
      valid: chartable.length >= 1 && iits.length >= 2 && (chartable.length <= 1 || formatSet.size === 1),
      reason: chartable.length < 1
        ? "Select at least one chartable compare item."
        : iits.length < 2
          ? "Grouped compare needs at least two IITs."
          : formatSet.size > 1
            ? "Grouped compare allows multiple metrics only when units or formats match."
            : "",
    },
    trend: {
      valid: chartable.length === 1 && years.length >= 2 && iits.length >= 1,
      reason: chartable.length !== 1
        ? "Trend needs exactly one chartable compare item."
        : years.length < 2
          ? "Trend needs at least two time points."
          : "",
    },
    smallMultiples: {
      valid: chartable.length >= 1 && iits.length >= 1,
      reason: chartable.length < 1 ? "Select at least one chartable compare item." : "",
    },
    table: {
      valid: selected.length >= 1 && iits.length >= 1,
      reason: selected.length < 1 ? "Select at least one compare item." : "",
    },
    chartableCount: chartable.length,
    tableOnlyCount: tableOnlyItems.length,
    years,
    formatSetSize: formatSet.size,
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
  const worksheetMap = useMemo(
    () => Object.fromEntries(
      hierarchy.flatMap((module) =>
        module.submodules.flatMap((submodule) =>
          submodule.worksheets.map((worksheet) => [
            worksheet.kpiId,
            {
              ...worksheet,
              moduleLabel: module.id,
              moduleId: module.id,
              submoduleId: submodule.id,
            },
          ]),
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
  const availableItems = useMemo(() => selectedSubmodules.flatMap((submodule) => submodule.worksheets), [selectedSubmodules]);
  const selectedItems = useMemo(() => draft.items.map((id) => worksheetMap[id]).filter(Boolean), [draft.items, worksheetMap]);

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
    if (!modeValidity[draft.view]?.valid) {
      const fallback = VIEW_OPTIONS.find((option) => modeValidity[option.id]?.valid)?.id ?? "table";
      setDraft((prev) => ({ ...prev, view: fallback, scale: fallback === "table" ? "raw" : prev.scale }));
    }
  }, [draft.view, modeValidity]);

  useEffect(() => {
    const requestKey = config?.CompareRequestKey ?? "__initial__";
    if (lastConfigRequestRef.current === requestKey) return;

    const nextDraft = createDraftFromConfig(config, moduleMap, submoduleMap, worksheetMap);
    lastConfigRequestRef.current = requestKey;
    setDraft(nextDraft);
    setToolbarSearch(config?.CompareKeyword ?? "");
    setSearch({ modules: "", submodules: "", items: "", iits: "" });
    setSortBy("selected");
    setOpenPopover(null);
    setBuilderOpen(false);

    if (config?.CompareAutoApply || config?.__compareApplied || requestKey === "__initial__") {
      setApplied(nextDraft);
    }
  }, [config, moduleMap, submoduleMap, worksheetMap]);

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
          item.kpiId,
          {
            ...item,
            kpi: item.kpi ?? KPI_BY_ID[item.kpiId],
          },
        ]),
      ),
    [appliedItems],
  );

  const chartableAppliedItems = appliedItems.filter((item) => item.comparable);
  const groupedIITs = (appliedIITs ?? []).slice(0, 7);

  const groupedRows = useMemo(() => {
    if (!applied) return [];
    return chartableAppliedItems.map((item) => {
      const rawValues = groupedIITs.map((iid) => valueForKpi(facts, item.kpi, iid, applied.focusYear));
      const displayValues = applied.scale === "indexed"
        ? normalizeToLeader(rawValues)
        : rawValues.map((value) => (item.kpi?.format === "pct" && value != null ? Number(value) * 100 : value));
      const row = {
        metricId: item.kpiId,
        label: item.label,
      };
      groupedIITs.forEach((iid, index) => {
        row[`display_${iid}`] = displayValues[index];
        row[`raw_${iid}`] = rawValues[index];
      });
      return row;
    });
  }, [applied, chartableAppliedItems, facts, groupedIITs]);

  const primaryAppliedItem = chartableAppliedItems[0];

  const trendRows = useMemo(() => {
    if (!applied || !primaryAppliedItem) return [];
    const seriesByInstitute = Object.fromEntries(
      appliedIITs.map((iid) => {
        const values = appliedYears.map((year) => valueForKpi(facts, primaryAppliedItem.kpi, iid, year));
        return [iid, values];
      }),
    );
    const indexed = Object.fromEntries(
      Object.entries(seriesByInstitute).map(([iid, values]) => [iid, normalizeToBase(values)]),
    );
    return appliedYears.map((year, yearIndex) => {
      const row = { year, label: String(year), metricId: primaryAppliedItem.kpiId };
      appliedIITs.forEach((iid) => {
        const raw = seriesByInstitute[iid]?.[yearIndex] ?? null;
        row[`raw_${iid}`] = raw;
        row[`display_${iid}`] = applied?.scale === "indexed"
          ? indexed[iid]?.[yearIndex] ?? null
          : (primaryAppliedItem.kpi?.format === "pct" && raw != null ? Number(raw) * 100 : raw);
      });
      return row;
    });
  }, [applied, appliedIITs, appliedYears, facts, primaryAppliedItem]);

  const smallMultipleSeries = useMemo(() => {
    if (!applied) return [];
    return chartableAppliedItems.map((item) => {
      const rawValues = appliedIITs.map((iid) => valueForKpi(facts, item.kpi, iid, applied.focusYear));
      const displayValues = applied.scale === "indexed"
        ? normalizeToLeader(rawValues)
        : rawValues.map((value) => (item.kpi?.format === "pct" && value != null ? Number(value) * 100 : value));
      return {
        item,
        rows: appliedIITs.map((iid, index) => ({
          instituteId: iid,
          shortName: iid,
          instituteName: IITs.find((entry) => entry.id === iid)?.name ?? iid,
          rawValue: rawValues[index],
          display: displayValues[index],
          color: PALETTE[index % PALETTE.length],
        })),
      };
    });
  }, [applied, appliedIITs, chartableAppliedItems, facts]);

  const tableRows = useMemo(() => {
    if (!applied) return [];
    return appliedIITs.flatMap((iid) => {
      const institute = IITs.find((entry) => entry.id === iid)?.name ?? iid;
      return appliedItems.map((item) => {
        const latest = valueForKpi(facts, item.kpi, iid, applied.focusYear);
        const prevYear = appliedYears[Math.max(0, appliedYears.indexOf(applied.focusYear) - 1)] ?? applied.focusYear;
        const prev = valueForKpi(facts, item.kpi, iid, prevYear);
        return {
          Institute: institute,
          InstituteCode: iid,
          Module: item.moduleLabel,
          Submodule: item.submoduleLabel,
          CompareItem: item.label,
          Value: latest,
          YoY: latest != null && prev != null && prev !== 0 && prevYear !== applied.focusYear ? (latest - prev) / prev : null,
          Range: appliedYears.map((year) => `${year}: ${fmtRaw(item.kpi, valueForKpi(facts, item.kpi, iid, year))}`).join(" - "),
          _item: item,
        };
      });
    });
  }, [applied, appliedIITs, appliedItems, appliedYears, facts]);

  const compareDetailColumns = useMemo(
    () => [
      { key: "Institute", label: "Institute" },
      { key: "Module", label: "Module" },
      { key: "Submodule", label: "Sub-module" },
      { key: "CompareItem", label: "Compare item" },
      { key: "Value", label: `Value (${applied?.focusYear ?? ""})` },
      { key: "YoY", label: "YoY" },
      { key: "Range", label: `${applied?.yearFrom ?? YEARS[0]}-${applied?.yearTo ?? YEARS[YEARS.length - 1]}` },
    ],
    [applied],
  );

  const compareDetailRows = useMemo(
    () =>
      tableRows.map((row) => ({
        ...row,
        Value: fmtRaw(row._item?.kpi, row.Value),
        YoY: formatPct(row.YoY),
      })),
    [tableRows],
  );

  const compareInterpretation = useMemo(() => {
    if (!applied) return "Build a comparison to see an interpretation.";

    const lines = [
      `This comparison covers ${appliedItems.length} compare item(s) across ${appliedIITs.length} IIT(s) from ${applied.yearFrom} to ${applied.yearTo}.`,
      `Current visual: ${VIEW_OPTIONS.find((option) => option.id === applied.view)?.label ?? applied.view}. Scale: ${applied.scale === "indexed" ? "Indexed 100" : "Raw"}. Focus year: ${applied.focusYear}.`,
      `Selected IITs: ${summarizeList(appliedIITs.map((iid) => instituteShortLabel(iid)), 4)}.`,
    ];

    if (applied.view === "grouped" && groupedRows.length) {
      let strongest = null;
      groupedRows.forEach((row) => {
        groupedIITs.forEach((iid) => {
          const value = row[`raw_${iid}`];
          if (value == null || !Number.isFinite(Number(value))) return;
          if (!strongest || Number(value) > Number(strongest.value)) {
            strongest = {
              iid,
              label: row.label,
              value,
              kpi: appliedMetricLookup[row.metricId]?.kpi,
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

    if (applied.view === "trend" && primaryAppliedItem && trendRows.length) {
      const lastRow = trendRows[trendRows.length - 1];
      let leader = null;
      appliedIITs.forEach((iid) => {
        const value = lastRow?.[`raw_${iid}`];
        if (value == null || !Number.isFinite(Number(value))) return;
        if (!leader || Number(value) > Number(leader.value)) {
          leader = { iid, value };
        }
      });
      if (leader) {
        lines.push(
          `${primaryAppliedItem.label} ends highest with ${instituteShortLabel(leader.iid)} at ${fmtRaw(primaryAppliedItem.kpi, leader.value)} in ${trendRows[trendRows.length - 1]?.label}.`,
        );
      }
    }

    if (applied.view === "smallMultiples" && smallMultipleSeries.length) {
      const firstSeries = smallMultipleSeries[0];
      const leader = [...firstSeries.rows]
        .filter((row) => row.rawValue != null && Number.isFinite(Number(row.rawValue)))
        .sort((a, b) => Number(b.rawValue) - Number(a.rawValue))[0];
      if (leader) {
        lines.push(
          `In small multiples, ${firstSeries.item.label} is currently led by ${leader.instituteName} at ${fmtRaw(firstSeries.item.kpi, leader.rawValue)}.`,
        );
      }
    }

    if (applied.view === "table") {
      lines.push(`The tabular view currently expands to ${tableRows.length} institute-item row(s).`);
    }

    return lines.join("\n\n");
  }, [applied, appliedItems, appliedIITs, appliedMetricLookup, groupedIITs, groupedRows, primaryAppliedItem, smallMultipleSeries, tableRows, trendRows]);

  const canApply = Boolean(
    draft.modules.length &&
      draft.submodules.length &&
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
      items: [...draft.items],
      iits: [...draft.iits],
    };
    setApplied(payload);
    setBuilderOpen(false);
    onConfigChange?.((prev) => ({
      ...prev,
      CompareModule: payload.modules[0] ?? prev.CompareModule,
      CompareSubmoduleId: payload.submodules[0] ?? prev.CompareSubmoduleId,
      CompareMetricIds: payload.items,
      MetricId: payload.items[0] ?? prev.MetricId,
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
      const next = { ...prev };
      if (kind === "module") {
        next.modules = next.modules.filter((item) => item !== id);
        const allowedSubmodules = next.modules.flatMap((moduleId) => moduleMap[moduleId]?.submodules.map((submodule) => submodule.id) ?? []);
        next.submodules = next.submodules.filter((item) => allowedSubmodules.includes(item));
        const allowedItems = next.submodules.flatMap((submoduleId) => submoduleMap[submoduleId]?.worksheets.map((worksheet) => worksheet.kpiId) ?? []);
        next.items = next.items.filter((item) => allowedItems.includes(item));
      }
      if (kind === "submodule") {
        next.submodules = next.submodules.filter((item) => item !== id);
        const keepModule = next.submodules.some((submoduleId) => submoduleMap[submoduleId]?.moduleId === submoduleMap[id]?.moduleId);
        if (!keepModule) next.modules = next.modules.filter((moduleId) => moduleId !== submoduleMap[id]?.moduleId);
        const allowedItems = next.submodules.flatMap((submoduleId) => submoduleMap[submoduleId]?.worksheets.map((worksheet) => worksheet.kpiId) ?? []);
        next.items = next.items.filter((item) => allowedItems.includes(item));
      }
      if (kind === "item") {
        next.items = next.items.filter((item) => item !== id);
        const item = worksheetMap[id];
        const keepSubmodule = next.items.some((itemId) => worksheetMap[itemId]?.submoduleId === item?.submoduleId);
        if (!keepSubmodule) next.submodules = next.submodules.filter((submoduleId) => submoduleId !== item?.submoduleId);
        const keepModule = next.submodules.some((submoduleId) => submoduleMap[submoduleId]?.moduleId === item?.moduleId);
        if (!keepModule) next.modules = next.modules.filter((moduleId) => moduleId !== item?.moduleId);
      }
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
      `Modules: ${(applied.modules ?? []).join(", ")}`,
      `Sub-modules: ${(applied.submodules ?? []).map((id) => submoduleMap[id]?.label ?? id).join(", ")}`,
      `Items: ${(applied.items ?? []).map((id) => worksheetMap[id]?.label ?? id).join(", ")}`,
      `IITs: ${(applied.iits ?? []).join(", ")}`,
      `Years: ${applied.yearFrom}-${applied.yearTo}`,
      `Focus year: ${applied.focusYear}`,
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
    const columns = [
      { key: "Institute", label: "Institute" },
      { key: "Module", label: "Module" },
      { key: "Submodule", label: "Sub-module" },
      { key: "CompareItem", label: "Compare item" },
      { key: "Value", label: `Value (${applied?.focusYear ?? ""})` },
      { key: "YoY", label: "YoY" },
      { key: "Range", label: `${applied?.yearFrom ?? YEARS[0]}-${applied?.yearTo ?? YEARS[YEARS.length - 1]}` },
    ];
    downloadText(
      "iitmis_compare.csv",
      toCsv(
        tableRows.map((row) => ({
          ...row,
          Value: fmtRaw(row._item?.kpi, row.Value),
          YoY: formatPct(row.YoY),
        })),
        columns,
      ),
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
      items: [...draft.items],
      iits: [...draft.iits],
    };
    setApplied(payload);
    setBuilderOpen(false);
    setActiveStep(1);
    setOpenPopover(null);
    onConfigChange?.((prev) => ({
      ...prev,
      CompareModule: payload.modules[0] ?? prev.CompareModule,
      CompareSubmoduleId: payload.submodules[0] ?? prev.CompareSubmoduleId,
      CompareMetricIds: payload.items,
      MetricId: payload.items[0] ?? prev.MetricId,
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
    if (!next.modules.length || !next.submodules.length || !next.items.length || !next.iits.length) {
      setApplied(null);
      setDraft(next);
      return;
    }
    setApplied(next);
    setDraft(next);
  }

  function updateSelectionSummarySource(updater) {
    if (applied) {
      commitAppliedSelection(updater(applied));
      return;
    }
    setDraft(updater);
  }

  function sortEntities(list, getLabel, getPriority = () => 0) {
    return [...list].sort((a, b) => {
      if (sortBy === "selected") {
        const priorityDelta = getPriority(b) - getPriority(a);
        if (priorityDelta) return priorityDelta;
      }
      const labelA = getLabel(a);
      const labelB = getLabel(b);
      return sortBy === "zToA" ? labelB.localeCompare(labelA) : labelA.localeCompare(labelB);
    });
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

  function toggleModuleExpand(moduleId) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }

  function toggleSubmoduleExpand(submoduleId) {
    setExpandedSubmodules((prev) => ({ ...prev, [submoduleId]: !prev[submoduleId] }));
  }

  function toggleModuleSelection(moduleId) {
    const module = moduleMap[moduleId];
    if (!module) return;
    const subIds = module.submodules.map((submodule) => submodule.id);
    const itemIds = module.submodules.flatMap((submodule) => submodule.worksheets.map((worksheet) => worksheet.kpiId));
    setDraft((prev) => {
      const selected = prev.modules.includes(moduleId);
      if (selected) {
        return {
          ...prev,
          modules: prev.modules.filter((id) => id !== moduleId),
          submodules: prev.submodules.filter((id) => !subIds.includes(id)),
          items: prev.items.filter((id) => !itemIds.includes(id)),
        };
      }
      return {
        ...prev,
        modules: [...new Set([...prev.modules, moduleId])],
        submodules: [...new Set([...prev.submodules, ...subIds])],
        items: [...new Set([...prev.items, ...itemIds])],
      };
    });
  }

  function toggleSubmoduleSelection(submoduleId) {
    const submodule = submoduleMap[submoduleId];
    if (!submodule) return;
    const itemIds = submodule.worksheets.map((worksheet) => worksheet.kpiId);
    setDraft((prev) => {
      const selected = prev.submodules.includes(submoduleId);
      if (selected) {
        const nextSubmodules = prev.submodules.filter((id) => id !== submoduleId);
        const nextModules = nextSubmodules.some((id) => submoduleMap[id]?.moduleId === submodule.moduleId)
          ? prev.modules
          : prev.modules.filter((id) => id !== submodule.moduleId);
        return {
          ...prev,
          modules: nextModules,
          submodules: nextSubmodules,
          items: prev.items.filter((id) => !itemIds.includes(id)),
        };
      }
      return {
        ...prev,
        modules: [...new Set([...prev.modules, submodule.moduleId])],
        submodules: [...new Set([...prev.submodules, submoduleId])],
        items: [...new Set([...prev.items, ...itemIds])],
      };
    });
  }

  function toggleItemSelection(itemId) {
    const item = worksheetMap[itemId];
    if (!item) return;
    setDraft((prev) => {
      const selected = prev.items.includes(itemId);
      if (selected) {
        const nextItems = prev.items.filter((id) => id !== itemId);
        const keepSubmodule = nextItems.some((id) => worksheetMap[id]?.submoduleId === item.submoduleId);
        const nextSubmodules = keepSubmodule ? prev.submodules : prev.submodules.filter((id) => id !== item.submoduleId);
        const keepModule = nextSubmodules.some((id) => submoduleMap[id]?.moduleId === item.moduleId);
        const nextModules = keepModule ? prev.modules : prev.modules.filter((id) => id !== item.moduleId);
        return {
          ...prev,
          modules: nextModules,
          submodules: nextSubmodules,
          items: nextItems,
        };
      }
      return {
        ...prev,
        modules: [...new Set([...prev.modules, item.moduleId])],
        submodules: [...new Set([...prev.submodules, item.submoduleId])],
        items: [...new Set([...prev.items, itemId])],
      };
    });
  }

  function getModuleSelectionState(module) {
    const subIds = module.submodules.map((submodule) => submodule.id);
    const itemIds = module.submodules.flatMap((submodule) => submodule.worksheets.map((worksheet) => worksheet.kpiId));
    const selectedSubCount = subIds.filter((id) => draft.submodules.includes(id)).length;
    const selectedItemCount = itemIds.filter((id) => draft.items.includes(id)).length;
    const checked = draft.modules.includes(module.id) && selectedSubCount === subIds.length && selectedItemCount === itemIds.length;
    const partial = !checked && (selectedSubCount > 0 || selectedItemCount > 0 || draft.modules.includes(module.id));
    return { checked, partial };
  }

  function getSubmoduleSelectionState(submodule) {
    const itemIds = submodule.worksheets.map((worksheet) => worksheet.kpiId);
    const selectedItemCount = itemIds.filter((id) => draft.items.includes(id)).length;
    const checked = draft.submodules.includes(submodule.id) && selectedItemCount === itemIds.length;
    const partial = !checked && (selectedItemCount > 0 || draft.submodules.includes(submodule.id));
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
                (item) => (draft.items.includes(item.kpiId) ? 2 : 0),
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
              worksheets: sortEntities(submodule.worksheets, (item) => item.label, (item) => (draft.items.includes(item.kpiId) ? 2 : 0)),
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
    draft.items.length > 0,
    draft.iits.length > 0,
    Boolean(toolbarSearch),
    draft.yearFrom !== YEARS[0] || draft.yearTo !== YEARS[YEARS.length - 1],
  ].filter(Boolean).length;

  const selectionSource = applied ?? draft;
  const selectionIitSummary = selectionSource?.iits?.length === IITs.length
    ? 'ALL'
    : selectionSource?.iits?.length === LEGACY_IITS.length && LEGACY_IITS.every((iid) => selectionSource.iits.includes(iid))
      ? "OLD IIT's"
      : selectionSource?.iits?.length
        ? `${selectionSource.iits.length} selected`
        : 'None';

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
            title={module.label ?? module.id}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition hover:border-sky-200 hover:bg-sky-50/40"
          >
            {module.label ?? module.id}
          </button>
        )) : (
          <span className="text-sm text-slate-500">No module selected.</span>
        )}
        <SelectionActionButton
          label={hiddenCount > 0 ? `More (+${hiddenCount})` : 'More'}
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
          <span className="text-sm text-slate-500">No sub-module selected.</span>
          <SelectionActionButton label="More" onClick={() => openBuilder(1)} title="Open sub-module filters" />
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
            title={`${submodule.moduleLabel} > ${submodule.label}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition hover:border-sky-200 hover:bg-sky-50/40"
          >
            {submodule.label}
          </button>
        ))}
        <SelectionActionButton
          label={hiddenCount > 0 ? `More (+${hiddenCount})` : 'More'}
          onClick={() => openBuilder(1)}
          title="Open sub-module filters"
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

    const visibleIITs = sortEntities(
      IITs.filter((iit) => {
        if (!iitQuery) return true;
        return `${iit.id} ${iit.name} ${iit.state || ''}`.toLowerCase().includes(iitQuery);
      }),
      (iit) => `${iit.id} ${iit.name}`,
      (iit) => (draft.iits.includes(iit.id) ? 2 : 0),
    );

    const selectAllModules = () => {
      setDraft((prev) => ({
        ...prev,
        modules: hierarchy.map((module) => module.id),
        submodules: hierarchy.flatMap((module) => module.submodules.map((submodule) => submodule.id)),
        items: hierarchy.flatMap((module) => module.submodules.flatMap((submodule) => submodule.worksheets.map((worksheet) => worksheet.kpiId))),
      }));
    };

    const resetModules = () => {
      setDraft((prev) => ({ ...prev, modules: [], submodules: [], items: [] }));
    };

    const selectAllVisibleSubmodules = () => {
      if (!selectedModuleEntities.length) return;
      const nextSubmodules = selectedModuleEntities.flatMap((module) => module.submodules.map((submodule) => submodule.id));
      const nextItems = selectedModuleEntities.flatMap((module) => module.submodules.flatMap((submodule) => submodule.worksheets.map((worksheet) => worksheet.kpiId)));
      setDraft((prev) => ({
        ...prev,
        modules: [...new Set([...prev.modules, ...selectedModuleEntities.map((module) => module.id)])],
        submodules: [...new Set([...prev.submodules, ...nextSubmodules])],
        items: [...new Set([...prev.items, ...nextItems])],
      }));
    };

    const resetSubmodules = () => {
      const selectedModuleSet = new Set(draft.modules);
      setDraft((prev) => ({
        ...prev,
        submodules: prev.submodules.filter((submoduleId) => !selectedModuleSet.has(submoduleMap[submoduleId]?.moduleId)),
        items: prev.items.filter((itemId) => !selectedModuleSet.has(worksheetMap[itemId]?.moduleId)),
      }));
    };

    return (
      <div className="fixed inset-0 z-[260] bg-slate-950/18 px-4 py-5 backdrop-blur-[2px]">
        <div
          data-compare-popover
          className="mx-auto flex h-full w-full max-w-[1180px] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[#f3f4f6] shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
        >
          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div>
              <div className="text-[1.25rem] font-extrabold text-slate-900">Advanced compare &amp; filter</div>
              <div className="mt-1 text-sm text-slate-500">Refine module, sub-module, date, and IIT filters, then apply them to refresh the compare view.</div>
            </div>
            <button
              type="button"
              onClick={() => setOpenPopover(null)}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-white shadow-sm"
              aria-label="Close advanced filters"
            >
              {compareIcon('close', true, '#ffffff')}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-5 pb-5">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Module</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px] flex-1 max-w-[320px]">
                        <SearchField value={moduleSearch} onChange={setModuleSearch} placeholder="Search module" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={resetModules} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                        <SelectionActionButton label="Select all" onClick={selectAllModules} title="Select all modules" />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {visibleModules.length ? visibleModules.map((module) => (
                        <FilterChoiceChip
                          key={module.id}
                          label={module.label ?? module.id}
                          active={draft.modules.includes(module.id)}
                          onClick={() => toggleModuleSelection(module.id)}
                          title={module.description || module.label || module.id}
                        />
                      )) : (
                        <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No matching modules found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Date</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,220px)_minmax(0,220px)]">
                    <ToolbarSelect
                      label="From"
                      value={String(draft.yearFrom)}
                      onChange={(value) => handleRangeChange('from', value)}
                      options={YEARS.map((year) => ({ value: String(year), label: String(year) }))}
                      minWidth={0}
                      className="w-full"
                    />
                    <ToolbarSelect
                      label="To"
                      value={String(draft.yearTo)}
                      onChange={(value) => handleRangeChange('to', value)}
                      options={YEARS.map((year) => ({ value: String(year), label: String(year) }))}
                      minWidth={0}
                      className="w-full"
                    />
                  </div>
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
                      <SelectionActionButton label="OLD IIT's" onClick={() => setDraft((prev) => ({ ...prev, iits: [...LEGACY_IITS] }))} title="Select old IITs" />
                      <SelectionActionButton label="ALL" onClick={() => setDraft((prev) => ({ ...prev, iits: IITs.map((iit) => iit.id) }))} title="Select all IITs" />
                    </div>
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

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
                  <div className="pt-2 text-[1.02rem] font-extrabold text-slate-900">Sub-module</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px] flex-1 max-w-[320px]">
                        <SearchField value={submoduleSearch} onChange={setSubmoduleSearch} placeholder="Search sub-module" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={resetSubmodules} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Reset</button>
                        <SelectionActionButton label="Select all" onClick={selectAllVisibleSubmodules} title="Select all sub-modules for the current modules" />
                      </div>
                    </div>
                    {selectedModuleEntities.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {visibleSubmodules.length ? visibleSubmodules.map((submodule) => (
                          <FilterChoiceChip
                            key={submodule.id}
                            label={submodule.label}
                            active={draft.submodules.includes(submodule.id)}
                            onClick={() => toggleSubmoduleSelection(submodule.id)}
                            title={`${submodule.moduleLabel} > ${submodule.label}`}
                          />
                        )) : (
                          <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No matching sub-modules found for the selected module.</div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[16px] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">Select at least one module to view its sub-modules here.</div>
                    )}
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
          <div className="mt-0.5 text-xs text-slate-500">Set the view, scale, and focus year without opening a bulky builder.</div>
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
              label="Focus"
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
    const appliedWorksheetPills = appliedItems.map((item) => ({
      id: item.kpiId,
      label: item.label,
      breadcrumb: [
        moduleMap[item.moduleId]?.label ?? item.moduleLabel ?? item.moduleId,
        submoduleMap[item.submoduleId]?.label ?? item.submoduleLabel ?? item.submoduleId,
        item.label,
      ].filter(Boolean).join(" > "),
    }));
    const appliedYearsLabel = `${applied.yearFrom}-${applied.yearTo}`;
    const appliedIitsLabel = summarizeList(appliedIITs.map((iid) => instituteShortLabel(iid)), 5);

    return (
      <div
        ref={targetRef}
        className={cn("rounded-[32px] border bg-white shadow-sm", fullscreen ? "h-full" : "")}
        style={{ borderColor: "rgba(59,130,246,0.15)" }}
      >
        <div className={cn("relative", fullscreen ? "h-full p-5" : "p-4")}>
          <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
            <div className="flex flex-wrap items-center gap-2">
              {SCALE_OPTIONS.map((option) => {
                const disabled = option.id === "indexed" && (applied.view === "table" || !appliedModeValidity[applied.view]?.valid);
                const active = applied.scale === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => commitAppliedSelection({ ...applied, scale: option.id })}
                    className={cn("rounded-full px-4 py-2 text-[0.78rem] font-bold transition", disabled ? "cursor-not-allowed opacity-50" : "")}
                    style={{
                      background: "rgba(255,255,255,0.98)",
                      border: `1px solid ${active ? uiAccent : "rgba(203,213,225,0.9)"}`,
                      color: active ? uiAccent : "#475569",
                      boxShadow: active ? "0 8px 24px rgba(59,130,246,0.14)" : "0 2px 10px rgba(15,23,42,0.04)",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="min-w-0 text-center lg:px-4">
              <div className="text-[1.08rem] font-extrabold leading-tight text-slate-900">Compare</div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {appliedWorksheetPills.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={openWorksheetFilters}
                    title={item.breadcrumb}
                    className="inline-flex items-center rounded-[14px] bg-[#eef5ff] px-4 py-2 text-sm font-bold text-[#1252a0] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] transition hover:bg-[#e2eeff]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-600">{appliedIitsLabel}</div>
              <div className="mt-1 text-sm font-semibold text-slate-700">{appliedYearsLabel}</div>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
              <CompareViewToolbar
                value={applied.view}
                disabledMap={Object.fromEntries(VIEW_OPTIONS.map((option) => [option.id, !appliedModeValidity[option.id]?.valid]))}
                onChange={(nextView) => {
                  const nextState = appliedModeValidity[nextView];
                  if (!nextState?.valid) return;
                  commitAppliedSelection({ ...applied, view: nextView, scale: nextView === "table" ? "raw" : applied.scale });
                }}
              />
              {!fullscreen ? (
                <button
                  type="button"
                  onClick={() => setIsFullscreen((value) => !value)}
                  className="grid h-11 w-11 place-items-center rounded-[16px] border bg-white text-sky-700 shadow-[0_10px_24px_rgba(37,99,235,0.10)]"
                  style={{ borderColor: "rgba(191,219,254,0.95)" }}
                  title={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}
                >
                  {compareIcon("fullscreen", false, "#2563eb")}
                </button>
              ) : null}
            </div>
          </div>

          {groupedIITs.length < appliedIITs.length && applied.view === "grouped" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Grouped bars are capped at 7 IITs for readability. The first 7 selected IITs are shown.
            </div>
          ) : null}

          <div className="mt-4 bg-white pt-2">
            {applied.view !== "table" && !appliedModeValidity[applied.view]?.valid ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {appliedModeValidity[applied.view]?.reason}
              </div>
            ) : null}

            {applied.view === "grouped" && appliedModeValidity.grouped.valid ? (
              <div style={{ height: fullscreen ? 620 : 520 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupedRows} margin={{ top: 12, right: 18, left: 8, bottom: 52 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      tick={(props) => <WrappedWorksheetTick {...props} />}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={68}
                    />
                    <YAxis tick={{ fontSize: 16, fill: "#475569" }} axisLine={false} tickLine={false} width={78} />
                    <Tooltip content={<CompareTooltip metricLookup={appliedMetricLookup} scaleMode={applied.scale} mode="grouped" />} />
                    {groupedIITs.map((iid, index) => (
                      <Bar key={iid} dataKey={`display_${iid}`} fill={PALETTE[index % PALETTE.length]} radius={[10, 10, 0, 0]} maxBarSize={Math.max(18, 42 - groupedRows.length)}>
                        {groupedRows.map((row) => <Cell key={`${iid}-${row.metricId}`} />)}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {applied.view === "trend" && appliedModeValidity.trend.valid ? (
              <div style={{ height: fullscreen ? 620 : 520 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendRows} margin={{ top: 14, right: 20, left: 8, bottom: 18 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 16, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 16, fill: "#475569" }} axisLine={false} tickLine={false} width={78} />
                    <Tooltip content={<CompareTooltip metricLookup={appliedMetricLookup} scaleMode={applied.scale} mode="trend" />} />
                    <ReferenceLine x={String(applied.focusYear)} stroke={uiAccent} strokeDasharray="4 4" />
                    {appliedIITs.map((iid, index) => (
                      <Line key={iid} type="monotone" dataKey={`display_${iid}`} stroke={PALETTE[index % PALETTE.length]} strokeWidth={2.6} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {applied.view === "smallMultiples" && appliedModeValidity.smallMultiples.valid ? (
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {smallMultipleSeries.map((series) => (
                  <SmallMultipleCard key={series.item.kpiId} series={series} accent={uiAccent} scaleMode={applied.scale} />
                ))}
              </div>
            ) : null}

            {applied.view === "table" && appliedModeValidity.table.valid ? (
              <div className="overflow-auto rounded-[24px] border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-[#eef5ff]">
                    <tr>
                      <th className="px-3 py-2 text-left">Institute</th>
                      <th className="px-3 py-2 text-left">Module</th>
                      <th className="px-3 py-2 text-left">Sub-module</th>
                      <th className="px-3 py-2 text-left">Compare item</th>
                      <th className="px-3 py-2 text-left">Value</th>
                      <th className="px-3 py-2 text-left">YoY</th>
                      <th className="px-3 py-2 text-left">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, index) => (
                      <tr key={`${row.Institute}-${row.CompareItem}-${index}`} className="odd:bg-[#f8fbff] even:bg-white">
                        <td className="border-t border-slate-200 px-3 py-2">{row.Institute}</td>
                        <td className="border-t border-slate-200 px-3 py-2">{row.Module}</td>
                        <td className="border-t border-slate-200 px-3 py-2">{row.Submodule}</td>
                        <td className="border-t border-slate-200 px-3 py-2">{row.CompareItem}</td>
                        <td className="border-t border-slate-200 px-3 py-2">{fmtRaw(row._item?.kpi, row.Value)}</td>
                        <td className="border-t border-slate-200 px-3 py-2">{formatPct(row.YoY)}</td>
                        <td className="border-t border-slate-200 px-3 py-2">{row.Range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          <div
            data-export-hide="true"
            className={`${fullscreen ? "fixed bottom-8 right-8 z-[340]" : "absolute bottom-4 right-4 z-20"} flex flex-col items-end gap-2`}
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
                    style={{ color: "#0f172a", border: "1px solid rgba(15,42,94,0.14)" }}
                  >
                    <span className="dashboard-speed-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[142] -translate-y-1/2 whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 opacity-0 shadow-sm transition">
                      {item.label}
                    </span>
                    <span>{compareIcon(item.icon, false, "#0f172a")}</span>
                  </button>
                ))
              : null}
            <button
              type="button"
              onClick={() => setSpeedDialOpen((value) => !value)}
              className="dashboard-speed-action group relative z-[141] grid h-12 w-12 place-items-center rounded-2xl text-3xl text-white shadow-lg"
              style={{ background: "#1e6cc8", lineHeight: 1 }}
            >
              <span className="dashboard-speed-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[142] -translate-y-1/2 whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 opacity-0 shadow-sm transition">
                {speedDialOpen ? "Close actions" : "Open actions"}
              </span>
              <span style={{ transform: speedDialOpen ? "translateY(-1px)" : "translateY(-2px)" }}>
                {speedDialOpen ? "x" : "+"}
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
        <div
          className="rounded-[32px] border px-5 py-5 shadow-sm"
          style={{
            borderColor: 'rgba(59,130,246,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          }}
        >
          <div className="text-[1.05rem] font-extrabold text-slate-900">Select Module(s):</div>
          {renderSelectionLine()}
          <div className="mt-5 text-[0.98rem] font-extrabold text-slate-900">Select Sub-module(s):</div>
          {renderSubKpiLine()}
        </div>

        <div
          className="rounded-[32px] border px-5 py-5 shadow-sm"
          style={{
            borderColor: 'rgba(59,130,246,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          }}
        >
          <div className="text-[1.05rem] font-extrabold text-slate-900">Date:</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <ToolbarSelect
              label="From"
              value={String(selectionSource.yearFrom)}
              onChange={(value) => updateSelectionSummarySource((prev) => {
                const year = Number(value);
                const nextFrom = Math.min(year, prev.yearTo);
                const nextFocus = Math.min(Math.max(prev.focusYear, nextFrom), prev.yearTo);
                return { ...prev, yearFrom: nextFrom, focusYear: nextFocus };
              })}
              options={YEARS.map((year) => ({ value: String(year), label: String(year) }))}
              minWidth={0}
              className="w-full"
              labelClassName="px-0 text-[0.72rem] font-semibold tracking-[0.22em] text-slate-500"
              selectClassName="w-full rounded-[16px] border-[1.5px] border-[#d8e5ff] bg-white text-base font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-[#93c5fd] focus:shadow-[0_0_0_4px_rgba(219,234,254,0.9)]"
            />
            <ToolbarSelect
              label="To"
              value={String(selectionSource.yearTo)}
              onChange={(value) => updateSelectionSummarySource((prev) => {
                const year = Number(value);
                const nextTo = Math.max(year, prev.yearFrom);
                const nextFocus = Math.min(Math.max(prev.focusYear, prev.yearFrom), nextTo);
                return { ...prev, yearTo: nextTo, focusYear: nextFocus };
              })}
              options={YEARS.map((year) => ({ value: String(year), label: String(year) }))}
              minWidth={0}
              className="w-full"
              labelClassName="px-0 text-[0.72rem] font-semibold tracking-[0.22em] text-slate-500"
              selectClassName="w-full rounded-[16px] border-[1.5px] border-[#d8e5ff] bg-white text-base font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-[#93c5fd] focus:shadow-[0_0_0_4px_rgba(219,234,254,0.9)]"
            />
          </div>

          <div className="mt-5 text-[0.98rem] font-extrabold text-slate-900">IIT(s):</div>
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
              OLD IIT's
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
            <SelectionActionButton
              label="More"
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
          Selections are ready. Open More to refine them or keep the current defaults.
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
              style={{ background: uiAccent }}
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
        <div className="mt-4 whitespace-pre-line rounded-[24px] border p-4 text-sm text-slate-700" style={{ borderColor: "rgba(59,130,246,0.12)", background: "rgba(248,250,252,0.85)" }}>
          {compareInterpretation}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              downloadText(
                `iitmis_compare_${applied?.view ?? "compare"}_ai_interpretation.txt`,
                `AI interpretation\n\n${compareInterpretation}`,
              );
              markDownloaded("AI interpretation downloaded.");
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{ color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)", background: "white" }}
          >
            Download AI interpretation
          </button>
        </div>
      </Drawer>
    </div>
  );

}



