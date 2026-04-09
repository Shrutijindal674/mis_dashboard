import { useMemo, useState } from "react";
import { IITs } from "../constants";

function resolveAccess(email, selectedInstituteId) {
  const value = String(email || "").trim().toLowerCase();
  const ministryHints = ["ministry", "gov", "admin@example.com", "administrator"];
  const isMinistry = ministryHints.some((hint) => value.includes(hint));
  if (isMinistry) return { role: "ministry", instituteId: IITs[0].id };

  const sorted = [...IITs].sort((a, b) => b.id.length - a.id.length);
  const match = sorted.find((item) => value.includes(item.id.toLowerCase()) || value.includes(item.name.toLowerCase().replace(/[^a-z]/g, "")));
  return { role: "iit", instituteId: match?.id || selectedInstituteId || IITs[0].id };
}

export default function Landing({ onLogin, defaultInstituteId }) {
  const [selectedInstituteId, setSelectedInstituteId] = useState(defaultInstituteId ?? IITs[0].id);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const accessPreview = useMemo(() => resolveAccess(email, selectedInstituteId), [email, selectedInstituteId]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f6f8fb 0%,#eef3f9 100%)" }}>
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="flex min-h-[560px] items-center justify-center rounded-[36px] bg-white p-8 shadow-sm" style={{ border: "1px solid rgba(15,42,94,0.08)" }}>
          <div className="flex w-full flex-col items-center justify-center text-center">
            <img src="/mis-landing-logo.png" alt="IIT MIS Management" className="h-64 w-64 object-contain md:h-[26rem] md:w-[26rem]" />
            <div className="mt-8 flex items-center justify-center gap-3 text-sm" style={{ color: "#334155" }}>
              <img src="/cdis-logo.png" alt="CDIS" className="h-8 w-8 object-contain" />
              <span>Developed by CDIS, IIT Kanpur</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-sm" style={{ border: "1px solid rgba(15,42,94,0.1)" }}>
            <div className="text-2xl" style={{ color: "#0f172a", fontWeight: 600 }}>Login</div>
            <div className="mt-1 text-sm" style={{ color: "#64748b" }}>IIT MIS management</div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <div className="mb-2 text-sm" style={{ color: "#334155", fontWeight: 600 }}>Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your official email"
                  className="h-12 w-full rounded-2xl px-4 outline-none"
                  style={{ border: "1px solid rgba(148,163,184,0.28)", background: "#fbfdff", color: "#0f172a" }}
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm" style={{ color: "#334155", fontWeight: 600 }}>Password</div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-2xl px-4 pr-16 outline-none"
                    style={{ border: "1px solid rgba(148,163,184,0.28)", background: "#fbfdff", color: "#0f172a" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs"
                    style={{ color: "#1252a0", background: "rgba(37,99,235,0.08)" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>


              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2" style={{ color: "#475569" }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" className="hover:underline" style={{ color: "#1252a0", fontWeight: 600 }}>
                  Forgot password?
                </button>
              </div>

              <button
                onClick={() => onLogin(accessPreview.role, accessPreview.instituteId, { email, password, remember })}
                className="h-12 w-full rounded-2xl text-white transition hover:opacity-95"
                style={{ background: "linear-gradient(90deg,#1975be,#2f89d9)", fontWeight: 600, boxShadow: "0 10px 30px rgba(25,117,190,0.22)" }}
                type="button"
              >
                Login
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
