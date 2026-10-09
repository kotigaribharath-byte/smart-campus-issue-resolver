import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import { issueService } from '../../services/issueService';
import { useToast } from '../../hooks/useToast';
import { ISSUE_PRIORITIES } from '../../utils/constants';
import { ShieldCheck, UserCheck, Wrench, AlertCircle, Loader2 } from 'lucide-react';

export const AssignStaffModal = ({
  isOpen,
  onClose,
  issue,
  onAssignedSuccess,
}) => {
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedDept, setSelectedDept] = useState(issue?.department?._id || '');
  const [selectedStaff, setSelectedStaff] = useState(issue?.assignedTo?._id || '');
  const [priority, setPriority] = useState(issue?.priority || 'Medium');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedDept(issue?.department?._id || issue?.department || '');
      setSelectedStaff(issue?.assignedTo?._id || issue?.assignedTo || '');
      setPriority(issue?.priority || 'Medium');
      setComment('');

      const fetchData = async () => {
        try {
          setLoadingData(true);
          const [deptRes, staffRes] = await Promise.all([
            departmentService.getDepartments(),
            staffService.getStaffMembers(),
          ]);

          if (deptRes.success) setDepartments(deptRes.departments);
          if (staffRes.success) setStaffList(staffRes.staff);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingData(false);
        }
      };

      fetchData();
    }
  }, [isOpen, issue]);

  // Filter staff by selected department if department is chosen
  const filteredStaff = selectedDept
    ? staffList.filter((s) => s.department?._id === selectedDept || s.department === selectedDept)
    : staffList;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      error('Please select a maintenance staff technician.');
      return;
    }

    try {
      setLoading(true);
      const res = await issueService.assignStaff(issue._id, {
        staffId: selectedStaff,
        departmentId: selectedDept || undefined,
        priority,
        comment,
      });

      if (res.success) {
        success('Task assigned successfully!');
        if (onAssignedSuccess) onAssignedSuccess(res.issue);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Complaint to Maintenance Staff"
      subtitle={`Complaint #${issue?.complaintId} • ${issue?.title}`}
      maxWidth="max-w-lg"
    >
      {loadingData ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 mt-2">Loading staff roster...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaff(''); // Reset staff selection on dept switch
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.staffCount || 0} Technicians)
                </option>
              ))}
            </select>
          </div>

          {/* Staff Technician Radio List with Workloads */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Available Technicians ({filteredStaff.length})
            </label>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {filteredStaff.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  No staff members available in this department.
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <label
                    key={staff._id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedStaff === staff._id
                        ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="radio"
                        name="staffRadio"
                        value={staff._id}
                        checked={selectedStaff === staff._id}
                        onChange={() => setSelectedStaff(staff._id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <img
                        src={staff.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${staff.name}`}
                        alt={staff.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{staff.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {staff.department?.name || 'General Maintenance'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                        {staff.activeIssuesCount ?? 0} active
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Urgency / Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ISSUE_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    priority === p
                      ? p === 'Critical'
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Admin Note / Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Instructions / Dispatch Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Please bring replacement LED ballasts and inspect floor socket."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStaff}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Assign Task Now
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
