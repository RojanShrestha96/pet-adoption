import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Dog, Cat, PawPrint } from 'lucide-react';

interface PetDistributionChartProps {
  data: {
    dog: number;
    cat: number;
    other: number;
  };
}

export function PetDistributionChart({ data }: PetDistributionChartProps) {
  const chartData = [
    { name: 'Dogs', value: data.dog, icon: Dog },
    { name: 'Cats', value: data.cat, icon: Cat },
    { name: 'Other', value: data.other, icon: PawPrint },
  ].filter(item => item.value > 0); // Only show non-zero categories

  const COLORS = ['#f97316', '#a855f7', '#3b82f6'];

  const total = data.dog + data.cat + data.other;

  // Custom label renderer
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-purple-50 border-2 border-dashed border-gray-200">
          <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4">
            <PawPrint className="w-10 h-10 text-orange-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Pets Yet</h4>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Add your first pet to see species distribution
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
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number | undefined) => [`${value || 0} pets`, '']}
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
