import React, { useState } from 'react';
import { SiftLogo } from './SiftLogo';

interface LandingPageProps {
  onStartNew: (samplePrompt?: string) => void;
  onOpenDemo: () => void;
}

interface CaseStudy {
  id: string;
  tabLabel: string;
  domainBadge: string;
  memoFile: string;
  inputs: { icon: string; text: string; color: string }[];
  title: string;
  groundingPct: string;
  beforeC1: string;
  c1Label: string;
  betweenC1C2: string;
  c2Label: string;
  afterC2: string;
  citation1: {
    author: string;
    quote: string;
    badge: string;
    doi: string;
  };
  citation2: {
    author: string;
    quote: string;
    badge: string;
  };
  tensionHeadline: string;
  tensionSub: string;
  tensionQuote: string;
  campA: { label: string; author: string; quote: string };
  campB: { label: string; author: string; quote: string };
  resolution: string;
  sources: { title: string; id: number }[];
  memoDownloadName: string;
  memoContent: string;
}

const CASE_STUDIES: Record<string, CaseStudy> = {
  'epistemic-drift': {
    id: 'epistemic-drift',
    tabLabel: 'AI & Distillation',
    domainBadge: 'Frontier AI & Systems',
    memoFile: 'sift://workspace/epistemic-drift-2025.memo',
    inputs: [
      { icon: 'description', text: '48 Academic PDFs', color: 'text-primary' },
      { icon: 'mic', text: '14 Recorded Interviews', color: 'text-tertiary' },
      { icon: 'table_chart', text: '3 Longitudinal Datasets', color: 'text-secondary' },
    ],
    title: 'Core Thesis & Contradiction Vector',
    groundingPct: '98.4% Grounding',
    beforeC1: 'While quantitative literature predicts centralized compute monopolization ',
    c1Label: '#1',
    betweenC1C2: ', field interviews with tier-two model laboratories reveal a sharp divergent trend: open weight distillation and decentralized edge execution are accelerating faster than parameter scaling ',
    c2Label: '#2',
    afterC2: '.',
    citation1: {
      author: 'Vance et al. (2024) — Cognitive Systems Institute',
      quote: '“Empirical GPU utilization audits show centralized API token costs scale super-linearly with context depth, triggering localized caching architectures.”',
      badge: 'Credibility: 99.1% (Peer Reviewed DOI: 10.1038/csi.2024.08)',
      doi: '10.1038/csi.2024.08',
    },
    citation2: {
      author: 'Primary Transcript #08 (00:42:15) — Frontier Systems Laboratory',
      quote: '“We reduced frontier model API spend by 82% simply by distilling reasoning tasks into fine-tuned 7B parameters deployed on commodity edge nodes.”',
      badge: 'Credibility: 96.8% (Primary Field Interview)',
    },
    tensionHeadline: 'Tension Identified (p < 0.01)',
    tensionSub: '• Source disagreement detected',
    tensionQuote: '“Arxiv:2409.112 directly contradicts Stanford Tech Review p.42 regarding memory throughput bottlenecks.”',
    campA: {
      label: 'Camp A — Centralized Scaling',
      author: 'Dr. Rossi (Stanford Tech Review p.42)',
      quote: '“Scale dictates cognitive ceiling; more compute solves reasoning.”',
    },
    campB: {
      label: 'Camp B — Architectural Distillation',
      author: 'Prof. Krell (Arxiv:2409.112)',
      quote: '“Architectural distillation outperforms pure parameter scaling 3:1.”',
    },
    resolution:
      'The tension is resolved by domain segmentation: Camp A holds for open-ended multi-step synthesis; Camp B holds for structured procedural workflows. Your startup hypothesis operates in the procedural domain.',
    sources: [
      { title: 'Vance et al. (2024)', id: 1 },
      { title: 'Transcript #08 (00:42:15)', id: 2 },
    ],
    memoDownloadName: 'epistemic-drift-2025.memo.md',
    memoContent: `# Sift Synthesis Memo: Epistemic Drift & Edge Distillation
Title: Core Thesis & Contradiction Vector
Status: Verified Grounding (98.4%)

## Executive Thesis
While quantitative literature predicts centralized compute monopolization [1], field interviews with tier-two model laboratories reveal a sharp divergent trend: open weight distillation and decentralized edge execution are accelerating faster than parameter scaling [2].

## Tension Identified (p < 0.01)
Source Disagreement: Arxiv:2409.112 directly contradicts Stanford Tech Review p.42 regarding memory throughput bottlenecks.
- Camp A: Scale dictates cognitive ceiling; more compute solves reasoning.
- Camp B: Architectural distillation outperforms pure parameter scaling 3:1.
- Synthesis: Domain segmentation resolves the dialectic tension.

## Traceable Sources
1. Vance et al. (2024) - Cognitive Systems Institute (DOI: 10.1038/csi.2024.08)
2. Primary Transcript #08 (00:42:15) - Frontier Systems Laboratory

Synthesized via Sift Technologies, PBC.
`,
  },
  'circadian-health': {
    id: 'circadian-health',
    tabLabel: 'Wearables & Sleep',
    domainBadge: 'Biomedical Sensing',
    memoFile: 'sift://workspace/circadian-health-2026.memo',
    inputs: [
      { icon: 'clinical_notes', text: '62 Clinical Trials', color: 'text-primary' },
      { icon: 'monitor_heart', text: '18 Polysomnography Studies', color: 'text-tertiary' },
      { icon: 'verified', text: '4 FDA Guidance Memos', color: 'text-secondary' },
    ],
    title: 'Photoplethysmography Motion Artifact Discrepancy',
    groundingPct: '97.6% Grounding',
    beforeC1: 'While consumer wellness marketing claims optical ring photoplethysmography reliably measures daytime sympathetic stress ',
    c1Label: '#1',
    betweenC1C2: ', clinical validation against 12-lead ECG reveals peripheral vasoconstriction during ambulation introduces a 41% error margin in daytime HRV calculations ',
    c2Label: '#2',
    afterC2: '.',
    citation1: {
      author: 'Chen & Mercer (2025) — Harvard Sleep & Circadian Medicine',
      quote: '“Optical sensor signals in ring form factors suffer from microvascular motion coupling, distorting pulse-arrival time by up to 84ms during ambulatory movements.”',
      badge: 'Credibility: 98.7% (Clinical Trial Registry NCT0492182)',
      doi: '10.1093/sleep/zsae048',
    },
    citation2: {
      author: 'Primary Laboratory Audit #14 (Stanford Biodesign)',
      quote: '“Only sleep-state measurements under thermal stabilization achieve high correlation with gold-standard Holter ECG records (r = 0.94).”',
      badge: 'Credibility: 97.4% (Direct Sensor Comparison)',
    },
    tensionHeadline: 'Clinical Discordance (p < 0.005)',
    tensionSub: '• Gold-standard measurement divergence',
    tensionQuote: '“Harvard Sleep Medicine polysomnography data directly challenges commercial ring marketing claims on daytime stress tracking.”',
    campA: {
      label: 'Camp A — Commercial Algorithms',
      author: 'Wearable Tech Consortia Whitepaper',
      quote: '“Continuous 24/7 PPG sampling captures real-time autonomic stress responses across diverse daytime routines.”',
    },
    campB: {
      label: 'Camp B — Clinical Electrophysiology',
      author: 'Dr. Chen (Harvard Sleep Lab)',
      quote: '“Daytime wrist and finger optical sensor data is heavily contaminated by peripheral vasoconstriction artifacts.”',
    },
    resolution:
      'The venture opportunity lies in nocturnal circadian drift calibration: using deep non-REM recovery baseline as the comparative index rather than noisy real-time daytime readings.',
    sources: [
      { title: 'Chen & Mercer (2025)', id: 1 },
      { title: 'Lab Audit #14 (Stanford)', id: 2 },
    ],
    memoDownloadName: 'circadian-biometrics-2026.memo.md',
    memoContent: `# Sift Synthesis Memo: Smart Ring & Circadian Health
Title: Photoplethysmography Motion Artifact Discrepancy
Status: Verified Grounding (97.6%)

## Executive Thesis
While consumer wellness marketing claims optical ring PPG reliably measures daytime sympathetic stress [1], clinical validation reveals peripheral vasoconstriction during ambulation introduces a 41% error margin in daytime HRV calculations [2].

## Tension Identified (p < 0.005)
Commercial wearable claims contradict gold-standard polysomnography and Holter ECG benchmarks.
- Camp A: Continuous 24/7 PPG captures daytime autonomic stress.
- Camp B: Daytime optical signals are distorted by microvascular motion coupling.
- Synthesis: Venture opportunity lies in nocturnal baseline delta calibration.

## Traceable Sources
1. Chen & Mercer (2025) - Harvard Sleep & Circadian Medicine (DOI: 10.1093/sleep/zsae048)
2. Primary Laboratory Audit #14 - Stanford Biodesign Clinical Trial NCT0492182

Synthesized via Sift Technologies, PBC.
`,
  },
  'zk-clinical-trials': {
    id: 'zk-clinical-trials',
    tabLabel: 'Cryptography & Health',
    domainBadge: 'Decentralized Science',
    memoFile: 'sift://workspace/zk-clinical-trials-2026.memo',
    inputs: [
      { icon: 'lock', text: '38 Cryptographic Protocols', color: 'text-primary' },
      { icon: 'gavel', text: '12 Regulatory Submissions', color: 'text-tertiary' },
      { icon: 'biotech', text: '5 Multi-Center Oncology Trials', color: 'text-secondary' },
    ],
    title: 'Verifiable Blinding & HIPAA/GDPR Harmony',
    groundingPct: '99.3% Grounding',
    beforeC1: 'Conventional federated learning frameworks claim differential privacy protects patient records in multi-center oncology trials ',
    c1Label: '#1',
    betweenC1C2: ', yet adversarial gradient reconstruction papers demonstrate genomic patient deanonymization in 72% of federated cohorts ',
    c2Label: '#2',
    afterC2: ', rendering zero-knowledge succinct non-interactive arguments (zk-SNARKs) the only mathematically defensible path forward.',
    citation1: {
      author: 'Al-Mansoor et al. (2025) — Nature Digital Medicine',
      quote: '“Gradient inversion attacks reconstruct patient single-nucleotide polymorphisms from shared federated weights with >90% accuracy.”',
      badge: 'Credibility: 99.5% (Peer Reviewed DOI: 10.1038/s41746-025-00892-z)',
      doi: '10.1038/s41746-025-00892-z',
    },
    citation2: {
      author: 'FDA Oncology Center of Excellence Whitepaper #03',
      quote: '“Regulatory acceptance of distributed trial evidence requires verifiable mathematical blinding proofs that eliminate cross-site data exposure.”',
      badge: 'Credibility: 98.2% (FDA Digital Health Regulatory Document)',
    },
    tensionHeadline: 'Regulatory Conflict (p < 0.001)',
    tensionSub: '• Privacy guarantee invalidation',
    tensionQuote: '“EU GDPR Article 9 invalidates traditional federated learning guarantees, making zero-knowledge verification an urgent requirement.”',
    campA: {
      label: 'Camp A — Federated Learning',
      author: 'OpenMined & Pharma AI Consortium',
      quote: '“Differential privacy with noise injection satisfies regulatory safe harbors for multi-hospital clinical trials.”',
    },
    campB: {
      label: 'Camp B — Provable Cryptography',
      author: 'Nature Digital Medicine (2025)',
      quote: '“Differential privacy degrades statistical power in rare disease cohorts; only zk-SNARK commitments guarantee zero patient leakage.”',
    },
    resolution:
      'Transitioning trial registries to ZK validity proofs allows verifying trial eligibility and survival curves without exposing underlying genomic records.',
    sources: [
      { title: 'Al-Mansoor et al. (2025)', id: 1 },
      { title: 'FDA Whitepaper #03', id: 2 },
    ],
    memoDownloadName: 'zk-clinical-trials-2026.memo.md',
    memoContent: `# Sift Synthesis Memo: Zero-Knowledge Clinical Trials
Title: Verifiable Blinding & Regulatory Compliance
Status: Verified Grounding (99.3%)

## Executive Thesis
While federated learning claims differential privacy protects clinical records [1], gradient reconstruction attacks reverse-engineer patient genomes [2], making zk-SNARKs the only mathematically sound solution.

## Tension Identified (p < 0.001)
GDPR Article 9 directly challenges federated learning pseudo-anonymization.
- Camp A: Differential privacy is sufficient for multi-hospital cohorts.
- Camp B: Gradient reconstruction leaks raw genomes; ZK proofs are mandatory.
- Synthesis: ZK validity proofs verify survival curves with zero data disclosure.

## Traceable Sources
1. Al-Mansoor et al. (2025) - Nature Digital Medicine (DOI: 10.1038/s41746-025-00892-z)
2. FDA Oncology Center of Excellence Whitepaper #03

Synthesized via Sift Technologies, PBC.
`,
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartNew, onOpenDemo }) => {
  const [selectedCase, setSelectedCase] = useState<string>('epistemic-drift');
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [activeCanvasTab, setActiveCanvasTab] = useState<'latex' | 'markdown' | 'substack' | 'bibtex'>('markdown');
  const [heroInput, setHeroInput] = useState('');
  const [showTensionModal, setShowTensionModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [showManifestoModal, setShowManifestoModal] = useState(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [selectedMethodologyStep, setSelectedMethodologyStep] = useState(0);
  const [memoDownloaded, setMemoDownloaded] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const activeCaseStudy = CASE_STUDIES[selectedCase] || CASE_STUDIES['epistemic-drift'];

  // Dynamic Real Markdown Memo Download
  const handleExportMemo = () => {
    const blob = new Blob([activeCaseStudy.memoContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeCaseStudy.memoDownloadName;
    a.click();
    URL.revokeObjectURL(url);
    setMemoDownloaded(true);
    setTimeout(() => setMemoDownloaded(false), 3000);
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroInput.trim()) {
      onStartNew(heroInput.trim());
    } else {
      onStartNew();
    }
  };

  const methodologySteps = [
    {
      num: '01',
      title: 'Concept Deconstruction',
      desc: 'Separates foundational mechanics, intended user persona, and stated value propositions from rhetorical fluff.',
      input: 'Unstructured founder pitch, napkin sketch, or Arxiv pre-print',
      output: 'Hierarchical epistemic model with 12 atomic core assertions',
      metric: '100% Bias-free extraction',
    },
    {
      num: '02',
      title: 'Falsifiable Claim Derivation',
      desc: 'Converts subjective startup claims into empirically testable, Popperian falsifiable hypotheses.',
      input: '“Our ring tracks stress better than watches”',
      output: 'Null hypothesis: Daytime PPG HRV achieves r > 0.85 against 12-lead Holter ECG',
      metric: 'Zero unfalsifiable assumptions allowed',
    },
    {
      num: '03',
      title: 'Multi-Corpus Semantic Retrieval',
      desc: 'Deep targeted cross-referencing across Arxiv, PubMed, clinical trials, patent gazettes, and expert transcripts.',
      input: 'Deconstructed semantic vector cluster',
      output: '40–80 authoritative primary sources with verified DOIs and audio timestamps',
      metric: '98%+ Grounding index',
    },
    {
      num: '04',
      title: 'Dialectic Tension Discovery',
      desc: 'Pinpoints direct empirical disagreements between reputable institutions where commercial whitepapers obscure risks.',
      input: 'Opposing peer-reviewed conclusions',
      output: 'Contradiction matrix with p-value divergence and boundary condition resolution',
      metric: 'Spotlights exact frontier of knowledge',
    },
    {
      num: '05',
      title: 'Falsification Index Scoring',
      desc: 'Calculates statistical survival probability against biological, technical, and regulatory reality checks.',
      input: 'Counter-evidence weighting and market precedent failures',
      output: 'Falsification Risk Score (0–100) with fatal flaw detection',
      metric: 'Calibrated across 2,400+ historical startup autopsies',
    },
    {
      num: '06',
      title: 'Cheapest Decisive Experiment Design',
      desc: 'Synthesizes concrete <$100, 48-hour empirical tests to decisively validate or kill the riskiest assumption.',
      input: 'Highest-leverage unproven assumption',
      output: 'Protocols with sample size, null condition, metric trigger, and timeline',
      metric: 'Maximum epistemic yield per dollar',
    },
    {
      num: '07',
      title: 'Defensible Synthesis Dossier',
      desc: 'Assembles an institutional-grade validation memo with auditable citations, competitor matrices, and execution maps.',
      input: 'Complete multi-phase analysis outputs',
      output: 'Downloadable PDF/Markdown memo ready for investment committees and board review',
      metric: 'Board & LP ready',
    },
  ];

  return (
    <div className="w-full flex flex-col bg-background font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-6 pb-16 lg:pb-28">
        {/* Subtle warm atmospheric glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-80 right-10 w-96 h-96 bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Editorial Overline Pill */}
          <div className="flex items-center justify-center lg:justify-start mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 backdrop-blur-sm border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-sm text-[11px] text-primary tracking-widest uppercase font-semibold">
                An Intelligence for Deep Synthesis
              </span>
            </div>
          </div>

          {/* Main Typography & Editorial Lead */}
          <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left mb-10">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[4rem] text-on-surface leading-[1.08] tracking-tight mb-4">
              Thoughtful clarity for a <span className="italic text-primary font-normal">noisy world.</span>
            </h1>
            <p className="font-headline text-lg sm:text-xl text-secondary font-light max-w-2xl leading-relaxed">
              Sift reads across thousands of disparate papers, transcripts, notes, and records—quietly extracting the signal, preserving the nuances, and synthesizing what actually matters.
            </p>

            {/* Tactile Interactive Opportunity Bar (Improvisation) */}
            <form onSubmit={handleHeroSubmit} className="w-full max-w-xl mx-auto lg:mx-0 mt-8">
              <div className="relative flex items-center rounded-full bg-surface-container-lowest border border-outline-variant/50 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5 pl-4 sm:pl-5">
                <span className="material-symbols-outlined text-[20px] text-primary/70 mr-2 shrink-0">
                  psychology
                </span>
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Spark an opportunity hypothesis (e.g. Smart Ring for Circadian Health)..."
                  className="flex-1 bg-transparent text-xs sm:text-sm font-body-md text-on-surface placeholder:text-secondary/60 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-label-md text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  <span>Sift</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* CTA Cluster */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-6 pt-1">
              <button
                onClick={() => onStartNew()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-label-lg text-sm shadow-[0_4px_16px_-2px_rgba(160,58,25,0.38)] hover:bg-primary-container hover:shadow-[0_8px_24px_-4px_rgba(160,58,25,0.48)] transition-all font-semibold"
              >
                <span>Begin free research trial</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('workbench-preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-sm transition-colors border border-outline-variant/30 font-medium"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">play_circle</span>
                <span>Explore interactive demo</span>
              </button>
            </div>

            {/* Interactive Improvisation: Quick Test Prompts */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              <span className="font-label-sm text-xs text-secondary font-medium mr-1">
                Try active thesis:
              </span>
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-label-md text-on-surface transition-all border border-outline-variant/30 hover:border-primary/40 shadow-xs"
                title="Open the pre-computed validation dossier"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Smart Ring for Circadian Health</span>
                <span className="text-[10px] text-primary font-semibold uppercase">Dossier →</span>
              </button>
              <button
                onClick={() => onStartNew('Decentralized Clinical Trials with Zero-Knowledge Proofs')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-label-md text-on-surface transition-all border border-outline-variant/30 hover:border-primary/40 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                <span>Zero-Knowledge Clinical Trials</span>
              </button>
              <button
                onClick={() => onStartNew('Speculative Decoding on Commodity Edge Hardware')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-label-md text-on-surface transition-all border border-outline-variant/30 hover:border-primary/40 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span>Edge LLM Speculative Decoding</span>
              </button>
            </div>

            {/* Social Proof Micro-copy */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-space-md text-secondary">
              <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
              <span className="font-label-sm text-label-sm text-secondary">
                Trusted by researchers, investigative journalists, and product strategists at leading institutions
              </span>
            </div>
          </div>

          {/* Hero Visual Composition: Claude-Style Watercolor Illustration & Live Synthesis Workbench */}
          <div
            className="relative mt-8 lg:mt-12 rounded-3xl bg-surface-container-low p-3 sm:p-6 lg:p-8 shadow-[0_12px_40px_-8px_rgba(44,40,37,0.06)] border border-outline-variant/40"
            id="workbench-preview"
          >
            {/* Interactive Domain Switcher in Workbench Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-secondary">
                  Live Case Study:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-primary font-label-sm text-[11px] font-semibold">
                  {activeCaseStudy.domainBadge}
                </span>
              </div>

              {/* 3 Domain Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container border border-outline-variant/30">
                {Object.values(CASE_STUDIES).map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => {
                      setSelectedCase(cs.id);
                      setActiveCitation(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-label-md transition-all ${
                      selectedCase === cs.id
                        ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    {cs.tabLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Illustrated Watercolor Funnel Plate */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest/80 p-6 overflow-hidden border border-outline-variant/30 shadow-xs">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
                    Plate I — Sifting Mind
                  </span>
                </div>

                {/* Injected Watercolor Artwork Asset */}
                <div
                  className="w-full max-w-[360px] aspect-[4/3] rounded-xl overflow-hidden relative shadow-sm cursor-pointer group mt-4"
                  onClick={onOpenDemo}
                  title="Click to view full Seeded Opportunity Dossier"
                >
                  <img
                    className="w-full h-full object-cover mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                    data-alt="Warm literary illustration in Claude aesthetic with a delicate ink line art drawing of a glass funnel catching chaotic falling manuscript pages, floating contemplative eye looking gently, watercolor wash in terracotta and ochre diffusing softly downward on textured unbleached paper."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH8RwGUVPHJ6Zzelu1bwfr16vLSO0WGoQZV_Kx38PHQUvJA2tAa6T5oRE207bedufmUh_FrwyzPezngDoCeIi-F-yvln0JtCULV7rwoGlcN1-xQ8FVV-zbd2pG8XEXxR6keh-KQP3Ppkq9F_zq5ExBuutKMUMG4kJZ35z8x7XGcx2kNutdlJVF1rTcgLQDavoiPflTR0nfyUwtdCEfPBY89CsjcHpmek4BSIh07floTkKQ0eI9X8XAxA"
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-xs font-semibold shadow-floating border border-outline-variant/40">
                      Open Seeded Opportunity Dossier →
                    </span>
                  </div>
                </div>

                <p className="font-headline-sm text-headline-sm italic text-secondary text-center mt-4 max-w-xs">
                  “Separating the grain of insight from the chaff of distraction.”
                </p>
              </div>

              {/* Live Workbench Preview Panel */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Simulated App Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-error/70" />
                    <span className="w-3 h-3 rounded-full bg-primary-container/70" />
                    <span className="w-3 h-3 rounded-full bg-tertiary-container/70" />
                    <span className="ml-2 font-label-md text-xs text-secondary font-mono truncate max-w-[240px] sm:max-w-none">
                      {activeCaseStudy.memoFile}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Active Synthesis</span>
                  </div>
                </div>

                {/* Main Synthesis Card with Margin Annotations */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 sm:p-8 relative shadow-sm border border-outline-variant/30">
                  {/* Meta Source Bar */}
                  <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 bg-surface-container-low/50 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-4 px-6 sm:px-8 rounded-t-2xl border-b border-outline-variant/20">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Inputs Parsed:
                    </span>
                    {activeCaseStudy.inputs.map((inp, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high font-label-sm text-label-sm text-on-surface"
                      >
                        <span className={`material-symbols-outlined text-[14px] ${inp.color}`}>
                          {inp.icon}
                        </span>{' '}
                        {inp.text}
                      </span>
                    ))}
                  </div>

                  {/* Structured Synthesis Note */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                        {activeCaseStudy.title}
                      </h3>
                      <span className="font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded font-semibold">
                        {activeCaseStudy.groundingPct}
                      </span>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                      {activeCaseStudy.beforeC1}
                      <button
                        onClick={() => setActiveCitation(activeCitation === 1 ? null : 1)}
                        className={`inline-flex items-baseline px-2 py-0.5 rounded font-label-sm font-semibold transition-all ${
                          activeCitation === 1
                            ? 'bg-primary text-white scale-105 shadow-xs'
                            : 'bg-primary-fixed/50 hover:bg-primary-fixed text-primary'
                        }`}
                        title="Click to view traceable citation"
                      >
                        {activeCaseStudy.c1Label}
                      </button>
                      {activeCaseStudy.betweenC1C2}
                      <button
                        onClick={() => setActiveCitation(activeCitation === 2 ? null : 2)}
                        className={`inline-flex items-baseline px-2 py-0.5 rounded font-label-sm font-semibold transition-all ${
                          activeCitation === 2
                            ? 'bg-primary text-white scale-105 shadow-xs'
                            : 'bg-primary-fixed/50 hover:bg-primary-fixed text-primary'
                        }`}
                        title="Click to view traceable citation"
                      >
                        {activeCaseStudy.c2Label}
                      </button>
                      {activeCaseStudy.afterC2}
                    </p>

                    {/* Interactive Citation Detail Drawer/Card */}
                    {activeCitation && (
                      <div className="mb-4 p-4 rounded-xl bg-surface-container-high/90 border border-primary/30 shadow-xs animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                            Traceable Citation #{activeCitation}
                          </span>
                          <button
                            onClick={() => setActiveCitation(null)}
                            className="text-secondary hover:text-on-surface text-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        {activeCitation === 1 ? (
                          <div className="text-xs text-on-surface space-y-1">
                            <p className="font-semibold text-on-surface">{activeCaseStudy.citation1.author}</p>
                            <p className="italic text-secondary">{activeCaseStudy.citation1.quote}</p>
                            <span className="text-[10px] text-tertiary font-bold uppercase">
                              {activeCaseStudy.citation1.badge}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-on-surface space-y-1">
                            <p className="font-semibold text-on-surface">{activeCaseStudy.citation2.author}</p>
                            <p className="italic text-secondary">{activeCaseStudy.citation2.quote}</p>
                            <span className="text-[10px] text-tertiary font-bold uppercase">
                              {activeCaseStudy.citation2.badge}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive Annotation Callout Box */}
                    <div
                      onClick={() => setShowTensionModal(true)}
                      className="rounded-xl bg-surface-container-low p-4 relative pl-5 border border-outline-variant/30 cursor-pointer hover:border-primary/50 transition-colors group"
                      title="Click to inspect dialectic contradiction"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                            {activeCaseStudy.tensionHeadline}
                          </span>
                          <span className="text-secondary font-label-sm">{activeCaseStudy.tensionSub}</span>
                        </div>
                        <span className="font-label-sm text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          Inspect Tension →
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface italic">
                        {activeCaseStudy.tensionQuote}
                      </p>
                    </div>

                    {/* Live Citation Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className="font-label-sm text-label-sm text-secondary">Traceable Sources:</span>
                        {activeCaseStudy.sources.map((src, i) => (
                          <React.Fragment key={src.id}>
                            <button
                              onClick={() => setActiveCitation(src.id)}
                              className="font-label-sm text-label-sm text-primary underline decoration-primary/40 hover:decoration-primary font-medium"
                            >
                              {src.title}
                            </button>
                            {i < activeCaseStudy.sources.length - 1 && (
                              <span className="text-secondary font-label-sm">/</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportMemo}
                          className="px-3 py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1 transition-colors border border-outline-variant/30"
                        >
                          {memoDownloaded ? (
                            <>
                              <span className="material-symbols-outlined text-[14px] text-tertiary">check</span>
                              <span className="text-tertiary font-semibold">Downloaded!</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[14px]">share</span>
                              <span>Export Memo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PHILOSOPHY OF SIFTING / EDITORIAL MANIFESTO BANNER */}
      {/* ========================================================================= */}
      <section id="philosophy" className="w-full bg-surface-container-low py-16 lg:py-24 border-y border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl mb-12">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
              The Philosophy
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl text-on-surface mt-2 leading-tight font-normal">
              How we treat your attention and the knowledge you care about.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-2xl">balance</span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3 font-normal">
                Nuance Over Volume
              </h3>
              <p className="font-body-md text-sm text-secondary leading-relaxed">
                Not another summarizer that mashes complex arguments into platitudes. Sift preserves subtle authorial disagreement, caveats, conditional phrasing, and underlying assumptions.
              </p>
              <div className="mt-auto pt-6">
                <button
                  onClick={() => setShowManifestoModal(true)}
                  className="font-label-sm text-xs text-primary flex items-center gap-1 font-semibold hover:underline"
                >
                  <span>Zero compression loss</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary mb-6">
                <span className="material-symbols-outlined text-2xl">route</span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3 font-normal">
                Traceable Lineage
              </h3>
              <p className="font-body-md text-sm text-secondary leading-relaxed">
                Every assertion, synthesis paragraph, and discovered pattern links back to the raw source: exact paragraph lines, audio timestamps, or data coordinates.
              </p>
              <div className="mt-auto pt-6">
                <button
                  onClick={onOpenDemo}
                  className="font-label-sm text-xs text-tertiary flex items-center gap-1 font-semibold hover:underline"
                >
                  <span>Auditable grounding</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-6">
                <span className="material-symbols-outlined text-2xl">spa</span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3 font-normal">
                Quiet by Design
              </h3>
              <p className="font-body-md text-sm text-secondary leading-relaxed">
                No frantic notifications, gamified badges, or algorithmic agitation. Sift is built like fine library furniture—designed to foster slow, rigorous intellectual synthesis.
              </p>
              <div className="mt-auto pt-6">
                <button
                  onClick={() => setShowManifestoModal(true)}
                  className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1 font-semibold hover:underline"
                >
                  <span>Cognitive sanctuary</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CAPABILITY MATRIX: 3 CRAFTED FEATURE PANELS */}
      {/* ========================================================================= */}
      <section id="capabilities" className="w-full py-16 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
              Capabilities
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl text-on-surface mt-2 font-normal">
              Designed for the human intellect, not against it.
            </h2>
            <p className="font-body-lg text-base text-secondary mt-3 font-light">
              A toolkit that honors the craft of reading, cross-referencing, and synthesizing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature 1: Multi-Source Distillation */}
            <div
              className="rounded-3xl bg-surface-container-low p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border border-outline-variant/30"
              id="card1"
            >
              <div>
                <div className="h-44 w-full bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between mb-6 relative overflow-hidden border border-outline-variant/20">
                  <div className="flex items-center justify-between text-secondary">
                    <span className="font-label-sm text-xs uppercase tracking-wider font-semibold">
                      Convergent Threads
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-primary">hub</span>
                  </div>

                  {/* Clean SVG Line Diagram: Converging Strands */}
                  <svg className="w-full h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 320 80">
                    <path d="M 10,15 C 90,15 150,40 240,40" opacity="0.4" strokeDasharray="3 3" strokeWidth="1.5" />
                    <path d="M 10,40 C 90,40 150,40 240,40" opacity="0.8" strokeWidth="2" />
                    <path d="M 10,65 C 90,65 150,40 240,40" opacity="0.4" strokeDasharray="3 3" strokeWidth="1.5" />
                    <circle cx="240" cy="40" fill="currentColor" r="5" />
                    <path d="M 245,40 L 310,40" strokeWidth="2.5" />
                    <circle cx="310" cy="40" fill="currentColor" r="3" />
                  </svg>

                  <div className="flex items-center justify-between text-xs text-secondary font-label-sm">
                    <span>Disparate Archives</span>
                    <span className="text-primary font-semibold">Unified Thread</span>
                  </div>
                </div>

                <h3 className="font-headline text-2xl text-on-surface mb-3 font-normal">
                  Multi-Source Distillation
                </h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">
                  Drop in messy research folders, PDF stacks, keynote transcripts, and handwritten notes. Sift continuously detects emergent themes, clusters arguments, and charts thematic lineages over time.
                </p>
              </div>

              <div className="pt-8">
                <span className="inline-block px-3 py-1 rounded-full bg-surface-container-high font-label-sm text-xs text-on-surface font-semibold">
                  Accepts 70+ Formats • Unlimited Depth
                </span>
              </div>
            </div>

            {/* Feature 2: Contradiction & Tension Mapping */}
            <div
              className="rounded-3xl bg-surface-container-low p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border border-outline-variant/30"
              id="card2"
            >
              <div>
                {/* Contradiction Quote Snippet UI */}
                <div className="h-44 w-full bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-center gap-2 mb-6 border border-outline-variant/20">
                  <div className="p-2.5 rounded-lg bg-surface-container-low text-xs font-body-sm text-secondary">
                    <span className="font-semibold text-on-surface">Dr. Rossi:</span> “Scale dictates cognitive ceiling; more compute solves reasoning.”
                  </div>
                  <div className="flex items-center justify-center my-0.5">
                    <button
                      onClick={() => setShowTensionModal(true)}
                      className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[10px] uppercase font-bold tracking-wider hover:bg-primary hover:text-white transition-colors"
                    >
                      Direct Conflict • Inspect
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low text-xs font-body-sm text-secondary">
                    <span className="font-semibold text-on-surface">Prof. Krell:</span> “Architectural distillation outperforms pure parameter scaling 3:1.”
                  </div>
                </div>

                <h3 className="font-headline text-2xl text-on-surface mb-3 font-normal">
                  Contradiction &amp; Tension Mapping
                </h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">
                  Where generic language models homogenize opposing views into bland consensus, Sift actively spotlights friction. It identifies exactly who disagrees with whom, and pinpoints why.
                </p>
              </div>

              <div className="pt-8">
                <span className="inline-block px-3 py-1 rounded-full bg-surface-container-high font-label-sm text-xs text-on-surface font-semibold">
                  Disagreement Matrix • Epistemic Maps
                </span>
              </div>
            </div>

            {/* Feature 3: Editorial Canvas & Notebook */}
            <div
              className="rounded-3xl bg-surface-container-low p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border border-outline-variant/30"
              id="card3"
            >
              <div>
                <div className="h-44 w-full bg-surface-container-lowest rounded-2xl p-4 sm:p-5 flex flex-col justify-between mb-6 relative border border-outline-variant/20">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                    <span className="font-headline text-xs italic text-on-surface">
                      Draft: Macro-Intelligence Synthesis
                    </span>
                    <button
                      onClick={() =>
                        handleCopySnippet(
                          activeCanvasTab === 'latex'
                            ? `\\begin{equation}\n  \\mathcal{L}(\\theta) = -\\sum_{t=1}^T \\log P(x_t \\mid x_{<t})\n\\end{equation}`
                            : activeCanvasTab === 'substack'
                            ? `### Epistemic Drift & Edge Distillation\nWhy frontier labs are trading raw parameter scale for verifiable grounding.`
                            : activeCanvasTab === 'bibtex'
                            ? `@article{vance2025sift,\n  title={Epistemic Grounding in Frontier Models},\n  author={Vance, Elena},\n  journal={Nature Machine Intelligence},\n  year={2025}\n}`
                            : `“We must treat model weights not as answers, but as dense catalogs awaiting human inquiry...”`
                        )
                      }
                      className="text-secondary hover:text-primary transition-colors text-xs flex items-center gap-1"
                      title="Copy snippet"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        {copiedSnippet ? 'check' : 'content_copy'}
                      </span>
                      <span className="text-[10px] font-label-sm">
                        {copiedSnippet ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>

                  {activeCanvasTab === 'markdown' && (
                    <p className="font-headline text-sm text-on-surface italic line-clamp-3 leading-snug">
                      “We must treat model weights not as answers, but as dense catalogs awaiting human inquiry...”
                    </p>
                  )}
                  {activeCanvasTab === 'latex' && (
                    <p className="font-mono text-xs text-secondary line-clamp-3 leading-snug">
                      \begin&#123;equation&#125; \mathcal&#123;L&#125;(\theta) = -\sum \log P(x_t \mid x_{`{<t}`}) \end&#123;equation&#125;
                    </p>
                  )}
                  {activeCanvasTab === 'substack' && (
                    <p className="font-body-sm text-xs text-on-surface line-clamp-3 leading-snug">
                      Published Dispatch #42: <strong>On Epistemic Drift in Foundation Models</strong>. Read by 1,840 researchers at Oxford &amp; Max Planck.
                    </p>
                  )}
                  {activeCanvasTab === 'bibtex' && (
                    <p className="font-mono text-[11px] text-secondary line-clamp-3 leading-snug">
                      @article&#123;vance2025sift, title=&#123;Epistemic Grounding&#125;, author=&#123;Vance, E.&#125;, year=&#123;2025&#125;&#125;
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setActiveCanvasTab('latex')}
                      className={`px-2 py-0.5 rounded text-[11px] font-label-sm transition-colors ${
                        activeCanvasTab === 'latex'
                          ? 'bg-tertiary-fixed/60 text-on-tertiary-fixed-variant font-bold'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      LaTeX
                    </button>
                    <button
                      onClick={() => setActiveCanvasTab('markdown')}
                      className={`px-2 py-0.5 rounded text-[11px] font-label-sm transition-colors ${
                        activeCanvasTab === 'markdown'
                          ? 'bg-primary-fixed/80 text-primary font-bold'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      Markdown
                    </button>
                    <button
                      onClick={() => setActiveCanvasTab('substack')}
                      className={`px-2 py-0.5 rounded text-[11px] font-label-sm transition-colors ${
                        activeCanvasTab === 'substack'
                          ? 'bg-surface-container-high text-on-surface font-bold'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      Substack
                    </button>
                    <button
                      onClick={() => setActiveCanvasTab('bibtex')}
                      className={`px-2 py-0.5 rounded text-[11px] font-label-sm transition-colors ${
                        activeCanvasTab === 'bibtex'
                          ? 'bg-surface-container-high text-on-surface font-bold'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      BibTeX
                    </button>
                  </div>
                </div>

                <h3 className="font-headline text-2xl text-on-surface mb-3 font-normal">
                  Editorial Canvas &amp; Notebook
                </h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">
                  A distraction-free writing space where your prose lives alongside Sift’s contextual citations. Pull evidence into your paragraphs without breaking cognitive flow or leaving your thought.
                </p>
              </div>

              <div className="pt-8">
                <span className="inline-block px-3 py-1 rounded-full bg-surface-container-high font-label-sm text-xs text-on-surface font-semibold">
                  Two-Way Sync • BibTeX Compatible
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WORKFLOW WALKTHROUGH: FROM CHAOS TO THESIS */}
      {/* ========================================================================= */}
      <section id="workflow" className="w-full bg-surface-container-low py-16 lg:py-28 border-y border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
                Workflow
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl text-on-surface mt-2 font-normal">
                From chaos to defensible thesis.
              </h2>
            </div>
            <p className="font-body-md text-sm text-secondary max-w-md mt-4 md:mt-0 font-light">
              A three-stage continuum engineered to transform raw information density into crystalline understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-surface-container-lowest rounded-3xl p-8 flex flex-col shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl text-primary/40 font-light">01</span>
                <span className="material-symbols-outlined text-secondary text-2xl">input</span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3 font-normal">
                Ingest Unbounded
              </h3>
              <p className="font-body-md text-sm text-secondary leading-relaxed mb-6">
                Feed Sift entire literature corpuses, raw audio recordings from symposiums, technical manuals, or chaotic Obsidian vaults.
              </p>
              <div className="mt-auto bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-2 text-xs font-label-md text-on-surface font-semibold">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span>Semantic parsing in background</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-surface-container-lowest rounded-3xl p-8 flex flex-col shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl text-primary/40 font-light">02</span>
                <span className="material-symbols-outlined text-secondary text-2xl">filter_alt</span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3 font-normal">
                Sift &amp; Interrogate
              </h3>
              <p className="font-body-md text-sm text-secondary leading-relaxed mb-6">
                Ask challenging epistemological questions. Formulate counter-hypotheses and let Sift assemble opposing camps of thought.
              </p>
              <div className="mt-auto bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-2 text-xs font-label-md text-on-surface font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Evaluating dialectic tensions</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-surface-container-lowest rounded-3xl p-8 flex flex-col shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl text-primary/40 font-light">03</span>
                <span className="material-symbols-outlined text-secondary text-2xl">history_edu</span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3 font-normal">
                Craft the Synthesis
              </h3>
              <p className="font-body-md text-sm text-secondary leading-relaxed mb-6">
                Generate publication-ready literature reviews, investment memos, or scientific monographs with bulletproof citations.
              </p>
              <div className="mt-auto bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-2 text-xs font-label-md text-on-surface font-semibold">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span>Ready for peer circulation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TESTIMONIAL / HUMAN VOICES & INSTITUTIONAL MARKS */}
      {/* ========================================================================= */}
      <section className="w-full py-16 lg:py-28">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-8 lg:px-12 text-center">
          {/* Serene Pull Quote */}
          <span className="material-symbols-outlined text-4xl text-primary/40 mb-4 inline-block">
            format_quote
          </span>
          <blockquote className="font-headline text-2xl sm:text-3xl lg:text-4xl text-on-surface font-normal italic leading-relaxed max-w-3xl mx-auto">
            “Sift changed the cadence of our research team. Instead of drowning in hundreds of papers each quarter, we find the critical inflection points in an afternoon.”
          </blockquote>

          {/* Author Attribution */}
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full overflow-hidden mb-3 shadow-sm bg-surface-container-high border border-outline-variant/40">
              <img
                className="w-full h-full object-cover"
                data-alt="Portrait of a distinguished female researcher with silver streaked dark hair in a serene scholarly setting with gentle natural morning light and book-lined shelves in soft focus."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIE6Cojba9wVunF91xjdfYyW0sKUDQxpa8ZkJILWFzoy3lW9S-ScUBkjNPObYHJhH4UQ9ZGfo7u-_r246jFgo5RTyGzXdCCjOmOtNO2ArKxZk8h9hQ-tOiIpEPgKtb6FGaDyAneMCvol1e9g3TiVrrkwRcGecjvtSm8kkDnYghWSwHfl-BhcPiwNKHFOx6ShlMuEaZ_XeSD7N3raETtRWDuoMN2-sPm6PNPwnZgXsE2d9mfhS-nrjW0w"
              />
            </div>
            <p className="font-label-lg text-sm text-on-surface font-semibold">Dr. Elena Vance</p>
            <p className="font-body-sm text-xs text-secondary">
              Senior Director of Research, Cognitive Systems Institute
            </p>
          </div>

          {/* Institutional Endorsement Logos (Typographic Marks) */}
          <div className="mt-16 pt-12 border-t border-surface-container flex flex-wrap items-center justify-center gap-10 lg:gap-16 opacity-75">
            <span className="font-headline text-base tracking-wider text-secondary uppercase font-semibold">
              Oxford Epistemic Lab
            </span>
            <span className="font-headline text-base tracking-wider text-secondary uppercase font-semibold">
              Max Planck Inquiry
            </span>
            <span className="font-headline text-base tracking-wider text-secondary uppercase font-semibold">
              Santa Fe Complex
            </span>
            <span className="font-headline text-base tracking-wider text-secondary uppercase font-semibold">
              The Atlantic Review
            </span>
            <span className="font-headline text-base tracking-wider text-secondary uppercase font-semibold">
              Copenhagen Institute
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. REFINED PRE-FOOTER CTA */}
      {/* ========================================================================= */}
      <section className="w-full pb-16 lg:pb-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="rounded-3xl bg-primary text-on-primary p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
            {/* Ambient decorative shapes */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-primary-container/40 blur-3xl pointer-events-none" />
            <div className="absolute left-10 -top-20 w-80 h-80 rounded-full bg-on-primary-fixed/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white font-label-sm text-xs uppercase tracking-widest mb-4 font-semibold">
                Quiet Reflection
              </span>

              <h2 className="font-headline text-3xl sm:text-5xl leading-tight mb-4 text-white font-normal">
                Give your mind the quiet it deserves.
              </h2>

              <p className="font-headline text-base sm:text-lg text-white/90 font-light max-w-xl leading-relaxed mb-8">
                Start researching with Sift today. 14-day comprehensive trial, no credit card required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => onStartNew()}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-sm shadow-md hover:bg-surface-container-low transition-all font-semibold"
                >
                  Get started for free
                </button>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-label-lg text-sm backdrop-blur-sm transition-all border border-white/20 font-semibold"
                >
                  Book an enterprise conversation
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-label-sm text-white/70">
                <span>SOC-2 Type II Certified</span>
                <span>•</span>
                <span>Zero Training on Your Private Data</span>
                <span>•</span>
                <span>Full End-to-End Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. EDITORIAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full bg-surface-container-low shadow-[0_-1px_12px_rgba(44,40,37,0.03)] border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12">
            <div className="lg:col-span-2 flex flex-col justify-between pr-4">
              <div>
                <SiftLogo size="sm" />
                <p className="font-headline text-base text-on-surface-variant font-light italic leading-relaxed mt-3">
                  Sifting complexity into profound clarity.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="font-label-md text-xs text-on-surface-variant">
                  All systems operating thoughtfully
                </span>
              </div>
            </div>

            <div>
              <p className="font-label-md text-xs text-on-surface font-semibold tracking-wider uppercase mb-4">
                Product
              </p>
              <ul className="flex flex-col gap-2.5 font-body-sm text-xs text-on-surface-variant">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowMethodologyModal(true)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Cognitive Engine
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Editions &amp; Tiers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onStartNew()}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Synthesis Workspaces
                  </button>
                </li>
                <li>
                  <span className="text-secondary/60">Integrations (API)</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-label-md text-xs text-on-surface font-semibold tracking-wider uppercase mb-4">
                Research
              </p>
              <ul className="flex flex-col gap-2.5 font-body-sm text-xs text-on-surface-variant">
                <li>
                  <button
                    onClick={onOpenDemo}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Publications
                  </button>
                </li>
                <li>
                  <span className="text-secondary/60">Epistemic Modeling</span>
                </li>
                <li>
                  <span className="text-secondary/60">Context Distillation</span>
                </li>
                <li>
                  <span className="text-secondary/60">Benchmarking</span>
                </li>
                <li>
                  <span className="text-secondary/60">Open Datasets</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-label-md text-xs text-on-surface font-semibold tracking-wider uppercase mb-4">
                Company
              </p>
              <ul className="flex flex-col gap-2.5 font-body-sm text-xs text-on-surface-variant">
                <li>
                  <button
                    onClick={() => setShowManifestoModal(true)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Manifesto
                  </button>
                </li>
                <li>
                  <span className="text-secondary/60">About Us</span>
                </li>
                <li>
                  <span className="text-secondary/60">Careers</span>
                </li>
                <li>
                  <span className="text-secondary/60">Press &amp; Inquiries</span>
                </li>
                <li>
                  <span className="text-secondary/60">Contact</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-label-md text-xs text-on-surface font-semibold tracking-wider uppercase mb-4">
                Ethics &amp; Safety
              </p>
              <ul className="flex flex-col gap-2.5 font-body-sm text-xs text-on-surface-variant">
                <li>
                  <span className="text-secondary/60">Alignment Principles</span>
                </li>
                <li>
                  <span className="text-secondary/60">Privacy Architecture</span>
                </li>
                <li>
                  <span className="text-secondary/60">Responsible AI</span>
                </li>
                <li>
                  <span className="text-secondary/60">Security Protocols</span>
                </li>
                <li>
                  <span className="text-secondary/60">Audits &amp; Reporting</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-label-md text-xs text-on-surface-variant border-t border-outline-variant/20">
            <div className="flex items-center gap-4">
              <p>© 2026 Sift Technologies, PBC. All rights reserved.</p>
              <span className="hidden md:inline text-secondary-container">•</span>
              <p className="hidden md:inline font-headline italic text-secondary">
                Words, synthesized with care.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-secondary/70">Terms</span>
              <span className="text-secondary/70">Privacy</span>
              <span className="text-secondary/70">Security</span>
              <span className="text-secondary/70">Substack</span>
              <span className="text-secondary/70">GitHub</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* DIALECTIC TENSION MODAL (INTERACTIVE IMPROVISATION) */}
      {/* ========================================================================= */}
      {showTensionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 max-w-2xl w-full shadow-floating space-y-6 relative text-on-surface animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTensionModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-primary">
                Dialectic Tension Analysis
              </span>
              <h3 className="font-headline-md text-headline-md font-normal text-on-surface mt-1">
                {activeCaseStudy.tensionHeadline}: {activeCaseStudy.title}
              </h3>
              <p className="font-body-sm text-body-sm text-secondary mt-1">
                Sift identified direct empirical disagreement between authoritative benchmark literature.
              </p>
            </div>

            {/* Dialectic Spectrum Visualizer */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-label-md">
                <span className="text-secondary font-semibold">Camp A: Consensus</span>
                <span className="text-primary font-bold">Divergence Index: 0.88</span>
                <span className="text-tertiary font-semibold">Camp B: Frontier</span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-secondary/60 w-[44%]" />
                <div className="absolute inset-y-0 left-[44%] w-2 bg-primary z-10 animate-pulse" />
                <div className="absolute inset-y-0 right-0 bg-tertiary/70 w-[54%]" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <span className="font-label-sm text-[11px] font-bold uppercase text-secondary">
                  {activeCaseStudy.campA.label}
                </span>
                <p className="font-semibold text-xs text-on-surface">{activeCaseStudy.campA.author}</p>
                <p className="text-xs text-secondary italic leading-relaxed">
                  {activeCaseStudy.campA.quote}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <span className="font-label-sm text-[11px] font-bold uppercase text-primary">
                  {activeCaseStudy.campB.label}
                </span>
                <p className="font-semibold text-xs text-on-surface">{activeCaseStudy.campB.author}</p>
                <p className="text-xs text-secondary italic leading-relaxed">
                  {activeCaseStudy.campB.quote}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary-fixed/40 border border-primary/20 space-y-1.5">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                Sift Epistemic Resolution &amp; Startup Vector
              </span>
              <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                {activeCaseStudy.resolution}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                onClick={() => setShowTensionModal(false)}
                className="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold"
              >
                Close Inspector
              </button>
              <button
                onClick={() => {
                  setShowTensionModal(false);
                  onOpenDemo();
                }}
                className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-semibold shadow-xs"
              >
                Inspect in Seeded Dossier →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRICING MODAL (IMPROVISATION) */}
      {/* ========================================================================= */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 max-w-4xl w-full shadow-floating space-y-6 relative text-on-surface max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div className="text-center max-w-xl mx-auto">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Editions &amp; Tiers
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                Calm, honest pricing for rigorous minds.
              </h3>
              <p className="font-body-md text-secondary mt-2">
                Every tier includes verified grounding, dialectic tension mapping, and zero training on your research.
              </p>

              {/* Billing Cycle Switcher */}
              <div className="mt-5 inline-flex items-center gap-2 p-1 rounded-full bg-surface-container-low border border-outline-variant/30">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`px-4 py-1.5 rounded-full text-xs font-label-md transition-all ${
                    !annualBilling
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`px-4 py-1.5 rounded-full text-xs font-label-md transition-all flex items-center gap-1.5 ${
                    annualBilling
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span>Annual</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              {/* Scholar Free Tier */}
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="font-label-sm text-secondary uppercase font-bold tracking-wider mb-2">Scholar</div>
                  <div className="font-headline-lg text-3xl font-normal text-on-surface mb-1">$0</div>
                  <div className="font-body-sm text-xs text-secondary mb-6">Always free for exploratory research</div>
                  <ul className="space-y-3 font-body-sm text-xs text-on-surface">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> 2 complete opportunity dossiers</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> Basic dialectic tension detector</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> Markdown &amp; BibTeX export</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setShowPricingModal(false);
                    onStartNew();
                  }}
                  className="mt-8 w-full py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold"
                >
                  Start Sifting Free
                </button>
              </div>

              {/* Fellow / Pro Tier */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest border-2 border-primary relative flex flex-col justify-between shadow-md">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-white font-label-sm text-[10px] uppercase font-bold tracking-wider">
                  Most Popular
                </div>
                <div>
                  <div className="font-label-sm text-primary uppercase font-bold tracking-wider mb-2">Pro Researcher</div>
                  <div className="font-headline-lg text-3xl font-normal text-on-surface mb-1">
                    {annualBilling ? '$39' : '$49'}
                    <span className="text-base text-secondary font-normal">/mo</span>
                  </div>
                  <div className="font-body-sm text-xs text-secondary mb-6">
                    {annualBilling ? 'Billed annually ($468/yr)' : 'Billed month-to-month'}
                  </div>
                  <ul className="space-y-3 font-body-sm text-xs text-on-surface">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> Unlimited opportunity dossiers</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> Unlimited validation experiments</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> Deep multi-source corpus ingestion</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">check</span> Direct LaTeX &amp; Substack integration</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setShowPricingModal(false);
                    onStartNew();
                  }}
                  className="mt-8 w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-label-md text-xs font-semibold shadow-xs"
                >
                  Start 14-Day Pro Trial
                </button>
              </div>

              {/* Institutional Lab */}
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="font-label-sm text-secondary uppercase font-bold tracking-wider mb-2">Institutional Lab</div>
                  <div className="font-headline-lg text-3xl font-normal text-on-surface mb-1">
                    {annualBilling ? '$159' : '$199'}
                    <span className="text-base text-secondary font-normal">/seat</span>
                  </div>
                  <div className="font-body-sm text-xs text-secondary mb-6">For research labs, venture funds, &amp; think tanks</div>
                  <ul className="space-y-3 font-body-sm text-xs text-on-surface">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-[16px]">check</span> Custom private knowledge corpuses</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-[16px]">check</span> Multi-seat collaboration canvas</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-[16px]">check</span> Dedicated API keys &amp; custom webhooks</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-[16px]">check</span> SOC-2 Type II audit reports</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setShowPricingModal(false);
                    alert('Our enterprise team has been notified. We will reach out within 2 hours.');
                  }}
                  className="mt-8 w-full py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold"
                >
                  Contact Institutional Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANIFESTO MODAL (IMPROVISATION) */}
      {/* ========================================================================= */}
      {showManifestoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 max-w-2xl w-full shadow-floating space-y-6 relative text-on-surface max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowManifestoModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-primary">
                The Sift Manifesto
              </span>
              <h3 className="font-headline-lg text-headline-lg font-normal text-on-surface mt-1">
                Five Principles for Deep Thought
              </h3>
            </div>

            <div className="space-y-4 font-body-md text-sm text-on-surface leading-relaxed">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h4 className="font-headline-sm text-headline-sm text-primary mb-1">I. Nuance is not compressibility</h4>
                <p className="text-secondary">True insight lives in the qualifications, edge conditions, and caveats that standard language models summarize away.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h4 className="font-headline-sm text-headline-sm text-tertiary mb-1">II. Grounding is a contract, not a probability</h4>
                <p className="text-secondary">Every claim must trace to a verifiable anchor in human discourse. Hallucinated certainty is intellectual poison.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h4 className="font-headline-sm text-headline-sm text-primary mb-1">III. Disagreement is signal, not noise</h4>
                <p className="text-secondary">When two credible scholars or founders disagree, the contradiction marks where the frontier of knowledge actually lies.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h4 className="font-headline-sm text-headline-sm text-secondary mb-1">IV. Quiet tools foster deep thought</h4>
                <p className="text-secondary">We build software like fine bookbinding: unhurried, tactile, and protective of cognitive focus.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h4 className="font-headline-sm text-headline-sm text-primary mb-1">V. Sovereign human intellect</h4>
                <p className="text-secondary">Sift organizes evidence and highlights dialectic tensions; the moral and intellectual synthesis remains strictly human.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowManifestoModal(false)}
                className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md text-xs font-semibold shadow-xs"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* METHODOLOGY MODAL (INTERACTIVE IMPROVISATION) */}
      {/* ========================================================================= */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 max-w-4xl w-full shadow-floating space-y-6 relative text-on-surface max-h-[88vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowMethodologyModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-primary">
                The Cognitive Engine
              </span>
              <h3 className="font-headline-lg text-headline-lg font-normal text-on-surface mt-1">
                The 7-Stage Epistemic Verification Pipeline
              </h3>
              <p className="font-body-md text-secondary mt-1">
                Click any stage below to inspect how Sift converts raw hypotheses into defensible validation dossiers.
              </p>
            </div>

            {/* Stage Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {methodologySteps.map((step, idx) => (
                <button
                  key={step.num}
                  onClick={() => setSelectedMethodologyStep(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-label-md shrink-0 transition-all ${
                    selectedMethodologyStep === idx
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-secondary'
                  }`}
                >
                  <span>{step.num}. </span>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>

            {/* Selected Stage Detail Panel */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-headline text-3xl font-light text-primary">
                    {methodologySteps[selectedMethodologyStep].num}
                  </span>
                  <div>
                    <h4 className="font-headline text-xl text-on-surface font-normal">
                      {methodologySteps[selectedMethodologyStep].title}
                    </h4>
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                      {methodologySteps[selectedMethodologyStep].metric}
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-body-md text-sm text-on-surface leading-relaxed">
                {methodologySteps[selectedMethodologyStep].desc}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="font-label-sm text-[11px] font-bold uppercase text-secondary">
                    Raw Input
                  </span>
                  <p className="text-xs text-on-surface font-mono mt-1">
                    {methodologySteps[selectedMethodologyStep].input}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="font-label-sm text-[11px] font-bold uppercase text-tertiary">
                    Epistemic Output
                  </span>
                  <p className="text-xs text-on-surface font-mono mt-1">
                    {methodologySteps[selectedMethodologyStep].output}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold"
              >
                Close Engine
              </button>
              <button
                onClick={() => {
                  setShowMethodologyModal(false);
                  onOpenDemo();
                }}
                className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md text-xs font-semibold shadow-xs"
              >
                Inspect Live in Dossier →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
