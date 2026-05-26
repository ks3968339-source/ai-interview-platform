import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function AuthOverlay({ onAuthSuccess, apiBaseUrl }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password.');
      return false;
    }
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      const endpoint = isLogin ? `${apiBaseUrl}/users/login` : `${apiBaseUrl}/users/signup`;
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Trigger standard local storage persistence and pass login state up
      onAuthSuccess(data.user, data.token);

    } catch (err) {
      console.error('❌ Authentication failure:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#03060f]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      
      {/* Decorative radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main glass card container */}
      <div className="relative w-full max-w-md bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/40 p-8 md:p-10 rounded-[32px] shadow-2xl shadow-indigo-950/20 overflow-hidden transition-all duration-300">
        
        {/* Glow-border header indicator */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />
        
        {/* Brand/Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-4 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
            {isLogin ? 'Sign In to TalentFlow' : 'Create Practice Account'}
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px]">
            {isLogin 
              ? 'Enter your credentials to access your personal dashboard arena.' 
              : 'Join the premier AI-driven workstation for technical preparation.'}
          </p>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-2xl flex items-start gap-3 mb-6 text-xs text-rose-400 leading-relaxed animate-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Sign Up only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
                required
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••"
                required
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  required
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

        </form>

        {/* Tab switcher */}
        <div className="mt-8 text-center text-xs text-slate-400">
          {isLogin ? (
            <p>
              New to TalentFlow?{' '}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
