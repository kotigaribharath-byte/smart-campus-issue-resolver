import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';

export const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 relative selection:bg-blue-100 selection:text-blue-900">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Top Navbar */}
      <Navbar onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

      {/* Body with Sidebar & Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {isAuthenticated && (
          <Sidebar
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 transition-all">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
