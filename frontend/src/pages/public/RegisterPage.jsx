import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

/* ─── 3D Isometric Architectural Campus Structures (Replacing Diamonds) ─── */

const CampusStructureTopLeft = () => (
  <svg
    className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_12px_24px_rgba(34,211,238,0.25)] select-none pointer-events-none transform -rotate-6"
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Isometric Tech Tower / Building Module */}
    {/* Top Roof Plane */}
    <polygon points="80,20 130,48 80,76 30,48" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.4" />
    <polygon points="80,30 115,50 80,70 45,50" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />

    {/* Left Isometric Wall */}
    <polygon points="30,48 80,76 80,135 30,107" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.4" />
    {/* Glass Floor Lines on Left Wall */}
    <line x1="30" y1="68" x2="80" y2="96" stroke="#cffafe" strokeWidth="1.2" strokeOpacity="0.7" />
    <line x1="30" y1="88" x2="80" y2="116" stroke="#cffafe" strokeWidth="1.2" strokeOpacity="0.7" />

    {/* Right Isometric Wall */}
    <polygon points="80,76 130,48 130,107 80,135" fill="#0284c7" stroke="#0369a1" strokeWidth="1.4" />
    {/* Glass Floor Lines on Right Wall */}
    <line x1="80" y1="96" x2="130" y2="68" stroke="#7dd3fc" strokeWidth="1.2" strokeOpacity="0.7" />
    <line x1="80" y1="116" x2="130" y2="88" stroke="#7dd3fc" strokeWidth="1.2" strokeOpacity="0.7" />

    {/* Modern Beacon Pillar on top */}
    <polygon points="80,8 86,14 80,20 74,14" fill="#a5f3fc" stroke="#38bdf8" strokeWidth="1" />
    <line x1="80" y1="2" x2="80" y2="8" stroke="#38bdf8" strokeWidth="1.5" />
  </svg>
);

const CampusStructureBottomLeft = () => (
  <svg
    className="w-56 h-56 sm:w-72 sm:h-72 drop-shadow-[0_20px_40px_rgba(6,182,212,0.3)] select-none pointer-events-none transform rotate-3"
    viewBox="0 0 260 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Complex 3D Isometric Campus Facility / Geodesic Architectural Hub */}
    {/* Main Top Platform */}
    <polygon points="130,25 215,74 130,123 45,74" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.6" />
    {/* Top Geometric Inset Pavilion */}
    <polygon points="130,45 185,76 130,108 75,76" fill="#cffafe" stroke="#0284c7" strokeWidth="1.2" />

    {/* Left Front Facade */}
    <polygon points="45,74 130,123 130,215 45,166" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.6" />
    {/* Architectural Windows / Louvers Left */}
    <polygon points="55,95 85,112 85,160 55,143" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <polygon points="95,118 120,132 120,180 95,166" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />

    {/* Right Front Facade */}
    <polygon points="130,123 215,74 215,166 130,215" fill="#0369a1" stroke="#075985" strokeWidth="1.6" />
    {/* Architectural Windows / Louvers Right */}
    <polygon points="140,132 165,118 165,166 140,180" fill="#0284c7" stroke="#67e8f9" strokeWidth="1" />
    <polygon points="175,112 205,95 205,143 175,160" fill="#0284c7" stroke="#67e8f9" strokeWidth="1" />

    {/* Secondary Ground Terrace */}
    <polygon points="130,215 215,166 240,180 155,230" fill="#075985" stroke="#0c4a6e" strokeWidth="1.2" />
    <polygon points="45,166 130,215 155,230 70,180" fill="#0369a1" stroke="#075985" strokeWidth="1.2" />
  </svg>
);

const CampusStructureTopRight = () => (
  <svg
    className="w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] select-none pointer-events-none drop-shadow-[0_25px_50px_rgba(56,189,248,0.2)] opacity-95"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Grand Isometric Campus Tech Dome / Polyhedral Engineering Framework */}
    <polygon points="200,40 350,120 220,165 70,85" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.8" />
    <polygon points="350,120 380,260 250,305 220,165" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.8" />
    <polygon points="70,85 220,165 190,305 40,225" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.8" />

    {/* Lower Isometric Terraces */}
    <polygon points="190,305 250,305 210,380 150,380" fill="#0284c7" stroke="#0369a1" strokeWidth="1.8" />
    <polygon points="250,305 380,260 340,335 210,380" fill="#0369a1" stroke="#075985" strokeWidth="1.8" />
    <polygon points="40,225 190,305 150,380 0,300" fill="#0369a1" stroke="#075985" strokeWidth="1.8" />

    {/* Internal Architectural Grid Accents */}
    <line x1="200" y1="40" x2="220" y2="165" stroke="#0284c7" strokeWidth="1.4" strokeDasharray="4,4" />
    <line x1="70" y1="85" x2="350" y2="120" stroke="#bae6fd" strokeWidth="1.4" strokeDasharray="4,4" />
    <circle cx="220" cy="165" r="5" fill="#a5f3fc" stroke="#0284c7" strokeWidth="1.5" />
  </svg>
);

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      error('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const res = await register({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone.trim(),
        studentId: studentId.trim(),
        role: 'student',
      });

      if (res.requiresVerification) {
        success(res.message || 'Registration initiated! Please enter the 6-digit code sent to your email.');
        navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
      } else {
        success(`Welcome to CampusFix, ${res.user?.name || name}! Your account is ready.`);
        navigate('/student/dashboard');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#152a6b] overflow-hidden flex flex-col justify-between font-sans selection:bg-cyan-300 selection:text-slate-900">
      {/* ─── 3D Isometric Architectural Campus Graphics (Replacing Diamonds) ─── */}
      <div className="absolute top-6 left-24 sm:left-32 z-0">
        <CampusStructureTopLeft />
      </div>

      <div className="absolute -bottom-8 -left-8 sm:-bottom-12 sm:left-4 z-0">
        <CampusStructureBottomLeft />
      </div>

      <div className="absolute -top-12 -right-12 sm:-top-16 sm:-right-8 z-0">
        <CampusStructureTopRight />
      </div>

      {/* ─── Header: Brand Logo 'campusfix.' ─── */}
      <header className="relative z-10 w-full pt-8 px-8 sm:pt-10 sm:px-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          campusfix<span className="text-cyan-400">.</span>
        </Link>

        {/* Existing Member Sign In Link */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-full border border-white/20 backdrop-blur-md transition-all shadow-sm"
        >
          <span>Have an account?</span>
          <span className="text-cyan-300 underline font-bold">Log in</span>
        </Link>
      </header>

      {/* ─── Main Content Split Layout ─── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-14 flex flex-col lg:flex-row items-center justify-between py-10 lg:py-14 gap-12 lg:gap-8">
        
        {/* ─── Left Column: Hero Text ─── */}
        <div className="w-full lg:max-w-xl text-left select-none">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-[1.18]">
            Join the smart campus network with complete confidence
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal max-w-lg">
            Create your verified student account to report facility breakdowns, receive automatic technician dispatch updates, and track resolutions in real time.
          </p>

          <div className="mt-6 flex items-center gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-base sm:text-lg font-medium text-white hover:text-cyan-200 transition-colors group"
            >
              <span>Learn more</span>
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* ─── Right Column: Deel-Style Floating White Sign Up Card ─── */}
        <div className="w-full lg:max-w-[460px] flex justify-center">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] p-7 sm:p-9 w-full border border-slate-100/60">
            {/* Card Heading */}
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 text-center tracking-tight mb-1">
              Create an account
            </h2>
            <p className="text-xs text-slate-500 font-medium text-center mb-6">
              Sign up using your campus details
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Campus Email Address */}
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Campus email address (e.g. name@srmist.edu.in)"
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Student Roll ID and Phone in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Roll / Student ID"
                    className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className="w-full pl-3.5 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-snug pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Official student accounts get instant verification and campus facility access.
                </span>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Bottom Footer: Already have an account? Log In */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Bottom Spacer / Copyright ─── */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-white/50 select-none">
        &copy; {new Date().getFullYear()} CampusFix &bull; SRM Institute of Science and Technology
      </footer>
    </div>
  );
};
