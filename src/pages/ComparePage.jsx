
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
  downloadText,
  formatCompact,
  formatPct,
  toCsv,
} from "../utils/helpers";
import { IITs, THEME_COLORS, YEARS } from "../constants";
import { COMPARE_HIERARCHY, KPI_BY_ID } from "../data/compareHierarchy";
import { kpiValue } from "../data/kpiDefs";

const LEGACY_IITS = ["IITB", "IITD", "IITK", "IITKGP", "IITM"];
const PALETTE = ["#2563eb", "#f59e0b", "#14b8a6", "#8b5cf6", "#ec4899", "#64748b", "#0f766e"];
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

function summarizeList(values, max = 3) {
  if (!values?.length) return "None selected";
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} +${values.length - max} more`;
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
  }[kind];

  if (!wrappers) return null;
  return <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">{wrappers}</svg>;
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

function ToolbarSelect({ label, value, options, onChange, minWidth = 110 }) {
  return (
    <label className="flex shrink-0 flex-col gap-1" style={{ minWidth }}>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[18px] border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-sky-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
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
      className="group flex items-start gap-2 rounded-2xl px-2 py-2 transition hover:bg-slate-50"
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

function SimpleChip({ children, tone = "#2563eb", removable = false, onRemove, onClick }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        onClick ? "cursor-pointer transition" : "",
      )}
      onClick={onClick}
      style={{
        background: `${tone}12`,
        borderColor: `${tone}22`,
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
                  {scaleMode === "indexed" && raw != null ? ` • ${fmtRaw(metric?.kpi, raw)}` : ""}
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
            <Bar dataKey="display" fill={accent} radius={[10, 10, 0, 0]} maxBarSize={26}>
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
  const [openPopover, setOpenPopover] = useState(null);
  const [toolbarSearch, setToolbarSearch] = useState("");
  const [sortBy, setSortBy] = useState("selected");
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubmodules, setExpandedSubmodules] = useState({});
  const chartRef = useRef(null);
  const fullscreenRef = useRef(null);

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
        shortLabel: truncate(item.label, 22),
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
          Range: appliedYears.map((year) => `${year}: ${fmtRaw(item.kpi, valueForKpi(facts, item.kpi, iid, year))}`).join(" • "),
          _item: item,
        };
      });
    });
  }, [applied, appliedIITs, appliedItems, appliedYears, facts]);

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
    if (!applied) return;
    const next = { ...applied };
    if (kind === "module") {
      next.modules = next.modules.filter((item) => item !== id);
      const allowedSubmodules = next.modules.flatMap((moduleId) => moduleMap[moduleId]?.submodules.map((submodule) => submodule.id) ?? []);
      next.submodules = next.submodules.filter((item) => allowedSubmodules.includes(item));
      const allowedItems = next.submodules.flatMap((submoduleId) => submoduleMap[submoduleId]?.worksheets.map((worksheet) => worksheet.kpiId) ?? []);
      next.items = next.items.filter((item) => allowedItems.includes(item));
    }
    if (kind === "submodule") {
      next.submodules = next.submodules.filter((item) => item !== id);
      const allowedItems = next.submodules.flatMap((submoduleId) => submoduleMap[submoduleId]?.worksheets.map((worksheet) => worksheet.kpiId) ?? []);
      next.items = next.items.filter((item) => allowedItems.includes(item));
    }
    if (kind === "item") next.items = next.items.filter((item) => item !== id);
    if (kind === "iit") next.iits = next.iits.filter((item) => item !== id);
    if (kind === "mode") next.view = VIEW_OPTIONS.find((option) => option.id !== next.view && deriveModeValidity(next.items.map((item) => worksheetMap[item]).filter(Boolean), next.iits, next.yearFrom, next.yearTo)[option.id]?.valid)?.id ?? next.view;
    if (kind === "scale") next.scale = "raw";
    if (!next.modules.length || !next.submodules.length || !next.items.length || !next.iits.length) {
      setApplied(null);
      setDraft(next);
      return;
    }
    setApplied(next);
    setDraft(next);
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
    const ok = await copyToClipboard(summary);
    setNotice(ok ? "Copied comparison summary." : "Copy failed.");
  }

  async function handleDownloadPng() {
    const target = isFullscreen ? fullscreenRef.current : chartRef.current;
    await downloadElementImage(target, `iitmis_compare_${applied?.view ?? "compare"}.png`, "png");
    setNotice("PNG downloaded.");
  }

  async function handleDownloadSvg() {
    const target = isFullscreen ? fullscreenRef.current : chartRef.current;
    await downloadElementSvg(target, `iitmis_compare_${applied?.view ?? "compare"}.svg`, { preserveLayout: true });
    setNotice("SVG downloaded.");
  }

  async function handleDownloadPdf() {
    const target = isFullscreen ? fullscreenRef.current : chartRef.current;
    await downloadElementPdf(target, `IIT MIS Compare ${applied?.focusYear ?? ""}`);
    setNotice("PDF downloaded.");
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
    setNotice("CSV downloaded.");
  }

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
    sortBy !== "selected",
    draft.yearFrom !== YEARS[0] || draft.yearTo !== YEARS[YEARS.length - 1],
  ].filter(Boolean).length;

  function renderSelectionLine() {
    const source = applied ?? draft;
    const moduleLabels = source.modules.map((id) => moduleMap[id]?.id ?? id);
    const submoduleLabels = source.submodules.map((id) => submoduleMap[id]?.label ?? id);
    const itemLabels = source.items.map((id) => worksheetMap[id]?.label ?? id);
    const pills = [];
    if (toolbarSearch) pills.push({ key: 'keyword', label: `Keyword: ${toolbarSearch}`, tone: '#334155', clear: () => setToolbarSearch(''), open: () => setOpenPopover('filters') });
    if (moduleLabels.length) pills.push({ key: 'modules', label: `Modules · ${summarizeList(moduleLabels, 2)}`, tone: '#475569', clear: () => setDraft((prev) => ({ ...prev, modules: [], submodules: [], items: [] })), open: () => setOpenPopover('filters') });
    if (submoduleLabels.length) pills.push({ key: 'submodules', label: `Sub-modules · ${summarizeList(submoduleLabels, 2)}`, tone: '#7c3aed', clear: () => setDraft((prev) => ({ ...prev, submodules: [], items: [] })), open: () => setOpenPopover('filters') });
    if (itemLabels.length) pills.push({ key: 'items', label: `Items · ${summarizeList(itemLabels, 2)}`, tone: '#0f766e', clear: () => setDraft((prev) => ({ ...prev, items: [] })), open: () => setOpenPopover('filters') });
    if (source.iits.length) pills.push({ key: 'iits', label: `IITs · ${summarizeList(source.iits, 3)}`, tone: '#ea580c', clear: () => setDraft((prev) => ({ ...prev, iits: [] })), open: () => setOpenPopover('filters') });
    pills.push({ key: 'years', label: `Years · ${source.yearFrom}–${source.yearTo}`, tone: '#1d4ed8', open: () => {} });
    pills.push({ key: 'mode', label: `Mode · ${VIEW_OPTIONS.find((option) => option.id === source.view)?.label ?? source.view}`, tone: '#db2777', clear: applied ? () => openBuilder(4) : undefined, open: () => setOpenPopover('mode') });
    pills.push({ key: 'scale', label: `Scale · ${source.scale === 'indexed' ? 'Indexed 100' : 'Raw'}`, tone: '#0891b2', clear: source.scale === 'indexed' ? () => setDraft((prev) => ({ ...prev, scale: 'raw' })) : undefined, open: () => setOpenPopover('mode') });
    if (sortBy !== 'selected') pills.push({ key: 'sort', label: `Sort · ${sortBy === 'aToZ' ? 'A–Z' : 'Z–A'}`, tone: '#64748b', clear: () => setSortBy('selected'), open: () => {} });

    if (!pills.length) return null;
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        {pills.map((pill) => (
          <SimpleChip key={pill.key} tone={pill.tone} removable={Boolean(pill.clear)} onRemove={pill.clear} onClick={pill.open}>
            {pill.label}
          </SimpleChip>
        ))}
      </div>
    );
  }

  function renderFilterPopover() {
    if (openPopover !== 'filters') return null;
    return (
      <div data-compare-popover className="absolute left-0 top-full z-40 mt-2 w-full max-w-[480px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Filters</div>
            <div className="mt-0.5 text-xs text-slate-500">Multiple selection stays compact and left-aligned.</div>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">{activeFilterCount} active</span>
        </div>

        <div className="mt-4 rounded-[24px] border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Hierarchy</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDraft((prev) => ({
                  ...prev,
                  modules: hierarchy.map((module) => module.id),
                  submodules: hierarchy.flatMap((module) => module.submodules.map((submodule) => submodule.id)),
                  items: hierarchy.flatMap((module) => module.submodules.flatMap((submodule) => submodule.worksheets.map((worksheet) => worksheet.kpiId))),
                }))}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, modules: [], submodules: [], items: [] }))}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="mt-3 max-h-[320px] overflow-auto pr-1">
            {filteredHierarchy.length ? filteredHierarchy.map((module) => {
              const moduleState = getModuleSelectionState(module);
              const moduleExpanded = expandedModules[module.id] ?? true;
              return (
                <div key={module.id} className="rounded-[22px] border border-slate-100 bg-slate-50/40 py-1">
                  <TreeNodeRow
                    level={0}
                    label={module.id}
                    subtitle={`${module.submodules.length} sub-modules`}
                    checked={moduleState.checked}
                    partial={moduleState.partial}
                    hasChildren
                    expanded={moduleExpanded}
                    onToggleExpand={() => toggleModuleExpand(module.id)}
                    onToggleCheck={() => toggleModuleSelection(module.id)}
                  />
                  {moduleExpanded ? module.submodules.map((submodule) => {
                    const submoduleState = getSubmoduleSelectionState(submodule);
                    const subExpanded = expandedSubmodules[submodule.id] ?? false;
                    return (
                      <div key={submodule.id}>
                        <TreeNodeRow
                          level={1}
                          label={submodule.label}
                          subtitle={`${submodule.worksheets.length} compare items`}
                          checked={submoduleState.checked}
                          partial={submoduleState.partial}
                          hasChildren
                          expanded={subExpanded}
                          onToggleExpand={() => toggleSubmoduleExpand(submodule.id)}
                          onToggleCheck={() => toggleSubmoduleSelection(submodule.id)}
                        />
                        {subExpanded ? submodule.worksheets.map((item) => (
                          <TreeNodeRow
                            key={item.kpiId}
                            level={2}
                            label={item.label}
                            subtitle={item.helper}
                            checked={draft.items.includes(item.kpiId)}
                            badge={item.comparable ? undefined : 'Table only'}
                            onToggleCheck={() => toggleItemSelection(item.kpiId)}
                          />
                        )) : null}
                      </div>
                    );
                  }) : null}
                </div>
              );
            }) : <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">No matching hierarchy nodes.</div>}
          </div>
        </div>

        <div className="mt-3 rounded-[24px] border border-slate-200 p-3">
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
                  {iid}
                </SimpleChip>
              ))}
              {draft.iits.length > 8 ? <SimpleChip tone="#64748b">+{draft.iits.length - 8} more</SimpleChip> : null}
            </div>
          ) : null}
          <div className="mt-3 grid max-h-44 gap-2 overflow-auto pr-1">
            {filteredIITs.map((iit) => (
              <label key={iit.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 px-3 py-2 transition hover:bg-slate-50">
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
                  <div className="text-sm font-semibold text-slate-800">{iit.id} · {iit.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{iit.state}</div>
                </div>
              </label>
            ))}
          </div>
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
    const viewLabel = VIEW_OPTIONS.find((option) => option.id === applied.view)?.label ?? applied.view;
    const subtitle = `${summarizeList(appliedItems.map((item) => item.label), 2)} · ${summarizeList(appliedIITs, 4)} · ${applied.yearFrom}–${applied.yearTo}`;

    return (
      <div
        ref={targetRef}
        className={cn("rounded-[32px] border bg-white shadow-sm", fullscreen ? "h-full" : "")}
        style={{ borderColor: "rgba(59,130,246,0.15)" }}
      >
        <div className={cn("relative", fullscreen ? "h-full p-5" : "p-4")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[1.05rem] font-extrabold leading-tight text-slate-900">Compare</div>
              <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {VIEW_OPTIONS.map((option) => {
                  const active = applied.view === option.id;
                  const state = appliedModeValidity[option.id];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!state.valid}
                      onClick={() => setApplied((prev) => ({ ...prev, view: option.id, scale: option.id === "table" ? "raw" : prev.scale }))}
                      className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition", !state.valid ? "cursor-not-allowed opacity-50" : "")}
                      style={{
                        background: active ? "#e8f0ff" : "#ffffff",
                        border: `1px solid ${active ? "rgba(37,99,235,0.28)" : "rgba(148,163,184,0.18)"}`,
                        color: active ? "#1d4ed8" : "#475569",
                      }}
                    >
                      {compareIcon(option.id, false, active ? "#1d4ed8" : "#475569")}
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {SCALE_OPTIONS.map((option) => {
                const disabled = option.id === "indexed" && (applied.view === "table" || !appliedModeValidity[applied.view]?.valid);
                const active = applied.scale === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setApplied((prev) => ({ ...prev, scale: option.id }))}
                    className={cn("rounded-full px-3 py-1.5 text-xs font-bold transition", disabled ? "cursor-not-allowed opacity-50" : "")}
                    style={{
                      background: active ? "#e8f0ff" : "white",
                      border: `1px solid ${active ? "rgba(37,99,235,0.28)" : "rgba(148,163,184,0.18)"}`,
                      color: active ? "#1d4ed8" : "#475569",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsFullscreen((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700"
                title={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}
              >
                {compareIcon("fullscreen", false, "#475569")}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {appliedYears.map((year) => (
                <SimpleChip key={year} tone={year === applied.focusYear ? "#1d4ed8" : "#64748b"} onClick={() => setApplied((prev) => ({ ...prev, focusYear: year }))}>
                  {year}
                </SimpleChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                {compareIcon("share", false, "#475569")}
                <span>Share summary</span>
              </button>
              <button type="button" onClick={applied.view === "table" ? handleDownloadCsv : handleDownloadSvg} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                {compareIcon("download", false, "#475569")}
                <span>{applied.view === "table" ? "CSV" : "SVG"}</span>
              </button>
              <button type="button" onClick={handleDownloadPng} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                {compareIcon("image", false, "#475569")}
                <span>PNG</span>
              </button>
            </div>
          </div>

          {groupedIITs.length < appliedIITs.length && applied.view === "grouped" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Grouped bars are capped at 7 IITs for readability. The first 7 selected IITs are shown.
            </div>
          ) : null}

          <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{viewLabel}</div>
                <div className="text-xs text-slate-500">{subtitle}</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                PDF
              </button>
            </div>

            {applied.view !== "table" && !appliedModeValidity[applied.view]?.valid ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {appliedModeValidity[applied.view]?.reason}
              </div>
            ) : null}

            {applied.view === "grouped" && appliedModeValidity.grouped.valid ? (
              <div style={{ height: fullscreen ? 620 : 520 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupedRows} margin={{ top: 12, right: 18, left: 8, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="shortLabel" tick={{ fontSize: 16, fill: "#475569" }} axisLine={false} tickLine={false} interval={0} />
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
                      <Line key={iid} type="monotone" dataKey={`display_${iid}`} stroke={PALETTE[index % PALETTE.length]} strokeWidth={2.6} dot={{ r: 3 }} activeDot={{ r: 5 }} />
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[1.6rem] font-extrabold tracking-tight text-slate-900">Compare</div>
        <div className="mt-1 text-sm text-slate-500">Lean compare controls with left-aligned multi-select filters and a compact selected-state line.</div>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
          {notice}
        </div>
      ) : null}

      <div className="relative" data-compare-toolbar>
        <div className="rounded-[30px] border bg-white px-4 py-4 shadow-sm" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
          <div className="flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={() => openBuilder(1)}
              className="inline-flex h-12 items-center gap-3 rounded-[18px] px-6 text-sm font-extrabold text-white shadow-sm"
              style={{ background: '#1d4ed8' }}
            >
              {compareIcon('build', true, '#ffffff')}
              <span>Build Compare</span>
            </button>

            <div className="min-w-[260px] flex-1 lg:max-w-[360px]">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Search by keyword</span>
                <input
                  value={toolbarSearch}
                  onChange={(event) => setToolbarSearch(event.target.value)}
                  placeholder="Search hierarchy, worksheets, or IITs"
                  className="h-12 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                />
              </label>
            </div>

            <ToolbarSelect
              label="Sort by"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'selected', label: 'Selected first' },
                { value: 'aToZ', label: 'A–Z' },
                { value: 'zToA', label: 'Z–A' },
              ]}
              minWidth={136}
            />

            <ToolbarSelect
              label="From"
              value={String(draft.yearFrom)}
              onChange={(value) => handleRangeChange('from', value)}
              options={YEARS.map((year) => ({ value: String(year), label: String(year) }))}
              minWidth={92}
            />

            <ToolbarSelect
              label="To"
              value={String(draft.yearTo)}
              onChange={(value) => handleRangeChange('to', value)}
              options={YEARS.map((year) => ({ value: String(year), label: String(year) }))}
              minWidth={92}
            />

            <button
              type="button"
              onClick={() => setOpenPopover((value) => (value === 'filters' ? null : 'filters'))}
              className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700"
            >
              {compareIcon('filters', false, '#475569')}
              <span>Filters</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-600">{activeFilterCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setOpenPopover((value) => (value === 'mode' ? null : 'mode'))}
              className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700"
            >
              {compareIcon(draft.view, false, '#475569')}
              <span>Compare Mode</span>
            </button>

            <button
              type="button"
              disabled={!canApply}
              onClick={applyCompare}
              className={cn('inline-flex h-12 items-center gap-3 rounded-[18px] px-6 text-sm font-extrabold text-white shadow-sm transition', !canApply ? 'cursor-not-allowed opacity-50' : '')}
              style={{ background: '#1d4ed8' }}
            >
              {compareIcon('compare', true, '#ffffff')}
              <span>Apply Compare</span>
            </button>
          </div>

          {renderSelectionLine()}
        </div>

        {renderFilterPopover()}
        {renderModePopover()}
      </div>

      {!applied ? <EmptyStateCard onBuild={() => openBuilder(1)} /> : null}

      {!applied && canApply ? (
        <div className="rounded-[24px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
          Selections are ready. Use Apply Compare to render the chart card.
        </div>
      ) : null}

      {applied ? renderChartCard(chartRef, false) : null}

      {isFullscreen && applied ? (
        <div className="fixed inset-0 z-[270] bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="flex h-full flex-col rounded-[36px] border border-white/30 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-900">Compare · Fullscreen</div>
                <div className="text-xs text-slate-500">The close button is kept separate from view controls for all charts.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="grid h-11 w-11 place-items-center rounded-xl text-white"
                style={{ background: uiAccent }}
              >
                {compareIcon('close', true, '#ffffff')}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">{renderChartCard(fullscreenRef, true)}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
