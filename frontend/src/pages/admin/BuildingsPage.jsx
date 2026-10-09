import React, { useState, useEffect } from 'react';
import { buildingService } from '../../services/buildingService';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Layers,
  MapPin,
  ClipboardList,
  Loader2,
} from 'lucide-react';

export const BuildingsPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [block, setBlock] = useState('');
  const [floorsInput, setFloorsInput] = useState('Ground Floor, 1st Floor, 2nd Floor, 3rd Floor');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await buildingService.getBuildings();
      if (res.success) {
        setBuildings(res.buildings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleOpenCreate = () => {
    setEditingBuilding(null);
    setName('');
    setBlock('');
    setFloorsInput('Ground Floor, 1st Floor, 2nd Floor, 3rd Floor');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBuilding(b);
    setName(b.name);
    setBlock(b.block || '');
    setFloorsInput(b.floors ? b.floors.join(', ') : '');
    setDescription(b.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedFloors = floorsInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      setSubmitting(true);
      if (editingBuilding) {
        const res = await buildingService.updateBuilding(editingBuilding._id, {
          name: name.trim(),
          block: block.trim(),
          floors: parsedFloors,
          description: description.trim(),
        });
        if (res.success) {
          success('Building details updated.');
          setIsModalOpen(false);
          fetchBuildings();
        }
      } else {
        const res = await buildingService.createBuilding({
          name: name.trim(),
          block: block.trim(),
          floors: parsedFloors,
          description: description.trim(),
        });
        if (res.success) {
          success('New campus building registered.');
          setIsModalOpen(false);
          fetchBuildings();
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
      const res = await buildingService.deleteBuilding(deleteTarget._id);
      if (res.success) {
        success('Building record deleted.');
        setDeleteTarget(null);
        fetchBuildings();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete building.');
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
            <Building2 className="w-6 h-6 text-indigo-600" />
            Campus Buildings & Floor Directories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic blocks, research labs, hostels, and floor mappings for smart routing
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Building
        </button>
      </div>

      {/* Buildings Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching campus facility layout..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buildings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(b)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {b.block || 'Central Wing'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {b.description || 'Primary campus academic and lecture facility.'}
                </p>

                {/* Floor Tags */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Configured Floors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {b.floors?.map((fl, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        {fl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Complaint Volume:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    {b.pendingIssues ?? 0} Pending
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {b.resolvedIssues ?? 0} Fixed
                  </span>
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
          title={editingBuilding ? 'Edit Building Details' : 'Add Campus Building'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Building Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science & Technology Centre"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Block / Wing Identifier
              </label>
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="e.g. Tech Block A, West Wing, Annex"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Floor Levels (Comma separated)
              </label>
              <input
                type="text"
                value={floorsInput}
                onChange={(e) => setFloorsInput(e.target.value)}
                placeholder="Ground Floor, 1st Floor, 2nd Floor, 3rd Floor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Building Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details regarding laboratories, lecture halls, or staff facilities..."
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
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Building'}
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
          title="Delete Building"
          message={`Are you sure you want to delete ${deleteTarget.name}?`}
        />
      )}
    </div>
  );
};
