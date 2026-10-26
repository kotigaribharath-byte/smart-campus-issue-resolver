import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* Floating Rounded Navbar with Hover Dropdowns */}
      <Navbar />

      {/* Main Content Full Width Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-12 transition-all">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
