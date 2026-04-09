import { cx } from "../../utils/helpers";

export default function PillButton({ active, onClick, children, accent }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-2xl border px-3 py-1.5 text-xs font-extrabold transition",
        active
          ? "text-white"
          : ""
      )}
      style={active ? { background: accent, borderColor: accent } : { background: "rgba(255,255,255,0.85)", color: "#1252a0", borderColor: "rgba(25,117,190,0.18)" }}
      type="button"
    >
      {children}
    </button>
  );
}
