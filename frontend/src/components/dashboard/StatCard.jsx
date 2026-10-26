import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  showDivider = true,
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      pill: 'bg-blue-50 text-blue-700 border-blue-100',
      arrowBg: 'text-blue-600 hover:bg-blue-50',
      barColor: '#3b82f6',
      bars: [40, 65, 30, 85, 55, 95, 75],
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      pill: 'bg-purple-50 text-purple-700 border-purple-100',
      arrowBg: 'text-purple-600 hover:bg-purple-50',
      barColor: '#8b5cf6',
      bars: [30, 50, 70, 45, 90, 60, 80],
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      pill: 'bg-amber-50 text-amber-700 border-amber-100',
      arrowBg: 'text-amber-600 hover:bg-amber-50',
      barColor: '#f59e0b',
      bars: [45, 70, 55, 60, 40, 80, 65],
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      arrowBg: 'text-emerald-600 hover:bg-emerald-50',
      barColor: '#10b981',
      bars: [50, 60, 40, 75, 85, 65, 95],
    },
  };

  const theme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div
      className={`relative flex items-center justify-between py-3 px-3 sm:px-6 ${
        showDivider ? 'md:border-r border-slate-200/80' : ''
      } group transition-all`}
    >
      {/* Metric Content Directly on Screen (No Box/Card Background) */}
      <div className="flex items-start gap-3.5 min-w-0">
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${theme.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
            <Icon className="w-5 h-5 stroke-[1.8]" />
          </div>
        )}

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {title}
            </span>
            <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </div>

          <div className="flex items-baseline gap-2">
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
            <p className="text-[11px] text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Embedded Sparkline Bars Directly on Screen */}
      <div className="hidden sm:flex items-end gap-1 h-9 pr-1 pl-2 select-none flex-shrink-0">
        {theme.bars.map((height, idx) => (
          <div
            key={idx}
            className="w-1.5 rounded-t-sm transition-all duration-300"
            style={{
              height: `${height}%`,
              backgroundColor: theme.barColor,
              opacity: 0.5 + (idx / theme.bars.length) * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};
