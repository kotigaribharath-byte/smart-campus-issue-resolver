import React from 'react';
import { PRIORITY_COLORS } from '../../utils/constants';
import { AlertCircle, Flame, ShieldAlert, ArrowDown } from 'lucide-react';

export const PriorityBadge = ({ priority, showIcon = true, size = 'md' }) => {
  const config = PRIORITY_COLORS[priority] || PRIORITY_COLORS['Medium'];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
    ? 'px-3 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-1 text-xs font-semibold';

  const renderIcon = () => {
    if (!showIcon) return null;
    if (priority === 'Critical') return <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />;
    if (priority === 'High') return <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />;
    if (priority === 'Medium') return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
    return <ArrowDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${config.bg} ${config.text} ${config.border} ${config.ring || ''} ${sizeClasses}`}
    >
      {renderIcon()}
      {priority || 'Medium'}
    </span>
  );
};
