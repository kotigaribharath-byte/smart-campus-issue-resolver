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
      gradient: 'from-blue-600 to-indigo-600',
      text: 'text-blue-600',
      bgGlow: 'bg-blue-500/15',
      borderHover: 'hover:border-blue-300',
      bar: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      pill: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    sky: {
      gradient: 'from-sky-500 to-cyan-500',
      text: 'text-sky-600',
      bgGlow: 'bg-sky-400/15',
      borderHover: 'hover:border-sky-300',
      bar: 'bg-gradient-to-r from-sky-500 to-cyan-500',
      pill: 'bg-sky-50 text-sky-700 border-sky-100',
    },
    amber: {
      gradient: 'from-amber-500 to-orange-500',
      text: 'text-amber-600',
      bgGlow: 'bg-amber-400/15',
      borderHover: 'hover:border-amber-300',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      pill: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-500',
      text: 'text-emerald-600',
      bgGlow: 'bg-emerald-400/15',
      borderHover: 'hover:border-emerald-300',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    rose: {
      gradient: 'from-rose-500 to-pink-500',
      text: 'text-rose-600',
      bgGlow: 'bg-rose-400/15',
      borderHover: 'hover:border-rose-300',
      bar: 'bg-gradient-to-r from-rose-500 to-pink-500',
      pill: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    purple: {
      gradient: 'from-purple-600 to-fuchsia-600',
      text: 'text-purple-600',
      bgGlow: 'bg-purple-500/15',
      borderHover: 'hover:border-purple-300',
      bar: 'bg-gradient-to-r from-purple-600 to-fuchsia-600',
      pill: 'bg-purple-50 text-purple-700 border-purple-100',
    },
  };

  const theme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div
      className={`group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.12)] ${theme.borderHover} hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default`}
    >
      {/* Ambient corner light glow */}
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${theme.bgGlow} blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
      />

      <div>
        {/* Top Header: Title and Icon */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.bar}`} />
            {title}
          </span>

          {Icon && (
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.gradient} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Value and Trend */}
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {value ?? 0}
          </h3>
          {trend && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pill}`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle and bottom bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <p className="truncate font-medium">{subtitle || 'Updated in real-time'}</p>
      </div>

      {/* Subtle Bottom Accent Indicator */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme.bar} opacity-80 group-hover:opacity-100 group-hover:h-1.5 transition-all`} />
    </div>
  );
};
