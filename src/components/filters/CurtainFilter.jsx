import { useState, useEffect, useMemo } from "react";
import { cx } from "../../utils/helpers";
import {
  IITs,
  MODULES,
  YEARS,
  NORMALIZATION_MODES,
  SORT_MODES,
} from "../../constants";
import { KPI_DEFS } from "../../data/kpiDefs";
import Select from "../ui/Select";
import MultiSelectChips from "../ui/MultiSelectChips";

// ----------------------------- Compare helpers -----------------------------
export function heatColor(v, vmin, vmax) {
  if (v == null || Number.isNaN(v)) return "#f4f4f5";
  const t  = vmax === vmin ? 0.5 : (v - vmin) / (vmax - vmin);
  const cl = Math.max(0, Math.min(1, t));
  const r  = Math.round(240 - 120 * cl);
  const g  = Math.round(248 - 180 * cl);
  const b  = Math.round(255 - 190 * cl);
  return `rgb(${r},${g},${b})`;
}

export function computeDenomStudents(enrollmentRows, instituteId, year) {
  return enrollmentRows
    .filter((r) => r.InstituteId === instituteId && r.Year === year)
    .reduce((s, r) => s + Number(r.Students ?? 0), 0);
}

function dedupeCompareKpis(kpis) {
  const map = new Map();
  kpis.forEach((kpi) => {
    if (!kpi?.fact || /register/i.test(kpi.label ?? "")) return;
    const key = `${kpi.module}::${kpi.label}`;
    if (!map.has(key)) map.set(key, kpi);
  });
  return Array.from(map.values());
}

const COMPARE_VIEW_OPTIONS = [
  { value: "grouped", label: "Grouped compare", help: "Best for one-year grouped comparison across selected IITs and measures." },
  { value: "trend", label: "Trend", help: "Tracks the selected measures across the chosen years." },
  { value: "smallMultiples", label: "Small multiples", help: "Keeps mixed units readable with one panel per measure." },
  { value: "table", label: "Table", help: "Shows the exact values for wider selections." },
];

const COMPARE_SCALE_OPTIONS = [
  { value: "raw", label: "Raw" },
  { value: "indexed", label: "Indexed 100" },
];

// ----------------------------- CurtainFilter component -----------------------------
export default function CurtainFilter({
  open,
  title,
  accent,
  schema,
  draft,
  setDraft,
  onApply,
  onClose,
  onDone,
  onReset,
  role,
  lockedInstituteId,
}) {
  const handleApply = onApply ?? onDone;
  const handleClose = onClose ?? onDone;
  const [tab, setTab] = useState("Basic");

  useEffect(() => {
    if (open) setTab("Basic");
  }, [open]);

  const instituteOptions = useMemo(
    () => IITs.map((i) => ({ value: i.id, label: `${i.name} • ${i.state}` })),
    []
  );

  const yearOpts = useMemo(
    () => YEARS.map((y) => ({ value: String(y), label: String(y) })),
    []
  );

  // Reports-only: catalog ~950 KPI IDs
  const reportKpiOptions = useMemo(() => {
    const base  = KPI_DEFS.map((k) => ({ value: k.id, label: `${k.label} • ${k.module} • ${k.id}` }));
    const extra = [];
    for (let i = 1; i <= 950; i++) {
      const id = `var_${String(i).padStart(4, "0")}`;
      extra.push({ value: id, label: `Variable ${i} • Demo • ${id}` });
    }
    return [...base, ...extra];
  }, []);

  const compareMetricDefs = useMemo(() => dedupeCompareKpis(KPI_DEFS), []);
  const compareModule = draft?.CompareModule ?? draft?.Module ?? MODULES[0];
  const compareMetricOptions = useMemo(
    () => compareMetricDefs
      .filter((metric) => metric.module === compareModule)
      .map((metric) => ({ value: metric.id, label: metric.label, help: metric.module })),
    [compareMetricDefs, compareModule]
  );

  function setKey(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const panel = useMemo(() => schema.filter((s) => s.panel === tab), [schema, tab]);

  return (
    <div
      className={cx("fixed inset-0 z-50", open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cx(
          "absolute inset-0 bg-black/30 transition",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Curtain panel */}
      <div
        className={cx(
          "absolute left-0 right-0 top-0 mx-auto max-w-7xl transition-transform",
          open ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="rounded-b-3xl shadow-2xl" style={{ background: "rgba(255,255,255,0.97)", borderLeft: "1px solid rgba(59,130,246,0.15)", borderRight: "1px solid rgba(59,130,246,0.15)", borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4" style={{ borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
            <div>
              <div className="text-sm font-extrabold" style={{ color: "#0f2a5e" }}>{title}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{tab} filter</div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab switcher */}
              <div className="hidden items-center gap-1 rounded-2xl p-1 sm:flex" style={{ background: "rgba(25,117,190,0.08)" }}>
                <button
                  className={cx(
                    "rounded-xl px-3 py-1 text-xs font-extrabold",
                    tab === "Basic" ? "bg-white shadow" : ""
                  )}
                  style={tab === "Basic" ? { color: "#0f2a5e" } : { color: "#334155" }}
                  onClick={() => setTab("Basic")}
                  type="button"
                >
                  Basic filter
                </button>
                <button
                  className={cx(
                    "rounded-xl px-3 py-1 text-xs font-extrabold",
                    tab === "Advanced" ? "bg-white shadow" : ""
                  )}
                  style={tab === "Advanced" ? { color: "#0f2a5e" } : { color: "#334155" }}
                  onClick={() => setTab("Advanced")}
                  type="button"
                >
                  Advanced filter
                </button>
              </div>

              <button
                onClick={onReset}
                className="rounded-2xl px-4 py-2 text-sm font-extrabold hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.85)", color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)" }}
                type="button"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="rounded-2xl px-4 py-2 text-sm font-extrabold text-white hover:opacity-95"
                style={{ background: accent }}
                type="button"
              >
                Done
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-auto px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              {panel.map((f) => {
                // Year range
                if (f.control === "year_range") {
                  const from = draft?.YearRange?.from ?? YEARS[0];
                  const to   = draft?.YearRange?.to   ?? YEARS[YEARS.length - 1];
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Select
                          label="from"
                          value={String(from)}
                          onChange={(v) => setKey("YearRange", { from: Number(v), to: Number(to) })}
                          options={yearOpts}
                        />
                        <Select
                          label="to"
                          value={String(to)}
                          onChange={(v) => setKey("YearRange", { from: Number(from), to: Number(v) })}
                          options={yearOpts}
                        />
                      </div>
                    </div>
                  );
                }

                // IIT multi-select
                if (f.control === "iit_multi") {
                  const locked = role === "iit";
                  const values = locked ? [lockedInstituteId] : draft?.InstituteId ?? [];
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                        {locked ? (
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-extrabold text-zinc-600">
                            locked
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <MultiSelectChips
                          label={locked ? "Your IIT" : "Select IITs"}
                          options={instituteOptions}
                          values={values}
                          onChange={(vals) => setKey("InstituteId", vals.slice(0, 28))}
                          max={28}
                          disabled={locked}
                          placeholder="Type an IIT name"
                        />
                        <div className="mt-2 text-[11px] text-zinc-500">
                          Compare requires at least 2 IITs. Recommended chart cap: up to 4 IITs for bar and up to 5 for donut. Wider selections are still available in table view.
                        </div>
                      </div>
                    </div>
                  );
                }

                // KPI multi-select (Reports)
                if (f.control === "kpi_multi") {
                  const values = draft?.KpiIds ?? [];
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3">
                        <MultiSelectChips
                          label="Select KPIs"
                          options={reportKpiOptions}
                          values={values}
                          onChange={(vals) => setKey("KpiIds", vals)}
                          max={950}
                          placeholder="Search KPI / Variable ID"
                        />
                        <div className="mt-2 text-[11px] text-zinc-500">
                          Select one or more KPIs to preview/export. (Demo shows a catalog of ~950 IDs.)
                        </div>
                      </div>
                    </div>
                  );
                }

                // KPI single-select (Compare)
                if (f.control === "kpi_single") {
                  const opts = KPI_DEFS.map((k) => ({
                    value: k.id,
                    label: `${k.label} • ${k.module}`,
                  }));
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3">
                        <Select
                          label=""
                          value={draft?.MetricId ?? opts[0].value}
                          onChange={(v) => setKey("MetricId", v)}
                          options={opts}
                        />
                      </div>
                    </div>
                  );
                }

                // Normalization single
                if (f.control === "norm_single") {
                  const opts = NORMALIZATION_MODES.map((m) => ({ value: m.id, label: m.label }));
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3">
                        <Select
                          label=""
                          value={draft?.Normalization ?? "absolute"}
                          onChange={(v) => setKey("Normalization", v)}
                          options={opts}
                        />
                        <div className="mt-2 text-[11px] text-zinc-500">
                          Use absolute values for comparison in this build.
                        </div>
                      </div>
                    </div>
                  );
                }


                // Compare module
                if (f.control === "compare_module") {
                  const modules = MODULES.map((module) => ({
                    module,
                    count: compareMetricDefs.filter((metric) => metric.module === module).length,
                  }));
                  return (
                    <div key={f.key} className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {modules.map((item) => {
                          const active = item.module === compareModule;
                          return (
                            <button
                              key={item.module}
                              type="button"
                              onClick={() => {
                                setKey("CompareModule", item.module);
                                const first = compareMetricDefs.find((metric) => metric.module === item.module);
                                setKey("CompareMetricIds", first ? [first.id] : []);
                              }}
                              className="rounded-full px-3 py-2 text-xs font-semibold transition"
                              style={{
                                background: active ? `${accent}12` : "#f8fafc",
                                border: `1px solid ${active ? accent : "rgba(148,163,184,0.22)"}`,
                                color: active ? accent : "#334155",
                              }}
                            >
                              {item.module} · {item.count}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Compare metric multi-select
                if (f.control === "compare_metric_multi") {
                  const values = draft?.CompareMetricIds ?? (draft?.MetricId ? [draft.MetricId] : []);
                  return (
                    <div key={f.key} className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-500">
                          {compareMetricOptions.length} available
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {compareMetricOptions.map((metric, index) => {
                          const active = values.includes(metric.value);
                          return (
                            <button
                              key={metric.value}
                              type="button"
                              onClick={() => {
                                const next = active
                                  ? values.filter((value) => value !== metric.value)
                                  : [...values, metric.value].slice(0, 8);
                                setKey("CompareMetricIds", next);
                                if (!active) setKey("MetricId", metric.value);
                              }}
                              className="rounded-full px-3 py-2 text-xs font-semibold transition"
                              style={{
                                background: active ? `${accent}12` : "#ffffff",
                                border: `1px solid ${active ? accent : "rgba(148,163,184,0.22)"}`,
                                color: active ? accent : "#475569",
                              }}
                              title={metric.label}
                            >
                              {active ? "✓ " : ""}{metric.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500">
                        Pick the compare-ready measures you want to show together. Leaving them all unchecked restores the full set in the compare view.
                      </div>
                    </div>
                  );
                }

                if (f.control === "compare_view") {
                  const value = draft?.CompareView ?? "grouped";
                  return (
                    <div key={f.key} className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {COMPARE_VIEW_OPTIONS.map((item) => {
                          const active = value === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setKey("CompareView", item.value)}
                              className="rounded-2xl px-3 py-3 text-left transition"
                              style={{
                                background: active ? `${accent}12` : "#f8fafc",
                                border: `1px solid ${active ? accent : "rgba(148,163,184,0.22)"}`,
                              }}
                            >
                              <div className="text-xs font-bold" style={{ color: active ? accent : "#0f172a" }}>{item.label}</div>
                              <div className="mt-1 text-[11px] text-zinc-500">{item.help}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (f.control === "compare_scale") {
                  const value = draft?.CompareScale ?? "raw";
                  return (
                    <div key={f.key} className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {COMPARE_SCALE_OPTIONS.map((item) => {
                          const active = value === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setKey("CompareScale", item.value)}
                              className="rounded-full px-3 py-2 text-xs font-semibold transition"
                              style={{
                                background: active ? `${accent}12` : "#ffffff",
                                border: `1px solid ${active ? accent : "rgba(148,163,184,0.22)"}`,
                                color: active ? accent : "#475569",
                              }}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500">
                        Indexed 100 is safer when the selected measures mix counts, rates, or currency values.
                      </div>
                    </div>
                  );
                }

                // Sort
                if (f.control === "sort_single") {
                  const opts = SORT_MODES.map((s) => ({ value: s.id, label: s.label }));
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3">
                        <Select
                          label=""
                          value={draft?.Sort ?? "latest"}
                          onChange={(v) => setKey("Sort", v)}
                          options={opts}
                        />
                      </div>
                    </div>
                  );
                }

                // Chart cap
                if (f.control === "chart_cap") {
                  const opts = [2, 4, 6, 8, 10, 14, 20, 28].map((n) => ({
                    value: String(n),
                    label: String(n),
                  }));
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3">
                        <Select
                          label=""
                          value={String(draft?.ChartCap ?? 8)}
                          onChange={(v) => setKey("ChartCap", Number(v))}
                          options={opts}
                        />
                      </div>
                    </div>
                  );
                }

                // Max rows
                if (f.control === "max_rows") {
                  const opts = [200, 500, 1000, 2000, 5000].map((n) => ({
                    value: String(n),
                    label: String(n),
                  }));
                  return (
                    <div key={f.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-extrabold text-zinc-900">{f.label}</div>
                      <div className="mt-3">
                        <Select
                          label=""
                          value={String(draft?.MaxRows ?? 1000)}
                          onChange={(v) => setKey("MaxRows", Number(v))}
                          options={opts}
                        />
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
              <div className="font-extrabold">Behaviour</div>
              <div className="mt-1 text-sm text-zinc-600">
                Press Done to apply the filter set. For comparison charts, keep focused selections for the visuals and use the table for wider selections.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
