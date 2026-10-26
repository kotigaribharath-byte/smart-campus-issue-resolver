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
  HelpCircle,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, isStudent, isStaff, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavSections = () => {
    if (isAdmin) {
      return [
        {
          title: 'MANAGEMENT',
          links: [
            { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'All Complaints', to: '/admin/issues', icon: ClipboardList },
            { label: 'User Directory', to: '/admin/users', icon: Users },
          ],
        },
        {
          title: 'INFRASTRUCTURE',
          links: [
            { label: 'Departments', to: '/admin/departments', icon: Layers },
            { label: 'Buildings & Floors', to: '/admin/buildings', icon: Building2 },
            { label: 'Analytics & Trends', to: '/admin/analytics', icon: BarChart3 },
            { label: 'Student Feedback', to: '/admin/feedback', icon: Star },
          ],
        },
        {
          title: 'SETTINGS',
          links: [
            { label: 'Notifications', to: '/notifications', icon: Bell },
            { label: 'Profile Settings', to: '/profile', icon: User },
          ],
        },
      ];
    }

    if (isStaff) {
      return [
        {
          title: 'WORKSTATION',
          links: [
            { label: 'Technician Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
            { label: 'Assigned Work Orders', to: '/staff/assigned-issues', icon: Wrench },
          ],
        },
        {
          title: 'SETTINGS',
          links: [
            { label: 'Notifications', to: '/notifications', icon: Bell },
            { label: 'Profile & Skills', to: '/profile', icon: User },
          ],
        },
      ];
    }

    // Student links
    return [
      {
        title: 'MAIN PORTAL',
        links: [
          { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
          { label: 'Report Campus Issue', to: '/student/report', icon: PlusCircle, highlight: true },
          { label: 'My Complaints', to: '/student/my-issues', icon: ClipboardList },
        ],
      },
      {
        title: 'PREFERENCES',
        links: [
          { label: 'Notifications', to: '/notifications', icon: Bell },
          { label: 'My Profile', to: '/profile', icon: User },
        ],
      },
    ];
  };

  const sections = getNavSections();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      
      {/* Role Identity Card */}
      <div className="p-3 m-3 mb-2 rounded-2xl bg-[#0f172a] text-white shadow-lg border border-slate-800/80 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-400/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0f172a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                {user?.role}
              </span>
              {user?.studentId && (
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  • {user.studentId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation list with sections */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200'
                          : link.highlight
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 font-bold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : link.highlight ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="flex-1 truncate">{link.label}</span>
                        {link.highlight && !isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-1.5">
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
