import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Shield, Wrench, ChevronDown, UserCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoAccountSwitcher = () => {
  const { user, login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState('');

  const demoAccounts = [
    {
      role: 'admin',
      name: 'Campus Admin (Dr. Mitchell)',
      email: 'admin@campusfix.edu',
      password: 'Admin@123',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50',
      badge: 'Admin Full Control',
      redirect: '/admin/dashboard',
    },
    {
      role: 'staff',
      name: 'Alex Vance (Electrician Staff)',
      email: 'staff.elec@campusfix.edu',
      password: 'Staff@123',
      icon: Wrench,
      color: 'text-amber-600 bg-amber-50',
      badge: 'Electrical Staff',
      redirect: '/staff/dashboard',
    },
    {
      role: 'staff',
      name: 'Priya Sharma (Network Staff)',
      email: 'staff.it@campusfix.edu',
      password: 'Staff@123',
      icon: Zap,
      color: 'text-blue-600 bg-blue-50',
      badge: 'IT Staff',
      redirect: '/staff/dashboard',
    },
  ];

  const handleQuickSwitch = async (acc) => {
    try {
      setLoadingRole(acc.email);
      await login({ email: acc.email, password: acc.password });
      success(`Switched to ${acc.name}`);
      setIsOpen(false);
      navigate(acc.redirect);
    } catch (err) {
      error('Failed to switch demo account.');
    } finally {
      setLoadingRole('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 rounded-xl text-xs font-semibold text-indigo-900 shadow-xs transition-all"
        title="Quick Role Demo Switcher"
      >
        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Demo Switcher</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 p-2 transform opacity-100 scale-100 transition-all">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Instant 1-Click Role Switch
            </span>
          </div>
          <div className="space-y-1">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isCurrent = user?.email === acc.email;
              return (
                <button
                  key={acc.email}
                  disabled={loadingRole === acc.email}
                  onClick={() => handleQuickSwitch(acc)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/80 border border-indigo-200 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${acc.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{acc.name}</p>
                    <span className="text-[10px] text-slate-500">{acc.badge}</span>
                  </div>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
