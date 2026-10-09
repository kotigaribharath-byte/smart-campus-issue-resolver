import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { UpdateStatusModal } from '../../components/issues/UpdateStatusModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatRelativeTime } from '../../utils/helpers';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  ArrowRight,
  ShieldAlert,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalIssue, setStatusModalIssue] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStaffDashboard();
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
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading technician workspace..." />;
  }

  const stats = data?.stats || {};
  const recentTasks = data?.recentTasks || [];

  return (
    <div className="space-y-6">
      {/* Staff Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wrench className="w-3.5 h-3.5" />
            {user?.department?.name || 'Maintenance Specialist'} • Staff ID: {user?.staffId || 'Verified'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Technician Console — {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Manage your assigned repair work orders, upload proof of fix, and maintain campus facility standards.
          </p>
        </div>

        <Link
          to="/staff/assigned-issues"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 flex-shrink-0"
        >
          View All Assigned Tasks ({stats.totalAssigned || 0})
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Critical Tasks Notice Banner */}
      {stats.criticalAssigned > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl flex-shrink-0 animate-bounce">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900">
                Urgent Attention: {stats.criticalAssigned} Critical Work Order{stats.criticalAssigned > 1 ? 's' : ''} Assigned
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                Critical complaints require immediate on-site safety and technical inspection.
              </p>
            </div>
          </div>
          <Link
            to="/staff/assigned-issues?priority=Critical"
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex-shrink-0"
          >
            Review Critical Tasks
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Assigned"
          value={stats.totalAssigned}
          subtitle="Lifetime dispatched tasks"
          icon={Wrench}
          colorScheme="indigo"
        />
        <StatCard
          title="Pending Action"
          value={stats.pendingTasks}
          subtitle="Assigned / In Progress"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedCount}
          subtitle="Fixed & operational"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Rating Score"
          value={`${stats.performanceRating || 5.0} ★`}
          subtitle={`Based on ${stats.totalFeedbacks || 0} reviews`}
          icon={Star}
          colorScheme="purple"
        />
      </div>

      {/* Active Work Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Work Orders</h2>
            <p className="text-xs text-slate-500">Tasks requiring inspection, diagnostic, or repair</p>
          </div>
          <Link
            to="/staff/assigned-issues"
            className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
          >
            All Work Orders ({stats.totalAssigned || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No work orders currently pending for your account. Great job!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      #{task.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-semibold text-slate-900">
                      {task.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                      {task.building?.name || 'Campus'} • {task.location}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {task.reportedBy?.name || 'Student'}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={task.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setStatusModalIssue(task)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        Update
                      </button>
                      <Link
                        to={`/staff/issues/${task._id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-block"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {statusModalIssue && (
        <UpdateStatusModal
          isOpen={!!statusModalIssue}
          onClose={() => setStatusModalIssue(null)}
          issue={statusModalIssue}
          onStatusUpdated={() => {
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};
