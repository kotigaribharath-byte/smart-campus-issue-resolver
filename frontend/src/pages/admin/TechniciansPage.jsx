import React, { useState, useEffect, useCallback } from 'react';
import { staffService } from '../../services/staffService';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import {
  Wrench,
  UserPlus,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Zap,
  Droplets,
  Wind,
  Wifi,
  Cpu,
  Layers,
  Clock,
  Shield,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TechniciansPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
    department: '',
    staffId: '',
    active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, deptRes] = await Promise.all([
        staffService.getStaffMembers({
          department: selectedDept !== 'ALL' ? selectedDept : undefined,
        }),
        departmentService.getDepartments(),
      ]);

      if (staffRes.success) setTechnicians(staffRes.staff);
      if (deptRes.success) setDepartments(deptRes.departments);
    } catch (err) {
      console.error(err);
      error('Failed to load technician roster.');
    } finally {
      setLoading(false);
    }
  }, [selectedDept, error]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Open Onboard Modal
  const handleOpenOnboard = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      email: '',
      password: 'Staff@123',
      role: 'staff',
      phone: '',
      department: departments[0]?._id || departments[0]?.id || '',
      staffId: `STF-TEC-${randomSuffix}`,
      active: true,
    });
    setIsOnboardOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      password: '',
      role: 'staff',
      phone: tech.phone || '',
      department: tech.department?._id || tech.department?.id || tech.department || '',
      staffId: tech.staffId || '',
      active: tech.active ?? true,
    });
  };

  // Submit Onboard / Edit Form
  const handleSaveTechnician = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      if (editingTech) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          staffId: formData.staffId,
          active: formData.active,
          role: 'staff',
        };
        if (formData.password) payload.password = formData.password;

        const res = await userService.updateUser(editingTech._id || editingTech.id, payload);
        if (res.success) {
          success(`Technician ${formData.name} updated successfully.`);
          setEditingTech(null);
          fetchTechnicians();
        }
      } else {
        const payload = {
          ...formData,
          role: 'staff',
          isEmailVerified: true,
        };
        const res = await userService.createUser(payload);
        if (res.success) {
          success(`Technician ${formData.name} onboarded successfully!`);
          setIsOnboardOpen(false);
          fetchTechnicians();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save technician record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Technician
  const handleDeleteTechnician = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await userService.deleteUser(deleteTarget._id || deleteTarget.id);
      if (res.success) {
        success('Technician record removed from roster.');
        setDeleteTarget(null);
        fetchTechnicians();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete technician.');
    } finally {
      setDeleting(false);
    }
  };

  // Quick Toggle Active Duty Status
  const handleToggleDuty = async (tech) => {
    try {
      const newStatus = !tech.active;
      const res = await userService.updateUser(tech._id || tech.id, {
        active: newStatus,
      });
      if (res.success) {
        success(`${tech.name} marked as ${newStatus ? 'On Duty' : 'Off Duty'}.`);
        fetchTechnicians();
      }
    } catch (err) {
      error('Failed to update duty status.');
    }
  };

  // Filter technicians by search
  const filteredTechs = technicians.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.staffId?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'ALL' ||
      t.departmentId === selectedDept ||
      t.department?.id === selectedDept ||
      t.department?._id === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Calculate high-level stats
  const totalOnboarded = technicians.length;
  const onDutyCount = technicians.filter((t) => t.active).length;
  const activeWorkloadTotal = technicians.reduce((acc, t) => acc + (t.activeIssuesCount || 0), 0);
  const resolvedWorkloadTotal = technicians.reduce((acc, t) => acc + (t.resolvedIssuesCount || 0), 0);

  const getDeptIcon = (deptName = '') => {
    const d = deptName.toLowerCase();
    if (d.includes('electr') || d.includes('power')) return Zap;
    if (d.includes('plumb') || d.includes('water')) return Droplets;
    if (d.includes('ac') || d.includes('air') || d.includes('hvac')) return Wind;
    if (d.includes('net') || d.includes('wi-fi') || d.includes('wifi')) return Wifi;
    return Cpu;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── 1. Header Hero Banner ─── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wrench className="w-3.5 h-3.5" />
            Technician Fleet Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Technician Onboarding & Fleet Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Onboard certified maintenance technicians, allocate departmental specializations, oversee live task workloads, and manage operational duty shifts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenOnboard}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            + Onboard New Technician
          </button>
          <Link
            to="/admin/issues"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            Work Orders
          </Link>
        </div>
      </div>

      {/* ─── 2. Embedded KPI Stats Strip ─── */}
      <div className="py-5 border-y border-slate-200/90 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 bg-transparent">
        <div className="py-3 px-3 sm:px-5 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            Total Technicians
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalOnboarded}</h3>
          <p className="text-[11px] text-slate-500">Certified roster</p>
        </div>

        <div className="py-3 px-3 sm:px-5 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            Active On-Duty
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{onDutyCount}</h3>
          <p className="text-[11px] text-slate-500">Available for dispatch</p>
        </div>

        <div className="py-3 px-3 sm:px-5 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            Active Work Orders
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-700">{activeWorkloadTotal}</h3>
          <p className="text-[11px] text-slate-500">In-progress repairs</p>
        </div>

        <div className="py-3 px-3 sm:px-5 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
            Lifetime Resolved
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-700">{resolvedWorkloadTotal}</h3>
          <p className="text-[11px] text-slate-500">Verified facility fixes</p>
        </div>
      </div>

      {/* ─── 3. Search & Department Filters ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technician name, staff ID, trade..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none self-stretch sm:self-auto">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedDept === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Departments
          </button>
          {departments.map((dept) => (
            <button
              key={dept._id || dept.id}
              onClick={() => setSelectedDept(dept._id || dept.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedDept === (dept._id || dept.id)
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4. Technician Roster Table ─── */}
      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 mt-2">Loading technician roster...</p>
        </div>
      ) : filteredTechs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Technicians Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {search || selectedDept !== 'ALL'
              ? 'No staff members match the selected filter query.'
              : 'Start by onboarding certified maintenance technicians to auto-dispatch facility issues.'}
          </p>
          <button
            onClick={handleOpenOnboard}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            + Onboard First Technician
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-4">Technician Profile</th>
                  <th className="py-3.5 px-4">Trade Specialization</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Active Workload</th>
                  <th className="py-3.5 px-4">Total Fixed</th>
                  <th className="py-3.5 px-4">Duty Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTechs.map((tech) => {
                  const DeptIcon = getDeptIcon(tech.department?.name);
                  return (
                    <tr key={tech._id || tech.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                            {tech.name?.charAt(0) || 'T'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {tech.name}
                            </span>
                            <span className="font-mono text-[10px] text-indigo-600 font-semibold block">
                              {tech.staffId || 'STF-GEN'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department / Trade */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                          <DeptIcon className="w-3.5 h-3.5 text-blue-600" />
                          {tech.department?.name || 'General Maintenance'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] truncate max-w-[190px]">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{tech.email}</span>
                        </div>
                        {tech.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{tech.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Active Workload */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              (tech.activeIssuesCount || 0) > 3
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : (tech.activeIssuesCount || 0) > 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tech.activeIssuesCount || 0} In Progress
                          </span>
                        </div>
                      </td>

                      {/* Lifetime Resolved */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {tech.resolvedIssuesCount || 0} Issues
                      </td>

                      {/* Duty Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleDuty(tech)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                            tech.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle duty status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tech.active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {tech.active ? 'On Duty' : 'Off Duty'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(tech)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                          title="Edit Technician Specialization"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tech)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                          title="De-roster Technician"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 5. Onboard / Edit Technician Modal ─── */}
      <Modal
        isOpen={isOnboardOpen || !!editingTech}
        onClose={() => {
          setIsOnboardOpen(false);
          setEditingTech(null);
        }}
        title={editingTech ? 'Edit Technician Specialization' : 'Onboard New Maintenance Technician'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveTechnician} className="space-y-4 pt-2">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technician Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rajesh.elec@srmist.edu.in"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Department / Specialization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department Specialization *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="">Select Specialization...</option>
                {departments.map((dept) => (
                  <option key={dept._id || dept.id} value={dept._id || dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Staff ID Tag
              </label>
              <input
                type="text"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                placeholder="STF-ELEC-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98401 23456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {editingTech ? 'Reset Password (optional)' : 'Initial Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingTech ? 'Leave blank to retain' : 'Default: Staff@123'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Duty Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="activeDuty"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="activeDuty" className="text-xs font-medium text-slate-700 cursor-pointer">
              Active On-Duty (Eligible for automated task dispatching)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsOnboardOpen(false);
                setEditingTech(null);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : editingTech ? (
                'Save Changes'
              ) : (
                'Onboard Technician'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── 6. Confirm De-roster Dialog ─── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Technician from Roster"
        message={`Are you sure you want to remove ${deleteTarget?.name} (${deleteTarget?.staffId})? Their active issues will be reverted to unassigned.`}
        confirmText="Remove Technician"
        type="danger"
        isLoading={deleting}
        onConfirm={handleDeleteTechnician}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
