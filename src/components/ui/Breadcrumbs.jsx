import React from "react";

export default function Breadcrumbs({ base, levels, drillPath, onPopTo }) {
  const baseVisible = base && String(base).trim().toLowerCase() !== "category";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {baseVisible ? (
        <button
          className="rounded-lg px-2.5 py-1.5 hover:opacity-80"
          style={{
            background: "rgba(25,117,190,0.08)",
            color: "#1252a0",
            fontWeight: 700,
            fontSize: 14,
          }}
          onClick={() => onPopTo(0)}
          type="button"
        >
          {base}
        </button>
      ) : null}

      {drillPath.map((v, idx) => (
        <React.Fragment key={`${idx}-${v}`}>
          {(baseVisible || idx > 0) ? (
            <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
              &gt;
            </span>
          ) : null}
          <button
            className="rounded-lg px-2.5 py-1.5 hover:opacity-80"
            style={{
              background: "rgba(25,117,190,0.08)",
              color: "#1252a0",
              fontWeight: 700,
              fontSize: 14,
            }}
            onClick={() => onPopTo(idx + 1)}
            title={levels[idx]?.label}
            type="button"
          >
            {v}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
