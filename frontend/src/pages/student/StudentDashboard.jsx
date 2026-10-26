import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/dashboard/StatCard';
import { DashboardSkeleton } from '../../components/common/LoadingSpinner';
import { FeedbackModal } from '../../components/issues/FeedbackModal';
import { formatRelativeTime } from '../../utils/helpers';
import {
  BarChart2,
  FileText,
  Plus,
  ArrowUpRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Star,
  Check,
  AlertCircle,
  FileCheck2,
  Radio,
  MapPin,
  Cpu,
  Wifi,
  Zap,
  Droplets,
  Wind,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModalIssue, setFeedbackModalIssue] = useState(null);

  // Department / Category filter (Matching 'CSE', 'ECE', 'IT' in Image 2)
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats || {};
  const recentIssues = data?.recentIssues || [];
  const awaitingFeedback = data?.awaitingFeedback || [];

  // Filter issues based on department/category tag & search
  const filteredIssues = recentIssues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.complaintId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDept === 'ALL' ||
      issue.category?.toUpperCase() === selectedDept ||
      (selectedDept === 'HOSTEL' && issue.category?.toLowerCase().includes('hostel')) ||
      (selectedDept === 'ELECTRICAL' && issue.category?.toLowerCase().includes('electr')) ||
      (selectedDept === 'AC / HVAC' && (issue.category?.toLowerCase().includes('ac') || issue.category?.toLowerCase().includes('air')));

    return matchesSearch && matchesDept;
  });

  const deptFilters = ['ALL', 'ELECTRICAL', 'PLUMBING', 'HOSTEL', 'AC / HVAC', 'NETWORK'];

  // Helper for category icons
  const getCategoryIcon = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('electr') || cat.includes('power')) return Zap;
    if (cat.includes('plumb') || cat.includes('water')) return Droplets;
    if (cat.includes('ac') || cat.includes('air') || cat.includes('hvac')) return Wind;
    if (cat.includes('net') || cat.includes('wi-fi') || cat.includes('wifi')) return Wifi;
    return Cpu;
  };

  // Helper for status pill style (Matching 'ALIGNED' and 'CRITICAL GAP' in Image 2)
  const getStatusBadge = (status = '') => {
    const st = status.toLowerCase();
    if (st === 'resolved' || st === 'closed') {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          RESOLVED
        </span>
      );
    }
    if (st === 'in progress') {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
          IN REPAIR
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
        DISPATCH PENDING
      </span>
    );
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      
      {/* ─── 1. Header Bar (Matching Image 2 Header Exactly) ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Facility & Issue Resolution Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Real-time tracking of SRMIST campus facility maintenance, automated technician assignment, and SLA resolution.
          </p>
        </div>

        {/* Right Action Buttons (Matching Image 2) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors shadow-2xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/student/my-issues"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Complaint Log (NAAC/SLA)</span>
          </Link>

          <Link
            to="/student/report"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* ─── Awaiting Feedback Rating Notice ─── */}
      {awaitingFeedback.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                You have {awaitingFeedback.length} resolved complaint{awaitingFeedback.length > 1 ? 's' : ''} awaiting review!
              </h4>
              <p className="text-[11px] text-amber-700">
                Help improve campus service quality by rating ticket #{awaitingFeedback[0].complaintId}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFeedbackModalIssue(awaitingFeedback[0])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all self-end sm:self-auto"
          >
            Rate Resolution Now
          </button>
        </div>
      )}

      {/* ─── 2. Embedded Stats Row (Matching Image 2 Stat Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Campus Resolution Index"
          value={stats.totalReported > 0 ? `${Math.round((stats.resolvedCount / stats.totalReported) * 100)}%` : '100%'}
          subtitle="Across Accredited Facilities"
          icon={BarChart2}
          colorScheme="blue"
          trend="+8% SLA"
        />
        <StatCard
          title="Total Logged Issues"
          value={stats.totalReported ?? 0}
          subtitle="Active Student Cohort"
          icon={ClipboardList}
          colorScheme="purple"
          trend="Lifetime"
        />
        <StatCard
          title="Under Active Repair"
          value={stats.inProgressCount ?? 0}
          subtitle="Technicians Currently On-Site"
          icon={Wrench}
          colorScheme="amber"
          trend="In Progress"
        />
        <StatCard
          title="Resolved Evidence Proofs"
          value={stats.resolvedCount ?? 0}
          subtitle="Fixed & Operational Badges"
          icon={CheckCircle2}
          colorScheme="emerald"
          trend="Operational"
        />
      </div>

      {/* ─── 3. Main Section: Heatmap & Issue Grid (Matching Image 2 Bottom Half) ─── */}
      <div className="space-y-4">
        {/* Section Title & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Facility Category Breakdown & Complaint Heatmap
            </h2>
          </div>

          {/* Department / Category Pill Selectors (Matching 'CSE', 'ECE', 'IT' in Image 2) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600 overflow-x-auto scrollbar-none">
            {deptFilters.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Grid of Cards or Clean Empty State ─── */}
        {filteredIssues.length === 0 ? (
          /* Clean Embedded Empty State */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <FileCheck2 className="w-7 h-7 stroke-[1.8]" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {searchQuery || selectedDept !== 'ALL'
                ? `No issues found for ${selectedDept}`
                : 'All Campus Facilities in Healthy Operational State'}
            </h3>

            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              No unresolved breakdown tickets detected for this category. If you observe broken laboratory equipment, lighting failures, or hostel water drops, report immediately.
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                to="/student/report"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                Report An Issue
              </Link>

              {selectedDept !== 'ALL' && (
                <button
                  onClick={() => setSelectedDept('ALL')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Grid of Issue Cards (Matching the Skill Cards in Image 2) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredIssues.map((issue) => {
              const CategoryIcon = getCategoryIcon(issue.category);
              const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';
              const isInProgress = issue.status === 'In Progress';

              return (
                <div
                  key={issue._id || issue.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top: Category Icon + Title + Status Badge + Arrow */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {issue.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold block">
                            #{issue.complaintId} • {issue.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getStatusBadge(issue.status)}
                        <Link
                          to={`/student/issues/${issue._id || issue.id}`}
                          className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar 1: Verification Progress (Matching Image 2) */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Resolution Progress</span>
                        <span className="text-slate-900 font-bold">
                          {isResolved ? '100%' : isInProgress ? '65%' : '25%'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isResolved ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: isResolved ? '100%' : isInProgress ? '65%' : '25%' }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar 2: SLA Dispatch Standard (Matching Image 2) */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Technician SLA Dispatch</span>
                        <span className="text-slate-900 font-bold">
                          {isResolved ? '100%' : isInProgress ? '85%' : '40%'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-500"
                          style={{ width: isResolved ? '100%' : isInProgress ? '85%' : '40%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Location and Relative Time */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {issue.building?.name || 'Campus'} • {issue.location}
                    </span>
                    <span>{formatRelativeTime(issue.updatedAt || issue.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Feedback Rating Modal ─── */}
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
