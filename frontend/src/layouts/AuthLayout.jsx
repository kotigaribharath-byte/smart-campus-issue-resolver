import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';
import { DemoAccountSwitcher } from '../components/common/DemoAccountSwitcher';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Demo Account Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <DemoAccountSwitcher />
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            CampusFix
          </span>
        </Link>
        <p className="mt-2 text-xs font-semibold text-indigo-200 tracking-wide uppercase">
          Smart Campus Issue Resolver & Facility Platform
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
