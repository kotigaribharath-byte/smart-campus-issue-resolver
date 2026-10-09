import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { issueService } from '../../services/issueService';
import { useToast } from '../../hooks/useToast';
import { ImageUploadZone } from '../common/ImageUploadZone';
import { CheckCircle2, Wrench, PauseCircle, CheckCheck, Loader2 } from 'lucide-react';

export const UpdateStatusModal = ({
  isOpen,
  onClose,
  issue,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState(issue?.status || 'In Progress');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const statusOptions = [
    { value: 'In Progress', label: 'In Progress', desc: 'Technician on-site repairing', icon: Wrench, color: 'text-sky-600' },
    { value: 'On Hold', label: 'On Hold', desc: 'Awaiting parts or access', icon: PauseCircle, color: 'text-amber-600' },
    { value: 'Resolved', label: 'Mark as Resolved', desc: 'Work complete & operational', icon: CheckCircle2, color: 'text-emerald-600' },
    { value: 'Closed', label: 'Closed', desc: 'Finalized and closed', icon: CheckCheck, color: 'text-slate-600' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment || comment.trim() === '') {
      error('Please provide a brief status update comment.');
      return;
    }

    try {
      setLoading(true);
      const res = await issueService.updateStatus(issue._id, {
        status,
        comment: comment.trim(),
        imageUrl: imageUrl || undefined,
      });

      if (res.success) {
        success(`Status updated to ${status}!`);
        if (onStatusUpdated) onStatusUpdated(res.issue);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Complaint Status"
      subtitle={`Complaint #${issue?.complaintId} • Current: ${issue?.status}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selection Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Select New Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${opt.color}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Update Comment / Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Progress / Resolution Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe action taken, replacement parts used, or verification test performed..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Proof / Repair Photo Upload */}
        <ImageUploadZone
          label="Attach Resolution / Proof Photo (Recommended)"
          initialImageUrl={imageUrl}
          onImageUploaded={(url) => setImageUrl(url)}
        />

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Status Update
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
