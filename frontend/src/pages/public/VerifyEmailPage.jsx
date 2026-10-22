import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2, ShieldCheck, Edit3 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);

  // 6-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const { verifyEmail, resendOtp } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus on the first input on load
  useEffect(() => {
    if (!isEditingEmail && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isEditingEmail]);

  // Handle OTP digit changes
  const handleChange = (index, value) => {
    // Only accept numeric input
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Handle single character
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input if filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    } else {
      error('Please paste a valid 6-digit verification code.');
    }
  };

  const fullCode = otp.join('');

  // Submit verification code
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      error('Please provide your email address.');
      setIsEditingEmail(true);
      return;
    }

    if (fullCode.length !== 6) {
      error('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyEmail({ email: email.trim().toLowerCase(), otp: fullCode });
      success(res.message || 'Email verified successfully! Welcome to CampusFix.');

      // Redirect based on user role
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user?.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResend = async () => {
    if (!canResend || resending) return;

    if (!email) {
      error('Please enter your email address first.');
      setIsEditingEmail(true);
      return;
    }

    try {
      setResending(true);
      const res = await resendOtp({ email: email.trim().toLowerCase(), type: 'REGISTER' });
      info(res.message || 'A fresh verification code has been dispatched.');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header icon and title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner text-indigo-600 mb-3">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          We’ve sent a 6-digit confirmation code to your campus email inbox.
        </p>
      </div>

      {/* Email Display & Edit Pill */}
      <div className="mb-6 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
        {isEditingEmail ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setIsEditingEmail(false)}
              className="text-xs px-2.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 truncate">{email || 'No email provided'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Change
            </button>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6-box OTP Input */}
        <div>
          <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Enter 6-Digit Code
          </label>
          <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all focus:outline-none ${
                  digit
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || fullCode.length !== 6}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying Code...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Verify & Complete Registration
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend Section */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 mb-2">
          Didn’t receive the code? Check spam or click below to resend.
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || resending}
          className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
            canResend && !resending
              ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer'
              : 'text-slate-400 cursor-not-allowed'
          }`}
        >
          {resending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sending New Code...
            </>
          ) : canResend ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Resend Code Now
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Resend Code in {countdown}s
            </>
          )}
        </button>
      </div>

      {/* Back to sign in */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Already verified?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
          Sign In
        </Link>
      </div>
    </div>
  );
};
