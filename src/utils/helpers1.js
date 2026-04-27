import html2canvas from "html2canvas";

// ----------------------------- Utilities -----------------------------

export const cx = (...xs) => xs.filter(Boolean).join(" ");

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function formatCompact(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function formatPct(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
}

export function sumBy(rows, field) {
  let s = 0;
  for (const r of rows) s += Number(r[field] ?? 0);
  return s;
}

export function groupSum(rows, key, valueField) {
  const m = new Map();
  for (const r of rows) {
    const k = r[key] ?? "(unknown)";
    m.set(k, (m.get(k) ?? 0) + Number(r[valueField] ?? 0));
  }
  return Array.from(m.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function safeDelta(curr, prev) {
  if (!prev || prev === 0) return null;
  return (curr - prev) / prev;
}

export function csvEscape(val) {
  const s = String(val ?? "");
  if (/[\n\r,\"]/g.test(s)) return `"${s.replace(/\"/g, '""')}"`;
  return s;
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label ?? c.key)).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => csvEscape(r[c.key])).join(","),
  );
  return [header, ...lines].join("\n");
}

export function downloadText(
  filename,
  text,
  mime = "text/plain;charset=utf-8",
) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadExcelHtml(filename, columns, rows) {
  const thead = `<tr>${columns
    .map(
      (c) =>
        `<th style="border:1px solid #ddd;padding:6px;text-align:left;">${String(
          c.label ?? c.key,
        )}</th>`,
    )
    .join("")}</tr>`;
  const tbody = rows
    .map(
      (r) =>
        `<tr>${columns
          .map(
            (c) =>
              `<td style="border:1px solid #eee;padding:6px;">${String(
                r[c.key] ?? "",
              )}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>
  <table style="border-collapse:collapse;font-family:Arial;font-size:12px;">${thead}${tbody}</table>
  </body></html>`;
  downloadText(filename, html, "application/vnd.ms-excel;charset=utf-8");
}

// ----------------------------- HTML → Print-to-PDF helper -----------------------------
// NOTE: Browsers do not allow programmatic “save to PDF” without user interaction.
// This helper opens a printable window and triggers the print dialog.
// Users can then choose “Save as PDF”.
export function downloadHtmlAsPdf({
  title = "Report",
  html = "",
  orientation = "landscape", // 'portrait' | 'landscape'
  pageSize = "A4",
}) {
  const win = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1100,height=800",
  );
  if (!win) {
    alert("Popup blocked. Please allow popups to export PDF.");
    return;
  }

  const doc = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${String(title).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</title>
      <style>
        @page { size: ${pageSize} ${orientation}; margin: 14mm; }
        html, body { padding: 0; margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111827; }
        h1,h2,h3 { margin: 0; }
        .muted { color: #6b7280; }
        .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background: #f9fafb; font-weight: 800; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #eef2ff; color: #1f2937; font-weight: 700; font-size: 11px; }
        ul { margin: 8px 0 0 18px; }
        li { margin: 4px 0; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      ${html}
      <script>
        // Give the browser a beat to layout content.
        setTimeout(() => { window.focus(); window.print(); }, 250);
      </script>
    </body>
  </html>`;

  win.document.open();
  win.document.write(doc);
  win.document.close();
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Returns the largest SVG inside an element — i.e. the recharts chart SVG,
 * not a small icon SVG that may appear first in DOM order.
 */

function findChartSvg(el) {
  if (!el) return null;

  // Prefer recharts wrapper
  const recharts = el.querySelector(".recharts-wrapper svg");
  if (recharts) return recharts;

  // fallback (your current logic)
  const all = Array.from(el.querySelectorAll("svg"));
  if (!all.length) return null;

  return all.reduce((best, cur) => {
    const { width: bw, height: bh } = best.getBoundingClientRect();
    const { width: cw, height: ch } = cur.getBoundingClientRect();
    return cw * ch > bw * bh ? cur : best;
  });
}

/**
 * Downloads a DOM element as a PNG or JPG image.
 * Uses the recharts SVG (or any element) → Canvas → data URL approach.
 * @param {HTMLElement} el  - The element to capture
 * @param {string} filename - e.g. "chart.png"
 * @param {"png"|"jpg"} fmt
 */
export async function downloadElementImage(el, filename, fmt = "png") {
  if (!el) return;

  const svg = findChartSvg(el);

  if (svg) {
    const { width, height } = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);
    clone.style.background = "#ffffff";

    const svgStr = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = window.devicePixelRatio || 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const mime = fmt === "jpg" ? "image/jpeg" : "image/png";
      const dataUrl = canvas.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    img.src = url;
    return;
  }

  const canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: window.devicePixelRatio || 2,
    useCORS: true,
    onclone: (doc) => {
      doc.querySelectorAll('[data-export-hide="true"]').forEach((node) => {
        node.style.display = "none";
      });
    },
  });
  const mime = fmt === "jpg" ? "image/jpeg" : "image/png";
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Downloads the chart SVG as a raw .svg file.
 * @param {HTMLElement} el
 * @param {string} filename - e.g. "chart.svg"
 */
// export function downloadElementSvg(el, filename) {
//   if (!el) return;
//   const svg = findChartSvg(el);
//   if (!svg) {
//     console.warn("downloadElementSvg: no SVG found");
//     return;
//   }
//   const { width, height } = svg.getBoundingClientRect();
//   const clone = svg.cloneNode(true);
//   clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
//   clone.setAttribute("width", width);
//   clone.setAttribute("height", height);
//   clone.style.background = "#ffffff";
//   const svgStr = new XMLSerializer().serializeToString(clone);
//   downloadText(filename, svgStr, "image/svg+xml;charset=utf-8");
// }

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateSvgText(value, max = 28) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function humanizeLabelText(value) {
  return String(value ?? "")
    .split(">")
    .map((part) =>
      part
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join(" > ");
}

function getExportCaptureDimensions(el) {
  const rect = el.getBoundingClientRect();
  return {
    width: Math.max(1, Math.ceil(Math.max(rect.width, el.scrollWidth, el.clientWidth))),
    height: Math.max(1, Math.ceil(Math.max(rect.height, el.scrollHeight, el.clientHeight))),
  };
}

function expandClonedExportLayout(root, view) {
  const nodes = [root, ...root.querySelectorAll("*")];

  nodes.forEach((node) => {
    if (!(node instanceof view.HTMLElement)) return;

    const style = view.getComputedStyle(node);
    const overflowValues = [style.overflow, style.overflowX, style.overflowY];

    if (overflowValues.some((value) => value && value !== "visible")) {
      node.style.overflow = "visible";
      node.style.overflowX = "visible";
      node.style.overflowY = "visible";
    }

    if (style.maxWidth !== "none") node.style.maxWidth = "none";
    if (style.maxHeight !== "none") node.style.maxHeight = "none";
  });
}

async function captureElementCanvas(el) {
  const scale = window.devicePixelRatio || 2;
  const { width, height } = getExportCaptureDimensions(el);
  const captureId = `export-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  el.setAttribute("data-export-capture-id", captureId);

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale,
      useCORS: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      onclone: (doc) => {
        doc.querySelectorAll('[data-export-hide="true"]').forEach((node) => {
          node.style.display = "none";
        });

        const view = doc.defaultView;
        const cloneRoot = doc.querySelector(`[data-export-capture-id="${captureId}"]`);
        if (!view || !(cloneRoot instanceof view.HTMLElement)) return;

        doc.documentElement.style.width = `${width}px`;
        doc.documentElement.style.height = `${height}px`;
        doc.documentElement.style.overflow = "visible";
        doc.body.style.width = `${width}px`;
        doc.body.style.height = `${height}px`;
        doc.body.style.margin = "0";
        doc.body.style.overflow = "visible";

        cloneRoot.style.width = `${width}px`;
        cloneRoot.style.minWidth = `${width}px`;
        cloneRoot.style.height = "auto";
        cloneRoot.style.minHeight = `${height}px`;
        cloneRoot.style.maxWidth = "none";
        cloneRoot.style.maxHeight = "none";
        cloneRoot.style.overflow = "visible";

        expandClonedExportLayout(cloneRoot, view);
      },
    });

    return { canvas, width, height, scale };
  } finally {
    el.removeAttribute("data-export-capture-id");
  }
}

function buildExportShell({
  bodyWidth,
  bodyHeight,
  bodyMarkup,
  meta = {},
  bodyY = 104,
  minCanvasWidth = 860,
}) {
  const canvasWidth = Math.max(Math.ceil(bodyWidth) + 64, minCanvasWidth);
  const totalHeight = Math.ceil(bodyHeight) + 154;
  const bodyX = Math.max(24, Math.round((canvasWidth - bodyWidth) / 2));
  const footerY = totalHeight - 18;
  const updatedText = meta.lastUpdatedAt
    ? `Last updated: ${new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(meta.lastUpdatedAt))}`
    : "";
  const downloadedText = meta.lastDownloadedAt
    ? `Last downloaded: ${new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(meta.lastDownloadedAt))}`
    : "";
  const titleText = humanizeLabelText(meta.title || "");
  const breadcrumbText = humanizeLabelText(meta.breadcrumb || "");
  const subtitleText = humanizeLabelText(meta.subtitle || "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${totalHeight}" viewBox="0 0 ${canvasWidth} ${totalHeight}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">
  <rect width="100%" height="100%" fill="#ffffff" />
  <text x="${canvasWidth / 2}" y="34" text-anchor="middle" font-size="17" font-weight="700" letter-spacing="0" word-spacing="1.2" fill="#0f172a">${escapeXml(titleText)}</text>
  <text x="${canvasWidth / 2}" y="58" text-anchor="middle" font-size="11.5" font-weight="600" word-spacing="0.6" fill="#1252a0">${escapeXml(breadcrumbText)}</text>
  <text x="${canvasWidth / 2}" y="79" text-anchor="middle" font-size="11" font-weight="500" word-spacing="0.4" fill="#475569">${escapeXml(subtitleText)}</text>
  <g transform="translate(${bodyX}, ${bodyY})">${bodyMarkup}</g>
  <text x="${canvasWidth - 16}" y="${footerY}" text-anchor="end" font-size="10.5" font-weight="500" fill="#64748b">${escapeXml([updatedText, downloadedText].filter(Boolean).join(" · "))}</text>
</svg>`;
}

export function downloadTableSvg(filename, columns, rows, meta = {}) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!safeColumns.length) return;

  const preparedRows = safeRows.map((row) =>
    safeColumns.map((column) => {
      const raw = column.format ? column.format(row[column.key]) : row[column.key];
      return String(raw ?? "—");
    }),
  );

  const tableInnerWidth = Math.max(640, safeColumns.length * 170);
  const tableX = 20;
  const bodyWidth = tableInnerWidth + tableX * 2;
  const colWidth = tableInnerWidth / safeColumns.length;
  const rowHeight = 34;
  const headerHeight = 42;
  const tableTop = 18;
  const bodyHeight = tableTop + headerHeight + preparedRows.length * rowHeight + 18;
  const textMax = Math.max(14, Math.floor(colWidth / 8.6));

  const headerCells = safeColumns
    .map((column, index) => {
      const x = tableX + index * colWidth;
      const cx = x + colWidth / 2;
      return `
        <rect x="${x}" y="${tableTop}" width="${colWidth}" height="${headerHeight}" fill="#eef5ff" stroke="rgba(59,130,246,0.18)" />
        <text x="${cx}" y="${tableTop + 25}" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">${escapeXml(truncateSvgText(column.label ?? column.key, textMax))}</text>`;
    })
    .join("");

  const bodyRows = preparedRows
    .map((values, rowIndex) => {
      const y = tableTop + headerHeight + rowIndex * rowHeight;
      const fill = rowIndex % 2 === 0 ? "#ffffff" : "#f8fbff";
      const cells = values
        .map((value, colIndex) => {
          const x = tableX + colIndex * colWidth;
          const cx = x + colWidth / 2;
          return `
            <rect x="${x}" y="${y}" width="${colWidth}" height="${rowHeight}" fill="${fill}" stroke="rgba(59,130,246,0.12)" />
            <text x="${cx}" y="${y + 21}" text-anchor="middle" font-size="11.5" font-weight="500" fill="#334155">${escapeXml(truncateSvgText(value, textMax + 4))}</text>`;
        })
        .join("");
      return cells;
    })
    .join("");

  const bodyMarkup = `
    <g>
      <rect x="0" y="0" width="${bodyWidth}" height="${bodyHeight}" rx="18" fill="#ffffff" stroke="rgba(59,130,246,0.16)" />
      ${headerCells}
      ${bodyRows}
    </g>`;

  const svgStr = buildExportShell({
    bodyWidth,
    bodyHeight,
    bodyMarkup,
    meta,
    minCanvasWidth: Math.max(920, bodyWidth + 80),
  });

  downloadText(filename, svgStr, "image/svg+xml;charset=utf-8");
}

export async function downloadElementSvg(el, filename, meta = {}) {
  if (!el) return;

  if (meta?.preserveLayout) {
    const { canvas, width, height } = await captureElementCanvas(el);
    const imageHref = canvas.toDataURL("image/png", 0.98);
    const bodyWidth = width;
    const bodyHeight = height;
    const bodyMarkup = `<image href="${imageHref}" x="0" y="0" width="${bodyWidth}" height="${bodyHeight}" />`;
    const svgStr = buildExportShell({
      bodyWidth,
      bodyHeight,
      bodyMarkup,
      meta,
      minCanvasWidth: Math.max(860, Math.ceil(bodyWidth) + 40),
    });
    downloadText(filename, svgStr, "image/svg+xml;charset=utf-8");
    return;
  }

  const chartSvg = findChartSvg(el);

  if (chartSvg) {
    const { width, height } = chartSvg.getBoundingClientRect();
    const clone = chartSvg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);
    clone.setAttribute("x", 0);
    clone.setAttribute("y", 0);
    clone.style.background = "#ffffff";

    const bodyMarkup = new XMLSerializer().serializeToString(clone);
    const svgStr = buildExportShell({
      bodyWidth: Math.ceil(width),
      bodyHeight: Math.ceil(height),
      bodyMarkup,
      meta,
    });
    downloadText(filename, svgStr, "image/svg+xml;charset=utf-8");
    return;
  }

  const { canvas, width, height } = await captureElementCanvas(el);
  const imageHref = canvas.toDataURL("image/png", 0.98);
  const bodyWidth = width;
  const bodyHeight = height;
  const bodyMarkup = `<image href="${imageHref}" x="0" y="0" width="${bodyWidth}" height="${bodyHeight}" />`;
  const svgStr = buildExportShell({
    bodyWidth,
    bodyHeight,
    bodyMarkup,
    meta,
    minCanvasWidth: Math.max(860, Math.ceil(bodyWidth) + 40),
  });
  downloadText(filename, svgStr, "image/svg+xml;charset=utf-8");
}

/**
 * Downloads the chart as a PDF (single-page, A4 landscape) using the browser print API.
 * Opens a hidden window with the SVG and triggers print-to-PDF.
 * @param {HTMLElement} el
 * @param {string} title - Document title shown in the PDF
 */
export function downloadElementPdf(el, title = "Chart") {
  if (!el) return;
  const svg = findChartSvg(el);
  if (!svg) {
    console.warn("downloadElementPdf: no SVG found");
    return;
  }
  const { width, height } = svg.getBoundingClientRect();
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  const svgStr = new XMLSerializer().serializeToString(clone);
  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      @page { size: A4 landscape; margin: 16mm; }
      body { margin: 0; display: flex; flex-direction: column; align-items: center; font-family: Arial, sans-serif; }
      h2 { font-size: 14px; color: #111; margin: 0 0 12px; }
      svg { max-width: 100%; height: auto; }
    </style>
  </head><body>
    <h2>${title}</h2>
    ${svgStr}
    <script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; };<\/script>
  </body></html>`;
  const win = window.open("", "_blank", "width=900,height=620");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

/**
 * Returns an HTML <iframe> embed snippet for the current page URL.
 * @param {string} title
 */
export function buildEmbedCode(title = "IITMIS Chart") {
  const src = window.location.href;
  return `<iframe\n  src="${src}"\n  title="${title}"\n  width="900"\n  height="600"\n  frameborder="0"\n  allowfullscreen\n></iframe>`;
}
