import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { DemoAccountSwitcher } from './DemoAccountSwitcher';
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  User as UserIcon,
  LogOut,
  Shield,
  Layers,
  Building2,
  BarChart3,
  Star,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNavDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isStaff) return '/staff/dashboard';
    return '/student/dashboard';
  };

  // Get nav items for the interactive hamburger dropdown matching Image 2
  const getDropdownNavItems = () => {
    if (isAdmin) {
      return [
        { label: 'Overview Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'All Campus Complaints', to: '/admin/issues', icon: ClipboardList },
        { label: 'User Directory', to: '/admin/users', icon: Users },
        { label: 'Departments & Wings', to: '/admin/departments', icon: Layers },
        { label: 'Buildings & Rooms', to: '/admin/buildings', icon: Building2 },
        { label: 'Resolution Analytics', to: '/admin/analytics', icon: BarChart3 },
        { label: 'Student Ratings & Feedback', to: '/admin/feedback', icon: Star },
        { label: 'Notifications', to: '/notifications', icon: Bell },
        { label: 'Profile & Settings', to: '/profile', icon: UserIcon },
      ];
    }

    if (isStaff) {
      return [
        { label: 'Technician Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Work Orders', to: '/staff/assigned-issues', icon: Wrench },
        { label: 'Notifications', to: '/notifications', icon: Bell },
        { label: 'Profile & Credentials', to: '/profile', icon: UserIcon },
      ];
    }

    // Student Links
    return [
      { label: 'Student Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Report Campus Issue', to: '/student/report', icon: PlusCircle, highlight: true },
      { label: 'My Complaints & Tracking', to: '/student/my-issues', icon: ClipboardList },
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'My Profile & Details', to: '/profile', icon: UserIcon },
    ];
  };

  const dropdownLinks = getDropdownNavItems();

  // User Initials
  const getInitials = (name) => {
    if (!name) return 'CF';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* ─── Left: Hamburger Button with Interactive Dropdown + Brand Logo ─── */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                {/* Hamburger Button (Matching Image 2) */}
                <button
                  type="button"
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isNavDropdownOpen
                      ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  aria-label="Navigation Menu"
                  title="Campus Navigation"
                >
                  {isNavDropdownOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* 🌟 Floating Interactive Dropdown Menu (Exact match to Image 2) 🌟 */}
                {isNavDropdownOpen && (
                  <div className="absolute left-0 mt-2.5 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/90 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      CAMPUS NAVIGATION
                    </div>

                    <div className="space-y-0.5 px-2 mt-1">
                      {dropdownLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.to;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsNavDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : link.highlight
                                ? 'text-blue-600 hover:bg-blue-50/70 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${
                                isActive ? 'text-blue-600' : link.highlight ? 'text-blue-600' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Brand Logo & Name: 'CampusFix 2.0' (Matching Image 2) */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  CampusFix
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-md">
                  2.0
                </span>
              </div>
            </Link>
          </div>

          {/* ─── Center: Sleek Wide Search Bar (Matching Image 2) ─── */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-2">
              <div
                onClick={() => navigate(isStudent ? '/student/my-issues' : isAdmin ? '/admin/issues' : '/staff/assigned-issues')}
                className="w-full flex items-center gap-2.5 px-4 py-2 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs text-slate-500 cursor-pointer transition-all shadow-2xs group"
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="truncate">Search complaints, rooms, technicians, buildings...</span>
              </div>
            </div>
          )}

          {/* ─── Right: Actions & User Profile (Matching Image 2) ─── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Real-time Notification Bell in Circle */}
                <NotificationBell />

                {/* Quick Demo Switcher / Settings */}
                <DemoAccountSwitcher />

                {/* User Profile Pill (Avatar + Name Stack + Caret) */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100/90 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {getInitials(user?.name)}
                    </div>

                    <div className="hidden sm:block text-left leading-tight">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                        {user?.name}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 capitalize">
                        {user?.role === 'student' ? 'SRM Student' : user?.role === 'staff' ? 'Technician' : 'University Admin'}
                      </p>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1.5 border border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
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
