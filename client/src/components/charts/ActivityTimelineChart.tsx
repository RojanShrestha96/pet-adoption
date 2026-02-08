import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface ActivityTimelineChartProps {
  data: Array<{
    day: string;
    activities: number;
  }>;
}

export function ActivityTimelineChart({ data }: ActivityTimelineChartProps) {
  const hasData = data.some(item => item.activities > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-gray-200">
          <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4">
            <Activity className="w-10 h-10 text-purple-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h4>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Your activity timeline will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
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
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelFormatter={(label) => `${label}`}
            formatter={(value: number | undefined) => [`${value || 0} activities`, '']}
          />
          <Area
            type="monotone"
            dataKey="activities"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorActivities)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
