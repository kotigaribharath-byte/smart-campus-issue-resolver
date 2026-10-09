import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'indigo', // indigo, sky, amber, emerald, rose, purple
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/70',
      iconBg: 'bg-indigo-600 text-white',
      border: 'border-indigo-100',
      accent: 'text-indigo-600',
    },
    sky: {
      bg: 'bg-sky-50/70',
      iconBg: 'bg-sky-600 text-white',
      border: 'border-sky-100',
      accent: 'text-sky-600',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100',
      accent: 'text-amber-600',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-100',
      accent: 'text-emerald-600',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconBg: 'bg-rose-600 text-white',
      border: 'border-rose-100',
      accent: 'text-rose-600',
    },
    purple: {
      bg: 'bg-purple-50/70',
      iconBg: 'bg-purple-600 text-white',
      border: 'border-purple-100',
      accent: 'text-purple-600',
    },
  };

  const currentTheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border ${currentTheme.border} shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${currentTheme.iconBg} flex items-center justify-center shadow-xs flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value ?? 0}
        </h3>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
