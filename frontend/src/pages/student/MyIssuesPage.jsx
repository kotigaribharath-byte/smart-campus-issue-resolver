import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../../services/issueService';
import { buildingService } from '../../services/buildingService';
import { IssueFilters } from '../../components/issues/IssueFilters';
import { IssueCard } from '../../components/issues/IssueCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, ClipboardList } from 'lucide-react';

export const MyIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [building, setBuilding] = useState('all');
  const [buildingsList, setBuildingsList] = useState([]);

  // Load buildings for filter dropdown
  useEffect(() => {
    buildingService.getBuildings().then((res) => {
      if (res.success) setBuildingsList(res.buildings);
    });
  }, []);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssues({
        myIssuesOnly: true,
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? priority : undefined,
        status: status !== 'all' ? status : undefined,
        building: building !== 'all' ? building : undefined,
        page,
        limit: 9,
      });

      if (res.success) {
        setIssues(res.issues);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, priority, status, building, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setPriority('all');
    setStatus('all');
    setBuilding('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            My Reported Issues
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and track all complaints reported from your account
          </p>
        </div>

        <Link
          to="/student/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Filter Component */}
      <IssueFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        priority={priority}
        setPriority={setPriority}
        status={status}
        setStatus={setStatus}
        building={building}
        setBuilding={setBuilding}
        buildingsList={buildingsList}
        onReset={handleReset}
        totalCount={totalCount}
      />

      {/* Issues Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching your reported issues..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No complaints match your filters"
          description="Try clearing search keywords or filter dropdowns to see more results."
          actionLabel="Report a New Complaint"
          actionLink="/student/report"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                basePath="/student/issues"
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-500 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
