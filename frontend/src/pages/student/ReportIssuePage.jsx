import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildingService } from '../../services/buildingService';
import { issueService } from '../../services/issueService';
import { useToast } from '../../hooks/useToast';
import { ImageUploadZone } from '../../components/common/ImageUploadZone';
import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  CATEGORY_DEPARTMENT_SUGGESTION,
} from '../../utils/constants';
import {
  PlusCircle,
  Building2,
  MapPin,
  Flame,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export const ReportIssuePage = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [buildingId, setBuildingId] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [floor, setFloor] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  const { success, error } = useToast();
  const navigate = useNavigate();

  // Load campus buildings dynamically
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoadingBuildings(true);
        const res = await buildingService.getBuildings();
        if (res.success && res.buildings.length > 0) {
          setBuildings(res.buildings);
          const firstId = res.buildings[0].id || res.buildings[0]._id;
          setBuildingId(firstId);
          setAvailableFloors(res.buildings[0].floors || ['Ground Floor', '1st Floor', '2nd Floor']);
          setFloor(res.buildings[0].floors?.[0] || 'Ground Floor');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  // Update floors when building selection changes
  const handleBuildingChange = (bId) => {
    setBuildingId(bId);
    const selected = buildings.find((b) => (b.id === bId || b._id === bId));
    if (selected && selected.floors) {
      setAvailableFloors(selected.floors);
      setFloor(selected.floors[0] || 'Ground Floor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !buildingId || !floor || !location.trim()) {
      error('Please complete all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await issueService.createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        building: buildingId,
        floor,
        location: location.trim(),
        imageUrls: imageUrls.filter(Boolean),
      });

      if (res.success && res.issue) {
        success(`Complaint #${res.issue.complaintId} submitted successfully!`);
        navigate(`/student/issues/${res.issue.id || res.issue._id}`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit complaint. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedDept = CATEGORY_DEPARTMENT_SUGGESTION[category] || 'General Maintenance';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Report Campus Facility Issue
            </h1>
            <p className="text-xs text-slate-500">
              Submit a maintenance request with photos. An automated tracking ID will be generated.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Title / Brief Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC unit leaking on row 4 desks in Room 302"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          {/* Category with Smart Routing Suggestion */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-left transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Smart Routing Callout */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-indigo-900 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>
                Smart Department Routing: <span className="text-indigo-700 font-extrabold">{suggestedDept}</span>
              </span>
            </div>
          </div>

          {/* Building & Floor Dropdowns (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Building */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Building <span className="text-rose-500">*</span>
              </label>
              {loadingBuildings ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={buildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {buildings.map((b) => {
                    const bVal = b.id || b._id;
                    return (
                      <option key={bVal} value={bVal}>
                        {b.name} {b.block ? `(${b.block})` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Floor (Dynamically updated) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Floor Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {availableFloors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exact Location / Room */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Exact Room / Lab / Area Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Database Lab 204, Quiet Study Section B, Room 402"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ISSUE_PRIORITIES.map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      isSelected
                        ? p === 'Critical'
                          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                          : p === 'High'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p === 'Critical' && '🔥 '}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the issue, when it started, safety risks, or symptoms..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          {/* Image Upload Zone */}
          <ImageUploadZone
            label="Attach Issue Photo (Recommended)"
            onImageUploaded={(url) => setImageUrls(url ? [url] : [])}
          />

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Complaint...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Campus Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
