import { useState } from "react";
import {
  Cell,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
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

function WrappedXAxisTick({ x = 0, y = 0, payload }) {
  const lines = splitLabelAcrossTwoLines(payload?.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#334155" fontSize="11" fontWeight="600">
        {lines.map((line, index) => (
          <tspan key={`${payload?.value ?? "label"}-${index}`} x="0" dy={index === 0 ? 16 : 13}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function WrappedYAxisTick({ x = 0, y = 0, payload }) {
  const lines = splitLabelAcrossTwoLines(payload?.value);
  const yOffsets = lines.length > 1 ? [-3, 10] : [4];

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={`${payload?.value ?? "label"}-${index}`}
          x={-10}
          y={yOffsets[index] ?? 4}
          textAnchor="end"
          fill="#334155"
          fontSize="11"
          fontWeight="600"
        >
          {line}
        </text>
      ))}
    </g>
  );
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

function DetailsTooltip({ active, payload, label, isPct, xLabel, yLabel, drillHint, stacked }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};

  return (
    <div
      className="min-w-[220px] rounded-2xl border bg-white px-4 py-3 shadow-xl"
      style={{ borderColor: "rgba(59,130,246,0.18)" }}
    >
      <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>
        {xLabel || "Selected item"}
      </div>
      <div className="mt-1 text-sm font-semibold" style={{ color: "#334155" }}>
        {label || point.name || "Selected item"}
      </div>
      <div
        className="mt-3 text-[10px] uppercase tracking-[0.14em]"
        style={{ color: "#64748b" }}
      >
        {yLabel || "Metric value"}
      </div>
      {stacked ? (
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
          {isPct ? formatPct(Number(point.value)) : formatCompact(Number(point.value))}
        </div>
      )}
      {drillHint ? (
        <div className="mt-3 text-xs font-semibold" style={{ color: "#2563eb" }}>
          {drillHint}
        </div>
      ) : null}
    </div>
  );
}

function LegendItem({ color, label, active }) {
  return (
    <div
      className="inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold"
      style={{
        borderColor: active ? "#0f172a" : "rgba(148,163,184,0.18)",
        background: active ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.82)",
        color: "#475569",
      }}
      title={label}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
        style={{ background: color }}
      />
      <span className="truncate">{label}</span>
    </div>
  );
}

function lightenHexColor(hex, amount = 0.24) {
  const normalized = String(hex ?? "").trim();
  const match = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return normalized;

  const fullHex =
    match[1].length === 3
      ? match[1].split("").map((char) => `${char}${char}`).join("")
      : match[1];
  const value = Number.parseInt(fullHex, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const blend = (channel) =>
    Math.round(channel + (255 - channel) * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${blend(red)}${blend(green)}${blend(blue)}`;
}

export default function BreakdownBar({
  data,
  format,
  onBarClick,
  accent,
  xLabel = "Category",
  yLabel = "Value",
  height = 520,
  interactive = false,
  drillHint = "",
  seriesKeys = [],
  seriesColors = [],
  forceHorizontal = false,
}) {
  const isPct = format === "pct";
  const stacked = Array.isArray(seriesKeys) && seriesKeys.length > 1;
  const horizontal = !stacked && (forceHorizontal || data.length > 7);
  const yAxisLabel = isPct ? `${yLabel} (%)` : yLabel;
  const palette = seriesColors.length ? seriesColors : generateColorShades(accent || "#1d4ed8", 6);
  const [selectedStackSegment, setSelectedStackSegment] = useState(null);
  const [hoverStackSegment, setHoverStackSegment] = useState(null);
  const activeStackSegment = hoverStackSegment ?? selectedStackSegment;

  function selectStackSegment(item, seriesKey) {
    const name = String(item?.name ?? "");
    setSelectedStackSegment((current) =>
      current?.name === name && current?.seriesKey === seriesKey
        ? null
        : { name, seriesKey },
    );
  }

  function stackSegmentIsActive(item, seriesKey) {
    return (
      activeStackSegment?.name === String(item?.name ?? "") &&
      activeStackSegment?.seriesKey === seriesKey
    );
  }

  return (
    <div className="flex flex-col" style={{ height }} onMouseLeave={() => setHoverStackSegment(null)}>
      {stacked ? (
        <div className="mb-2 flex flex-wrap justify-center gap-1.5 px-3">
          {seriesKeys.map((seriesKey, index) => (
            <LegendItem
              key={seriesKey}
              color={palette[index % palette.length]}
              label={seriesKey}
              active={activeStackSegment?.seriesKey === seriesKey}
            />
          ))}
        </div>
      ) : null}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={
              horizontal
                ? { top: 24, right: 24, left: 112, bottom: 18 }
                : { top: 40, right: 24, left: 44, bottom: 42 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  domain={isPct ? [0, 1] : [0, "dataMax"]}
                  ticks={isPct ? [0, 0.25, 0.5, 0.75, 1] : undefined}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                  tickFormatter={(v) =>
                    isPct ? formatPct(Number(v)) : formatCompact(v)
                  }
                >
                  <Label
                    value={isPct ? `${yLabel} (%)` : yLabel}
                    position="insideBottom"
                    offset={-4}
                    style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
                  />
                </XAxis>
                <YAxis
                  type="category"
                  dataKey="name"
                  width={188}
                  tick={(props) => <WrappedYAxisTick {...props} />}
                >
                  <Label
                    value={xLabel}
                    angle={-90}
                    position="insideLeft"
                    offset={-18}
                    style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
                  />
                </YAxis>
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={(props) => <WrappedXAxisTick {...props} />}
                  interval={0}
                  height={78}
                >
                  <Label
                    value={xLabel}
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
                  tickFormatter={(v) =>
                    isPct ? formatPct(Number(v)) : formatCompact(v)
                  }
                >
                  <Label content={<WrappedAxisLabel value={yAxisLabel} />} />
                </YAxis>
              </>
            )}
            <Tooltip
              content={<DetailsTooltip isPct={isPct} xLabel={xLabel} yLabel={yLabel} drillHint={drillHint} stacked={stacked} />}
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
            />
            {stacked ? (
              seriesKeys.map((seriesKey, index) => (
                <Bar
                  key={seriesKey}
                  dataKey={seriesKey}
                  name={seriesKey}
                  stackId="year"
                  fill={palette[index % palette.length]}
                  radius={index === seriesKeys.length - 1 ? [12, 12, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive={false}
                >
                  {data.map((item, itemIndex) => {
                    const baseColor = palette[index % palette.length];
                    const active = stackSegmentIsActive(item, seriesKey);
                    return (
                      <Cell
                        key={`${seriesKey}-${item.name}-${itemIndex}`}
                        cursor="pointer"
                        fill={baseColor}
                        opacity={1}
                        stroke={active ? lightenHexColor(baseColor, 0.42) : "rgba(255,255,255,0.72)"}
                        strokeWidth={active ? 3 : 0.75}
                        strokeLinejoin="round"
                        onMouseEnter={() =>
                          setHoverStackSegment({
                            name: String(item?.name ?? ""),
                            seriesKey,
                          })
                        }
                        onClick={(event) => {
                          event?.stopPropagation?.();
                          selectStackSegment(item, seriesKey);
                        }}
                      />
                    );
                  })}
                </Bar>
              ))
            ) : (
              <Bar
                dataKey="value"
                radius={horizontal ? [0, 12, 12, 0] : [12, 12, 0, 0]}
                fill={accent}
                onClick={interactive ? (d) => onBarClick?.(d?.name) : undefined}
                isAnimationActive={false}
              >
                {data.map((item, index) => (
                  <Cell key={`${item.name}-${index}`} cursor={interactive ? "pointer" : "default"} />
                ))}
                <LabelList
                  dataKey="value"
                  position={horizontal ? "right" : "top"}
                  formatter={(v) =>
                    isPct ? formatPct(Number(v)) : formatCompact(Number(v))
                  }
                  style={{ fill: "#0f172a", fontSize: 11, fontWeight: 700 }}
                />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
