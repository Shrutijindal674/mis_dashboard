import { cx } from "../../utils/helpers";

export default function Select({ label, value, onChange, options, className, disabled }) {
  return (
    <label className={cx("flex flex-col gap-1", className)}>
      {label ? (
        <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "#64748b" }}>{label}</span>
      ) : null}
      <select
        className={cx(
          "h-10 rounded-xl px-3 text-sm shadow-sm outline-none",
          disabled ? "opacity-60" : ""
        )}
        style={{ border: "1px solid rgba(59,130,246,0.18)", background: "rgba(255,255,255,0.94)", color: "#334155" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
