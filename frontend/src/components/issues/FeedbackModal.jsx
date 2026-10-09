import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { feedbackService } from '../../services/feedbackService';
import { useToast } from '../../hooks/useToast';
import { Star, Loader2, Heart } from 'lucide-react';

export const FeedbackModal = ({
  isOpen,
  onClose,
  issue,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await feedbackService.submitFeedback({
        issueId: issue._id,
        rating,
        comment: comment.trim(),
      });

      if (res.success) {
        success('Thank you! Your feedback has been recorded.');
        if (onFeedbackSubmitted) onFeedbackSubmitted(res.feedback);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  const ratingDescriptions = {
    1: 'Very Unsatisfied - Issue still persists',
    2: 'Unsatisfied - Poor fix or delayed',
    3: 'Neutral - Acceptable resolution',
    4: 'Satisfied - Quick & effective',
    5: 'Extremely Satisfied - Outstanding service!',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Issue Resolution"
      subtitle={`Complaint #${issue?.complaintId} • ${issue?.title}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating Controls */}
        <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100/80">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
            How was the maintenance service?
          </span>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-amber-800">
            {ratingDescriptions[hoverRating || rating]}
          </p>
        </div>

        {/* Comment Box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Comments or Compliments (Optional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share feedback on technician punctuality, repair quality, or clean-up..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Actions */}
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
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-200 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
