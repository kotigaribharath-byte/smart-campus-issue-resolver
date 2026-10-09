import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  Clock,
  User,
  Wrench,
  AlertCircle,
  MessageSquare,
  Star,
  ShieldCheck,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const IssueTimeline = ({ timeline = [], currentStatus }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const getActionIcon = (type, newStatus) => {
    if (type === 'created') return <Clock className="w-4 h-4 text-indigo-600" />;
    if (type === 'assigned') return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
    if (type === 'reopened') return <RotateCcw className="w-4 h-4 text-rose-600" />;
    if (type === 'resolved' || newStatus === 'Resolved') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (type === 'feedback') return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
    if (newStatus === 'In Progress') return <Wrench className="w-4 h-4 text-sky-600" />;
    return <MessageSquare className="w-4 h-4 text-slate-600" />;
  };

  const getDotBackground = (type, newStatus) => {
    if (type === 'resolved' || newStatus === 'Resolved') return 'bg-emerald-100 ring-emerald-200';
    if (type === 'reopened') return 'bg-rose-100 ring-rose-200';
    if (newStatus === 'In Progress') return 'bg-sky-100 ring-sky-200';
    if (type === 'feedback') return 'bg-amber-100 ring-amber-200';
    return 'bg-indigo-100 ring-indigo-200';
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No timeline history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {timeline.map((item, index) => {
        const isLatest = index === timeline.length - 1;
        return (
          <div key={item._id || index} className="relative group">
            {/* Timeline Icon Node */}
            <div
              className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${getDotBackground(
                item.actionType,
                item.newStatus
              )} shadow-xs z-10`}
            >
              {getActionIcon(item.actionType, item.newStatus)}
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    {item.updatedBy?.name || 'System'}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {item.updatedBy?.role || 'user'}
                  </span>
                  {item.newStatus && (
                    <StatusBadge status={item.newStatus} size="sm" />
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              {/* Comment text */}
              {item.comment && (
                <p className="text-xs text-slate-700 leading-relaxed font-normal mt-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  {item.comment}
                </p>
              )}

              {/* Proof / Resolution Image */}
              {item.imageUrl && (
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Repair / Proof Image:
                  </span>
                  <div
                    onClick={() => setSelectedImage(item.imageUrl)}
                    className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group/img"
                  >
                    <img
                      src={item.imageUrl}
                      alt="Timeline evidence"
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Evidence & Repair Photo"
          maxWidth="max-w-2xl"
        >
          <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2">
            <img
              src={selectedImage}
              alt="Full Preview"
              className="max-h-[70vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
