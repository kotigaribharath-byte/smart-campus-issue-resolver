import React from 'react';
import { Shield, Heart, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>CampusFix™ Smart Campus Facility Resolution Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Socket.IO Live Connected
            </span>
            <span>Real-Time Node.js + MongoDB API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
