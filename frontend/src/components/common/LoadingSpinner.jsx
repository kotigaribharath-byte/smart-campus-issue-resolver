import React, { useState, useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';

/**
 * 🌟 Full-Screen Branded CampusFix Loading Screen
 */
export const LoadingScreen = ({ message = 'Synchronizing campus services...' }) => {
  const [dots, setDots] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Synchronizing campus facility network...',
    'Verifying active security tokens...',
    'Retrieving real-time dispatch logs...',
    'Loading smart maintenance metrics...',
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none -bottom-20 -right-20" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Orbital Brand Centerpiece */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-8">
          {/* Outer Slow Counter-Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin-reverse-slow" />

          {/* Middle Glowing Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-blue-500 border-b-transparent border-l-transparent animate-spin" />

          {/* Core Shield Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl glow-blue transform hover:scale-105 transition-transform">
            <Shield className="w-8 h-8 text-white fill-white/20" />
          </div>

          {/* Floating Sparkle */}
          <div className="absolute -top-1 -right-1 p-1 bg-cyan-400/20 rounded-full">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
          campusfix<span className="text-cyan-400">.</span>
        </h3>
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1 mb-6">
          Smart Campus Issue Resolver
        </p>

        {/* Dynamic Status Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 p-0.5 overflow-hidden border border-slate-700/60 shadow-inner mb-3">
          <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full animate-shimmer" style={{ width: '100%' }} />
        </div>

        {/* Cycling Status Label */}
        <p className="text-xs font-medium text-slate-300 transition-all duration-300 h-5">
          {message || steps[stepIndex]}{dots}
        </p>
      </div>
    </div>
  );
};

/**
 * 📊 Dashboard Skeleton Loader (Replaces boring spinners during page load)
 */
export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Hero Banner Shimmer */}
    <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 relative overflow-hidden border border-slate-200">
      <div className="w-36 h-5 bg-slate-300 rounded-full mb-3 animate-shimmer" />
      <div className="w-64 h-8 bg-slate-300 rounded-xl mb-3 animate-shimmer" />
      <div className="w-96 max-w-full h-4 bg-slate-300 rounded-lg animate-shimmer" />
    </div>

    {/* 3 Stat Cards Shimmer */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20 h-3.5 bg-slate-200 rounded-md animate-shimmer" />
            <div className="w-10 h-10 bg-slate-100 rounded-xl animate-shimmer" />
          </div>
          <div className="w-16 h-7 bg-slate-300 rounded-lg mb-2 animate-shimmer" />
          <div className="w-28 h-3 bg-slate-200 rounded-md animate-shimmer" />
        </div>
      ))}
    </div>

    {/* Complaints Table Card Shimmer */}
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="w-36 h-5 bg-slate-200 rounded-lg animate-shimmer" />
          <div className="w-52 h-3.5 bg-slate-100 rounded-md animate-shimmer" />
        </div>
        <div className="w-24 h-4 bg-slate-200 rounded-md animate-shimmer" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((r) => (
          <div key={r} className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-shimmer" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * 📦 General Inline Loading Spinner
 */
export const LoadingSpinner = ({ text = 'Loading...', size = 'md', fullScreen = false }) => {
  if (fullScreen) {
    return <LoadingScreen message={text} />;
  }

  const sizeClasses =
    size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-10 h-10 border-3' : 'w-7 h-7 border-2';

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className={`${sizeClasses} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-semibold text-slate-500 tracking-wide">{text}</p>}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-24 animate-shimmer"></div>
      <div className="h-8 w-8 bg-slate-100 rounded-xl animate-shimmer"></div>
    </div>
    <div className="h-6 bg-slate-300 rounded w-16 mb-2 animate-shimmer"></div>
    <div className="h-3 bg-slate-200 rounded w-32 animate-shimmer"></div>
  </div>
);
