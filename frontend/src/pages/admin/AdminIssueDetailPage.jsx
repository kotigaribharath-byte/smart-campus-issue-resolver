import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { issueService } from '../../services/issueService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { IssueTimeline } from '../../components/issues/IssueTimeline';
import { AssignStaffModal } from '../../components/issues/AssignStaffModal';
import { UpdateStatusModal } from '../../components/issues/UpdateStatusModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  User,
  Wrench,
  ShieldCheck,
  Star,
  MessageSquare,
  Send,
  Trash2,
  Image as ImageIcon,
  Edit,
  Phone,
  Mail,
} from 'lucide-react';

export const AdminIssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { success, error } = useToast();

  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchIssueDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssueById(id);
      if (res.success) {
        setIssue(res.issue);
        setTimeline(res.timeline || []);
        setFeedback(res.feedback || null);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchIssueDetails();
  }, [fetchIssueDetails]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket || !issue?._id) return;

    socket.emit('join_issue_room', issue._id);

    const handleStatusUpdate = (data) => {
      if (data.issue && data.issue._id === issue._id) {
        setIssue(data.issue);
        if (data.update) {
          setTimeline((prev) => [...prev, data.update]);
        }
      }
    };

    const handleCommentAdded = (data) => {
      if (data.issueId === issue._id && data.comment) {
        setTimeline((prev) => [...prev, data.comment]);
      }
    };

    socket.on('issue_status_updated', handleStatusUpdate);
    socket.on('issue_comment_added', handleCommentAdded);

    return () => {
      socket.emit('leave_issue_room', issue._id);
      socket.off('issue_status_updated', handleStatusUpdate);
      socket.off('issue_comment_added', handleCommentAdded);
    };
  }, [socket, issue?._id]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await issueService.addComment(issue._id, {
        comment: commentText.trim(),
      });
      if (res.success) {
        setCommentText('');
        setTimeline((prev) => [...prev, res.comment]);
        success('Admin remark logged.');
      }
    } catch (err) {
      error('Failed to post remark.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteIssue = async () => {
    try {
      setDeleting(true);
      const res = await issueService.deleteIssue(issue._id);
      if (res.success) {
        success('Complaint permanently removed.');
        navigate('/admin/issues');
      }
    } catch (err) {
      error('Failed to delete issue.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching complaint audit record..." />;
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Complaint record not found.</p>
        <Link to="/admin/issues" className="text-xs font-bold text-indigo-600 mt-2 block">
          ← Return to Master Database
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssignOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Dispatch / Assign Staff
          </button>
          <button
            onClick={() => setIsUpdateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            Override Status
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
              #{issue.complaintId}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {issue.category}
            </span>
            {issue.department && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                Dept: {issue.department.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={issue.priority} size="md" />
            <StatusBadge status={issue.status} size="md" />
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {issue.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>
        </div>

        {/* Location & Metadata Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Building</span>
              <span className="font-semibold">{issue.building?.name || 'Main Campus'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Floor & Location</span>
              <span className="font-semibold">{issue.floor} • {issue.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Logged Timestamp</span>
              <span className="font-semibold">{formatDate(issue.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Photos */}
        {issue.imageUrls && issue.imageUrls.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Complaint Photographic Evidence:
            </span>
            <div className="flex flex-wrap gap-3">
              {issue.imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImage(url)}
                  className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shadow-2xs"
                >
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reporter & Assigned Staff Two-Column Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Reporter Student */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Reported By Student
          </span>
          <div className="flex items-center gap-3">
            <img
              src={issue.reportedBy?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${issue.reportedBy?.name}`}
              alt={issue.reportedBy?.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{issue.reportedBy?.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">{issue.reportedBy?.email}</p>
              {issue.reportedBy?.phone && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {issue.reportedBy.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Staff */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Technician
            </span>
            <button
              onClick={() => setIsAssignOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              {issue.assignedTo ? 'Change' : 'Assign'}
            </button>
          </div>
          {issue.assignedTo ? (
            <div className="flex items-center gap-3">
              <img
                src={issue.assignedTo.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${issue.assignedTo.name}`}
                alt={issue.assignedTo.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{issue.assignedTo.name}</h4>
                <p className="text-[11px] text-indigo-600 font-semibold truncate">
                  {issue.department?.name || 'Technician Specialist'}
                </p>
                {issue.assignedTo.phone && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {issue.assignedTo.phone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-amber-700 font-semibold border border-amber-200 flex items-center justify-between">
              <span>Unassigned</span>
              <button
                onClick={() => setIsAssignOpen(true)}
                className="text-xs font-bold text-amber-900 underline"
              >
                Dispatch Staff Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Student Feedback (if provided) */}
      {feedback && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Student Quality Feedback & Rating
            </h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    feedback.rating >= s
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {feedback.comment && (
            <p className="text-xs text-amber-900 leading-relaxed italic">
              "{feedback.comment}"
            </p>
          )}
        </div>
      )}

      {/* Full Audit Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Complete Complaint Lifecycle & Audit History
        </h2>
        <IssueTimeline timeline={timeline} currentStatus={issue.status} />
      </div>

      {/* Admin Remarks Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          Log Administrative Remark / Directive
        </h3>
        <form onSubmit={handleSendComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type administrative directive, parts approval, or escalation note..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            Log Directive
          </button>
        </form>
      </div>

      {/* Assign Staff Modal */}
      {isAssignOpen && (
        <AssignStaffModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          issue={issue}
          onAssignedSuccess={(updated) => {
            setIssue(updated);
            fetchIssueDetails();
          }}
        />
      )}

      {/* Update Status Modal */}
      {isUpdateOpen && (
        <UpdateStatusModal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          issue={issue}
          onStatusUpdated={(updated) => {
            setIssue(updated);
            fetchIssueDetails();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteIssue}
          loading={deleting}
          title="Delete Complaint"
          message={`Are you sure you want to permanently delete complaint #${issue.complaintId}?`}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title="Complaint Attachment"
          maxWidth="max-w-2xl"
        >
          <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2">
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[70vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
