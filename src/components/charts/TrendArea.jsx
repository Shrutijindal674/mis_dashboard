import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "../../utils/helpers";

export default function TrendArea({ seriesA, seriesB, labelA, labelB, accent, height = 360, xLabel = "Year", yLabel = "Value" }) {
  const data = seriesA.map((p, i) => ({
    Month: p.Month,
    A:     p.Value,
    B:     seriesB[i]?.Value ?? 0,
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 40, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Month" tick={{ fontSize: 12 }}>
            <Label value={xLabel} position="insideBottom" offset={-8} style={{ fill: "#475569", fontSize: 12 }} />
          </XAxis>
          <YAxis width={78} tick={{ fontSize: 12 }} tickFormatter={formatCompact}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={-18} style={{ fill: "#475569", fontSize: 12 }} />
          </YAxis>
          <Tooltip formatter={(v) => formatCompact(Number(v))} />
          <Legend />
          <Area
            type="monotone"
            dataKey="B"
            name={labelB}
            stroke="#64748b"
            fill="#e5e7eb"
            fillOpacity={0.7}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="A"
            name={labelA}
            stroke={accent}
            fill={accent}
            fillOpacity={0.25}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
