export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative flex max-h-[92vh] w-[min(1180px,96vw)] flex-col overflow-hidden rounded-[28px] p-6 shadow-2xl"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(59,130,246,0.15)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-extrabold" style={{ color: "#0f2a5e" }}>{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.85)", color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)" }}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="mt-4 flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
