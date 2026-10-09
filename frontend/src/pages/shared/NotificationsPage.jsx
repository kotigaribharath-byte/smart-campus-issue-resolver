import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIssueLink = (issueId) => {
    if (!issueId) return '#';
    const id = issueId._id || issueId;
    if (user?.role === 'admin') return `/admin/issues/${id}`;
    if (user?.role === 'staff') return `/staff/issues/${id}`;
    return `/student/issues/${id}`;
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'reopened':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-sky-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Activity & Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status alerts, assignment dispatches, and technician comments
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No notifications in this view.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 transition-colors ${
                  !notif.read ? 'bg-indigo-50/40 -mx-6 px-6 rounded-2xl' : ''
                }`}
              >
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs text-slate-900 leading-relaxed ${!notif.read ? 'font-bold' : 'font-normal'}`}>
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(notif.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.issueId && (
                    <Link
                      to={getIssueLink(notif.issueId)}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif._id);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-slate-500 transition-colors text-xs font-bold flex items-center gap-1"
                      title="Open Complaint"
                    >
                      <span className="hidden sm:inline">View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
