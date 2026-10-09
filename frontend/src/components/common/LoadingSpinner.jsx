import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md', fullScreen = false }) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-slate-100">
          <Loader2 className={`${sizeClasses} text-indigo-600 animate-spin`} />
          <p className="text-sm font-medium text-slate-700">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeClasses} text-indigo-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-24"></div>
      <div className="h-5 bg-slate-200 rounded-full w-20"></div>
    </div>
    <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
    <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
    <div className="h-3 bg-slate-100 rounded w-5/6 mb-4"></div>
    <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
  </div>
);
