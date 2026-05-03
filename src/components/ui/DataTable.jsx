import { useMemo, useState } from "react";
import { cx, hexToRgba } from "../../utils/helpers";

function normalizeSortableValue(value) {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  const text = String(value).trim();
  const numeric = Number(text.replace(/[%,$₹,]/g, ""));
  if (text !== "" && Number.isFinite(numeric)) return numeric;
  return text.toLowerCase();
}

function compareValues(left, right) {
  const a = normalizeSortableValue(left);
  const b = normalizeSortableValue(right);

  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function DataTable({ columns, rows, maxHeight = 520, onRowClick, footerRight, accent = "#1d4ed8" }) {
  const [sortState, setSortState] = useState({ key: null, direction: null });

  const sortedRows = useMemo(() => {
    if (!sortState.key || !sortState.direction) return rows;
    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;
    return [...rows].sort((left, right) => {
      const result = compareValues(left?.[sortState.key], right?.[sortState.key]);
      return result * directionMultiplier;
    });
  }, [rows, sortState]);

  function toggleSort(key) {
    setSortState((current) => {
      if (current.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      if (current.direction === "desc") return { key: null, direction: null };
      return { key, direction: "asc" };
    });
  }

  const headerBg = hexToRgba(accent, 0.96);
  const stripBg = hexToRgba(accent, 0.045);
  const activeArrowColor = accent;

  return (
    <div className="overflow-auto rounded-2xl border border-zinc-200" style={{ maxHeight }}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-20" style={{ background: headerBg }}>
          <tr>
            {columns.map((c) => {
              const active = sortState.key === c.key;
              return (
                <th
                  key={c.key}
                  className="border-b border-zinc-200 px-3 py-2 text-center text-xs text-white"
                  style={{ fontWeight: 800, background: headerBg, position: "sticky", top: 0, zIndex: 20 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg px-1 py-0.5 transition hover:bg-white/70"
                    title={`Sort by ${c.label}`}
                    aria-label={`Sort by ${c.label}`}
                  >
                    <span>{c.label}</span>
                    <span className="inline-flex flex-col text-[8px] leading-[7px]" aria-hidden="true">
                      <span style={{ color: active && sortState.direction === "asc" ? activeArrowColor : "#94a3b8" }}>▲</span>
                      <span style={{ color: active && sortState.direction === "desc" ? activeArrowColor : "#94a3b8" }}>▼</span>
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {sortedRows.map((r, idx) => (
            <tr
              key={idx}
              className={cx(onRowClick ? "cursor-pointer" : "")}
              style={{ background: idx % 2 === 0 ? "#ffffff" : stripBg }}
              onClick={() => onRowClick?.(r)}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="border-b border-zinc-100 px-3 py-2 text-center text-zinc-700"
                  style={{ fontWeight: 500 }}
                >
                  {c.format ? c.format(r[c.key]) : String(r[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {footerRight ? (
          <tfoot>
            <tr>
              <td colSpan={columns.length} className="bg-white px-3 py-2">
                <div className="flex items-center justify-end gap-2 text-xs text-zinc-500">
                  {footerRight}
                </div>
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
