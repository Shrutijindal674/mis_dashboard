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
import { formatCompact, formatPct } from "../../utils/helpers";

function DetailsTooltip({ active, payload, label, isPct, xLabel, yLabel }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};
  const formattedValue = isPct
    ? formatPct(Number(point.value))
    : formatCompact(Number(point.value));

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
      <div className="mt-1 text-sm font-semibold" style={{ color: "#0f172a" }}>
        {formattedValue}
      </div>
    </div>
  );
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
}) {
  const isPct = format === "pct";
  const horizontal = data.length > 7;

  return (
    <div className="flex flex-col" style={{ height }}>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={
              horizontal
                ? { top: 24, right: 28, left: 62, bottom: 18 }
                : { top: 24, right: 24, left: 18, bottom: 58 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                  tickFormatter={(v) =>
                    isPct ? `${Math.round(v * 100)}%` : formatCompact(v)
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
                  width={160}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                >
                  <Label
                    value={xLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
                  />
                </YAxis>
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={72}
                >
                  <Label
                    value={xLabel}
                    position="insideBottom"
                    offset={-6}
                    style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
                  />
                </XAxis>
                <YAxis
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                  tickFormatter={(v) =>
                    isPct ? `${Math.round(v * 100)}%` : formatCompact(v)
                  }
                >
                  <Label
                    value={isPct ? `${yLabel} (%)` : yLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
                  />
                </YAxis>
              </>
            )}
            <Tooltip
              content={<DetailsTooltip isPct={isPct} xLabel={xLabel} yLabel={yLabel} />}
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
            />
            <Bar
              dataKey="value"
              radius={horizontal ? [0, 12, 12, 0] : [12, 12, 0, 0]}
              fill={accent}
              onClick={(d) => onBarClick?.(d?.name)}
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
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
