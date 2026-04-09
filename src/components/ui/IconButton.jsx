export default function IconButton({ title, children, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="grid h-9 w-9 place-items-center rounded-2xl shadow-sm hover:opacity-80 transition-colors" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(59,130,246,0.18)", color: "#1252a0" }}
      type="button"
    >
      {children}
    </button>
  );
}
