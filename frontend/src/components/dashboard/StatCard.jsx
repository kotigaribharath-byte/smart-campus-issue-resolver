import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue', // blue, purple, emerald, amber
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      pill: 'bg-blue-50 text-blue-700 border-blue-100',
      arrowBg: 'text-blue-600 bg-blue-50/80 group-hover:bg-blue-600 group-hover:text-white',
      barColor: '#3b82f6',
      bars: [40, 65, 30, 85, 55, 95, 75],
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      pill: 'bg-purple-50 text-purple-700 border-purple-100',
      arrowBg: 'text-purple-600 bg-purple-50/80 group-hover:bg-purple-600 group-hover:text-white',
      barColor: '#8b5cf6',
      bars: [30, 50, 70, 45, 90, 60, 80],
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      arrowBg: 'text-emerald-600 bg-emerald-50/80 group-hover:bg-emerald-600 group-hover:text-white',
      barColor: '#10b981',
      bars: [50, 60, 40, 75, 85, 65, 95],
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      pill: 'bg-amber-50 text-amber-700 border-amber-100',
      arrowBg: 'text-amber-600 bg-amber-50/80 group-hover:bg-amber-600 group-hover:text-white',
      barColor: '#f59e0b',
      bars: [45, 70, 55, 60, 40, 80, 65],
    },
  };

  const theme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-center justify-between overflow-hidden cursor-default">
      
      {/* Top-Right Arrow Action (Matching Image 2) */}
      <div className={`absolute top-3.5 right-3.5 p-1 rounded-lg ${theme.arrowBg} transition-all duration-200`}>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </div>

      {/* Left: Icon Squircle + Metric Content */}
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>
        )}

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            {title}
          </span>

          <div className="flex items-center gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value ?? 0}
            </h3>
            {trend && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pill}`}>
                {trend}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Embedded Vertical Mini-Bar Chart (Matching Image 2) */}
      <div className="hidden sm:flex items-end gap-1 h-10 pr-2 pl-3 select-none">
        {theme.bars.map((height, idx) => (
          <div
            key={idx}
            className="w-1.5 rounded-t-sm transition-all duration-300 group-hover:opacity-100"
            style={{
              height: `${height}%`,
              backgroundColor: theme.barColor,
              opacity: 0.6 + (idx / theme.bars.length) * 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
};
