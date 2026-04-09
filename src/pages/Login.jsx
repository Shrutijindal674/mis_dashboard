export default function Login({ onLogin, onBack }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f0f6ff 0%,#e8f0fb 50%,#f5f8ff 100%)" }}>
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-4">
          <button
            onClick={onBack}
            className="rounded-2xl px-4 py-2 text-sm font-bold shadow-sm hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.85)", color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)" }}
            type="button"
          >
            ← Back
          </button>
        </div>

        <div className="rounded-3xl p-8 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <h2 className="text-3xl font-extrabold" style={{ color: "#0f2a5e" }}>Login</h2>
          <p className="mt-2 text-sm" style={{ color: "#64748b" }}>
            Prototype login (role is configured via DEFAULT_ROLE constant).
          </p>
          <button
            onClick={onLogin}
            className="mt-8 w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#1975be,#3b9de0)" }}
            type="button"
          >
            Login →
          </button>
        </div>
      </div>
    </div>
  );
}
