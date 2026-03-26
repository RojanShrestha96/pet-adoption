import { Card } from "../ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface AdminDonationChartProps {
  data: {
    month: string;
    total: number;
    count: number;
  }[];
}

export function AdminDonationChart({ data }: AdminDonationChartProps) {
  // UX IMPROVEMENT: Admin donation analytics
  return (
    <Card className="p-6" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Monthly Donation Trend</h3>
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-light)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }}></span> Last 6 Months
        </div>
      </div>
      <div className="h-[260px] w-full">
         {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3348" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8892a4' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8892a4' }} tickFormatter={(val) => `Rs ${val}`} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  borderRadius: '10px',
                  background: '#1e2130',
                  border: '1px solid #2d3348',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  color: '#e2e8f0',
                }}
                labelStyle={{ color: '#8892a4', fontWeight: 600 }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: number | undefined) => [`Rs ${(value || 0).toLocaleString()}`, 'Total']}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={50} fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
         ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
               <p>No donation data available for the last 6 months.</p>
            </div>
         )}
      </div>
    </Card>
  );
}
