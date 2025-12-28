/**
 * Email Verification Page
 * Enter 4-digit code sent to email
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiCheck, FiRefreshCw } from 'react-icons/fi';
import Loader from '../components/Loader';

const VerifyEmailPage = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  
  const { verifyEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only keep last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setCode(newCode);
      inputRefs[Math.min(pastedData.length, 3)].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 4) {
      toast.error('Please enter the 4-digit code');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyEmail(email, fullCode);
      toast.success(result.message || 'Email verified successfully!');
      navigate('/donate');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResending(true);

    try {
      await resendVerificationCode(email);
      toast.success('Verification code resent!');
      setCountdown(60); // 60 second cooldown
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Feed In Need" className="h-12 w-12 object-contain" />
            <span className="font-bold text-2xl text-primary-600">Feed In Need</span>
          </Link>
          
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-primary-600 text-3xl" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a 4-digit code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || code.join('').length !== 4}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader size="small" color="white" />
              ) : (
                <>
                  <FiCheck />
                  Verify Email
                </>
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="text-primary-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {resending ? (
                  <Loader size="tiny" />
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <FiRefreshCw className="text-sm" />
                    Resend Code
                  </>
                )}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-primary-600">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
