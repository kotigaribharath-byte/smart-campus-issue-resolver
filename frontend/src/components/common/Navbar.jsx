import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { DemoAccountSwitcher } from './DemoAccountSwitcher';
import {
  Shield,
  LogOut,
  User as UserIcon,
  Menu,
  PlusCircle,
  LayoutDashboard,
  Search,
  Sparkles,
  Radio,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { user, isAuthenticated, logout, isStudent, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isStaff) return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand & Mobile toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 group-hover:shadow-blue-300 transition-all">
                <Shield className="w-5 h-5 fill-white/10" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                  campusfix<span className="text-blue-600">.</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    <Radio className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
                    SRM Portal
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Quick Facility Search Bar (Visual/Interactive) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div
                onClick={() => navigate(isStudent ? '/student/my-issues' : isAdmin ? '/admin/issues' : '/staff/assigned-issues')}
                className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-400 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span className="text-slate-500">Search issues, locations, technicians...</span>
                </div>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Fast Report Button for Student */}
                {isStudent && (
                  <Link
                    to="/student/report"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-200 hover:shadow-md transition-all hover:scale-102 flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Report Issue</span>
                    <span className="sm:hidden">Report</span>
                  </Link>
                )}

                {/* Quick Demo Switcher */}
                <DemoAccountSwitcher />

                {/* Real-time Notification Bell */}
                <NotificationBell />

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
                  >
                    <img
                      src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/20"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                        {user?.name}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 p-2 transform opacity-100 scale-100 transition-all"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        {user?.studentId && (
                          <span className="inline-block mt-1 text-[10px] font-mono font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                            ID: {user.studentId}
                          </span>
                        )}
                      </div>

                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <DemoAccountSwitcher />
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
