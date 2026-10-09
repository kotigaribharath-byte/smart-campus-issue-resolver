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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {isAuthenticated && (
          <Sidebar
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
