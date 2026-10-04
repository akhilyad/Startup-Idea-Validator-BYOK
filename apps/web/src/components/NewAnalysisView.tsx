import React, { useState } from 'react';
import {
  Sparkles,
  Link,
  MessageSquare,
  ClipboardPaste,
  Mic,
  ArrowRight,
  AlertCircle,
  Loader2,
  HelpCircle,
  Check,
} from 'lucide-react';
import { api, type NormalizedIdea } from '../lib/api';

interface NewAnalysisViewProps {
  onAnalysisCreated: (analysisId: string) => void;
  onOpenAuth: () => void;
  initialIdea?: string;
}

export const NewAnalysisView: React.FC<NewAnalysisViewProps> = ({
  onAnalysisCreated,
  onOpenAuth,
  initialIdea = '',
}) => {
  const [inputType, setInputType] = useState<'TEXT' | 'URL' | 'REDDIT_URL' | 'PASTE' | 'VOICE'>('TEXT');
  const [rawInput, setRawInput] = useState(initialIdea);
  const [sourceUrl, setSourceUrl] = useState('');
  const [requestedDepth, setRequestedDepth] = useState<'QUICK' | 'STANDARD' | 'DEEP'>('STANDARD');

  // Decomposition / Normalization state
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [normalized, setNormalized] = useState<NormalizedIdea | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([
    'Target customer considers this friction painful enough to pay upfront.',
    'Incumbents have technical or cultural constraints preventing fast emulation.',
    'Unit economics support customer acquisition via non-paid organic channels.',
  ]);
  const [newAssumption, setNewAssumption] = useState('');

  // Execution state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalization trigger
  const handleNormalize = async () => {
    if (!rawInput.trim() || rawInput.length < 5) return;
    setIsNormalizing(true);
    setError(null);
    try {
      const res = await api.normalizeIdea(rawInput, inputType, sourceUrl);
      setNormalized(res.normalized);
    } catch (err: any) {
      console.warn('Normalization fallback:', err);
      // Fallback decomposition
      setNormalized({
        proposedCustomer: 'Independent business or technical practitioner',
        problem: rawInput.slice(0, 160),
        proposedSolution: 'Specialized deep-synthesis workflow addressing critical friction',
        industry: 'Software / Knowledge Systems',
        geography: 'Global / Remote',
        businessModel: 'Subscription / Usage-based',
        pricing: '$49 - $99/mo',
        distribution: 'Direct research communities, organic citation',
        technology: 'Agentic extraction, dialectic graph, LLM pipeline',
      });
    } finally {
      setIsNormalizing(false);
    }
  };

  // Launch research
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createAnalysis({
        rawInput,
        inputType,
        sourceUrl: sourceUrl || undefined,
        requestedDepth,
        normalizedCustomer: normalized?.proposedCustomer,
        normalizedProblem: normalized?.problem,
        normalizedSolution: normalized?.proposedSolution,
        industry: normalized?.industry || undefined,
        geography: normalized?.geography || undefined,
        businessModel: normalized?.businessModel || undefined,
        pricing: normalized?.pricing || undefined,
        distribution: normalized?.distribution || undefined,
        technology: normalized?.technology || undefined,
        assumptions,
      });

      onAnalysisCreated(res.analysisId);
    } catch (err: any) {
      if (err?.code === 'USAGE_LIMIT_EXCEEDED') {
        setError(err.message || 'Free analysis limit reached. Please upgrade.');
      } else if (err?.code === 'UNAUTHORIZED') {
        onOpenAuth();
      } else {
        setError(err?.message || 'Failed to start analysis.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick preset loader
  const loadPreset = (preset: {
    text: string;
    customer: string;
    problem: string;
    solution: string;
  }) => {
    setRawInput(preset.text);
    setNormalized({
      proposedCustomer: preset.customer,
      problem: preset.problem,
      proposedSolution: preset.solution,
      industry: 'Software / Automation',
      geography: 'United States',
      businessModel: 'B2B SaaS',
      pricing: '$49/month',
      distribution: 'Direct communities, search',
      technology: 'Browser automation, LLM reasoning',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
      {/* Title */}
      <div className="mb-8 pb-6 border-b border-border">
        <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
          Hypothesis Intake
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-semibold text-on-surface mt-1">
          New Opportunity Synthesis
        </h1>
        <p className="text-sm text-secondary font-light mt-1">
          Decompose your idea into a falsifiable hypothesis before research begins. Sift will challenge it and formulate empirical tests.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-error-container border border-error/20 flex items-start gap-3 text-on-error-container text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-error" />
          <div className="flex-1">
            <p className="font-semibold">Unable to start analysis</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Input Modality Tabs */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-border">
            <div className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
              Step 1: Input Raw Concept
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-[11px] text-secondary">Examples:</span>
              <button
                type="button"
                onClick={() =>
                  loadPreset({
                    text: 'I want to build an AI recruiting agent that automatically applies to jobs for users with tailored resumes.',
                    customer: 'Software engineers & knowledge job seekers',
                    problem: '15-25 hours/week spent on repetitive application forms with 2% response rates',
                    solution: 'Autonomous job search and custom application agent',
                  })
                }
                className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              >
                AI Job Applier
              </button>
              <button
                type="button"
                onClick={() =>
                  loadPreset({
                    text: 'Automated AI inventory forecasting and supplier purchase ordering for independent restaurants.',
                    customer: 'Independent multi-unit restaurant operators (2-10 locations)',
                    problem: 'Manual inventory clipboard counts result in 8% food spoilage and costly stockouts',
                    solution: 'Predictive consumption forecasting integrated with POS and supplier catalogs',
                  })
                }
                className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              >
                Restaurant Inventory
              </button>
            </div>
          </div>

          {/* Modality buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setInputType('TEXT')}
              className={`p-2.5 rounded-full font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputType === 'TEXT'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface border border-border'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Raw Idea</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType('URL')}
              className={`p-2.5 rounded-full font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputType === 'URL'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface border border-border'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Website URL</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType('REDDIT_URL')}
              className={`p-2.5 rounded-full font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputType === 'REDDIT_URL'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface border border-border'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reddit Thread</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType('PASTE')}
              className={`p-2.5 rounded-full font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputType === 'PASTE'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface border border-border'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType('VOICE')}
              className={`p-2.5 rounded-full font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputType === 'VOICE'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface border border-border'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice / Audio</span>
            </button>
          </div>

          {/* URL Input if applicable */}
          {(inputType === 'URL' || inputType === 'REDDIT_URL') && (
            <div className="mb-4">
              <label className="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
                {inputType === 'REDDIT_URL' ? 'Reddit Discussion URL' : 'Target Web / Competitor URL'}
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-border text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* Main textarea */}
          <div>
            <label className="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
              {inputType === 'PASTE'
                ? 'Pasted Customer Interview / Research Notes'
                : inputType === 'VOICE'
                ? 'Voice Transcript / Audio Dictation'
                : 'Describe your thesis, target customer pain, or market observation'}
            </label>
            <textarea
              rows={4}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. I want to build an autonomous AI procurement agent for mid-sized factories that automates purchase orders, quotes, and delivery tracking..."
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-border text-on-surface text-sm focus:outline-none focus:border-primary transition-colors resize-y leading-relaxed font-body"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNormalize}
              disabled={isNormalizing || rawInput.trim().length < 5}
              className="px-4 py-2 rounded-full font-label-md text-xs font-semibold bg-primary-fixed/50 hover:bg-primary-fixed text-primary border border-primary/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              {isNormalizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Decomposing thesis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Decompose Hypothesis (Preview Model)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Normalized Opportunity Model (PRD §9) */}
        {normalized && (
          <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
                  Step 2: Normalized Opportunity Model
                </span>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed/50 text-tertiary font-bold">
                  Editable Pre-Research
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Customer */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  Target Customer Segment
                </label>
                <input
                  type="text"
                  value={normalized.proposedCustomer}
                  onChange={(e) =>
                    setNormalized({ ...normalized, proposedCustomer: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-border text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Problem */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  Core Problem / JTBD
                </label>
                <input
                  type="text"
                  value={normalized.problem}
                  onChange={(e) =>
                    setNormalized({ ...normalized, problem: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-border text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Solution */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  Proposed Solution
                </label>
                <input
                  type="text"
                  value={normalized.proposedSolution}
                  onChange={(e) =>
                    setNormalized({ ...normalized, proposedSolution: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-border text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Business Model */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  Business Model &amp; Pricing
                </label>
                <input
                  type="text"
                  value={normalized.businessModel || ''}
                  onChange={(e) =>
                    setNormalized({ ...normalized, businessModel: e.target.value })
                  }
                  placeholder="e.g. B2B SaaS, $99/mo"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-border text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Critical Assumptions Editor */}
            <div>
              <label className="block font-label-md text-xs font-semibold text-on-surface mb-2">
                Initial Critical Assumptions to Falsify
              </label>
              <div className="space-y-2 mb-3">
                {assumptions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-border/60 text-xs text-on-surface"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setAssumptions(assumptions.filter((_, i) => i !== idx))}
                      className="text-secondary hover:text-error transition-colors ml-2"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAssumption}
                  onChange={(e) => setNewAssumption(e.target.value)}
                  placeholder="Add another critical assumption to test..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newAssumption.trim()) {
                      setAssumptions([...assumptions, newAssumption.trim()]);
                      setNewAssumption('');
                    }
                  }}
                  className="px-4 py-2 rounded-full font-label-md text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-border"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Research Depth */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-border shadow-xs">
          <div className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary mb-3">
            Step 3: Select Research Rigor
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRequestedDepth('QUICK')}
              className={`p-4 rounded-2xl text-left border transition-all ${
                requestedDepth === 'QUICK'
                  ? 'bg-primary-fixed/40 border-primary text-on-surface shadow-xs'
                  : 'bg-surface-container-low border-border text-secondary hover:text-on-surface'
              }`}
            >
              <div className="text-xs font-bold text-on-surface mb-1 font-label-md">Quick Scan</div>
              <div className="text-[11px] text-secondary leading-snug">
                Problem, customer friction, and direct competitor landscape.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRequestedDepth('STANDARD')}
              className={`p-4 rounded-2xl text-left border transition-all ${
                requestedDepth === 'STANDARD'
                  ? 'bg-primary-fixed/40 border-primary text-on-surface shadow-xs'
                  : 'bg-surface-container-low border-border text-secondary hover:text-on-surface'
              }`}
            >
              <div className="text-xs font-bold text-on-surface mb-1 font-label-md">
                Standard Validation
              </div>
              <div className="text-[11px] text-secondary leading-snug">
                11 research pipelines, counter-evidence hunt, unit economics, experiments.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRequestedDepth('DEEP')}
              className={`p-4 rounded-2xl text-left border transition-all ${
                requestedDepth === 'DEEP'
                  ? 'bg-primary-fixed/40 border-primary text-on-surface shadow-xs'
                  : 'bg-surface-container-low border-border text-secondary hover:text-on-surface'
              }`}
            >
              <div className="text-xs font-bold text-on-surface mb-1 font-label-md">
                Deep Forensic
              </div>
              <div className="text-[11px] text-secondary leading-snug">
                Predecessor graveyard autopsy, regulatory barriers, and adversarial audit.
              </div>
            </button>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !rawInput.trim()}
            className="w-full py-4 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold text-base shadow-[0_4px_16px_-2px_rgba(160,58,25,0.38)] hover:shadow-[0_8px_24px_-4px_rgba(160,58,25,0.48)] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Launching Sift Synthesis Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Launch Opportunity Synthesis</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
