import React from 'react';
import { Trophy, Star, CheckCircle2, Wrench } from 'lucide-react';

export const StaffLeaderboard = ({ staff = [] }) => {
  if (!staff || staff.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        No staff performance records available.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {staff.map((member, index) => {
        const isTop = index === 0;
        return (
          <div
            key={member.id || index}
            className={`p-3.5 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 ${
              isTop ? 'bg-amber-50/30' : ''
            }`}
          >
            {/* Rank & Profile Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  index === 0
                    ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                    : index === 1
                    ? 'bg-slate-200 text-slate-800'
                    : index === 2
                    ? 'bg-amber-800/10 text-amber-900'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {index === 0 ? <Trophy className="w-3.5 h-3.5 text-amber-600" /> : index + 1}
              </div>

              <img
                src={member.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`}
                alt={member.name}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
              />

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  {member.department}
                </p>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="flex items-center gap-3 flex-shrink-0 text-right">
              <div>
                <span className="text-xs font-extrabold text-emerald-600 block">
                  {member.resolvedCount} Resolved
                </span>
                <span className="text-[10px] text-slate-400">
                  {member.resolutionRate}% Rate
                </span>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-900">
                  {member.averageRating}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
