import React from "react";
import { hexToRgba } from "../../utils/helpers";

export default function Breadcrumbs({ base, levels, drillPath, onPopTo, accent = "#1d4ed8" }) {
  const baseVisible = base && String(base).trim().toLowerCase() !== "category";
  const buttonBg = hexToRgba(accent, 0.08);
  const buttonColor = accent;
  const separatorColor = hexToRgba(accent, 0.62);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {baseVisible ? (
        <button
          className="rounded-lg px-2.5 py-1.5 hover:opacity-80"
          style={{
            background: buttonBg,
            color: buttonColor,
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
            <span style={{ color: separatorColor, fontSize: 13, fontWeight: 800 }}>
              &gt;
            </span>
          ) : null}
          <button
            className="rounded-lg px-2.5 py-1.5 hover:opacity-80"
            style={{
              background: buttonBg,
              color: buttonColor,
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
