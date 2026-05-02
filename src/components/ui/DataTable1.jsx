import { cx, hexToRgba } from "../../utils/helpers";

export default function DataTable({ columns, rows, maxHeight = 520, onRowClick, footerRight, accent = "#1d4ed8" }) {
  const headerBg = hexToRgba(accent, 0.08);
  const stripBg = hexToRgba(accent, 0.045);

  return (
    <div className="overflow-auto rounded-2xl border border-zinc-200" style={{ maxHeight }}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0" style={{ background: headerBg }}>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="border-b border-zinc-200 px-3 py-2 text-center text-xs text-zinc-800"
                style={{ fontWeight: 800 }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
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
