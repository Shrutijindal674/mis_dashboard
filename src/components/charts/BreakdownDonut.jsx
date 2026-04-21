import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCompact, formatPct } from "../../utils/helpers";

function TooltipCard({ active, payload, isPct, metricLabel, drillHint }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};
  const val = Number(point.value ?? 0);
  const formattedValue = isPct ? formatPct(val) : formatCompact(val);
  const share = Number(point.share ?? 0) * 100;

  return (
    <div
      className="min-w-[220px] rounded-2xl border bg-white px-4 py-3 shadow-xl"
      style={{ borderColor: "rgba(59,130,246,0.18)" }}
    >
      <div className="text-sm font-extrabold" style={{ color: "#0f172a" }}>
        Selected item
      </div>
      <div className="mt-1 text-sm font-semibold" style={{ color: "#334155" }}>
        {point.name}
      </div>
      <div
        className="mt-3 text-[10px] uppercase tracking-[0.14em]"
        style={{ color: "#64748b" }}
      >
        {metricLabel ? `${metricLabel}` : "Metric value"}
      </div>
      <div className="mt-1 text-sm font-semibold" style={{ color: "#0f172a" }}>
        {formattedValue}
      </div>
      {!isPct ? (
        <div className="mt-1 text-xs" style={{ color: "#475569" }}>
          Share of total: {share.toFixed(1)}%
        </div>
      ) : null}
      {drillHint ? (
        <div className="mt-3 text-xs font-semibold" style={{ color: "#2563eb" }}>
          {drillHint}
        </div>
      ) : null}
    </div>
  );
}

function DonutLabel({ cx, cy, midAngle, outerRadius, name, value, isPct }) {
  const RADIAN = Math.PI / 180;
  const radius = Number(outerRadius) + 18;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > Number(cx) ? "start" : "end";
  const label = isPct ? formatPct(Number(value ?? 0)) : formatCompact(Number(value ?? 0));
  return (
    <text x={x} y={y} fill="#0f172a" textAnchor={textAnchor} dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700 }}>
      {`${name}: ${label}`}
    </text>
  );
}

export default function BreakdownDonut({ data, format, onSliceClick, accent, soft, metricLabel, height = 520, interactive = false, drillHint = "" }) {
  const isPct = format === "pct";
  const total = data.reduce((s, x) => s + Number(x.value ?? 0), 0) || 1;
  const donutBoundary = "rgba(15,23,42,0.16)";

  const donutData = data.map((d, i) => ({
    name: d.name,
    value: Number(d.value ?? 0),
    share: Number(d.value ?? 0) / total,
    _i: i,
  }));

  return (
    <div className="min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 28, right: 88, bottom: 28, left: 88 }}>
          <Tooltip content={<TooltipCard isPct={isPct} metricLabel={metricLabel} drillHint={drillHint} />} />
          <Pie
            data={donutData}
            dataKey="value"
            nameKey="name"
            innerRadius="52%"
            outerRadius="84%"
            paddingAngle={donutData.length > 1 ? 1 : 0}
            onClick={(p) => onSliceClick?.(p?.name)}
            labelLine={false}
            label={(props) => <DonutLabel {...props} isPct={isPct} />}
          >
            {donutData.map((d) => (
              <Cell
                key={d.name}
                fill={d._i % 2 === 0 ? accent : soft}
                stroke={donutBoundary}
                strokeWidth={1.1}
                cursor={interactive ? "pointer" : "default"}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
