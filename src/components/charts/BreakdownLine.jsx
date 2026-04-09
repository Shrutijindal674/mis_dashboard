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
import { formatCompact, formatPct } from "../../utils/helpers";

function TooltipCard({ active, payload, label, isPct, yLabel }) {
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
      <div className="mt-1 text-sm font-semibold" style={{ color: "#0f172a" }}>
        {formattedValue}
      </div>
    </div>
  );
}

export default function BreakdownLine({ data, format, accent, yLabel = "Value" }) {
  const isPct = format === "pct";

  return (
    <div className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 24, left: 18, bottom: 40 }}>
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
            tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
            tickFormatter={(v) => (isPct ? `${Math.round(v * 100)}%` : formatCompact(v))}
          >
            <Label
              value={isPct ? `${yLabel} (%)` : yLabel}
              angle={-90}
              position="insideLeft"
              style={{ fill: "#0f172a", fontSize: 13, fontWeight: 800 }}
            />
          </YAxis>
          <Tooltip content={<TooltipCard isPct={isPct} yLabel={yLabel} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={3}
            dot={{ r: 5, fill: accent }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
