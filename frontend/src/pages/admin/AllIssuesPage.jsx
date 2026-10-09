import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../../services/issueService';
import { buildingService } from '../../services/buildingService';
import { departmentService } from '../../services/departmentService';
import { IssueFilters } from '../../components/issues/IssueFilters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { AssignStaffModal } from '../../components/issues/AssignStaffModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import {
  ClipboardList,
  UserCheck,
  Trash2,
  Eye,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const AllIssuesPage = () => {
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
  const [department, setDepartment] = useState('all');
  const [buildingsList, setBuildingsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  // Modals
  const [assignIssue, setAssignIssue] = useState(null);
  const [deleteIssueTarget, setDeleteIssueTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    buildingService.getBuildings().then((res) => {
      if (res.success) setBuildingsList(res.buildings);
    });
    departmentService.getDepartments().then((res) => {
      if (res.success) setDepartmentsList(res.departments);
    });
  }, []);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssues({
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? priority : undefined,
        status: status !== 'all' ? status : undefined,
        building: building !== 'all' ? building : undefined,
        department: department !== 'all' ? department : undefined,
        page,
        limit: 12,
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
  }, [search, category, priority, status, building, department, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleDeleteIssue = async () => {
    if (!deleteIssueTarget) return;
    try {
      setDeleting(true);
      const res = await issueService.deleteIssue(deleteIssueTarget._id);
      if (res.success) {
        success('Complaint record permanently deleted.');
        setDeleteIssueTarget(null);
        fetchIssues();
      }
    } catch (err) {
      error('Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setPriority('all');
    setStatus('all');
    setBuilding('all');
    setDepartment('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            Master Campus Complaints Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query, manage, dispatch, and review all facility issues across university departments
          </p>
        </div>
      </div>

      {/* Dynamic Filters */}
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

      {/* Issues Table */}
      {loading ? (
        <LoadingSpinner text="Searching master complaint records..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No complaint records found"
          description="Try modifying search keywords or clearing filter dropdowns."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tracking ID</th>
                  <th className="py-3.5 px-4">Title / Summary</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Building & Room</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Technician</th>
                  <th className="py-3.5 px-4">Reported</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      #{issue.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <Link
                        to={`/admin/issues/${issue._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
                      >
                        {issue.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 block truncate">
                        By {issue.reportedBy?.name || 'Student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {issue.category}
                    </td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate text-slate-600">
                      {issue.building?.name || 'Campus'} • {issue.location}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {issue.assignedTo?.name ? (
                        <div>
                          <span className="font-semibold text-slate-900 block">{issue.assignedTo.name}</span>
                          <span className="text-[10px] text-slate-400">{issue.department?.name || 'Technician'}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(issue.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setAssignIssue(issue)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                        title="Dispatch / Reassign Staff"
                      >
                        Dispatch
                      </button>
                      <Link
                        to={`/admin/issues/${issue._id}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 inline-block transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteIssueTarget(issue)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete Complaint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Showing page <span className="font-bold text-slate-800">{page}</span> of{' '}
                <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign Staff Modal */}
      {assignIssue && (
        <AssignStaffModal
          isOpen={!!assignIssue}
          onClose={() => setAssignIssue(null)}
          issue={assignIssue}
          onAssignedSuccess={() => {
            fetchIssues();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteIssueTarget && (
        <ConfirmDialog
          isOpen={!!deleteIssueTarget}
          onClose={() => setDeleteIssueTarget(null)}
          onConfirm={handleDeleteIssue}
          loading={deleting}
          title="Delete Complaint Record"
          message={`Are you sure you want to permanently delete complaint #${deleteIssueTarget.complaintId} ("${deleteIssueTarget.title}") and all its timeline history?`}
        />
      )}
    </div>
  );
};
