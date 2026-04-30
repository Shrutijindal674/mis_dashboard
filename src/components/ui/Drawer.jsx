import { cx } from "../../utils/helpers";

export default function Drawer({ open, title, children, onClose }) {
  return (
    <div className={cx("fixed inset-0 z-[500]", open ? "" : "pointer-events-none")}>
      <div
        className={cx(
          "absolute inset-0 bg-black/40 transition",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cx(
          "absolute right-0 top-0 flex h-full w-[min(640px,94vw)] flex-col shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ background: "rgba(255,255,255,0.97)" }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
          <div className="text-sm font-extrabold" style={{ color: "#0f2a5e" }}>{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.85)", color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)" }}
            type="button"
          >
            Back
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
