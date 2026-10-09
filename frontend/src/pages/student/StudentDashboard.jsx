import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FeedbackModal } from '../../components/issues/FeedbackModal';
import { formatRelativeTime } from '../../utils/helpers';
import {
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Star,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackModalIssue, setFeedbackModalIssue] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStudentDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard metrics..." />;
  }

  const stats = data?.stats || {};
  const recentIssues = data?.recentIssues || [];
  const awaitingFeedback = data?.awaitingFeedback || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Report CTA Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Student Facility Portal • {user?.studentId || 'ID Verified'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Report facility issues across campus, monitor repair progress in real-time, and rate service resolutions.
          </p>
        </div>

        <Link
          to="/student/report"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Report New Campus Issue
        </Link>
      </div>

      {/* Awaiting Feedback Notice Banner */}
      {awaitingFeedback.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                You have {awaitingFeedback.length} resolved complaint{awaitingFeedback.length > 1 ? 's' : ''} awaiting your rating!
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Help us maintain campus service quality by sharing your review on #{awaitingFeedback[0].complaintId}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFeedbackModalIssue(awaitingFeedback[0])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex-shrink-0 self-end sm:self-auto"
          >
            Rate Resolution Now
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Reported"
          value={stats.totalReported}
          subtitle="All complaints logged"
          icon={ClipboardList}
          colorScheme="indigo"
        />
        <StatCard
          title="Under Review"
          value={stats.submittedCount}
          subtitle="Awaiting technician dispatch"
          icon={Clock}
          colorScheme="sky"
        />
        <StatCard
          title="Active Repairs"
          value={stats.inProgressCount}
          subtitle="Technician currently on-site"
          icon={Wrench}
          colorScheme="amber"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedCount}
          subtitle="Fixed & operational"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Recent Issues Table / Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Your latest reported issues and current status</p>
          </div>
          <Link
            to="/student/my-issues"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All ({stats.totalReported || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            You haven't reported any campus issues yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Issue Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      #{issue.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-semibold text-slate-900">
                      {issue.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{issue.category}</td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                      {issue.building?.name || 'Campus'} • {issue.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatRelativeTime(issue.updatedAt || issue.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/student/issues/${issue._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Track <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Modal for Rating Resolved Issues */}
      {feedbackModalIssue && (
        <FeedbackModal
          isOpen={!!feedbackModalIssue}
          onClose={() => setFeedbackModalIssue(null)}
          issue={feedbackModalIssue}
          onFeedbackSubmitted={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
