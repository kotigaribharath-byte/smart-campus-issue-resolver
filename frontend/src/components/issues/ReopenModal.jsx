import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { issueService } from '../../services/issueService';
import { useToast } from '../../hooks/useToast';
import { ImageUploadZone } from '../common/ImageUploadZone';
import { RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';

export const ReopenModal = ({
  isOpen,
  onClose,
  issue,
  onReopenedSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || reason.trim() === '') {
      error('Please provide a reason why this issue is being reopened.');
      return;
    }

    try {
      setLoading(true);
      const res = await issueService.reopenIssue(issue._id, {
        reason: reason.trim(),
        imageUrl: imageUrl || undefined,
      });

      if (res.success) {
        success('Issue has been reopened for technician re-inspection.');
        if (onReopenedSuccess) onReopenedSuccess(res.issue);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reopen issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reopen Resolved Complaint"
      subtitle={`Complaint #${issue?.complaintId} • ${issue?.title}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-relaxed">
            Reopening will flag this task as urgent and notify the maintenance supervisor and assigned technician for immediate re-examination.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Reason for Reopening <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. AC fan is spinning but still blowing hot air, water tap is still leaking at the base..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <ImageUploadZone
          label="Attach Current Photo of Persisting Issue (Optional)"
          initialImageUrl={imageUrl}
          onImageUploaded={(url) => setImageUrl(url)}
        />

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
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reopening...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Confirm Reopen Issue
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
