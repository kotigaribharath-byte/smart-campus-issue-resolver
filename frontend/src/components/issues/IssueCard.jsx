import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { formatRelativeTime } from '../../utils/helpers';
import { MapPin, User, Clock, Building, ArrowRight, Image as ImageIcon } from 'lucide-react';

export const IssueCard = ({ issue, basePath = '/student/issues', onQuickAssign }) => {
  const hasImage = issue.imageUrls && issue.imageUrls.length > 0;
  const isCritical = issue.priority === 'Critical';

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden ${
        isCritical
          ? 'border-red-300 ring-1 ring-red-200 shadow-xs'
          : 'border-slate-200/90 shadow-xs'
      }`}
    >
      {/* Top Banner with Tracking ID & Priority */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              #{issue.complaintId}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {issue.category}
            </span>
          </div>
          <PriorityBadge priority={issue.priority} size="sm" />
        </div>

        {/* Title */}
        <Link
          to={`${basePath}/${issue._id}`}
          className="block font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-2 mb-2 leading-snug"
        >
          {issue.title}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {issue.description}
        </p>

        {/* Location Info */}
        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 truncate">
            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium">{issue.building?.name || 'Main Campus'}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate text-slate-500">
              {issue.floor} • {issue.location}
            </span>
          </div>
        </div>

        {/* Image thumbnail preview if available */}
        {hasImage && (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
              <img
                src={issue.imageUrls[0]}
                alt="Complaint attachment"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <ImageIcon className="w-3.5 h-3.5" />
              {issue.imageUrls.length} Photo{issue.imageUrls.length > 1 ? 's' : ''} attached
            </span>
          </div>
        )}
      </div>

      {/* Footer Meta & Action */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <StatusBadge status={issue.status} size="sm" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(issue.createdAt)}
          </span>

          <Link
            to={`${basePath}/${issue._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-2xs"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
