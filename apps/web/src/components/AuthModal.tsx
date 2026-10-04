import React, { useState } from 'react';
import { User, Lock, Mail, Loader2, Sparkles, X } from 'lucide-react';
import { api, type AuthResponse } from '../lib/api';
import { SiftLogo } from './SiftLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res: AuthResponse;
      if (isRegister) {
        res = await api.register(email, password, name || undefined);
      } else {
        res = await api.login(email, password);
      }
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login('demo@sift.internal', 'demopassword123');
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-border max-w-md w-full shadow-2xl space-y-6 relative text-on-surface">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex justify-center">
            <SiftLogo size="sm" showWordmark={false} />
          </div>
          <h2 className="text-2xl font-headline font-semibold text-on-surface">
            {isRegister ? 'Create Your Account' : 'Welcome to Sift'}
          </h2>
          <p className="text-xs text-secondary font-light">
            {isRegister
              ? 'Get 2 free opportunity analyses per account lifetime.'
              : 'Sign in to access your synthesis archives and empirical protocols.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs border border-error/20">
            {error}
          </div>
        )}

        {/* Demo Account Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-primary-fixed/50 hover:bg-primary-fixed border border-primary/20 text-primary font-label-md font-semibold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Quick Login: Seeded Demo Account (PRD §83)</span>
        </button>

        <div className="flex items-center gap-3 text-secondary text-xs my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="font-label-sm uppercase tracking-wider text-[10px]">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Researcher or Founder Name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@institute.org"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold text-xs shadow-[0_2px_10px_-2px_rgba(160,58,25,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              'Create Account (2 Free Analyses)'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {isRegister
              ? 'Already have an account? Sign in instead.'
              : "Don't have an account? Register with 2 free passes."}
          </button>
        </div>
      </div>
    </div>
  );
};
