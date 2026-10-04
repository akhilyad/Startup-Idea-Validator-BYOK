import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  BookOpen,
} from 'lucide-react';
import { api, type AnalysisListItem } from '../lib/api';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listAnalyses()
      .then((res) => setAnalyses(res.analyses))
      .catch((err) => console.error('Failed to load analyses:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
            Synthesis Archives
          </span>
          <h1 className="text-3xl sm:text-4xl font-headline font-semibold text-on-surface mt-1">
            Opportunity Dossiers
          </h1>
          <p className="text-sm text-secondary font-light mt-1">
            Track your falsifiable business theses, contradiction vectors, and active validation experiments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-analysis')}
          className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold text-sm shadow-[0_2px_10px_-2px_rgba(160,58,25,0.35)] flex items-center gap-2 self-start transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Synthesis</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
          <p className="text-xs text-secondary">Loading portfolio dossiers...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface-container-low border border-border text-center max-w-lg mx-auto my-12 shadow-xs">
          <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-on-surface mb-2">
            No Opportunity Theses Yet
          </h3>
          <p className="text-xs text-secondary mb-6 leading-relaxed">
            Enter a raw startup concept, customer problem, or Reddit thread to generate your first evidence-backed validation thesis.
          </p>
          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold text-xs shadow-sm transition-all"
          >
            Run Your First Analysis
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('analysis-detail', item.id)}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-border hover:border-outline-variant cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-warm group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface">
                    {item.projectName}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.status === 'COMPLETE'
                        ? 'bg-tertiary-fixed/60 text-tertiary'
                        : 'bg-primary-fixed/60 text-primary'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="text-lg font-headline font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-secondary line-clamp-3 leading-relaxed">
                  {item.problem || item.rawInput}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-secondary">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-on-surface">{item.stats.assumptions}</span> Assumptions
                  <span>•</span>
                  <span className="font-semibold text-on-surface">{item.stats.experiments}</span> Experiments
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
