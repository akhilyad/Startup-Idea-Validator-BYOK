import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { NewAnalysisView } from './components/NewAnalysisView';
import { AnalysisDetailView } from './components/AnalysisDetailView';
import { DashboardView } from './components/DashboardView';
import { ExperimentsView } from './components/ExperimentsView';
import { BillingView } from './components/BillingView';
import { AuthModal } from './components/AuthModal';
import { api, type AuthResponse } from './lib/api';

export const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [prefilledIdea, setPrefilledIdea] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('sift_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sift_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sift_theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => setIsDark((prev) => !prev);

  // Load active user session on mount
  useEffect(() => {
    api
      .getMe()
      .then((data) => setAuth(data))
      .catch(() => setAuth(null));
  }, []);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) {
      setSelectedAnalysisId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDemo = async () => {
    try {
      const res = await api.listAnalyses();
      if (res.analyses.length > 0) {
        handleNavigate('analysis-detail', res.analyses[0].id);
      } else {
        handleNavigate('new-analysis');
      }
    } catch {
      handleNavigate('new-analysis');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setAuth(null);
      setCurrentView('landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary-fixed selection:text-on-primary-fixed transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        auth={auth}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        {currentView === 'landing' && (
          <LandingPage
            onStartNew={(prompt?: string) => {
              setPrefilledIdea(prompt ?? '');
              handleNavigate('new-analysis');
            }}
            onOpenDemo={handleOpenDemo}
          />
        )}

        {currentView === 'new-analysis' && (
          <NewAnalysisView
            initialIdea={prefilledIdea}
            onAnalysisCreated={(id) => handleNavigate('analysis-detail', id)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'analysis-detail' && selectedAnalysisId && (
          <AnalysisDetailView
            analysisId={selectedAnalysisId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'experiments' && (
          <ExperimentsView onNavigate={handleNavigate} />
        )}

        {currentView === 'billing' && (
          <BillingView
            onPlanUpdated={() => {
              api.getMe().then(setAuth).catch(() => {});
            }}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(data) => setAuth(data)}
      />
    </div>
  );
};
