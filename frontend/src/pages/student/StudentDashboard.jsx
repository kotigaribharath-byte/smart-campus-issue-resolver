import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { DashboardSkeleton } from '../../components/common/LoadingSpinner';
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
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  PhoneCall,
  Check,
  Building,
  Radio,
  FileCheck2,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModalIssue, setFeedbackModalIssue] = useState(null);

  // Filters for recent issues
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await dashboardService.getStudentDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show the advanced dashboard skeleton loading screen
  if (loading) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats || {};
  const recentIssues = data?.recentIssues || [];
  const awaitingFeedback = data?.awaitingFeedback || [];

  // Filter issues based on user controls
  const filteredIssues = recentIssues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.complaintId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || issue.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && ['Submitted', 'Assigned'].includes(issue.status)) ||
      (statusFilter === 'Active' && issue.status === 'In Progress') ||
      (statusFilter === 'Resolved' && ['Resolved', 'Closed'].includes(issue.status));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Electrical', 'Plumbing', 'IT & Wi-Fi', 'Air Conditioning', 'Hostel', 'Classroom'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ─── Executive Welcome & Action Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#172554] to-[#1e3a8a] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        {/* Ambient Light Shapes */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                SRMIST Verified Student • {user?.studentId || 'ID Verified'}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Facility Services Online
              </span>
            </div>

            {/* Title & Greeting */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!</span>
              <Sparkles className="w-6 h-6 text-cyan-300 hidden sm:inline-block animate-pulse" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Report campus infrastructure breakdowns, monitor repair dispatch in real time, and verify technician fixes directly from your dashboard.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              title="Refresh dashboard metrics"
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl text-white transition-all hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/student/report"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 flex-shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report New Campus Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Awaiting Feedback Notice Banner ─── */}
      {awaitingFeedback.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500 text-white rounded-xl flex-shrink-0 shadow-md shadow-amber-200">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                You have {awaitingFeedback.length} resolved complaint{awaitingFeedback.length > 1 ? 's' : ''} awaiting your feedback rating!
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5">
                Help us ensure high maintenance standards by rating ticket #{awaitingFeedback[0].complaintId}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFeedbackModalIssue(awaitingFeedback[0])}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex-shrink-0 self-end sm:self-auto"
          >
            Rate Resolution Now
          </button>
        </div>
      )}

      {/* ─── Metric Cards Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Reported"
          value={stats.totalReported}
          subtitle="All complaints logged"
          icon={ClipboardList}
          colorScheme="indigo"
          trend="Lifetime"
        />
        <StatCard
          title="Under Review"
          value={stats.submittedCount}
          subtitle="Awaiting technician dispatch"
          icon={Clock}
          colorScheme="sky"
          trend="Pending"
        />
        <StatCard
          title="Active Repairs"
          value={stats.inProgressCount}
          subtitle="Technician currently on-site"
          icon={Wrench}
          colorScheme="amber"
          trend="In Progress"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedCount}
          subtitle="Fixed & operational"
          icon={CheckCircle2}
          colorScheme="emerald"
          trend="Operational"
        />
      </div>

      {/* ─── Complaints Workspace Card ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Recent Complaints</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {recentIssues.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your reported facility issues and current repair updates
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold text-slate-600">
              {['All', 'Pending', 'Active', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Link
              to="/student/my-issues"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors whitespace-nowrap pl-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search & Category Pills Filter Bar */}
        <div className="py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, or room..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Complaints List or High-End Empty State ─── */}
        {filteredIssues.length === 0 ? (
          /* 🌟 Rich Designed Empty State with 3-Step Guide 🌟 */
          <div className="mt-4 p-8 sm:p-12 text-center rounded-2xl bg-gradient-to-b from-slate-50/70 to-white border border-dashed border-slate-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner mb-4">
              <FileCheck2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 stroke-[1.5]" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {searchQuery || selectedCategory !== 'All' || statusFilter !== 'All'
                ? 'No matching complaints found'
                : 'No Active Facility Complaints'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery || selectedCategory !== 'All' || statusFilter !== 'All'
                ? 'Try adjusting your search query or active filter tags to view your records.'
                : 'All campus facilities around you are currently in optimal condition. If you notice any electrical, plumbing, or classroom issues, report them in seconds.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/student/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                Report First Campus Issue
              </Link>

              {(searchQuery || selectedCategory !== 'All' || statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setStatusFilter('All');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* 3-Step Workflow Explainer */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Step 01</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">Snap & Geotag</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Upload an image and specify your campus block, floor, and room number.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Step 02</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">Smart Auto-Routing</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  The issue is instantly dispatched to the appropriate department technician.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Step 03</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">Track & Rate</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Receive live updates, see repair proof, and submit your satisfaction rating.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Table of Complaints */
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredIssues.map((issue) => (
                  <tr key={issue._id || issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      #{issue.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-semibold text-slate-900">
                      {issue.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                        {issue.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[150px]">
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
                        to={`/student/issues/${issue._id || issue.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
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

      {/* ─── Emergency & Support Quick Contact Widget ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Electrical & Power Desk</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">+91 (044) 2741-7100</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Hostel Maintenance Office</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">+91 (044) 2741-7200</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Campus IT & Wi-Fi Support</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">helpdesk@srmist.edu.in</p>
          </div>
        </div>
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
