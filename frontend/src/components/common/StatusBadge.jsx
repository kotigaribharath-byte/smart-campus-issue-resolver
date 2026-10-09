import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
    ? 'px-3.5 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} shadow-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status || 'Unknown'}
    </span>
  );
};
