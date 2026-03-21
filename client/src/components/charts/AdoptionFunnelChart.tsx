import { GitMerge } from "lucide-react";

interface FunnelStage {
  stage: string;
  value: number;
  color: string;
}

interface AdoptionFunnelChartProps {
  data: FunnelStage[];
}

export function AdoptionFunnelChart({ data }: AdoptionFunnelChartProps) {
  const maxValue = data[0]?.value || 1;
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border-2 border-dashed border-gray-200 w-full">
          <div className="inline-flex p-3 rounded-full bg-white shadow-sm mb-3">
            <GitMerge className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-1">No Pipeline Data Yet</h4>
          <p className="text-sm text-gray-500">Funnel will appear once applications come in</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {data.map((stage, index) => {
        const widthPct = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
        const nextStage = data[index + 1];
        const conversionRate =
          index > 0 && data[index - 1].value > 0
            ? Math.round((stage.value / data[index - 1].value) * 100)
            : 100;
        const dropOff =
          nextStage && stage.value > 0
            ? Math.round(((stage.value - nextStage.value) / stage.value) * 100)
            : null;

        return (
          <div key={stage.stage} className="relative">
            <div className="flex items-center gap-3">
              {/* Stage Bar */}
              <div className="flex-1 relative">
                <div
                  className="h-10 rounded-lg flex items-center px-3 transition-all duration-700"
                  style={{
                    width: `${Math.max(widthPct, 15)}%`,
                    backgroundColor: stage.color + "20",
                    border: `1.5px solid ${stage.color}40`,
                    minWidth: "60px",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-lg opacity-70"
                    style={{ width: `${Math.max(widthPct, 15)}%`, backgroundColor: stage.color + "30" }}
                  />
                  <span
                    className="relative z-10 text-sm font-bold"
                    style={{ color: stage.color }}
                  >
                    {stage.value}
                  </span>
                </div>
              </div>

              {/* Label + Conversion */}
              <div className="w-32 flex-shrink-0">
                <div className="text-sm font-semibold text-gray-800">{stage.stage}</div>
                {index > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="text-green-600 font-medium">{conversionRate}%</span> conversion
                  </div>
                )}
              </div>
            </div>

            {/* Drop-off connector */}
            {dropOff !== null && stage.value > 0 && (
              <div className="flex items-center gap-1 mt-0.5 ml-2">
                <div className="w-px h-3 bg-gray-300 ml-2" />
                <span className="text-xs text-red-400 pl-3">
                  ↓ {dropOff}% drop-off
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
