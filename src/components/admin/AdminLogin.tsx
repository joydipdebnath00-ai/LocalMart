import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Shield, Lock, Mail, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle, RefreshCw, Key } from 'lucide-react';
import { validateAdminPasswordRules } from '../../services/crypto';

export const AdminLogin: React.FC = () => {
  const {
    superAdmin,
    isSuperAdminConfigured,
    setupPrimarySuperAdmin,
    loginSuperAdmin,
    resetAdminPassword,
  } = usePlatform();

  // Mode: 'login' | 'first_time_setup' | 'reset_password'
  const [mode, setMode] = useState<'login' | 'first_time_setup' | 'reset_password'>(
    isSuperAdminConfigured ? 'login' : 'first_time_setup'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Live password validation
  const pwdValidation = validateAdminPasswordRules(password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await loginSuperAdmin(email, password, totpCode);
      if (result.success) {
        setSuccessMessage('Authentication successful. Initializing Super Admin Console...');
      } else if (result.requires2FA) {
        setRequires2FA(true);
        setErrorMessage('2-Factor Authentication required. Enter your 6-digit TOTP code (demo code: 123456).');
      } else {
        setErrorMessage(result.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await setupPrimarySuperAdmin(name, email, password);
      if (res.success) {
        setSuccessMessage('Root Super Admin provisioned securely. You are now logged in!');
      } else {
        setErrorMessage(res.error || 'Setup failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Setup error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetAdminPassword(password);
      if (res.success) {
        setSuccessMessage('Password reset successfully! Please log in with your new credentials.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(res.error || 'Password reset failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to fill demo credentials if admin exists
  const fillDemoAdminCreds = () => {
    if (superAdmin) {
      setEmail(superAdmin.email);
    } else {
      setName('Platform Owner');
      setEmail('owner@marketpulse.platform');
      setPassword('Admin@MarketPulse2026!');
      setConfirmPassword('Admin@MarketPulse2026!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Platform Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted access for Platform Owner & Primary Administrators only
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 text-xs text-amber-200/90 flex gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-300">Strict Role Separation</strong>
            Normal customer or shop owner accounts cannot access this command center. Only verified <code className="bg-amber-950/40 px-1 rounded text-amber-200">SUPER_ADMIN</code> credentials permit entry.
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-5 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-5 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode: First Time Setup */}
        {mode === 'first_time_setup' && (
          <form onSubmit={handleFirstTimeSetup} className="space-y-4">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 mb-2">
              <span className="text-xs font-semibold text-emerald-400 block mb-1">
                Initial Super Admin Provisioning
              </span>
              <p className="text-xs text-slate-400">
                Configure your root Super Admin account. Passwords are salted and hashed (PBKDF2/SHA-256) and never saved in plaintext.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Joydip Debnath (Platform Owner)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Owner Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@platform.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password (Enterprise Policy: min 8 chars, A-Z, a-z, 0-9, symbol)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong password"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-1.5 text-[11px]">
                  {pwdValidation.isValid ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Strong password policy met
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {pwdValidation.error}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !pwdValidation.isValid}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Hashing & Initializing...' : 'Initialize Super Admin'}</span>
            </button>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
              <button
                type="button"
                onClick={fillDemoAdminCreds}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Key className="w-3 h-3" /> Auto-fill Secure Demo Credentials
              </button>
              {isSuperAdminConfigured && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="hover:text-slate-200"
                >
                  Already setup? Log in
                </button>
              )}
            </div>
          </form>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Admin Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@marketpulse.platform"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('reset_password')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {requires2FA && (
              <div className="bg-slate-800/80 p-3 rounded-xl border border-indigo-500/40">
                <label className="block text-xs font-medium text-indigo-300 mb-1">
                  Two-Factor Authentication (2FA TOTP Code)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code (demo: 123456)"
                  className="w-full px-3 py-2 bg-slate-900 border border-indigo-500 rounded-lg text-center tracking-widest text-lg text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enter code from your Google Authenticator or demo pass: 123456
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Console'}</span>
            </button>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('first_time_setup');
                  setName('Platform Owner');
                  setEmail('owner@marketpulse.platform');
                  setPassword('Admin@MarketPulse2026!');
                  setConfirmPassword('Admin@MarketPulse2026!');
                }}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset / Quick Provision Demo Admin
              </button>
              <span className="text-slate-500">CLI: python manage.py createsuperadmin</span>
            </div>
          </form>
        )}

        {/* Mode: Reset Password */}
        {mode === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 mb-2">
              <span className="text-xs font-semibold text-amber-400 block mb-1">
                Reset Super Admin Master Password
              </span>
              <p className="text-xs text-slate-400">
                Enter a new password meeting standard complexity requirements.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Strong Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !pwdValidation.isValid}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-emerald-950"
            >
              {isLoading ? 'Updating Hash...' : 'Update Master Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
