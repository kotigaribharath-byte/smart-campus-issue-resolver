import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { formatRelativeTime } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'reopened':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden transform opacity-100 scale-100 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    if (!n.read) markAsRead(n._id);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 flex-shrink-0 mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-slate-800 leading-relaxed ${!n.read ? 'font-semibold' : 'font-normal'}`}>
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 block py-1"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
