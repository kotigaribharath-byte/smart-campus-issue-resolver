import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { issueService } from '../../services/issueService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { IssueTimeline } from '../../components/issues/IssueTimeline';
import { UpdateStatusModal } from '../../components/issues/UpdateStatusModal';
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
  MessageSquare,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';

export const StaffIssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { success, error } = useToast();

  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
      error(err.response?.data?.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchIssueDetails();
  }, [fetchIssueDetails]);

  // Real-time socket updates
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

    const handleReopened = (data) => {
      if (data.issue && data.issue._id === issue._id) {
        setIssue(data.issue);
        if (data.update) {
          setTimeline((prev) => [...prev, data.update]);
        }
      }
    };

    socket.on('issue_status_updated', handleStatusUpdate);
    socket.on('issue_comment_added', handleCommentAdded);
    socket.on('issue_reopened', handleReopened);

    return () => {
      socket.emit('leave_issue_room', issue._id);
      socket.off('issue_status_updated', handleStatusUpdate);
      socket.off('issue_comment_added', handleCommentAdded);
      socket.off('issue_reopened', handleReopened);
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
        success('Technician note recorded.');
      }
    } catch (err) {
      error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching task specifications..." />;
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Work order could not be located.</p>
        <Link to="/staff/assigned-issues" className="text-xs font-bold text-amber-600 mt-2 block">
          ← Return to Assigned Work Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        {/* Status Update Trigger */}
        <button
          onClick={() => setIsUpdateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-200 transition-all hover:scale-105"
        >
          <Wrench className="w-4 h-4" />
          Update Status & Upload Proof
        </button>
      </div>

      {/* Main Task Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              #{issue.complaintId}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {issue.category}
            </span>
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

        {/* Location & Reported Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Building</span>
              <span className="font-semibold">{issue.building?.name || 'Main Campus'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Floor & Room</span>
              <span className="font-semibold">{issue.floor} • {issue.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatched Date</span>
              <span className="font-semibold">{formatDate(issue.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Student Attachment Photos */}
        {issue.imageUrls && issue.imageUrls.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Student Attached Photos:
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

      {/* Student Reporter Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Reported By Student
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={issue.reportedBy?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${issue.reportedBy?.name}`}
              alt={issue.reportedBy?.name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{issue.reportedBy?.name}</h4>
              <p className="text-xs text-slate-500">Student ID: {issue.reportedBy?.studentId || 'Enrolled'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {issue.reportedBy?.phone && (
              <a
                href={`tel:${issue.reportedBy.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {issue.reportedBy.phone}
              </a>
            )}
            {issue.reportedBy?.email && (
              <a
                href={`mailto:${issue.reportedBy.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                {issue.reportedBy.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Full Work Order Progression
        </h2>
        <IssueTimeline timeline={timeline} currentStatus={issue.status} />
      </div>

      {/* Add Progress Note / Comment Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          Log Maintenance Progress Remark
        </h3>
        <form onSubmit={handleSendComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="e.g. Inspected circuit breaker, parts order placed with facilities..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            Log Note
          </button>
        </form>
      </div>

      {/* Update Status Modal */}
      {isUpdateModalOpen && (
        <UpdateStatusModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          issue={issue}
          onStatusUpdated={(updatedIssue) => {
            setIssue(updatedIssue);
            fetchIssueDetails();
          }}
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
