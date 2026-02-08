import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface AdoptionTrendsChartProps {
  data: Array<{
    month: string;
    adoptions: number;
  }>;
}

export function AdoptionTrendsChart({ data }: AdoptionTrendsChartProps) {
  const hasData = data.some(item => item.adoptions > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-gray-200">
          <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4">
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Adoptions Yet</h4>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Adoption trends will appear here once pets are adopted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelFormatter={(label) => `${label}`}
            formatter={(value: number | undefined) => [`${value || 0} adoptions`, '']}
          />
          <Bar
            dataKey="adoptions"
            fill="#22c55e"
            radius={[8, 8, 0, 0]}
            barSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
