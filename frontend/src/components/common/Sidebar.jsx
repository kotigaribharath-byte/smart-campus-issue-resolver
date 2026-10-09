import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  CheckCircle2,
  Users,
  Building2,
  Layers,
  BarChart3,
  Star,
  Bell,
  User,
  LogOut,
  Wrench,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, isStudent, isStaff, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'All Complaints', to: '/admin/issues', icon: ClipboardList },
        { label: 'User Directory', to: '/admin/users', icon: Users },
        { label: 'Departments', to: '/admin/departments', icon: Layers },
        { label: 'Buildings & Floors', to: '/admin/buildings', icon: Building2 },
        { label: 'Analytics & Trends', to: '/admin/analytics', icon: BarChart3 },
        { label: 'Student Feedback', to: '/admin/feedback', icon: Star },
        { label: 'Notifications', to: '/notifications', icon: Bell },
        { label: 'Profile Settings', to: '/profile', icon: User },
      ];
    }

    if (isStaff) {
      return [
        { label: 'Staff Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Work orders', to: '/staff/assigned-issues', icon: Wrench },
        { label: 'Notifications', to: '/notifications', icon: Bell },
        { label: 'Profile & Skills', to: '/profile', icon: User },
      ];
    }

    // Student links
    return [
      { label: 'Student Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Report Campus Issue', to: '/student/report', icon: PlusCircle, highlight: true },
      { label: 'My Complaints', to: '/student/my-issues', icon: ClipboardList },
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'My Profile', to: '/profile', icon: User },
    ];
  };

  const links = getNavLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 w-64">
      {/* Role Identity Card */}
      <div className="p-4 m-3 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-400"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-200">
                {user?.role} {user?.department ? `• ${user.department.name}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : link.highlight
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
