import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText } from 'lucide-react';

interface ApplicationStatusChartProps {
  data: {
    pending: number;
    reviewing: number;
    approved: number;
    rejected: number;
    followUp?: number;
    finalizing?: number;
  };
}

export function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  const chartData = [
    { name: 'Pending', value: data.pending },
    { name: 'Reviewing', value: data.reviewing },
    { name: 'Approved', value: data.approved },
    { name: 'Follow-up', value: data.followUp || 0 },
    { name: 'Finalizing', value: data.finalizing || 0 },
    { name: 'Rejected', value: data.rejected },
  ].filter(item => item.value > 0);

  const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#ef4444'];

  const total = data.pending + data.reviewing + data.approved + data.rejected + (data.followUp || 0) + (data.finalizing || 0);

  // Custom label to show in center
  const renderCenterLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-gray-900"
      >
        <tspan x="50%" dy="-0.5em" fontSize="32" fontWeight="bold">
          {total}
        </tspan>
        <tspan x="50%" dy="1.5em" fontSize="14" fill="#6b7280">
          Total
        </tspan>
      </text>
    );
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-gray-200">
          <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4">
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h4>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Application stats will show when people start applying
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {renderCenterLabel()}
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number | undefined) => [`${value || 0} applications`, '']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
