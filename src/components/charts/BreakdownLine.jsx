import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatPct, generateColorShades } from "../../utils/helpers";

function splitLabelAcrossTwoLines(text) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  const words = normalized.split(" ");
  if (words.length === 1) {
    if (words[0].length <= 18) return [words[0]];
    const midpoint = Math.ceil(words[0].length / 2);
    return [words[0].slice(0, midpoint), words[0].slice(midpoint)].filter(Boolean);
  }

  let bestPair = [normalized];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(" ");
    const secondLine = words.slice(index).join(" ");
    const longestLine = Math.max(firstLine.length, secondLine.length);
    const imbalance = Math.abs(firstLine.length - secondLine.length);
    const score = longestLine * 2 + imbalance;

    if (score < bestScore) {
      bestPair = [firstLine, secondLine];
      bestScore = score;
    }
  }

  return bestPair;
}

function WrappedAxisLabel({ viewBox, value }) {
  if (!viewBox) return null;
  const lines = splitLabelAcrossTwoLines(value);
  const x = (viewBox.x ?? 0) + 18;
  const y = (viewBox.y ?? 0) + (viewBox.height ?? 0) / 2;

  return (
    <g transform={`translate(${x},${y}) rotate(-90)`}>
      <text textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="800">
        {lines.map((line, index) => (
          <tspan key={`${value ?? "axis"}-${index}`} x="0" dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function TooltipCard({ active, payload, label, isPct, yLabel, multiSeries }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};
  const formattedValue = isPct
    ? formatPct(Number(point.value ?? 0))
    : formatCompact(Number(point.value ?? 0));

  return (
    <div
      className="min-w-[200px] rounded-2xl border bg-white px-4 py-3 shadow-xl"
      style={{ borderColor: "rgba(59,130,246,0.18)" }}
    >
      <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>
        Year
      </div>
      <div className="mt-1 text-sm font-semibold" style={{ color: "#334155" }}>
        {label}
      </div>
      <div
        className="mt-3 text-[10px] uppercase tracking-[0.14em]"
        style={{ color: "#64748b" }}
      >
        {yLabel || "Metric"}
      </div>
      {multiSeries ? (
        <div className="mt-1 grid gap-1 text-sm font-semibold" style={{ color: "#0f172a" }}>
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <span>{entry.name}</span>
              <span>{isPct ? formatPct(Number(entry.value ?? 0)) : formatCompact(Number(entry.value ?? 0))}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-1 text-sm font-semibold" style={{ color: "#0f172a" }}>
          {formattedValue}
        </div>
      )}
    </div>
  );
}

export default function BreakdownLine({
  data,
  format,
  accent,
  yLabel = "Value",
  height = 420,
  seriesKeys = [],
  seriesColors = [],
}) {
  const isPct = format === "pct";
  const axisLabel = isPct ? `${yLabel} (%)` : yLabel;
  const activeSeriesKeys = Array.isArray(seriesKeys) && seriesKeys.length > 1 ? seriesKeys : ["value"];
  const palette = seriesColors.length ? seriesColors : generateColorShades(accent || "#1d4ed8", 5);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 24, left: 44, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}>
            <Label
              value="Year"
              position="insideBottom"
              offset={-6}
              style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
            />
          </XAxis>
          <YAxis
            width={84}
            domain={isPct ? [0, 1] : [0, "dataMax"]}
            ticks={isPct ? [0, 0.25, 0.5, 0.75, 1] : undefined}
            tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
            tickFormatter={(v) => (isPct ? formatPct(Number(v)) : formatCompact(v))}
          >
            <Label content={<WrappedAxisLabel value={axisLabel} />} />
          </YAxis>
          <Tooltip content={<TooltipCard isPct={isPct} yLabel={yLabel} multiSeries={activeSeriesKeys.length > 1} />} />
          {activeSeriesKeys.map((seriesKey, index) => (
            <Line
              key={seriesKey}
              type="monotone"
              dataKey={seriesKey}
              name={seriesKey}
              stroke={palette[index % palette.length]}
              strokeWidth={3}
              dot={{ r: 5, fill: palette[index % palette.length] }}
              activeDot={{ r: 7 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
