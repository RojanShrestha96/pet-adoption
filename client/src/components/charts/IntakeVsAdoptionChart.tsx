import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { BarChart2 } from "lucide-react";

interface IntakeVsAdoptionData {
  month: string;
  intake: number;
  adopted: number;
  net: number;
}

interface IntakeVsAdoptionChartProps {
  data: IntakeVsAdoptionData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const intake = payload.find((p: any) => p.dataKey === "intake")?.value || 0;
    const adopted = payload.find((p: any) => p.dataKey === "adopted")?.value || 0;
    const net = intake - adopted;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-gray-600">Intake</span>
            </span>
            <span className="font-semibold text-blue-600">{intake}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="text-gray-600">Adopted</span>
            </span>
            <span className="font-semibold text-green-600">{adopted}</span>
          </div>
          <div className="border-t border-gray-100 pt-1 flex items-center justify-between gap-4">
            <span className="text-gray-500">Net Load</span>
            <span className={`font-bold ${net > 0 ? "text-red-500" : net < 0 ? "text-green-600" : "text-gray-500"}`}>
              {net > 0 ? `+${net}` : net}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function IntakeVsAdoptionChart({ data }: IntakeVsAdoptionChartProps) {
  const hasData = data.some((d) => d.intake > 0 || d.adopted > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-gray-200">
          <div className="inline-flex p-3 rounded-full bg-white shadow-sm mb-3">
            <BarChart2 className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-1">No Intake Data Yet</h4>
          <p className="text-sm text-gray-500">Intake vs adoption trends will appear once pets are added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Legend
            verticalAlign="top"
            height={32}
            formatter={(value) => (
              <span className="text-sm text-gray-600 font-medium capitalize">{value}</span>
            )}
          />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          <Bar dataKey="intake" name="Intake" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={22} />
          <Bar dataKey="adopted" name="Adopted" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
