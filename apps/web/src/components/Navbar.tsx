import React, { useState } from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  LogOut,
  Zap,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import type { AuthResponse } from '../lib/api';
import { SiftLogo } from './SiftLogo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  auth: AuthResponse | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenManifesto?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  auth,
  onLogout,
  onOpenAuth,
  isDark,
  onToggleTheme,
  onOpenManifesto,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const freeRemaining = auth?.entitlements?.freeRemaining ?? 2;
  const isSubscribed = auth?.entitlements?.isSubscribed ?? false;

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'manifesto' && onOpenManifesto) {
      onOpenManifesto();
      return;
    }
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md shadow-[0_1px_8px_rgba(44,40,37,0.04)] border-b border-surface-container-high transition-colors duration-200">
      <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand with Sift Wordmark & Emblem */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            aria-label="Sift Home"
          >
            <SiftLogo size="md" />
          </button>
        </div>

        {/* Center Editorial Navigation Links (Matching Stitch Attachment) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8" data-active-classes="text-primary font-medium">
          <button
            onClick={() => scrollToSection('workbench-preview')}
            className={`tracking-wide transition-colors font-label-lg text-sm ${
              currentView === 'landing' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Product
          </button>

          <button
            onClick={() => scrollToSection('philosophy')}
            className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface tracking-wide transition-colors"
          >
            Methodology
          </button>

          <button
            onClick={() => scrollToSection('capabilities')}
            className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface tracking-wide transition-colors"
          >
            Research
          </button>

          <button
            onClick={() => scrollToSection('manifesto')}
            className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface tracking-wide transition-colors"
          >
            Manifesto
          </button>

          <button
            onClick={() => onNavigate('billing')}
            className={`font-label-lg text-label-lg tracking-wide transition-colors ${
              currentView === 'billing' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pricing
          </button>

          {/* Quick Workspace Switcher for SaaS tools */}
          <div className="h-4 w-px bg-surface-container-high mx-1" />

          <button
            onClick={() => onNavigate('dashboard')}
            className={`font-label-sm text-label-sm px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-primary-soft text-primary border-primary/30 font-semibold'
                : 'bg-surface-container-low text-secondary border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dossiers</span>
          </button>

          <button
            onClick={() => onNavigate('experiments')}
            className={`font-label-sm text-label-sm px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
              currentView === 'experiments'
                ? 'bg-primary-soft text-primary border-primary/30 font-semibold'
                : 'bg-surface-container-low text-secondary border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Experiments</span>
          </button>
        </nav>

        {/* Right Action Suite: Theme Switcher, Sign in, Start sifting, Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Switcher: Warm Editorial Parchment vs Nocturne Ink */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Warm Editorial Parchment' : 'Switch to Nocturne Ink Mode'}
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-secondary" />
            )}
          </button>

          {/* Entitlements badge */}
          <button
            onClick={() => onNavigate('billing')}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-xs font-semibold border transition-all cursor-pointer bg-surface-container-low border-outline-variant/40 hover:border-outline text-on-surface-variant"
          >
            {isSubscribed ? (
              <>
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="text-tertiary font-bold">PRO RESEARCHER</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-primary" />
                <span>
                  <strong className="text-primary">{freeRemaining}</strong> / 2 free
                </span>
              </>
            )}
          </button>

          {/* User auth state */}
          {auth ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <div className="font-label-md text-xs font-semibold text-on-surface">
                  {auth.user.name || auth.user.email}
                </div>
                <div className="font-label-sm text-[11px] text-secondary">
                  {auth.workspace?.name || 'Workspace'}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 rounded-full text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="font-label-lg text-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 transition-colors"
            >
              Sign in
            </button>
          )}

          {/* Primary CTA button matching Stitch Attachment */}
          <button
            onClick={() => onNavigate('new-analysis')}
            className="rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-sm px-5 py-2.5 shadow-[0_2px_10px_-2px_rgba(160,58,25,0.35)] transition-all hover:shadow-[0_4px_16px_-2px_rgba(160,58,25,0.45)] font-semibold"
          >
            Start sifting
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-on-surface-variant hover:text-on-surface bg-surface-container-low transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-xl border-b border-outline-variant/30 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-outline-variant/20">
            <button
              onClick={() => scrollToSection('workbench-preview')}
              className="text-left font-label-md text-sm text-on-surface py-2 hover:text-primary transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('philosophy')}
              className="text-left font-label-md text-sm text-on-surface py-2 hover:text-primary transition-colors"
            >
              Methodology
            </button>
            <button
              onClick={() => scrollToSection('capabilities')}
              className="text-left font-label-md text-sm text-on-surface py-2 hover:text-primary transition-colors"
            >
              Research
            </button>
            <button
              onClick={() => scrollToSection('manifesto')}
              className="text-left font-label-md text-sm text-on-surface py-2 hover:text-primary transition-colors"
            >
              Manifesto
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('billing');
              }}
              className="text-left font-label-md text-sm text-on-surface py-2 hover:text-primary transition-colors"
            >
              Pricing
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('dashboard');
              }}
              className="flex-1 py-2 px-3 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-label-md text-on-surface flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
              <span>Dossiers</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('experiments');
              }}
              className="flex-1 py-2 px-3 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-label-md text-on-surface flex items-center justify-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-tertiary" />
              <span>Experiments</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
