'use client';

import React, { useMemo, useState } from 'react';

export interface CommissionTier {
  consultantRate: number; // 50% for Tiers 1-2
  agencyRate: number;     // 75% for Tiers 3-6
}

export interface Plan {
  id: string;
  name: string;
  codename: string;
  price: number;
  tier: number;
  path: 'AI Consultant' | 'Agency Builder';
}

const PLANS: Plan[] = [
  { id: 'pulse', name: 'Pulse', codename: 'PULSE', price: 150, tier: 1, path: 'AI Consultant' },
  { id: 'amplify', name: 'Amplify', codename: 'AMPLIFY', price: 250, tier: 2, path: 'AI Consultant' },
  { id: 'autopilot', name: 'Autopilot', codename: 'AUTOPILOT', price: 400, tier: 3, path: 'Agency Builder' },
  { id: 'pipeline', name: 'Pipeline', codename: 'PIPELINE', price: 600, tier: 4, path: 'Agency Builder' },
  { id: 'forge', name: 'Forge', codename: 'FORGE', price: 1000, tier: 5, path: 'Agency Builder' },
  { id: 'citadel', name: 'Citadel', codename: 'CITADEL', price: 3000, tier: 6, path: 'Agency Builder' },
];

const DEFAULT_RATES: CommissionTier = {
  consultantRate: 50,
  agencyRate: 75,
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export interface CommissionCalculatorProps {
  initialRates?: CommissionTier;
}

export function CommissionCalculator({ initialRates = DEFAULT_RATES }: CommissionCalculatorProps) {
  const [rates, setRates] = useState<CommissionTier>(initialRates);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('autopilot');
  const [clients, setClients] = useState<number>(3);
  const [months, setMonths] = useState<number>(12);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[2],
    [selectedPlanId]
  );

  const commissionRate =
    selectedPlan.tier <= 2 ? rates.consultantRate : rates.agencyRate;

  const monthlyPerClient = (selectedPlan.price * commissionRate) / 100;
  const monthlyTotal = monthlyPerClient * clients;
  const yearlyTotal = monthlyTotal * months;
  const lifetimeHint = monthlyTotal * 24; // simple 24-month projection

  const updateRate = (key: keyof CommissionTier, value: number) => {
    if (!Number.isFinite(value)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setRates((prev) => ({ ...prev, [key]: clamped }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 p-5 sm:p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="border-b border-[#D4AF37]/30 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
            Agent Midas
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Commission Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Instant earnings estimator for affiliate recruitment. See exactly how
            much you earn per client, every month.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left – Controls */}
          <section className="lg:col-span-2 space-y-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
                Select Plan
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      selectedPlanId === plan.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                        : 'border-white/10 bg-black/40 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold">{plan.codename}</div>
                    <div className="text-xs opacity-80">{formatMoney(plan.price)}/mo</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-300">
                Number of Clients
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={clients}
                  onChange={(e) => setClients(Number(e.target.value))}
                  className="mt-2 w-full accent-[#D4AF37]"
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>1</span>
                  <span className="font-bold text-[#D4AF37]">{clients}</span>
                  <span>50</span>
                </div>
              </label>

              <label className="block text-sm font-medium text-zinc-300">
                Projection Months
                <input
                  type="range"
                  min={1}
                  max={36}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="mt-2 w-full accent-[#D4AF37]"
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>1</span>
                  <span className="font-bold text-[#D4AF37]">{months} mo</span>
                  <span>36</span>
                </div>
              </label>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-zinc-300">Commission Rates</h3>
              <label className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">AI Consultant (T1–T2)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={rates.consultantRate}
                    onChange={(e) => updateRate('consultantRate', Number(e.target.value))}
                    className="w-16 rounded border border-white/15 bg-black px-2 py-1 text-right text-white"
                  />
                  <span className="text-zinc-500">%</span>
                </div>
              </label>
              <label className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Agency Builder (T3–T6)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={rates.agencyRate}
                    onChange={(e) => updateRate('agencyRate', Number(e.target.value))}
                    className="w-16 rounded border border-white/15 bg-black px-2 py-1 text-right text-white"
                  />
                  <span className="text-zinc-500">%</span>
                </div>
              </label>
            </div>
          </section>

          {/* Right – Results */}
          <section className="lg:col-span-3 space-y-5">
            {/* Big numbers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-[#D4AF37]/80">
                  Monthly Earnings
                </p>
                <p className="mt-1 text-3xl font-black text-[#D4AF37]">
                  {formatMoney(monthlyTotal)}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatMoney(monthlyPerClient)} × {clients} client{clients > 1 ? 's' : ''}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">
                  {months}-Month Projection
                </p>
                <p className="mt-1 text-3xl font-black text-emerald-400">
                  {formatMoney(yearlyTotal)}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Recurring · same clients stay
                </p>
              </div>
            </div>

            {/* Breakdown card */}
            <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Breakdown
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Selected Plan</dt>
                  <dd className="font-medium text-white">
                    {selectedPlan.codename} · {formatMoney(selectedPlan.price)}/mo
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Path</dt>
                  <dd className="font-medium text-white">{selectedPlan.path}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Your Commission Rate</dt>
                  <dd className="font-medium text-[#D4AF37]">{commissionRate}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Per Client / Month</dt>
                  <dd className="font-medium text-white">{formatMoney(monthlyPerClient)}</dd>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <dt className="text-zinc-400">24-Month Lifetime Hint</dt>
                  <dd className="font-bold text-emerald-400">{formatMoney(lifetimeHint)}</dd>
                </div>
              </dl>
            </div>

            {/* Quick comparison table */}
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3 text-right">You Earn / mo</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANS.map((plan) => {
                    const rate = plan.tier <= 2 ? rates.consultantRate : rates.agencyRate;
                    const earn = (plan.price * rate) / 100;
                    const isActive = plan.id === selectedPlanId;
                    return (
                      <tr
                        key={plan.id}
                        className={`border-t border-white/5 ${
                          isActive ? 'bg-[#D4AF37]/10' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-4 py-2.5 font-medium text-white">
                          {plan.codename}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">
                          {formatMoney(plan.price)}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">{rate}%</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-[#D4AF37]">
                          {formatMoney(earn)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="text-center text-xs text-zinc-500">
          Numbers based on Agent Midas Commission Policy. Actual earnings depend on client retention.
        </footer>
      </div>
    </div>
  );
}

export default CommissionCalculator;
