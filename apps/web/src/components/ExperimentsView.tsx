import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api, type AnalysisListItem } from '../lib/api';

interface ExperimentsViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({ onNavigate }) => {
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
      <div className="mb-8 pb-6 border-b border-border">
        <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
          Empirical Protocols
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-semibold text-on-surface mt-1">
          Validation Experiments Workspace
        </h1>
        <p className="text-sm text-secondary font-light mt-1">
          Move from theoretical research to empirical reality. Experiments designed to falsify critical assumptions with minimal capital expenditure.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
          <p className="text-xs text-secondary">Loading active experiments...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface-container-low border border-border text-center max-w-md mx-auto my-12 shadow-xs">
          <FlaskConical className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-1">
            No Active Protocols
          </h3>
          <p className="text-xs text-secondary mb-4 leading-relaxed">
            Run a synthesis first to extract prioritized falsification experiments.
          </p>
          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-semibold shadow-sm transition-all"
          >
            Create Synthesis
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest border border-border shadow-xs hover:border-outline-variant transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                    {a.projectName}
                  </span>
                  <h3 className="text-lg font-headline font-semibold text-on-surface mt-0.5">
                    {a.title}
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('analysis-detail', a.id)}
                  className="px-4 py-2 rounded-full font-label-md text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-border flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <span>Open Dossier Protocols</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>

              <div className="text-xs text-secondary leading-relaxed flex items-center justify-between">
                <span>
                  This thesis has <strong className="text-on-surface font-semibold">{a.stats.experiments}</strong> active empirical experiment(s) designed to test critical willingness-to-pay and execution unknowns.
                </span>
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-tertiary bg-tertiary-fixed/50 px-2.5 py-0.5 rounded-full font-bold">
                  Tracked
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
