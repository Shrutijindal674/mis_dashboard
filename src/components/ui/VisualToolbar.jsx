import { cx } from "../../utils/helpers";

export default function VisualToolbar({ items, value, onChange, orientation = "vertical", className = "", exportHidden = false, style = {} }) {
  const horizontal = orientation === "horizontal";
  return (
    <div
      data-export-hide={exportHidden ? "true" : undefined}
      className={cx(
        "visual-toolbar overflow-hidden shadow-lg",
        horizontal
          ? "flex items-center rounded-xl"
          : "absolute right-0 top-1/2 z-20 flex -translate-y-1/2 translate-x-1/2 flex-col rounded-2xl",
        className,
      )}
      style={{
        background: "rgba(255,255,255,0.98)",
        border: "1px solid rgba(59,130,246,0.16)",
        ...style,
      }}
    >
      {items.map((it, idx) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={cx(horizontal ? "grid h-10 w-10 place-items-center text-base transition" : "grid h-11 w-11 place-items-center text-lg transition")}
            style={{
              [horizontal ? "borderLeft" : "borderTop"]:
                idx !== 0 ? "1px solid rgba(59,130,246,0.1)" : undefined,
              background: active ? "#1975be" : "transparent",
              color: active ? "#fff" : "#1252a0",
            }}
            type="button"
            title={it.label}
            aria-label={it.label}
          >
            {it.icon}
          </button>
        );
      })}
    </div>
  );
}
