import { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, GeoJSON, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { IITs } from "../constants";

// ── Local India states GeoJSON (served from /public/india_states_a.geojson) ──
const INDIA_GEO_URL = "/india_states_a.geojson";

// ── Pulse keyframe injected once ─────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("iit-pulse-style")) {
  const s = document.createElement("style");
  s.id = "iit-pulse-style";
  s.textContent = `
    @keyframes iit-pulse {
      0%   { transform:scale(1);   opacity:.7; }
      70%  { transform:scale(2.2); opacity:0;  }
      100% { transform:scale(1);   opacity:0;  }
    }
    @keyframes iit-pulse-active {
      0%   { transform:scale(1);   opacity:.9; }
      70%  { transform:scale(2.6); opacity:0;  }
      100% { transform:scale(1);   opacity:0;  }
    }
    .iit-marker-wrap { transition: transform .18s; }
    .iit-marker-wrap:hover { transform: scale(1.15); }
  `;
  document.head.appendChild(s);
}

// ── Custom DivIcon for IIT markers ───────────────────────────────────────────
function makeIITIcon(iitId, active) {
  const bg        = active ? "#f59e0b" : "#1975be";
  const ringColor = active ? "#fde68a" : "#7fc0eb";
  const glow      = active
    ? "0 0 0 3px #fde68a, 0 4px 18px rgba(245,158,11,0.55)"
    : "0 0 0 2.5px #7fc0eb, 0 4px 14px rgba(25,117,190,0.4)";
  const size   = active ? 36 : 28;
  const fsize  = active ? 9 : 7.5;
  const short  = iitId.replace(/^IIT/, "") || iitId;
  const anim   = active ? "iit-pulse-active" : "iit-pulse";

  return L.divIcon({
    className: "",
    html: `
      <div class="iit-marker-wrap" style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <span style="
          position:absolute;top:${size / 2}px;left:${size / 2}px;
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:${ringColor};
          transform:translate(-50%,-50%);
          animation:${anim} 2s ease-out infinite;
          pointer-events:none;z-index:0;
        "></span>
        <div style="
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:linear-gradient(135deg,${active ? "#fbbf24,#f59e0b" : "#3b9de0,#1975be"});
          box-shadow:${glow};
          display:flex;align-items:center;justify-content:center;
          font-size:${fsize}px;font-weight:900;color:white;
          position:relative;z-index:2;
          letter-spacing:-0.3px;
          border:${active ? "2.5px solid #fff8e1" : "2px solid white"};
        ">${short}</div>
        <div style="
          margin-top:3px;
          background:${active ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#1975be,#1975be)"};
          color:white;
          font-size:7px;font-weight:800;
          padding:2px 7px;
          border-radius:8px;
          white-space:nowrap;
          letter-spacing:0.4px;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          position:relative;z-index:2;
          ${active ? "text-shadow:0 1px 2px rgba(0,0,0,0.2);" : ""}
        ">${iitId}</div>
      </div>`,
    iconSize:    [active ? 46 : 38, 58],
    iconAnchor:  [active ? 23 : 19, 29],
    popupAnchor: [0, -38],
  });
}

// ── IIT Markers — re-renders on selectedId change ────────────────────────────
function IITMarkers({ selectedId, onSelect }) {
  const map     = useMap();
  const ref     = useRef({});

  useEffect(() => {
    Object.values(ref.current).forEach((l) => map.removeLayer(l));
    ref.current = {};

    IITs.forEach((inst) => {
      const active = inst.id === selectedId;
      const marker = L.marker([inst.lat, inst.lon], {
        icon:    makeIITIcon(inst.id, active),
        zIndexOffset: active ? 1000 : 0,
      });

      marker.bindPopup(`
        <div style="
          padding:0;min-width:230px;font-family:system-ui,sans-serif;
          border-radius:14px;overflow:hidden;
        ">
          <div style="
            background:linear-gradient(135deg,${active ? "#f59e0b,#fbbf24" : "#1975be,#1975be"});
            padding:12px 16px 10px;
          ">
            <div style="font-size:8.5px;font-weight:700;letter-spacing:1.2px;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-bottom:3px;">
              ${active ? "✓ Currently Selected" : "Indian Institute of Technology"}
            </div>
            <div style="font-size:15px;font-weight:800;color:white;line-height:1.3;">${inst.name}</div>
          </div>
          <div style="padding:12px 16px;background:white;">
            <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#374151;">
              <span style="font-size:13px;">📍</span> ${inst.state}
            </div>
            <button
              onclick="window.__iitSelect && window.__iitSelect('${inst.id}')"
              style="
                margin-top:11px;width:100%;padding:9px 0;
                background:${active ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#1975be,#1975be)"};
                color:white;border:none;border-radius:10px;font-size:12px;font-weight:700;
                cursor:pointer;letter-spacing:0.4px;
                box-shadow:${active ? "0 4px 12px rgba(245,158,11,0.4)" : "0 4px 12px rgba(25,117,190,0.4)"};
              ">
              ${active ? "✓ Selected" : "Select this IIT →"}
            </button>
          </div>
        </div>`, { closeButton: false, maxWidth: 260 });

      marker.on("click", () => { onSelect(inst.id); marker.openPopup(); });
      marker.addTo(map);
      ref.current[inst.id] = marker;
    });

    window.__iitSelect = onSelect;
    return () => {
      Object.values(ref.current).forEach((l) => map.removeLayer(l));
      delete window.__iitSelect;
    };
  }, [map, selectedId, onSelect]);

  return null;
}

// ── India states GeoJSON layer ───────────────────────────────────────────────
function IndiaStates({ onReady }) {
  const [data, setData] = useState(null);
  const map = useMap();

  useEffect(() => {
    fetch(INDIA_GEO_URL)
      .then((r) => r.json())
      .then((d) => { setData(d); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (data && onReady) onReady();
  }, [data, onReady]);

  if (!data) return null;

  return (
    <GeoJSON
      key="states"
      data={data}
      style={() => ({
        fillColor:   "#bde0f7",
        fillOpacity: 0.55,
        color:       "#3b9de0",
        weight:      1.2,
        dashArray:   "3 2",
      })}
      onEachFeature={(feat, layer) => {
        const name = feat.properties?.ST_NM || "";
        if (name) {
          layer.bindTooltip(
            `<div style="
              font-size:11.5px;font-weight:700;color:#1252a0;
              background:white;border:1px solid #bde0f7;
              border-radius:7px;padding:4px 9px;
              box-shadow:0 2px 8px rgba(25,117,190,0.18);
            ">${name}</div>`,
            { sticky: true, direction: "top", opacity: 1, className: "" }
          );
        }
        layer.on({
          mouseover: () =>
            layer.setStyle({ fillColor: "#7fc0eb", fillOpacity: 0.72, weight: 2, color: "#1975be", dashArray: "" }),
          mouseout: () =>
            layer.setStyle({ fillColor: "#bde0f7", fillOpacity: 0.55, weight: 1.2, color: "#3b9de0", dashArray: "3 2" }),
        });
      }}
    />
  );
}

// ── FitIndia: zooms map to fit India bounds on load ──────────────────────────
function FitIndia() {
  const map = useMap();
  useEffect(() => {
    // India approximate bounds
    map.fitBounds([[6.5, 68.0], [37.5, 97.5]], { padding: [20, 20] });
    // Block panning outside India region
    map.setMaxBounds([[2, 60], [42, 102]]);
  }, [map]);
  return null;
}

function FocusSelected({ selectedId, isInitialLoad }) {
  const map = useMap();

  useEffect(() => {
    // Only zoom if user manually selected, not on initial page load
    if (!isInitialLoad) {
      const inst = IITs.find((item) => item.id === selectedId) ?? IITs[0];
      map.setView([inst.lat, inst.lon], 5.9, { animate: true });
    }
  }, [map, selectedId, isInitialLoad]);

  return null;
}

// ── Main IndiaMap component ───────────────────────────────────────────────────
function IndiaMap({ selectedId, onSelect, isInitialLoad }) {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className="relative overflow-hidden shadow-2xl"
      style={{
        height: 580,
        borderRadius: "24px",
        background: "linear-gradient(135deg,#dbeafe 0%,#eff6ff 40%,#e0f2fe 100%)",
        border: "1.5px solid rgba(59,130,246,0.2)",
        boxShadow: "0 25px 60px rgba(25,117,190,0.1), 0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Decorative top-bar gradient accent */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "4px",
          background: "linear-gradient(90deg,#3b9de0,#f59e0b,#34d399,#3b9de0)",
          backgroundSize: "200% 100%",
          animation: "shimmer 4s linear infinite",
          zIndex: 1001,
        }}
      />
      <style>{`
        @keyframes shimmer { 0%{background-position:0% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
          style={{ background: "linear-gradient(135deg,#dbeafe,#eff6ff)" }}
        >
          <div
            style={{
              width: 48, height: 48,
              borderRadius: "50%",
              border: "4px solid rgba(59,130,246,0.2)",
              borderTop: "4px solid #1975be",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1975be", letterSpacing: "0.5px" }}>
            Loading India map…
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute", left: 14, top: 14, zIndex: 1000,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid rgba(59,130,246,0.15)",
          padding: "12px 14px",
          boxShadow: "0 8px 24px rgba(25,117,190,0.1)",
        }}
      >
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "1px", color: "#1975be", textTransform: "uppercase", marginBottom: 8 }}>
          Legend
        </div>
        {[
          { color: "linear-gradient(135deg,#3b9de0,#1975be)", label: "IIT — click to select" },
          { color: "linear-gradient(135deg,#fbbf24,#f59e0b)", label: "Selected IIT" },
          { isState: true, label: "Indian state" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < 2 ? 7 : 0 }}>
            {item.isState ? (
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: "#bde0f7", border: "1.5px solid #3b9de0",
              }} />
            ) : (
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: item.color,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }} />
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1e3a5f" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* IIT count badge */}
      <div
        style={{
          position: "absolute", right: 14, top: 14, zIndex: 1000,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 14,
          border: "1px solid rgba(59,130,246,0.15)",
          padding: "8px 14px",
          boxShadow: "0 8px 24px rgba(25,117,190,0.1)",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg,#3b9de0,#1975be)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900, color: "white",
          boxShadow: "0 2px 8px rgba(25,117,190,0.35)",
        }}>
          {IITs.length}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#1975be", letterSpacing: "0.8px", textTransform: "uppercase" }}>IITs</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1e3a5f" }}>on map</div>
        </div>
      </div>

      <MapContainer
        center={[22, 82.5]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        style={{
          height: "100%", width: "100%",
          background: "linear-gradient(160deg,#dbeafe 0%,#eff6ff 60%,#e0f2fe 100%)",
          borderRadius: "24px",
        }}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <FitIndia />
        <ZoomControl position="bottomright" />
        <FocusSelected selectedId={selectedId} isInitialLoad={isInitialLoad} />
        <IndiaStates onReady={() => setLoading(false)} />
        <IITMarkers selectedId={selectedId} onSelect={onSelect} />
      </MapContainer>
    </div>
  );
}

// ----------------------------- MapPage -----------------------------
export default function MapPage({ selectedInstituteId, onPick, onBack }) {
  const [selected, setSelected] = useState(selectedInstituteId ?? IITs[0].id);
  const [search, setSearch] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Mark initial load as done after first render
    setIsInitialLoad(false);
  }, []);

  const sel = useMemo(() => IITs.find((i) => i.id === selected) ?? IITs[0], [selected]);
  const filteredIITs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return IITs;
    return IITs.filter((iit) =>
      [iit.id, iit.name, iit.state].join(" ").toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg,#eff3f8 0%,#edf3fb 45%,#f5f7fb 100%)" }}
    >
      <div style={{
        position: "fixed", top: "-20%", left: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(25,117,190,0.06) 0%,transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", right: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(148,163,184,0.12) 0%,transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div className="relative mx-auto max-w-7xl px-6 py-8" style={{ zIndex: 1 }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "rgba(15,42,94,0.08)" }}>
          <button
            onClick={onBack}
            type="button"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(15,42,94,0.08)",
              color: "#1e3a5f",
              borderRadius: 14,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-full px-4 py-2 text-sm" style={{ background: "rgba(255,255,255,0.85)", color: "#334155", border: "1px solid rgba(15,42,94,0.08)" }}>
              {sel.id}
            </div>
            <button
              onClick={() => onPick(selected)}
              type="button"
              style={{
                background: "linear-gradient(90deg,#1975be,#2f89d9)",
                color: "white",
                borderRadius: 14,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                boxShadow: "0 6px 20px rgba(25,117,190,0.22)",
              }}
            >
              Continue →
            </button>
          </div>
        </div>

        <div className="mt-8 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 400, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
              Select an IIT
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#64748b" }}>
              The first institute is preselected. Search or change the institute before opening the dashboard.
            </p>
          </div>

          <div className="min-w-[280px] rounded-2xl px-4 py-3" style={{ background: "white", border: "1px solid rgba(15,42,94,0.08)" }}>
            <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "#2563eb" }}>Institute</div>
            <div className="mt-1 text-base" style={{ color: "#0f172a", fontWeight: 500 }}>{sel.name}</div>
            <div className="text-sm" style={{ color: "#64748b" }}>{sel.state}</div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <IndiaMap selectedId={selected} onSelect={setSelected} isInitialLoad={isInitialLoad} />

          <div style={{
            background: "rgba(255,255,255,0.94)",
            border: "1px solid rgba(15,42,94,0.08)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(15,23,42,0.05)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              background: "linear-gradient(135deg,rgba(25,117,190,0.08),rgba(59,157,224,0.03))",
              borderBottom: "1px solid rgba(15,42,94,0.06)",
              padding: "18px 20px 16px",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb" }}>
                Select IIT
              </div>
              <div className="mt-3 rounded-2xl bg-white px-4 py-3" style={{ border: "1px solid rgba(148,163,184,0.22)" }}>
                <div className="mb-2 text-sm" style={{ color: "#475569" }}>Search IIT</div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, code, or state"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: "#0f172a" }}
                />
              </div>
            </div>

            <div style={{ padding: "16px 20px", flex: 1 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                {filteredIITs.length} result{filteredIITs.length === 1 ? "" : "s"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto", paddingRight: 2 }}>
                {filteredIITs.map((iit) => {
                  const active = iit.id === selected;
                  return (
                    <button
                      key={iit.id}
                      type="button"
                      onClick={() => setSelected(iit.id)}
                      style={{
                        background: active ? "rgba(37,99,235,0.08)" : "#f8fafc",
                        border: active ? "1px solid rgba(37,99,235,0.42)" : "1px solid rgba(148,163,184,0.18)",
                        borderRadius: 14,
                        padding: "11px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left",
                        boxShadow: active ? "0 0 0 2px rgba(37,99,235,0.08)" : "none",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{iit.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{iit.id} · {iit.state}</div>
                      </div>
                      <div
                        style={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: active ? "#2563eb" : "#cbd5e1",
                          color: "white",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                        }}
                      >
                        {active ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
                {!filteredIITs.length ? (
                  <div className="rounded-2xl px-4 py-5 text-sm" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid rgba(148,163,184,0.18)" }}>
                    No IIT matched your search.
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              <button
                onClick={() => onPick(selected)}
                type="button"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "linear-gradient(90deg,#1975be,#2f89d9)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(25,117,190,0.22)",
                }}
              >
                Continue with {sel.id} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
