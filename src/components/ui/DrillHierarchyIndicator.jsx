import { formatCompact, formatPct } from "../../utils/helpers";
import { FACULTY_STAFF_FIELD_LABELS } from "../../data/facultyStaffSheetData";
import { getFacultyStaffPathwayShortLabel } from "../../data/hierarchyMap";

function Thumbnail({ type = "dots", active = false }) {
  const iconScale = active ? "scale(1.02)" : "scale(1)";

  if (type === "grid") {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true" style={{ transform: iconScale }}>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 22.8h19" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M9.1 26.5 6.5 22.8l-2.9.5" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="m12.2 27.8 3.1-1.9 2.6 2.1 3-2.3 3 1.8 2.3-1.8" stroke="#f59e0b" strokeWidth="2.1" />
          <circle cx="16" cy="9.2" r="3.8" stroke="#f97316" strokeWidth="2.4" />
          <circle cx="8.8" cy="11.1" r="2.9" stroke="#f59e0b" strokeWidth="2.2" />
          <circle cx="23.2" cy="11.1" r="2.9" stroke="#ef4444" strokeWidth="2.2" />
          <path d="M10.6 22c0-3.8 2.5-6.6 5.4-6.6s5.4 2.8 5.4 6.6" stroke="#f59e0b" strokeWidth="2.4" />
          <path d="M4.8 20.7c0-2.7 1.8-4.8 4-4.8 1 0 1.9.3 2.6 1" stroke="#f97316" strokeWidth="2.1" />
          <path d="M27.2 20.7c0-2.7-1.8-4.8-4-4.8-1 0-1.9.3-2.6 1" stroke="#ef4444" strokeWidth="2.1" />
        </g>
      </svg>
    );
  }

  if (type === "dots") {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true" style={{ transform: iconScale }}>
        <g stroke="none">
          <rect x="2.5" y="4" width="4.2" height="2.3" rx="1.1" fill="#fcd34d" />
          <rect x="7.4" y="2.2" width="4.2" height="2.3" rx="1.1" transform="rotate(-18 9.5 3.35)" fill="#fbbf24" />
          <rect x="13.9" y="1.2" width="4.2" height="2.3" rx="1.1" fill="#fb923c" />
          <rect x="20.3" y="2.3" width="4.2" height="2.3" rx="1.1" transform="rotate(18 22.4 3.45)" fill="#fdba74" />
          <rect x="25.1" y="4.1" width="4.2" height="2.3" rx="1.1" fill="#f59e0b" />

          <circle cx="10.2" cy="12.1" r="3.4" fill="#d6b06c" />
          <circle cx="21.8" cy="12.1" r="3.4" fill="#a37067" />
          <circle cx="5.6" cy="20.2" r="3.1" fill="#9d6a62" opacity="0.96" />
          <circle cx="16" cy="20.3" r="3.1" fill="#ffd6c9" />
          <circle cx="26.4" cy="20.2" r="3.1" fill="#e6c275" />

          <path d="M5.3 30v-6.2c0-3.2 2.1-5.6 4.9-5.6 2.8 0 4.9 2.4 4.9 5.6V30z" fill="#f7c948" />
          <path d="M10.2 30V17.5c0-3.8 2.5-6.4 5.8-6.4s5.8 2.6 5.8 6.4V30z" fill="#28c1c6" opacity="0.96" />
          <path d="M16.1 30V17.5c0-3.8 2.5-6.4 5.8-6.4 3.3 0 5.8 2.6 5.8 6.4V30z" fill="#ff507d" opacity="0.9" />
          <path d="M11 30V19.4c0-3.1 2-5.2 5-5.2s5 2.1 5 5.2V30z" fill="#1aa8a3" opacity="0.82" />
          <path d="M14.2 30v-7.5c0-3.2 2-5.6 4.9-5.6s4.9 2.4 4.9 5.6V30z" fill="#203d8f" opacity="0.6" />
          <path d="M23.1 30v-6.1c0-3.3 2.1-5.7 5-5.7s5 2.4 5 5.7V30z" fill="#5b46e7" opacity="0.92" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true" style={{ transform: iconScale }}>
      <g fill="none" stroke="#1f2937" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="8.8" r="2.4" strokeWidth="1.9" />
        <circle cx="22" cy="8.8" r="2.4" strokeWidth="1.9" />
        <path d="M6.8 15.3v-1.1c0-1.9 1.4-3.4 3.2-3.4s3.2 1.5 3.2 3.4v1.1" strokeWidth="1.9" />
        <path d="M18.8 15.3v-1.1c0-1.9 1.4-3.4 3.2-3.4s3.2 1.5 3.2 3.4v1.1" strokeWidth="1.9" />
        <circle cx="16" cy="17" r="5.5" strokeWidth="2.1" />
        <circle cx="16" cy="16.2" r="2.5" strokeWidth="1.9" />
        <path d="M12.5 22.1c.6-1.8 1.9-2.8 3.5-2.8s2.9 1 3.5 2.8" strokeWidth="1.9" />
        <path d="m20.5 21.4 5.2 5.2" strokeWidth="2.1" />
        <path d="M4.6 22.6v-1c0-1.6 1.2-2.9 2.6-2.9" strokeWidth="1.9" />
        <path d="M27.4 22.6v-1c0-1.6-1.2-2.9-2.6-2.9" strokeWidth="1.9" />
      </g>
    </svg>
  );
}

function fieldLabel(fieldKey) {
  return FACULTY_STAFF_FIELD_LABELS[fieldKey] ?? String(fieldKey ?? "").replaceAll("_", " ");
}

function formatValue(value, isPercent = false) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Not available";
  return isPercent ? formatPct(Number(value) > 1 ? Number(value) / 100 : Number(value)) : formatCompact(Number(value));
}

function groupBreadcrumb(group) {
  return `Faculty & Staff › Faculty and Staff › ${group.label}`;
}

function pathwayBreadcrumb(pathway) {
  const root = fieldLabel(pathway.rootField);
  const children = (pathway.children ?? []).map(fieldLabel).join(" › ");
  return `Faculty & Staff › Faculty and Staff › ${pathway.hierarchyLabel ?? ""} › ${pathway.pathwaySpecificHierarchyLabel} › ${root}${children ? ` › ${children}` : ""}`;
}

function pathwayCardLabel(pathway) {
  return getFacultyStaffPathwayShortLabel(pathway);
}

function pathwayHoverTitle(pathway) {
  const root = fieldLabel(pathway.rootField);
  const children = (pathway.children ?? []).map(fieldLabel).join(" > ");
  const pathwayLabel = pathwayCardLabel(pathway);
  return `Faculty & Staff > Faculty and Staff > ${pathway.hierarchyLabel ?? ""} > ${pathwayLabel} > ${root}${children ? ` > ${children}` : ""}`;
}

export default function DrillHierarchyIndicator({
  groups = [],
  selectedHierarchyKey,
  onSelectHierarchy,
  className = "",
}) {
  if (!groups.length) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} data-export-hide="true">
      {groups.map((group) => {
        const active = group.key === selectedHierarchyKey;
        const tooltip = groupBreadcrumb(group);
        return (
          <div key={group.key} className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onSelectHierarchy?.(group.key)}
              aria-label={group.label}
              aria-pressed={active}
              className="grid h-11 w-11 place-items-center rounded-[18px] transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: active
                  ? `linear-gradient(145deg, rgba(255,255,255,0.98), ${group.bg})`
                  : "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
                border: `1px solid ${active ? `${group.color}80` : "rgba(148,163,184,0.18)"}`,
                boxShadow: active
                  ? `0 14px 30px ${group.color}22, inset 0 1px 0 rgba(255,255,255,0.92)`
                  : "0 8px 20px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
              title={tooltip}
            >
              <Thumbnail type={group.thumbnail} active={active} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function DrillPathwayLegend({
  pathways = [],
  activePathwayNo,
  onSelectPathway,
  onSelectBreakdown,
  valueSummaries = {},
  rootValues = {},
  displayMode = "value",
  accent = "#2563eb",
  isFullscreen = false,
}) {
  if (!pathways.length) return null;

  return (
    <aside
      className={`shrink-0 rounded-2xl bg-white/90 p-3 text-left shadow-sm ring-1 ring-blue-100 ${isFullscreen ? "w-[310px]" : "w-[290px]"}`}
      data-export-hide="true"
    >
      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Mapped drill paths</div>
      <div className="mt-2 max-h-[400px] space-y-3 overflow-y-auto pr-1">
        {pathways.map((pathway) => {
          const active = Number(pathway.pathwayNo) === Number(activePathwayNo);
          const breadcrumb = pathwayHoverTitle(pathway);
          return (
            <div key={pathway.pathwayNo}>
              <button
                type="button"
                onClick={() => onSelectPathway?.(pathway.pathwayNo)}
                aria-pressed={active}
                className="w-full rounded-2xl border px-3 py-3 text-left transition-colors duration-150"
                style={{
                  background: active ? `${accent}0F` : "#ffffff",
                  borderColor: active ? `${accent}66` : "rgba(226,232,240,0.95)",
                }}
                title={breadcrumb}
              >
                <span
                  className="block text-[11px] font-extrabold leading-snug"
                  style={{ color: active ? accent : "#0f172a" }}
                >
                  {pathwayCardLabel(pathway)}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function buildPathwayValueSummaries(pathways, rawRowsByPathway, displayRowsByPathway) {
  return Object.fromEntries(
    pathways.map((pathway) => {
      const rawRows = rawRowsByPathway?.[pathway.pathwayNo] ?? [];
      const displayRows = displayRowsByPathway?.[pathway.pathwayNo] ?? [];
      const children = Object.fromEntries(
        rawRows.map((rawRow) => {
          const displayRow = displayRows.find((item) => item.fieldKey === rawRow.fieldKey || item.name === rawRow.name);
          return [
            rawRow.fieldKey,
            {
              rawValue: Number(rawRow.rawValue ?? rawRow.value ?? 0),
              rawText: formatValue(rawRow.rawValue ?? rawRow.value, rawRow.isPercentField),
              percentValue: Number(displayRow?.value ?? 0),
              percentText: formatPct(Number(displayRow?.value ?? 0)),
            },
          ];
        }),
      );
      return [pathway.pathwayNo, { children }];
    }),
  );
}
