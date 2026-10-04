import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';

interface BillingViewProps {
  onPlanUpdated: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onPlanUpdated }) => {
  const [usage, setUsage] = useState<{
    plan: string;
    isSubscribed: boolean;
    usageCount: number;
    maxFree: number;
    freeRemaining: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadUsage = async () => {
    try {
      const data = await api.getBillingUsage();
      setUsage(data);
    } catch (err) {
      console.error('Failed to load usage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const handleUpgrade = async (plan: 'ONE_TIME' | 'PRO') => {
    setUpgrading(true);
    setMessage(null);
    try {
      const res = await api.upgradePlan(plan);
      setMessage(res.message);
      await loadUsage();
      onPlanUpdated();
    } catch (err: any) {
      alert(err?.message || 'Upgrade failed.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
        <p className="text-xs text-secondary">Loading usage entitlements...</p>
      </div>
    );
  }

  const freeRemaining = usage?.freeRemaining ?? 2;
  const usageCount = usage?.usageCount ?? 0;
  const isSubscribed = usage?.isSubscribed ?? false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <div className="mb-8 pb-6 border-b border-border">
        <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
          Subscriptions &amp; Passports
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-semibold text-on-surface mt-1">
          Usage &amp; Subscription Entitlements
        </h1>
        <p className="text-sm text-secondary font-light mt-1">
          Transparent, auditable access. Sift grants 2 complete epistemic syntheses free to evaluate value.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-2xl bg-tertiary-fixed/30 border border-tertiary-fixed text-on-surface text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-tertiary" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Account Usage Ledger Box (PRD §49, §57) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest border border-border mb-10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface">
              Account Usage Ledger (PRD §48)
            </span>
          </div>
          <span className="font-label-sm text-xs font-bold px-3 py-1 rounded-full bg-primary-fixed/50 text-primary">
            Active Plan: {usage?.plan ?? 'FREE'}
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface-container-low border border-border/60">
            <div className="text-xs text-secondary mb-1">Syntheses Completed</div>
            <div className="text-2xl font-headline font-semibold text-on-surface">{usageCount}</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-border/60">
            <div className="text-xs text-secondary mb-1">Free Tier Allocation</div>
            <div className="text-2xl font-headline font-semibold text-on-surface">2 analyses</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-border/60">
            <div className="text-xs text-secondary mb-1">Remaining Passes</div>
            <div className="text-2xl font-headline font-semibold text-tertiary">
              {isSubscribed ? 'Unlimited (Pro)' : `${freeRemaining} left`}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* One-Time Decision */}
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-border flex flex-col justify-between shadow-xs hover:border-outline-variant transition-all">
          <div>
            <span className="font-label-sm text-xs uppercase font-bold text-secondary tracking-wider">
              Single Thesis Pass
            </span>
            <div className="text-3xl font-headline font-semibold text-on-surface mt-1 mb-2">
              $49 <span className="text-xs font-body font-normal text-secondary">/ synthesis</span>
            </div>
            <p className="text-xs text-secondary mb-6 leading-relaxed">
              When you need an immediate, evidence-grounded go/no-go determination for a high-stakes decision.
            </p>

            <ul className="space-y-3 text-xs text-on-surface-variant mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary" />
                <span>1 deep forensic opportunity dossier</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary" />
                <span>Full "Challenge the Idea" counter-evidence hunt</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary" />
                <span>Full Markdown &amp; BibTeX export</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('ONE_TIME')}
            disabled={upgrading}
            className="w-full py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-semibold text-xs transition-all border border-border"
          >
            {upgrading ? 'Processing...' : 'Purchase Single Analysis ($49)'}
          </button>
        </div>

        {/* Pro Subscription */}
        <div className="p-8 rounded-3xl bg-surface-container-lowest border-2 border-primary/50 shadow-md flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-[10px] font-bold tracking-wider uppercase text-on-primary shadow-xs">
            RECOMMENDED
          </div>
          <div>
            <span className="font-label-sm text-xs uppercase font-bold text-primary tracking-wider">
              Unlimited Access
            </span>
            <div className="text-3xl font-headline font-semibold text-on-surface mt-1 mb-2">
              $79 <span className="text-xs font-body font-normal text-secondary">/ month</span>
            </div>
            <p className="text-xs text-secondary mb-6 leading-relaxed">
              For active founders, investment syndicates, and research studios evaluating multiple opportunity theses.
            </p>

            <ul className="space-y-3 text-xs text-on-surface-variant mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Unlimited opportunity research runs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Continuous thesis versioning &amp; dialectic diffs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Empirical experiment tracking workspace</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Priority research agent worker pool</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('PRO')}
            disabled={upgrading || isSubscribed}
            className="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold text-xs transition-all shadow-[0_2px_10px_-2px_rgba(160,58,25,0.35)] disabled:opacity-50"
          >
            {isSubscribed ? 'Active Subscription' : upgrading ? 'Activating...' : 'Upgrade to Pro ($79/mo)'}
          </button>
        </div>
      </div>
    </div>
  );
};
