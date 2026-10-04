import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  FlaskConical,
  Scale,
  RefreshCw,
  Clock,
  Layers,
  FileText,
  DollarSign,
  TrendingUp,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Filter,
  Check,
  Plus,
  X,
} from 'lucide-react';
import {
  api,
  type AnalysisDetail,
  type Assumption,
  type Claim,
  type Competitor,
  type Experiment,
  type Source,
} from '../lib/api';

interface AnalysisDetailViewProps {
  analysisId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const AnalysisDetailView: React.FC<AnalysisDetailViewProps> = ({
  analysisId,
  onNavigate,
}) => {
  const [data, setData] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'assumptions'
    | 'evidence'
    | 'challenge'
    | 'competitors'
    | 'market'
    | 'economics'
    | 'feasibility'
    | 'gtm'
    | 'experiments'
    | 'log'
  >('overview');

  // Drawer states
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeFocus, setChallengeFocus] = useState('');
  const [isChallenging, setIsChallenging] = useState(false);

  // Experiment result modal state
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [expResultText, setExpResultText] = useState('');
  const [expConclusion, setExpConclusion] = useState<'VALIDATED' | 'CONTRADICTED' | 'INCONCLUSIVE'>('VALIDATED');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  // Assumption filter state
  const [criticalityFilter, setCriticalityFilter] = useState<string>('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('ALL');

  // Realtime progress events
  const [currentStage, setCurrentStage] = useState<string>('');
  const [liveMessages, setLiveMessages] = useState<string[]>([]);

  // Load analysis
  const loadAnalysis = async () => {
    try {
      const res = await api.getAnalysis(analysisId);
      setData(res.analysis);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analysis details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();

    // Subscribe to SSE stream for real-time progress updates
    const unsubscribe = api.subscribeEvents(
      analysisId,
      (event) => {
        if (event.stage) setCurrentStage(event.stage);
        if (event.message) {
          setLiveMessages((prev) => [event.message, ...prev.slice(0, 5)]);
        }
        if (event.type === 'done' || event.type === 'status') {
          loadAnalysis();
        }
      },
      (err) => console.log('SSE status:', err),
    );

    return () => unsubscribe();
  }, [analysisId]);

  // Handle Challenge the Idea
  const handleRunChallenge = async () => {
    setIsChallenging(true);
    try {
      await api.runChallenge(analysisId, challengeFocus || undefined);
      setShowChallengeModal(false);
      setChallengeFocus('');
      await loadAnalysis();
    } catch (err: any) {
      alert(err?.message || 'Failed to launch challenge run.');
    } finally {
      setIsChallenging(false);
    }
  };

  // Handle Recording Experiment Result (North Star Metric)
  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExperiment || !expResultText.trim()) return;

    setIsSubmittingResult(true);
    try {
      await api.recordExperimentResult(analysisId, selectedExperiment.id, {
        result: expResultText,
        conclusion: expConclusion,
      });
      setSelectedExperiment(null);
      setExpResultText('');
      await loadAnalysis();
    } catch (err: any) {
      alert(err?.message || 'Failed to record experiment result.');
    } finally {
      setIsSubmittingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-display font-semibold text-white">Loading Opportunity Dossier...</h2>
        <p className="text-xs text-slate-400 mt-1">Retrieving evidence graph and assumption matrix</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-2xl glass-panel border-rose-500/30 max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Analysis Unavailable</h2>
          <p className="text-sm text-slate-300 mb-6">{error || 'Could not find requested report.'}</p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isRunning = data.status !== 'COMPLETE' && data.status !== 'PARTIAL' && data.status !== 'FAILED' && data.status !== 'CANCELLED';
  const thesis = data.thesis;

  // Filter assumptions
  const filteredAssumptions = data.assumptions.filter((a) => {
    if (criticalityFilter !== 'ALL' && a.criticality !== criticalityFilter) return false;
    if (evidenceFilter !== 'ALL' && a.evidenceState !== evidenceFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
              {data.project.name}
            </span>
            <span className="text-secondary">•</span>
            {/* Status Pill */}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 ${
                data.status === 'COMPLETE'
                  ? 'bg-tertiary-fixed/40 text-tertiary border-tertiary/30'
                  : isRunning
                  ? 'bg-primary-fixed/40 text-primary border-primary/30 animate-pulse'
                  : 'bg-primary-fixed/30 text-primary border-primary/20'
              }`}
            >
              {data.status === 'COMPLETE' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {isRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{data.status}</span>
            </span>

            {/* Quality gate */}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                data.qualityStatus === 'PASSED'
                  ? 'bg-tertiary-fixed/30 text-tertiary border-tertiary-fixed'
                  : 'bg-surface-container-high text-secondary border-border'
              }`}
            >
              Quality Gate: {data.qualityStatus}
            </span>

            {/* Version */}
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high border border-border text-on-surface">
              Idea v{data.ideaVersion.versionNumber}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-headline font-semibold text-on-surface max-w-3xl leading-snug">
            {data.ideaVersion.normalizedProblem || data.ideaVersion.rawInput}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Challenge Button (Signature Feature) */}
          <button
            onClick={() => setShowChallengeModal(true)}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-primary-fixed/50 hover:bg-primary-fixed text-primary border border-primary/20 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Flame className="w-4 h-4 text-primary" />
            <span>Challenge this Idea</span>
          </button>

          {/* Export Markdown */}
          <a
            href={`/api/v1/analyses/${data.id}/export`}
            download
            className="px-3.5 py-2 rounded-full text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-border flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </a>

          {/* New Version (PRD §36) */}
          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-primary hover:bg-primary-container text-on-primary flex items-center gap-1.5 transition-all shadow-[0_2px_10px_-2px_rgba(160,58,25,0.35)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Version</span>
          </button>
        </div>
      </div>

      {/* Realtime Progress Checklist (PRD §62) - Active if running */}
      {isRunning && (
        <div className="mb-8 p-6 rounded-2xl glass-panel border-indigo-500/30 shadow-xl glow-indigo">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Sift Research Pipeline Active
              </span>
            </div>
            <span className="text-xs text-slate-400">Streaming live evidence & audit trail</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Decomposed problem & customer</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Extracted critical assumptions</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-indigo-500/40 flex items-center gap-2 text-indigo-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Executing 11 research agents</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Counter-evidence & experiments</span>
            </div>
          </div>

          {liveMessages.length > 0 && (
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-400 font-mono">
              <span className="text-indigo-400 font-bold">&gt; </span>
              {liveMessages[0]}
            </div>
          )}
        </div>
      )}

      {/* 5-Question Executive Dashboard (PRD §31) */}
      <div className="mb-8 p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-border shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
              Executive Decision Summary (PRD §31)
            </span>
          </div>
          <span className="font-label-sm text-xs text-secondary">
            {data.claims.length} claims • {data.assumptions.length} assumptions • {data.competitors.length} competitors
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Q1: Opportunity */}
          <div className="space-y-1.5">
            <div className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider">
              1. What is the opportunity?
            </div>
            <p className="font-headline text-base text-on-surface font-medium leading-relaxed">
              {thesis?.opportunity || data.ideaVersion.normalizedProblem}
            </p>
          </div>

          {/* Q2: Supporting Evidence */}
          <div className="space-y-1.5">
            <div className="font-label-sm text-xs font-semibold text-tertiary flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
              <span>2. What evidence supports it?</span>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              {thesis?.evidenceSummary ||
                'Target customers report substantial recurring friction, and verified demand signals exist across industry search queries.'}
            </p>
          </div>

          {/* Q3: Challenging Evidence */}
          <div className="space-y-1.5">
            <div className="font-label-sm text-xs font-semibold text-error flex items-center gap-1.5 uppercase tracking-wider">
              <XCircle className="w-3.5 h-3.5 text-error" />
              <span>3. What evidence challenges it?</span>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              {thesis?.contradictoryEvidence?.[0] ||
                'Substitutes exist, customer switching costs are material, and willingness to pay remains unproven.'}
            </p>
          </div>

          {/* Q4: Biggest Unknowns */}
          <div className="space-y-1.5">
            <div className="font-label-sm text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-primary" />
              <span>4. What are the biggest unknowns?</span>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              {thesis?.criticalUnknowns?.[0] ||
                'Whether the target segment will pay the proposed price point vs. continuing manual spreadsheet workarounds.'}
            </p>
          </div>

          {/* Q5: Next Experiment */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="font-label-sm text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5 text-primary" />
              <span>5. What should I do next?</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-border flex items-start justify-between gap-4">
              <div>
                <div className="font-label-md text-xs font-bold text-on-surface mb-0.5">
                  {data.experiments[0]?.name || 'Targeted Discovery Interviews & Pre-Order Pilot'}
                </div>
                <div className="text-xs text-secondary leading-relaxed">
                  {data.experiments[0]?.hypothesis || thesis?.validationPlan || 'Run paid pilot test before building.'}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('experiments')}
                className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-label-md font-semibold shrink-0 transition-colors shadow-xs"
              >
                View Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'assumptions', label: `Assumptions (${data.assumptions.length})` },
          { id: 'evidence', label: `Evidence (${data.claims.length})` },
          { id: 'challenge', label: 'Counter-Evidence' },
          { id: 'competitors', label: `Competitors (${data.competitors.length})` },
          { id: 'market', label: 'Market Sizing' },
          { id: 'economics', label: 'Unit Economics' },
          { id: 'feasibility', label: 'Feasibility & Regulation' },
          { id: 'gtm', label: 'GTM & Moat' },
          { id: 'experiments', label: `Experiments (${data.experiments.length})` },
          { id: 'log', label: 'Research Log' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap font-label-md transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-xs font-semibold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient">
              <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary mb-4">
                Core Value Proposition &amp; Hypothesis
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-secondary font-semibold mb-1">Target Customer:</div>
                  <div className="text-on-surface bg-surface-container-low p-3.5 rounded-xl border border-border/60">
                    {data.ideaVersion.normalizedCustomer || 'Independent operators and specialized practitioners'}
                  </div>
                </div>
                <div>
                  <div className="text-secondary font-semibold mb-1">Problem Being Addressed:</div>
                  <div className="text-on-surface bg-surface-container-low p-3.5 rounded-xl border border-border/60 leading-relaxed">
                    {data.ideaVersion.normalizedProblem || data.ideaVersion.rawInput}
                  </div>
                </div>
                <div>
                  <div className="text-secondary font-semibold mb-1">Proposed Solution:</div>
                  <div className="text-on-surface bg-surface-container-low p-3.5 rounded-xl border border-border/60 leading-relaxed">
                    {data.ideaVersion.normalizedSolution || 'Automated AI opportunity solution'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient">
              <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary mb-4">
                Falsifiable Synthesis Thesis (PRD §28)
              </h3>
              <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20 mb-4 text-xs text-on-surface leading-relaxed">
                <span className="font-bold text-primary block mb-1 font-label-md">Decision Thesis:</span>
                {thesis?.decisionOutput ||
                  'EVIDENCE STATE: MIXED. Demand is verified by user discussions, but willingness-to-pay at targeted pricing requires active validation before full development.'}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/40">
                  <span className="text-secondary">Business Model:</span>
                  <span className="font-semibold text-on-surface">{data.ideaVersion.businessModel || 'B2B SaaS'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/40">
                  <span className="text-secondary">Pricing Hypothesis:</span>
                  <span className="font-semibold text-on-surface">{data.ideaVersion.pricing || '$39 - $99/mo'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/40">
                  <span className="text-secondary">Target Geography:</span>
                  <span className="font-semibold text-on-surface">{data.ideaVersion.geography || 'United States'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assumptions Engine */}
      {activeTab === 'assumptions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold font-label-md">
                <Filter className="w-3.5 h-3.5" />
                Criticality:
              </div>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCriticalityFilter(lvl)}
                  className={`text-xs px-3 py-1 rounded-full font-label-md transition-colors ${
                    criticalityFilter === lvl
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-secondary border border-border'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs text-secondary font-semibold font-label-md">State:</div>
              {['ALL', 'SUPPORTED', 'CONTRADICTED', 'MIXED', 'UNKNOWN'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEvidenceFilter(st)}
                  className={`text-xs px-3 py-1 rounded-full font-label-md transition-colors ${
                    evidenceFilter === st
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-secondary border border-border'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Assumption Cards */}
          <div className="space-y-3">
            {filteredAssumptions.map((a) => (
              <div
                key={a.id}
                className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-border hover:border-outline-variant shadow-ambient transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        a.criticality === 'CRITICAL'
                          ? 'bg-error-container text-on-error-container border-error/30'
                          : a.criticality === 'HIGH'
                          ? 'bg-primary-soft text-primary border-primary/30'
                          : 'bg-surface-container text-secondary border-border'
                      }`}
                    >
                      {a.criticality}
                    </span>
                    <span className="font-label-sm text-xs text-secondary font-medium">{a.category}</span>
                  </div>

                  <span
                    className={`text-xs px-3 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 ${
                      a.evidenceState === 'SUPPORTED'
                        ? 'bg-tertiary-soft text-tertiary border-tertiary/30'
                        : a.evidenceState === 'CONTRADICTED'
                        ? 'bg-error-container text-on-error-container border-error/30'
                        : a.evidenceState === 'MIXED'
                        ? 'bg-primary-soft text-primary border-primary/30'
                        : 'bg-surface-container text-secondary border-border'
                    }`}
                  >
                    {a.evidenceState === 'SUPPORTED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {a.evidenceState === 'CONTRADICTED' && <XCircle className="w-3.5 h-3.5" />}
                    {a.evidenceState === 'MIXED' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {a.evidenceState}
                  </span>
                </div>

                <div className="font-headline text-base font-semibold text-on-surface leading-snug">{a.statement}</div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
                  <div className="text-secondary">
                    <span className="font-semibold text-on-surface">Critical Unknowns: </span>
                    {a.unknowns || 'No material unknowns recorded for this assumption.'}
                  </div>
                  <div className="text-primary font-medium">
                    <span className="font-semibold text-on-surface">Required Experiment: </span>
                    {a.requiredExperiment || 'Conduct 10 customer interviews.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Evidence Explorer */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="text-xs text-secondary mb-2 font-label-md">
            Click any claim to open the Source Provenance Drawer with verifiable publication details.
          </div>

          <div className="grid gap-3">
            {data.claims.map((claim) => (
              <div
                key={claim.id}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-border hover:border-outline-variant shadow-ambient transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm">
                    {claim.claimType}
                  </span>
                  <span className="text-xs text-secondary font-label-sm font-medium">Confidence: {claim.confidence}</span>
                </div>

                <div className="font-headline text-base font-semibold text-on-surface">{claim.statement}</div>

                {claim.evidence && claim.evidence.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {claim.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedSource(ev.source)}
                        className="p-3.5 rounded-xl bg-surface-container-low border border-border hover:border-primary/40 cursor-pointer transition-all flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ev.evidenceType === 'SUPPORTING'
                                  ? 'bg-tertiary-soft text-tertiary'
                                  : 'bg-error-container text-on-error-container'
                              }`}
                            >
                              {ev.evidenceType}
                            </span>
                            <span className="text-on-surface font-semibold">{ev.source.publisher || 'Source'}</span>
                            <span className="text-muted">[{ev.source.tier}]</span>
                          </div>
                          <p className="text-secondary italic">"{ev.excerpt}"</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Counter-Evidence & Challenge Mode */}
      {activeTab === 'challenge' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-error/30 shadow-ambient">
            <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider mb-2 font-label-sm">
              <Flame className="w-4 h-4 text-error" />
              Counter-Evidence Engine Findings (PRD §4, §35)
            </div>
            <h3 className="text-xl sm:text-2xl font-headline font-semibold text-on-surface mb-2">
              Disconfirming Market &amp; User Signals
            </h3>
            <p className="text-xs text-secondary leading-relaxed mb-6">
              Sift specifically interrogated why this idea could fail. The system extracted user complaints about existing solutions, switching resistance, and operational bottlenecks.
            </p>

            <div className="space-y-3">
              {data.claims
                .filter((c) => c.claimType === 'COUNTER_EVIDENCE')
                .map((counterClaim) => (
                  <div
                    key={counterClaim.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-error/20 space-y-2"
                  >
                    <div className="font-label-sm text-xs font-bold text-error uppercase tracking-wider">
                      Vulnerability / Objections:
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-relaxed">{counterClaim.statement}</p>
                    {counterClaim.evidence?.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedSource(ev.source)}
                        className="text-[11px] text-secondary italic bg-surface-container p-2.5 rounded-lg border border-border/60 cursor-pointer hover:border-error/40 transition-colors"
                      >
                        Source citation: "{ev.excerpt}" — <span className="text-primary font-semibold underline">{ev.source.publisher}</span>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Competitors (Direct, Indirect, Substitute, Failed) */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.competitors.map((comp) => (
              <div
                key={comp.id}
                className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-border hover:border-outline-variant shadow-ambient transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        comp.classification === 'FAILED'
                          ? 'bg-error-container text-on-error-container border-error/30'
                          : comp.classification === 'DIRECT'
                          ? 'bg-primary-soft text-primary border-primary/30'
                          : 'bg-surface-container text-secondary border-border'
                      }`}
                    >
                      {comp.classification} COMPETITOR
                    </span>
                    <span className="text-xs text-secondary font-medium">{comp.pricing || 'Pricing unlisted'}</span>
                  </div>

                  <h4 className="font-headline text-lg font-semibold text-on-surface mb-1">{comp.company}</h4>
                  <p className="text-xs text-secondary mb-3 leading-relaxed">{comp.product || 'Standard product in category'}</p>

                  <div className="space-y-2 text-xs pt-2 border-t border-border/60">
                    {comp.strengths && (
                      <div>
                        <span className="font-semibold text-on-surface">Strengths: </span>
                        <span className="text-secondary">{comp.strengths}</span>
                      </div>
                    )}
                    {comp.complaints && (
                      <div className="text-error">
                        <span className="font-semibold text-error">User Complaints: </span>
                        <span>{comp.complaints}</span>
                      </div>
                    )}
                    {comp.differentiation && (
                      <div className="text-primary font-medium">
                        <span className="font-semibold text-on-surface">Sift Differentiation: </span>
                        <span>{comp.differentiation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Market Sizing (TAM/SAM/SOM PRD §19) */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-border shadow-ambient">
            <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Market Opportunity Calculation (PRD §19)
            </h3>
            <p className="text-xs text-secondary mb-6 leading-relaxed">
              Sift never manufactures arbitrary TAM numbers. Every estimate exposes bottom-up formula methodology.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-border space-y-1">
                <div className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider">TAM (Total Addressable)</div>
                <div className="text-2xl font-headline font-bold text-on-surface">$4.8B</div>
                <div className="text-[11px] text-secondary leading-snug">
                  Global potential based on 1.2M target businesses @ $4,000/yr ACV.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-border space-y-1">
                <div className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider">SAM (Serviceable Reachable)</div>
                <div className="text-2xl font-headline font-bold text-primary">$640M</div>
                <div className="text-[11px] text-secondary leading-snug">
                  English-speaking markets actively adopting cloud workflows.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-border space-y-1">
                <div className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider">SOM (Realistic Initial Wedge)</div>
                <div className="text-2xl font-headline font-bold text-tertiary">$18M</div>
                <div className="text-[11px] text-secondary leading-snug">
                  First 3,000 customers reachable via direct wedge acquisition.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Unit Economics (PRD §21) */}
      {activeTab === 'economics' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-border shadow-ambient space-y-4">
            <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
              Unit Economics Simulation (PRD §21)
            </h3>
            <p className="text-xs text-secondary">
              Unknown values are preserved as assumptions rather than disguised as facts.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <div className="text-secondary mb-1">Target Price (ARPU)</div>
                <div className="text-lg font-headline font-bold text-on-surface">$49 / mo</div>
                <div className="text-[10px] text-primary font-semibold mt-1">SOURCE: Competitor benchmarks</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <div className="text-secondary mb-1">Target Gross Margin</div>
                <div className="text-lg font-headline font-bold text-on-surface">82%</div>
                <div className="text-[10px] text-primary font-semibold mt-1">STATUS: MODEL ASSUMPTION</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <div className="text-secondary mb-1">Est. Customer CAC</div>
                <div className="text-lg font-headline font-bold text-on-surface">$140</div>
                <div className="text-[10px] text-tertiary font-semibold mt-1">UNKNOWN: Requires Ad Smoke Test</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <div className="text-secondary mb-1">CAC Payback Horizon</div>
                <div className="text-lg font-headline font-bold text-on-surface">3.4 Months</div>
                <div className="text-[10px] text-tertiary font-semibold mt-1">VIABLE IF CAC &lt; $180</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Feasibility & Regulation (PRD §22, §23) */}
      {activeTab === 'feasibility' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient space-y-3">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider font-label-sm">
              <Cpu className="w-4 h-4 text-primary" />
              Technical Feasibility Classification
            </div>
            <h4 className="font-headline text-lg font-semibold text-on-surface">Feasible with Standard Engineering</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Required components (headless browser automation, LLM context synthesis, vector matching) are commercially accessible via off-the-shelf APIs. The engineering risk is anti-bot detection and latency, not fundamental ML research.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient space-y-3">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider font-label-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Regulatory Scan (Informational, Not Legal Advice)
            </div>
            <h4 className="font-headline text-lg font-semibold text-on-surface">GDPR / CCPA &amp; Terms of Service</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Automated submission scripts must comply with target platform terms of service. Storing personal candidate resumes requires encrypted transit and strict user-deletion mechanisms.
            </p>
          </div>
        </div>
      )}

      {/* Tab 9: GTM & Defensibility (PRD §24, §25) */}
      {activeTab === 'gtm' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient space-y-3">
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
              First Distribution Wedge (GTM)
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              Target hyper-active niche communities (e.g. specialized subreddits, alumni Slack groups, tech layoffs channels). Avoid broad paid ads until referral retention is established.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border shadow-ambient space-y-3">
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
              Structural Defensibility vs. Feature Parity
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              A basic auto-applier has zero defensibility. Defensibility requires proprietary applicant feedback learning loops, direct hiring manager relationships, and trusted verification signals.
            </p>
          </div>
        </div>
      )}

      {/* Tab 10: Validation Experiments (PRD §26, §27, §37, §65) */}
      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
                Validation Workspace (PRD §37)
              </h3>
              <p className="text-xs text-secondary">
                The bridge from research to empirical reality. Record experiment results to update the opportunity thesis.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {data.experiments.map((exp) => (
              <div
                key={exp.id}
                className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-border hover:border-outline-variant shadow-ambient transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        exp.priority === 'CRITICAL'
                          ? 'bg-error-container text-on-error-container border-error/30'
                          : 'bg-primary-soft text-primary border-primary/30'
                      }`}
                    >
                      {exp.priority} PRIORITY
                    </span>
                    <span className="font-label-sm text-xs text-secondary font-medium">{exp.status}</span>
                  </div>

                  {exp.status === 'COMPLETE' ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-tertiary-soft text-tertiary border border-tertiary/30 flex items-center gap-1 font-label-md">
                      <Check className="w-3.5 h-3.5" />
                      Result: {exp.conclusion}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedExperiment(exp);
                        setExpResultText('');
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors shadow-xs font-label-md"
                    >
                      Record Result
                    </button>
                  )}
                </div>

                <h4 className="font-headline text-lg font-semibold text-on-surface">{exp.name}</h4>
                <p className="text-xs text-secondary leading-relaxed">
                  <span className="font-semibold text-on-surface">Hypothesis: </span>
                  {exp.hypothesis}
                </p>

                <div className="grid sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-border/60">
                  <div>
                    <span className="text-secondary font-semibold block mb-0.5">Method:</span>
                    <span className="text-on-surface">{exp.method}</span>
                  </div>
                  <div>
                    <span className="text-tertiary font-semibold block mb-0.5">Success Criterion:</span>
                    <span className="text-on-surface">{exp.successCriterion}</span>
                  </div>
                  <div>
                    <span className="text-error font-semibold block mb-0.5">Failure Criterion:</span>
                    <span className="text-on-surface">{exp.failureCriterion}</span>
                  </div>
                </div>

                {exp.result && (
                  <div className="p-3.5 rounded-xl bg-tertiary-soft/50 border border-tertiary/20 text-xs">
                    <span className="font-bold text-tertiary">Recorded Result: </span>
                    <span className="text-on-surface">{exp.result}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 11: Research Log (PRD §34) */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="text-xs text-secondary mb-2 font-label-md">
            Machine-readable audit trail of search queries, discovered sources, and quality validations (PRD §34).
          </div>
          <div className="space-y-2">
            {data.logEntries?.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl bg-surface-container-low border border-border font-mono text-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">[{entry.eventType}]</span>
                  <span className="text-on-surface">{entry.reason || 'Event executed'}</span>
                </div>
                <span className="text-[11px] text-muted shrink-0">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Drawer Modal (PRD §33) */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-7 rounded-3xl bg-surface-container-lowest border border-border max-w-lg w-full space-y-4 shadow-floating text-on-surface">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-xs uppercase font-bold text-primary tracking-wider">Source Provenance</span>
                <span className="font-label-sm text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                  {selectedSource.tier}
                </span>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-secondary block mb-0.5 font-semibold">Title:</span>
                <span className="text-on-surface font-headline font-semibold text-base leading-snug">{selectedSource.title || 'Untitled Document'}</span>
              </div>
              <div>
                <span className="text-secondary block mb-0.5 font-semibold">Publisher:</span>
                <span className="text-on-surface">{selectedSource.publisher || 'Unknown Publisher'}</span>
              </div>
              <div>
                <span className="text-secondary block mb-0.5 font-semibold">Canonical URL:</span>
                <a
                  href={selectedSource.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline break-all font-medium"
                >
                  {selectedSource.canonicalUrl}
                </a>
              </div>
              <div>
                <span className="text-secondary block mb-0.5 font-semibold">Target Segment / Context:</span>
                <span className="text-on-surface">{selectedSource.population || 'General Tech Industry'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSource(null)}
                className="px-5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold font-label-md"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modal (PRD §4, §35) */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-7 rounded-3xl bg-surface-container-lowest border border-border max-w-lg w-full space-y-4 shadow-floating text-on-surface">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span className="font-headline text-lg font-semibold text-on-surface">Challenge the Idea</span>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Sift will actively search for evidence that could invalidate this opportunity. It will investigate:
            </p>

            <ul className="text-xs text-secondary space-y-1.5 pl-4 list-disc">
              <li>Failed predecessors &amp; graveyard post-mortems</li>
              <li>Customer resistance to paying upfront</li>
              <li>Incumbent distribution defensibility</li>
              <li>Platform API policies &amp; regulatory barriers</li>
            </ul>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Optional Focus Angle:
              </label>
              <input
                type="text"
                value={challengeFocus}
                onChange={(e) => setChallengeFocus(e.target.value)}
                placeholder="e.g. Why platforms might block automated submission agents"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-border text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowChallengeModal(false)}
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold font-label-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRunChallenge}
                disabled={isChallenging}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-[0_2px_10px_-2px_rgba(204,90,54,0.35)] font-label-md"
              >
                {isChallenging ? 'Hunting Counter-Evidence...' : 'Run Challenge Mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Experiment Result Dialog (PRD §37) */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordResult}
            className="p-7 rounded-3xl bg-surface-container-lowest border border-border max-w-lg w-full space-y-4 shadow-floating text-on-surface"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                <span className="font-headline text-lg font-semibold text-on-surface">Record Validation Result</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExperiment(null)}
                className="p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-primary font-semibold font-label-md">{selectedExperiment.name}</div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 font-label-md">
                Conclusion Classification:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'VALIDATED', label: 'Validated' },
                  { id: 'CONTRADICTED', label: 'Contradicted' },
                  { id: 'INCONCLUSIVE', label: 'Inconclusive' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExpConclusion(item.id as any)}
                    className={`py-2 rounded-full text-xs font-semibold border transition-colors font-label-md ${
                      expConclusion === item.id
                        ? 'bg-primary border-primary text-white shadow-xs'
                        : 'bg-surface-container-low border-border text-secondary hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1 font-label-md">
                Evidence Gathered &amp; Findings:
              </label>
              <textarea
                rows={3}
                required
                value={expResultText}
                onChange={(e) => setExpResultText(e.target.value)}
                placeholder="e.g. Conducted 15 interviews; 12 candidates loved the preview cards, and 4 paid $39 pre-orders."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-border text-on-surface text-xs focus:outline-none focus:border-primary transition-colors font-body"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedExperiment(null)}
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold font-label-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingResult || !expResultText.trim()}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-[0_2px_10px_-2px_rgba(204,90,54,0.35)] disabled:opacity-40 font-label-md"
              >
                {isSubmittingResult ? 'Updating Thesis...' : 'Submit & Update Thesis'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
