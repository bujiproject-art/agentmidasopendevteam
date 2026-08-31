# Bounty #23 — FAQ Manager

A focused, dependency-free FAQ Manager component for the Agent Midas frontend stack.

## What it includes

- Dynamic FAQ filtering
- Full-text search across question, answer, and category
- Category filter chips
- Accessible accordion behavior with `aria-expanded` and `aria-controls`
- Keyboard-focus states
- Empty-state recovery
- Mobile-first layout for 375px+
- Agent Midas dark/gold design system
- No new npm dependencies

## Integration

Place `FAQManager.tsx` in the appropriate app/component location in the Agent Midas Next.js frontend and render it from the desired route:

```tsx
import FAQManager from './FAQManager';

export default function FAQPage() {
  return <FAQManager />;
}
```

The component uses only React state/memo hooks plus the existing Tailwind utility classes described in the project contribution guide.

## Notes

The public bounty repository currently contains contribution/program documentation rather than the production Next.js application source tree, so this submission keeps the implementation isolated and avoids inventing or modifying unavailable production routes.
