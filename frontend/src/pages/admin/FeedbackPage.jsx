import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedbackService } from '../../services/feedbackService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Star, MessageSquare, Wrench, Building2, User, ArrowRight } from 'lucide-react';

export const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ averageRating: 5.0, totalReviews: 0 });
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getFeedback({
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
      });
      if (res.success) {
        setFeedbacks(res.feedbacks);
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [ratingFilter]);

  if (loading) {
    return <LoadingSpinner text="Fetching student resolution reviews..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          Student Service Feedback & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Student satisfaction reviews, technician service ratings, and resolution quality audits
        </p>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100 block">
              Overall Campus Satisfaction
            </span>
            <h2 className="text-4xl font-extrabold mt-1">{stats.averageRating || 4.8} / 5.0</h2>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-white text-white" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Total Verified Reviews
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalReviews || 0}</h2>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">
              Direct student post-resolution feedback
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Rating Filter Tabs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Filter by Star Rating
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['all', '5', '4', '3', '2', '1'].map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ratingFilter === r
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? 'All Reviews' : `${r} ★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Recent Reviews ({feedbacks.length})
        </h3>

        {feedbacks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No feedback found for the selected star rating filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-4">
            {feedbacks.map((f) => (
              <div key={f._id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Student & Date */}
                  <div className="flex items-center gap-3">
                    <img
                      src={f.studentId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${f.studentId?.name}`}
                      alt={f.studentId?.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{f.studentId?.name}</h4>
                      <p className="text-[10px] text-slate-400">{formatDate(f.createdAt)}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          f.rating >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-1">{f.rating}.0</span>
                  </div>
                </div>

                {/* Comment Text */}
                {f.comment && (
                  <p className="text-xs text-slate-700 font-normal leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    "{f.comment}"
                  </p>
                )}

                {/* Linked Complaint Info */}
                {f.issueId && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50/40 px-3 py-1.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">
                        #{f.issueId.complaintId}
                      </span>
                      <span className="truncate max-w-xs">{f.issueId.title}</span>
                    </div>
                    {f.issueId.assignedTo && (
                      <span className="text-slate-600 flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-slate-400" />
                        Technician: {f.issueId.assignedTo.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
