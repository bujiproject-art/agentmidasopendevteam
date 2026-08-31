'use client';

import { useMemo, useState } from 'react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'getting-started-1',
    question: 'How do I get started with Agent Midas?',
    answer:
      'Choose the area you want help with, open the matching tool, and follow the guided steps. The interface is designed to keep the most important actions visible first.',
    category: 'Getting Started',
  },
  {
    id: 'getting-started-2',
    question: 'Do I need technical experience?',
    answer:
      'No. Agent Midas is designed for clear, guided use. Advanced controls can stay out of the way until you need them.',
    category: 'Getting Started',
  },
  {
    id: 'account-1',
    question: 'Where can I manage my account?',
    answer:
      'Open Settings from the dashboard to update profile information and review account options.',
    category: 'Account',
  },
  {
    id: 'account-2',
    question: 'How do I keep my account secure?',
    answer:
      'Use a unique password, keep sign-in methods private, and review connected services regularly. Never share access credentials in messages.',
    category: 'Account',
  },
  {
    id: 'billing-1',
    question: 'Where can I review billing information?',
    answer:
      'Billing and subscription information is available from the account area. Review the displayed plan and charges before confirming any change.',
    category: 'Billing',
  },
  {
    id: 'support-1',
    question: 'What if I cannot find the answer I need?',
    answer:
      'Try a shorter search phrase or clear the category filter. If the answer is still missing, use the support option in the dashboard.',
    category: 'Support',
  },
];

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function FAQManager() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(FAQS.map((item) => item.category)))],
    [],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query);

    return FAQS.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const haystack = normalize(`${item.question} ${item.answer} ${item.category}`);
      return matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [category, query]);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setOpenId(null);
  };

  return (
    <section className="min-h-screen bg-[#0A0A0A] px-4 py-12 text-[#F5F5F5] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Help Center
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#9CA3AF]">
            Search common questions or choose a category. Answers open in place so you never lose your spot.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-4 sm:p-5">
          <label htmlFor="faq-search" className="mb-2 block text-sm font-medium text-[#F5F5F5]">
            Search FAQs
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “billing” or “account”"
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-base text-[#F5F5F5] outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
          />

          <div className="mt-4" aria-label="FAQ categories">
            <p className="mb-2 text-sm font-medium text-[#F5F5F5]">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => {
                const selected = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] ${
                      selected
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#F5F5F5] hover:border-[#D4AF37] hover:text-[#E8C547]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6" aria-live="polite">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm text-[#9CA3AF]">
              {filtered.length} {filtered.length === 1 ? 'answer' : 'answers'} found
            </p>
            {(query || category !== 'All') && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-[#D4AF37] underline-offset-4 hover:text-[#E8C547] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((item) => {
                const isOpen = openId === item.id;
                const panelId = `${item.id}-answer`;

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] transition hover:bg-[#141414]"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D4AF37]"
                    >
                      <span>
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
                          {item.category}
                        </span>
                        <span className="block text-base font-semibold text-[#F5F5F5] sm:text-lg">
                          {item.question}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] text-xl text-[#D4AF37]"
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {isOpen && (
                      <div id={panelId} className="border-t border-[#2A2A2A] px-5 py-5">
                        <p className="max-w-3xl text-base leading-7 text-[#9CA3AF]">{item.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] px-5 py-10 text-center">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">No matching FAQs</h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                Try a different word or clear the category filter.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8C547] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
              >
                Show all FAQs
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FAQManager;
