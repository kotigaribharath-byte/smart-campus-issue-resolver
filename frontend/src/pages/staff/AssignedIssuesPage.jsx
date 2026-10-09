import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { issueService } from '../../services/issueService';
import { buildingService } from '../../services/buildingService';
import { IssueFilters } from '../../components/issues/IssueFilters';
import { IssueCard } from '../../components/issues/IssueCard';
import { UpdateStatusModal } from '../../components/issues/UpdateStatusModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Wrench } from 'lucide-react';

export const AssignedIssuesPage = () => {
  const [searchParams] = useSearchParams();
  const priorityParam = searchParams.get('priority');

  const [issues, setIssues] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState(priorityParam || 'all');
  const [status, setStatus] = useState('all');
  const [building, setBuilding] = useState('all');
  const [buildingsList, setBuildingsList] = useState([]);

  const [selectedIssueForUpdate, setSelectedIssueForUpdate] = useState(null);

  useEffect(() => {
    buildingService.getBuildings().then((res) => {
      if (res.success) setBuildingsList(res.buildings);
    });
  }, []);

  const fetchAssignedIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssues({
        assignedOnly: true,
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
    fetchAssignedIssues();
  }, [fetchAssignedIssues]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-600" />
            Assigned Work Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, filter, update statuses, and log repair proofs for tasks assigned to you
          </p>
        </div>
      </div>

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

      {loading ? (
        <LoadingSpinner text="Fetching assigned work orders..." />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No work orders match the criteria"
          description="You currently have no tasks matching this filter combination."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <div key={issue._id} className="relative group">
                <IssueCard
                  issue={issue}
                  basePath="/staff/issues"
                />
              </div>
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

      {selectedIssueForUpdate && (
        <UpdateStatusModal
          isOpen={!!selectedIssueForUpdate}
          onClose={() => setSelectedIssueForUpdate(null)}
          issue={selectedIssueForUpdate}
          onStatusUpdated={() => {
            fetchAssignedIssues();
          }}
        />
      )}
    </div>
  );
};
