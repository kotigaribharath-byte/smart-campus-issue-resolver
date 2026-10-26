import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  showDivider = false,
}) => {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/80',
      pill: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/80',
      pill: 'bg-blue-50 text-blue-700 border-blue-200/80',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100/80',
      pill: 'bg-purple-50 text-purple-700 border-purple-200/80',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/80',
      pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/80',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    sky: {
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100/80',
      pill: 'bg-sky-50 text-sky-700 border-sky-200/80',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100/80',
      pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
  };

  const theme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div
      className={`relative flex flex-col justify-between py-3 px-3 sm:px-5 ${
        showDivider ? 'md:border-r border-slate-200/80' : ''
      } group transition-all`}
    >
      {/* Top Row: Icon + Title + Arrow/Trend */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
          )}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </span>
        </div>

        {trend ? (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pill} flex-shrink-0`}>
            {trend}
          </span>
        ) : (
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
        )}
      </div>

      {/* Value & Subtitle (Clean, High Contrast & Perfectly Aligned) */}
      <div className="space-y-0.5">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {value ?? 0}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-slate-500 font-medium truncate pt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
