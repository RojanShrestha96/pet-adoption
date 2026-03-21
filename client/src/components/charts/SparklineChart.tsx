import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
  positive?: boolean;
  height?: number;
}

export function SparklineChart({
  data,
  color,
  positive = true,
  height = 36,
}: SparklineChartProps) {
  const strokeColor = color || (positive ? "#22c55e" : "#ef4444");
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${strokeColor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "6px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
            formatter={(v) => [v ?? "", ""]}
            labelFormatter={() => ""}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#spark-${strokeColor.replace("#", "")})`}
            dot={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
