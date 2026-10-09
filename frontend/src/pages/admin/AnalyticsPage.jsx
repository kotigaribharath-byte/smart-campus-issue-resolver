import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { CategoryBarChart } from '../../components/dashboard/CategoryBarChart';
import { StatusPieChart } from '../../components/dashboard/StatusPieChart';
import { MonthlyTrendAreaChart } from '../../components/dashboard/MonthlyTrendAreaChart';
import { BuildingDistributionChart } from '../../components/dashboard/BuildingDistributionChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAdminDashboard().then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing aggregation analytics pipeline..." />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Campus Facility Deep Analytics & Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics, turnaround velocity, building load distributions, and historical trends
        </p>
      </div>

      {/* Intelligence Metric Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Resolution Velocity
          </span>
          <p className="text-2xl font-black text-slate-900">
            {stats.avgResolutionHours || 14.5} <span className="text-sm font-semibold text-slate-500">hours</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Average turnaround time
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Resolution Efficiency
          </span>
          <p className="text-2xl font-black text-emerald-600">
            {stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}%
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {stats.resolvedIssues} of {stats.totalIssues} closed
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            High Density Category
          </span>
          <p className="text-lg font-black text-indigo-600 truncate">
            {stats.mostCommonCategory || 'Electrical'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Most frequent student complaint
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Top Maintenance Site
          </span>
          <p className="text-lg font-black text-amber-700 truncate">
            {stats.mostProblematicBuilding || 'Main Academic Block'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Highest cumulative ticket volume
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Category Distribution Analysis</h3>
          <p className="text-xs text-slate-500 mb-4">Volume breakdown across facility categories</p>
          <CategoryBarChart data={charts.categoryStats} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Complaint Lifecycle Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Active workload stages vs completed ratio</p>
          <StatusPieChart data={charts.statusStats} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Submission & Resolution Velocity</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly incident intake versus fix speed</p>
          <MonthlyTrendAreaChart data={charts.monthlyTrends} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Campus Building Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Facility density and pending workload</p>
          <BuildingDistributionChart data={charts.buildingStats} />
        </div>
      </div>
    </div>
  );
};
