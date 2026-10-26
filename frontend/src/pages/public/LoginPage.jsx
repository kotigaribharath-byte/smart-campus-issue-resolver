import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  Loader2,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

/* ─── Geometric Faceted Gemstones Matching Reference Design ─── */

const GemTopLeft = () => (
  <svg
    className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_10px_20px_rgba(34,211,238,0.25)] select-none pointer-events-none transform -rotate-12"
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Upper table & crown facets */}
    <polygon points="80,15 125,55 80,45 35,55" fill="#cffafe" stroke="#38bdf8" strokeWidth="1.2" />
    <polygon points="80,15 35,55 20,85" fill="#a5f3fc" stroke="#38bdf8" strokeWidth="1.2" />
    <polygon points="80,15 125,55 140,85" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.2" />
    <polygon points="80,45 125,55 105,95 80,90" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.2" />
    <polygon points="80,45 35,55 55,95 80,90" fill="#67e8f9" stroke="#0284c7" strokeWidth="1.2" />
    {/* Girdle & pavilion facets */}
    <polygon points="35,55 20,85 55,95" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.2" />
    <polygon points="125,55 140,85 105,95" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.2" />
    <polygon points="55,95 80,90 80,145" fill="#22d3ee" stroke="#0369a1" strokeWidth="1.2" />
    <polygon points="105,95 80,90 80,145" fill="#0ea5e9" stroke="#0369a1" strokeWidth="1.2" />
    <polygon points="20,85 55,95 80,145" fill="#0284c7" stroke="#075985" strokeWidth="1.2" />
    <polygon points="140,85 105,95 80,145" fill="#0369a1" stroke="#075985" strokeWidth="1.2" />
  </svg>
);

const GemBottomLeft = () => (
  <svg
    className="w-56 h-56 sm:w-72 sm:h-72 drop-shadow-[0_20px_40px_rgba(6,182,212,0.3)] select-none pointer-events-none transform -rotate-6"
    viewBox="0 0 260 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top crown facets */}
    <polygon points="130,20 205,65 130,60 55,65" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.4" />
    <polygon points="130,20 55,65 25,115" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.4" />
    <polygon points="130,20 205,65 235,115" fill="#cffafe" stroke="#38bdf8" strokeWidth="1.4" />
    <polygon points="130,60 205,65 175,135 130,125" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.4" />
    <polygon points="130,60 55,65 85,135 130,125" fill="#a5f3fc" stroke="#0284c7" strokeWidth="1.4" />
    {/* Pavilion & side facets */}
    <polygon points="55,65 25,115 85,135" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.4" />
    <polygon points="205,65 235,115 175,135" fill="#67e8f9" stroke="#0369a1" strokeWidth="1.4" />
    <polygon points="85,135 130,125 130,235" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.4" />
    <polygon points="175,135 130,125 130,235" fill="#0284c7" stroke="#0369a1" strokeWidth="1.4" />
    <polygon points="25,115 85,135 130,235" fill="#0369a1" stroke="#075985" strokeWidth="1.4" />
    <polygon points="235,115 175,135 130,235" fill="#075985" stroke="#0c4a6e" strokeWidth="1.4" />
  </svg>
);

const GemTopRight = () => (
  <svg
    className="w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] select-none pointer-events-none drop-shadow-[0_25px_50px_rgba(56,189,248,0.2)] opacity-95"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Giant cut facet geometry */}
    <polygon points="200,30 360,110 240,150 90,80" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.8" />
    <polygon points="360,110 390,260 270,300 240,150" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.8" />
    <polygon points="200,30 360,110 390,260" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.8" />
    <polygon points="90,80 240,150 170,320 40,210" fill="#a5f3fc" stroke="#0284c7" strokeWidth="1.8" />
    <polygon points="240,150 270,300 170,320" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.8" />
    <polygon points="40,210 170,320 200,390" fill="#0284c7" stroke="#0369a1" strokeWidth="1.8" />
    <polygon points="270,300 170,320 200,390" fill="#0369a1" stroke="#075985" strokeWidth="1.8" />
    <polygon points="270,300 390,260 200,390" fill="#075985" stroke="#0c4a6e" strokeWidth="1.8" />
  </svg>
);

export const LoginPage = () => {
  // Navigation & context hooks
  const { login, sendLoginCode, loginWithCode } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'code' (SRMIST OTP) or 'password' (standard login)
  const [loginMode, setLoginMode] = useState('code');

  // Password login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // SRMIST Code login state
  const [srmEmail, setSrmEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  // Quick Demo Dropdown Toggle
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const from = location.state?.from?.pathname;

  // Handle countdown for resending code
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Navigate after successful authentication
  const handleRedirectAfterLogin = (user) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  /* ─── Mode 1: Login with Password ─── */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      success(`Welcome back, ${res.user.name}!`);
      handleRedirectAfterLogin(res.user);
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        error(err.response.data.message || 'Please verify your email address to log in.');
        navigate(`/verify-email?email=${encodeURIComponent(err.response.data.email || email)}`);
        return;
      }
      error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Mode 2: Send Login Code to SRMIST Email ─── */
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();

    const cleanEmail = srmEmail.trim().toLowerCase();
    if (!cleanEmail) {
      error('Please enter your official SRMIST email address.');
      return;
    }

    // Strict validation for @srmist.edu.in
    if (!cleanEmail.endsWith('@srmist.edu.in')) {
      error('Login codes can only be sent to official SRMIST campus emails ending with @srmist.edu.in.');
      return;
    }

    try {
      setSendingCode(true);
      const res = await sendLoginCode(cleanEmail);
      setCodeSent(true);
      setResendCooldown(60);
      success(res.message || '6-digit login code has been sent to your @srmist.edu.in inbox!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to dispatch login code. Please try again.');
    } finally {
      setSendingCode(false);
    }
  };

  /* ─── Mode 2: Verify Login Code ─── */
  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = srmEmail.trim().toLowerCase();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length < 6) {
      error('Please enter the 6-digit login code.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginWithCode({ email: cleanEmail, code: cleanCode });
      success(`Welcome to CampusFix, ${res.user.name}!`);
      handleRedirectAfterLogin(res.user);
    } catch (err) {
      error(err.response?.data?.message || 'Invalid or expired login code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-fill helper
  const fillDemo = (role) => {
    setLoginMode('password');
    setShowDemoMenu(false);
    if (role === 'admin') {
      setEmail('admin@campusfix.edu');
      setPassword('Admin@123');
    } else if (role === 'staff') {
      setEmail('staff.elec@campusfix.edu');
      setPassword('Staff@123');
    } else {
      setEmail('student1@campusfix.edu');
      setPassword('Student@123');
    }
    success(`Filled ${role.toUpperCase()} demo credentials.`);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#152a6b] overflow-hidden flex flex-col justify-between font-sans selection:bg-cyan-300 selection:text-slate-900">
      {/* ─── Background Faceted Geometric Jewels (Matching Reference Screenshot) ─── */}
      <div className="absolute top-6 left-24 sm:left-32 z-0">
        <GemTopLeft />
      </div>

      <div className="absolute -bottom-8 -left-8 sm:-bottom-12 sm:left-4 z-0">
        <GemBottomLeft />
      </div>

      <div className="absolute -top-12 -right-12 sm:-top-16 sm:-right-8 z-0">
        <GemTopRight />
      </div>

      {/* ─── Header: Brand Logo 'campusfix.' ─── */}
      <header className="relative z-10 w-full pt-8 px-8 sm:pt-10 sm:px-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          campusfix<span className="text-cyan-400">.</span>
        </Link>

        {/* Quick Demo Credentials Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-md transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Demo Accounts</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showDemoMenu ? 'rotate-180' : ''}`} />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-slate-800">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Quick Fill Logins
              </div>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="font-medium text-slate-700">Campus Admin</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff')}
                className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="font-medium text-slate-700">Maintenance Staff</span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Staff</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="font-medium text-slate-700">SRM Student</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Student</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── Main Content Split Layout ─── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-14 flex flex-col lg:flex-row items-center justify-between py-10 lg:py-16 gap-12 lg:gap-8">
        
        {/* ─── Left Column: Hero Text ─── */}
        <div className="w-full lg:max-w-xl text-left select-none">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-[1.18]">
            Resolve campus issues with complete confidence using CampusFix
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal max-w-lg">
            Get instant resolution tracking, automatic department escalation, and real-time maintenance updates when you sign in today.
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

        {/* ─── Right Column: Deel-Style Floating White Login Card ─── */}
        <div className="w-full lg:max-w-[440px] flex justify-center">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] p-7 sm:p-9 w-full border border-slate-100/60">
            {/* Card Heading */}
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 text-center tracking-tight mb-5">
              Log in
            </h2>

            {/* Login Mode Toggle Tabs (Code vs Password) */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('code');
                  setCodeSent(false);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMode === 'code'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Login with Code
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMode === 'password'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Login with Password
              </button>
            </div>

            {/* ════════════ MODE 1: LOGIN WITH CODE (OFFICIAL @SRMIST.EDU.IN) ════════════ */}
            {loginMode === 'code' && (
              <div>
                {!codeSent ? (
                  /* Step 1: Input Official SRMIST Email */
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="text-left">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official SRMIST Email
                      </label>
                      <input
                        type="email"
                        required
                        value={srmEmail}
                        onChange={(e) => setSrmEmail(e.target.value)}
                        placeholder="yourname@srmist.edu.in"
                        className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500 leading-snug">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>
                          Security code will only be dispatched to official emails ending with{' '}
                          <strong className="text-blue-700 font-semibold">@srmist.edu.in</strong>.
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingCode || !srmEmail}
                      className="w-full mt-2 py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendingCode ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending One-Time Code...
                        </>
                      ) : (
                        'Send Login Code'
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Enter 6-digit Code */
                  <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                    <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Code sent to your SRM inbox
                      </div>
                      <p className="text-[12px] text-blue-700 mt-1 break-all">
                        {srmEmail}
                      </p>
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        6-Digit Security Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        autoFocus
                        className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-center tracking-[8px] font-mono text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying Code...
                        </>
                      ) : (
                        'Log In with Code'
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={resendCooldown > 0 || sendingCode}
                        className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${sendingCode ? 'animate-spin' : ''}`} />
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCodeSent(false);
                          setOtpCode('');
                        }}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        Change email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ════════════ MODE 2: LOGIN WITH PASSWORD (DEEL EXACT LAYOUT) ════════════ */}
            {loginMode === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                <div className="text-xs text-slate-500 font-medium text-center pb-1">
                  Log in using email address
                </div>

                {/* Email Address */}
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Log In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>
            )}

            {/* Bottom Footer: Need to create an account? Sign Up */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              Need to create an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800">
                Sign Up
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
