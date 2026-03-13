import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth } from '../firebase';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/features/auth/LoginForm';
import OTPModal from '../components/ui/OTPModal';

// Temporary demo flag: when true, bypass phone auth and go straight to dashboard.
// Temporary demo flag: when true, bypass phone auth and go straight to dashboard.
const DEMO_MODE = false;

const Login = ({ onLoginSuccess }) => {
  const { t, i18n } = useTranslation();
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [authData, setAuthData] = useState({ phoneNumber: '', countryCode: '+91' });
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [sendOtpError, setSendOtpError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const confirmationResultRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerRef = useRef(null);

  const getFullPhoneNumber = (data) =>
    `${data.countryCode.replace(/\s/g, '')}${data.phoneNumber}`;

  const sendOtp = async (data) => {
    const fullPhone = getFullPhoneNumber(data);
    setSendOtpError('');
    setVerifyError('');

    try {
      if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          { size: 'invisible', callback: () => { } }
        );
      }
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) {
        const msg = 'Verification not ready. Please refresh and try again.';
        setSendOtpError(msg);
        return { success: false, error: msg };
      }
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      confirmationResultRef.current = result;
      return { success: true, result };
    } catch (err) {
      const message =
        err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Try again later.'
          : err.message || 'Failed to send code.';
      setSendOtpError(message);
      return { success: false, error: message };
    }
  };

  const handleLoginSubmit = async (data) => {
    if (DEMO_MODE) {
      if (onLoginSuccess) onLoginSuccess('admin');
      return;
    }

    // Hardcoded bypass for Superadmin test number (10 digits)
    if (data.phoneNumber === '1111111111') {
      setAuthData(data);
      setIsOtpOpen(true);
      return;
    }

    if (data.phoneNumber.length !== 10) {
      setSendOtpError('Please enter a valid 10-digit phone number');
      return;
    }
    setSendOtpLoading(true);
    setSendOtpError('');
    const { success } = await sendOtp(data);
    setSendOtpLoading(false);
    if (success) {
      setAuthData(data);
      setIsOtpOpen(true);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setVerifyError('');

    // Superadmin bypass
    if (authData.phoneNumber === '1111111111' && otp === '000000') {
      setIsOtpOpen(false);
      if (onLoginSuccess) onLoginSuccess('superadmin');
      return;
    }

    const conf = confirmationResultRef.current;
    if (!conf) {
      setVerifyError('Session expired. Please request a new code.');
      return;
    }
    try {
      await conf.confirm(otp);
      confirmationResultRef.current = null;
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear?.();
        } catch (_) { }
        recaptchaVerifierRef.current = null;
      }
      setIsOtpOpen(false);
      if (onLoginSuccess) onLoginSuccess('admin');
    } catch (err) {
      const message =
        err.code === 'auth/invalid-verification-code'
          ? 'Invalid code. Please try again.'
          : err.message || 'Verification failed.';
      setVerifyError(message);
    }
  };

  const handleResendOtp = async () => {
    setVerifyError('');
    setSendOtpError('');
    const { success, error } = await sendOtp(authData);
    if (!success) {
      setVerifyError(error || 'Failed to resend. Try again.');
    }
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(nextLng);
  };

  return (
    <AuthLayout backgroundImage="/images/loginscreenimg.svg">
      <div className="w-full relative z-10 flex flex-col h-full justify-center">
        {/* Language Toggle */}
        <div className="flex justify-end mb-8 md:mb-12">
          <button
            onClick={toggleLanguage}
            className="text-sm font-medium text-grayCustom hover:text-primary transition-colors"
          >
            {i18n.language === 'en' ? 'తెలుగు' : 'English'}
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-title font-semibold text-dark mb-3">
            {t('login.title')}
          </h1>
          <p className="text-grayCustom text-body font-normal">
            {t('login.welcome')}
          </p>
        </div>

        <LoginForm
          onSubmit={handleLoginSubmit}
          loading={sendOtpLoading}
          error={sendOtpError}
        />

      </div>

      {/* Hidden container for Firebase reCAPTCHA (phone auth) */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden" />

      {/* Footer */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 text-xs text-[#939393]">
        {t('login.footer')}
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        phoneNumber={authData.phoneNumber}
        countryCode={authData.countryCode}
        verifyError={verifyError}
      />
    </AuthLayout>
  );
};

export default Login;
