import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/dashboard/StatCard';
import { CategoryBarChart } from '../../components/dashboard/CategoryBarChart';
import { StatusPieChart } from '../../components/dashboard/StatusPieChart';
import { MonthlyTrendAreaChart } from '../../components/dashboard/MonthlyTrendAreaChart';
import { BuildingDistributionChart } from '../../components/dashboard/BuildingDistributionChart';
import { StaffLeaderboard } from '../../components/dashboard/StaffLeaderboard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { AssignStaffModal } from '../../components/issues/AssignStaffModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatRelativeTime } from '../../utils/helpers';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Flame,
  Hourglass,
  Star,
  Users,
  Building2,
  Layers,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignModalIssue, setAssignModalIssue] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminDashboard();
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
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing MongoDB aggregation analytics..." />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const staffPerformance = data?.staffPerformance || [];
  const recentIssues = data?.recentIssues || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Campus Administrator Executive Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Facility Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Real-time MongoDB aggregation of campus complaints, automated technician workloads, and resolution metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/issues"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            Master Issues Database
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            Deep Analytics
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Issues"
          value={stats.totalIssues}
          subtitle="All complaints logged"
          icon={ClipboardList}
          colorScheme="indigo"
        />
        <StatCard
          title="Pending"
          value={stats.pendingIssues}
          subtitle="Awaiting resolution"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressIssues}
          subtitle="Active on-site repairs"
          icon={Hourglass}
          colorScheme="sky"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedIssues}
          subtitle="Successfully fixed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Critical"
          value={stats.criticalIssues}
          subtitle="High urgency alert"
          icon={Flame}
          colorScheme="rose"
        />
        <StatCard
          title="Avg Resolution"
          value={`${stats.avgResolutionHours || 14.5}h`}
          subtitle="Turnaround velocity"
          icon={Zap}
          colorScheme="purple"
        />
      </div>

      {/* Analytics Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Category</h3>
              <p className="text-xs text-slate-500">Distribution across facility domains</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Top: {stats.mostCommonCategory || 'Electrical'}
            </span>
          </div>
          <CategoryBarChart data={charts.categoryStats} />
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaint Lifecycle Status</h3>
              <p className="text-xs text-slate-500">Active vs completed pipeline ratio</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {stats.resolvedIssues} of {stats.totalIssues} Resolved
            </span>
          </div>
          <StatusPieChart data={charts.statusStats} />
        </div>
      </div>

      {/* Analytics Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Submission vs Resolution Velocity</h3>
              <p className="text-xs text-slate-500">Longitudinal service throughput</p>
            </div>
          </div>
          <MonthlyTrendAreaChart data={charts.monthlyTrends} />
        </div>

        {/* Building Distribution Stacked Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Issues by Campus Building</h3>
              <p className="text-xs text-slate-500">Facility density and pending volume</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              Most active: {stats.mostProblematicBuilding || 'MAB'}
            </span>
          </div>
          <BuildingDistributionChart data={charts.buildingStats} />
        </div>
      </div>

      {/* Row 3: Staff Performance Leaderboard & Recent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Leaderboard (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Technician Performance</h3>
                <p className="text-xs text-slate-500">Resolved tasks & student ratings</p>
              </div>
              <Link to="/admin/users?role=staff" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                Manage Staff
              </Link>
            </div>
            <StaffLeaderboard staff={staffPerformance} />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Service Satisfaction:</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              {stats.overallRating || 4.8} / 5.0
            </span>
          </div>
        </div>

        {/* Recent High Urgency Complaints (2 Cols) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Campus Complaints</h3>
                <p className="text-xs text-slate-500">Latest issues requiring administrative dispatch or monitoring</p>
              </div>
              <Link
                to="/admin/issues"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Master Database ({stats.totalIssues || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Summary</th>
                    <th className="py-3 px-3">Building</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Staff</th>
                    <th className="py-3 px-3 text-right">Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentIssues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                        #{issue.complaintId}
                      </td>
                      <td className="py-3 px-3 max-w-[180px] truncate font-semibold text-slate-900">
                        {issue.title}
                      </td>
                      <td className="py-3 px-3 text-slate-500 truncate max-w-[120px]">
                        {issue.building?.name || 'Campus'}
                      </td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={issue.priority} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {issue.assignedTo?.name ? (
                          <span className="font-semibold text-slate-800">{issue.assignedTo.name}</span>
                        ) : (
                          <span className="text-amber-600 font-bold">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => setAssignModalIssue(issue)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          Assign
                        </button>
                        <Link
                          to={`/admin/issues/${issue._id}`}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-block"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Staff Modal */}
      {assignModalIssue && (
        <AssignStaffModal
          isOpen={!!assignModalIssue}
          onClose={() => setAssignModalIssue(null)}
          issue={assignModalIssue}
          onAssignedSuccess={() => {
            fetchAdminData();
          }}
        />
      )}
    </div>
  );
};
