import { useState, useMemo } from "react";
import { cx } from "../../utils/helpers";

export default function MultiSelectChips({
  label,
  options,
  values,
  onChange,
  placeholder = "Search…",
  max,
  disabled,
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [options, q]);

  const canAdd = (v) => !values.includes(v) && (!max || values.length < max);
  const maxSelectable = max ? Math.min(max, options.length) : options.length;

  return (
    <div className={cx("flex flex-col gap-1", disabled ? "opacity-60" : "") }>
      {label ? (
        <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>{label}</span>
      ) : null}

      <div className="rounded-2xl p-2 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {!disabled ? (
              <>
                <button
                  type="button"
                  onClick={() => onChange(options.slice(0, maxSelectable).map((o) => o.value))}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(25,117,190,0.08)", color: "#1252a0" }}
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(15,23,42,0.05)", color: "#475569" }}
                >
                  Clear all
                </button>
              </>
            ) : null}
          </div>
          {max ? (
            <div className="text-[11px]" style={{ color: "#64748b" }}>
              {values.length}/{max} selected
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1">
          {values.length ? (
            values.map((v) => {
              const lab = options.find((o) => o.value === v)?.label ?? v;
              return (
                <button
                  key={v}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(values.filter((x) => x !== v))}
                  className="rounded-full px-2 py-1 text-xs font-bold hover:opacity-80" style={{ background: "rgba(25,117,190,0.1)", color: "#1252a0" }}
                  title="Remove"
                >
                  {lab} ×
                </button>
              );
            })
          ) : (
            <span className="text-xs" style={{ color: "#64748b" }}>No selection</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            disabled={disabled}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-xl px-3 text-sm outline-none" style={{ border: "1px solid rgba(59,130,246,0.2)", color: "#334155" }}
          />
        </div>

        <div className="mt-2 max-h-44 overflow-auto rounded-xl" style={{ border: "1px solid rgba(59,130,246,0.15)" }}>
          {filtered.slice(0, 250).map((o) => {
            const active = values.includes(o.value);
            const disabledRow = disabled || (!active && !canAdd(o.value));
            return (
              <button
                key={o.value}
                type="button"
                disabled={disabledRow}
                onClick={() => {
                  if (active) onChange(values.filter((x) => x !== o.value));
                  else if (canAdd(o.value)) onChange([...values, o.value]);
                }}
                className={cx(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                  disabledRow ? "opacity-50" : ""
                )}
                style={active ? { background: "linear-gradient(90deg,#1975be,#3b9de0)", color: "#fff" } : { background: "transparent", color: "#334155" }}
              >
                <span className="truncate">{o.label}</span>
                <span className={cx("text-xs font-extrabold", active ? "text-white" : "")}>{active ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
