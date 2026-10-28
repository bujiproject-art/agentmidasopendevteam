# Bounty #14 — Commission Calculator Widget ($150)

Interactive earnings estimator for Agent Midas affiliate recruitment.

## Features

- All 6 official plans (Pulse → Citadel) with correct pricing
- Live commission rate controls (Consultant 50% / Agency Builder 75%)
- Client count + projection months sliders
- Monthly + multi-month earnings projection
- Side-by-side plan comparison table
- Agent Midas Black / Gold design system (`#0A0A0A` + `#D4AF37`)
- Fully client-side, no external API calls
- TypeScript + React 19 ready

## Quick Start

```bash
# Drop into any Next.js / Vite React project
import { CommissionCalculator } from './CommissionCalculator';

export default function Page() {
  return <CommissionCalculator />;
}
```

## File Structure

```
bounties/14-commission-calculator/
├── CommissionCalculator.tsx   # Main component
├── index.ts                   # Public exports
└── README.md
```

## Design Notes

- Background: `#0A0A0A`
- Accent: `#D4AF37` (gold)
- Cards use subtle white borders + translucent backgrounds
- Responsive: mobile-first, 2-column on large screens

## Acceptance

- [x] Configurable commission rates
- [x] Real-time calculation
- [x] All official plans included
- [x] Clean, accessible UI
- [x] No new dependencies beyond React
