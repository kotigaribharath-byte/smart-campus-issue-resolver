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
  Star,
  FileCheck2,
  MapPin,
  Cpu,
  Wifi,
  Zap,
  Droplets,
  Wind,
  User,
  Building,
  AlertCircle,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModalIssue, setFeedbackModalIssue] = useState(null);

  // Department / Category filter
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

  const getCategoryTheme = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('electr') || cat.includes('power')) {
      return {
        icon: Zap,
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-200/80',
        gradient: 'from-amber-500 via-orange-400 to-amber-500',
        tagBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      };
    }
    if (cat.includes('plumb') || cat.includes('water')) {
      return {
        icon: Droplets,
        bg: 'bg-sky-500/10',
        text: 'text-sky-600',
        border: 'border-sky-200/80',
        gradient: 'from-sky-500 via-blue-400 to-sky-500',
        tagBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      };
    }
    if (cat.includes('ac') || cat.includes('air') || cat.includes('hvac')) {
      return {
        icon: Wind,
        bg: 'bg-teal-500/10',
        text: 'text-teal-600',
        border: 'border-teal-200/80',
        gradient: 'from-teal-500 via-emerald-400 to-teal-500',
        tagBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      };
    }
    if (cat.includes('net') || cat.includes('wi-fi') || cat.includes('wifi')) {
      return {
        icon: Wifi,
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-600',
        border: 'border-indigo-200/80',
        gradient: 'from-indigo-500 via-violet-400 to-indigo-500',
        tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      };
    }
    return {
      icon: Cpu,
      bg: 'bg-slate-500/10',
      text: 'text-slate-700',
      border: 'border-slate-200/80',
      gradient: 'from-slate-600 via-slate-400 to-slate-600',
      tagBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
    };
  };

  const renderPriorityPill = (priority) => {
    const p = (priority || 'Medium').toLowerCase();
    if (p === 'critical') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          Critical
        </span>
      );
    }
    if (p === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Low
      </span>
    );
  };

  const renderStatusPill = (status = '') => {
    const st = status.toLowerCase();
    if (st === 'resolved' || st === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    }
    if (st === 'in progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          In Repair
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
        <Clock className="w-3 h-3 text-sky-600" />
        Dispatch Pending
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ─── 1. Page Header (Decent, Calm, Executive SaaS Style) ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Facility & Issue Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Real-time tracking of SRMIST campus facility maintenance, automated technician assignment, and SLA resolution.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
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

      {/* ─── 2. Embedded Stats Directly On Screen (No Box/Card Backgrounds) ─── */}
      <div className="py-6 border-y border-slate-200/90 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 bg-transparent">
        <StatCard
          title="Total Logged Issues"
          value={stats.totalReported ?? 0}
          subtitle="Active Student Cohort"
          icon={ClipboardList}
          colorScheme="purple"
          trend="Lifetime"
          showDivider={true}
        />
        <StatCard
          title="Under Active Repair"
          value={stats.inProgressCount ?? 0}
          subtitle="Technicians Currently On-Site"
          icon={Wrench}
          colorScheme="amber"
          trend="In Progress"
          showDivider={true}
        />
        <StatCard
          title="Resolved Evidence Proofs"
          value={stats.resolvedCount ?? 0}
          subtitle="Fixed & Operational Badges"
          icon={CheckCircle2}
          colorScheme="emerald"
          trend="Operational"
          showDivider={false}
        />
      </div>

      {/* ─── 3. Facility Category Breakdown & Issue Status ─── */}
      <div className="space-y-4">
        {/* Section Title & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Facility Category Breakdown & Complaints
            </h2>
          </div>

          {/* Department / Category Pill Selectors */}
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
          /* Embedded List of Issues (No Card Boxes, Data Directly on Screen) */
          <div className="divide-y divide-slate-200/70 border-y border-slate-200/80">
            {filteredIssues.map((issue) => {
              const theme = getCategoryTheme(issue.category);
              const CategoryIcon = theme.icon;
              const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';
              const isInProgress = issue.status === 'In Progress';

              return (
                <div
                  key={issue._id || issue.id}
                  className="group py-4 px-2 hover:bg-slate-50/80 rounded-xl transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Icon, Ticket ID, Title, Description, Location */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.text} border ${theme.border} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Meta Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                          #{issue.complaintId}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${theme.tagBg}`}>
                          {issue.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {issue.building?.name || 'Main Campus'}
                          {issue.location && <span>• {issue.location}</span>}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <Link
                          to={`/student/issues/${issue._id || issue.id}`}
                          className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{issue.title}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                        </Link>
                        {issue.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-2xl">
                            {issue.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Visual Lifecycle Pipeline */}
                  <div className="flex items-center gap-6 lg:px-4 lg:border-x lg:border-slate-100 flex-shrink-0">
                    <div className="space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Stage</span>
                        <span
                          className={`font-bold ${
                            isResolved ? 'text-emerald-700' : isInProgress ? 'text-amber-700' : 'text-blue-700'
                          }`}
                        >
                          {isResolved ? 'Resolved' : isInProgress ? 'In Repair' : 'Logged & Dispatched'}
                        </span>
                      </div>

                      {/* Connected Stepper Line */}
                      <div className="grid grid-cols-3 gap-1 w-full">
                        <div className={`h-1.5 rounded-full ${isResolved || isInProgress ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                        <div
                          className={`h-1.5 rounded-full ${
                            isResolved ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'
                          }`}
                        />
                        <div className={`h-1.5 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>
                          {issue.assignedTo?.name ? `Tech: ${issue.assignedTo.name}` : 'Auto-dispatching'}
                        </span>
                        <span>{formatRelativeTime(issue.updatedAt || issue.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & View Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {renderStatusPill(issue.status)}
                      {renderPriorityPill(issue.priority)}
                    </div>

                    <Link
                      to={`/student/issues/${issue._id || issue.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 group/btn shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Link>
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
