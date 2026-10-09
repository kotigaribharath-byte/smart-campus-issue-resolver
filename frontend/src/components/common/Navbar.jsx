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
  X,
  PlusCircle,
  LayoutDashboard,
  ClipboardList,
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
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Mobile toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  CampusFix
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Smart Campus
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Fast Report Button for Student */}
                {isStudent && (
                  <Link
                    to="/student/report"
                    className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all hover:shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report Issue
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
                    className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <img
                      src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                        {user?.name}
                      </p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                        {user?.role}
                      </span>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 p-2 transform opacity-100 scale-100 transition-all"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile & Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
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
