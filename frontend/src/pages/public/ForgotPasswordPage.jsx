import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const { forgotPassword, resetPassword } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Handle digit typing
  const handleDigitChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      if (inputRefs.current[5]) inputRefs.current[5].focus();
    }
  };

  // Step 1: Request reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your campus email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(email.trim().toLowerCase());
      success(res.message || 'If an account exists, a 6-digit reset code was dispatched.');
      setStep(2);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send password reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      error('Please enter the full 6-digit reset code.');
      return;
    }

    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
        newPassword,
      });
      success(res.message || 'Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 shadow-inner text-amber-600 mb-3">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {step === 1 ? 'Forgot Password?' : 'Create New Password'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          {step === 1
            ? 'Enter your registered email to receive a 6-digit recovery code.'
            : `Enter the code sent to ${email} and your new password.`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusfix.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Recovery Code...
              </>
            ) : (
              <>
                Send 6-Digit Reset Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* OTP digits */}
          <div>
            <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              6-Digit Reset Code
            </label>
            <div className="flex justify-center items-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-10 h-12 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none ${
                    digit
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              New Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Reset Password & Sign In
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-800 mt-2 inline-flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change Email / Request New Code
          </button>
        </form>
      )}

      {/* Back to sign in link */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Remember your password?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
