import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Users,
  ClipboardList,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartments();
      if (res.success) {
        setDepartments(res.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setCategoryKey('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setCategoryKey(dept.categoryKey || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      if (editingDept) {
        const res = await departmentService.updateDepartment(editingDept._id, {
          name: name.trim(),
          description: description.trim(),
          categoryKey: categoryKey.trim(),
        });
        if (res.success) {
          success('Department updated successfully.');
          setIsModalOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await departmentService.createDepartment({
          name: name.trim(),
          description: description.trim(),
          categoryKey: categoryKey.trim(),
        });
        if (res.success) {
          success('New department added.');
          setIsModalOpen(false);
          fetchDepartments();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await departmentService.deleteDepartment(deleteTarget._id);
      if (res.success) {
        success('Department deleted.');
        setDeleteTarget(null);
        fetchDepartments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            Maintenance & Service Departments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure specialized campus maintenance departments, technician rosters, and routing rules
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching campus departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dept)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {dept.description || 'Specialized campus facility and repair division.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {dept.staffCount ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Staff</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl">
                  <span className="text-xs font-extrabold text-amber-700 block">
                    {dept.pendingIssues ?? 0}
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold uppercase">Pending</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <span className="text-xs font-extrabold text-emerald-700 block">
                    {dept.resolvedIssues ?? 0}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase">Solved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDept ? 'Edit Department' : 'Create New Department'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electrical Department, IT/Network"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category Keyword / Tag
              </label>
              <input
                type="text"
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                placeholder="e.g. Electrical, Wi-Fi, Plumbing"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description & Scope
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities and areas of maintenance covered..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Department'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete Department"
          message={`Are you sure you want to delete ${deleteTarget.name}?`}
        />
      )}
    </div>
  );
};
