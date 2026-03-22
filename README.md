# Invest Forecast

A personal investment forecasting PWA for tracking deposits, bonds, and other fixed-income instruments. Calculates expected interest income, net of fees, across multiple currencies and payment frequencies.

## Features

- Track investments with start date, period, interest rate, currency, and payment frequency
- Automatic calculation of yearly net income and per-payment amounts (after tax/fee deduction)
- Summary dashboard: total capital, average rate, yearly net, monthly average, current month forecast
- Future investments: plan ahead and optionally include them in summary calculations
- Sortable investment list (by date, period, amount, rate, yearly net)
- Configurable investment types with per-type fee rates (e.g. income tax on bank deposits)
- Light / Dark / System theme
- Works offline — all data stored in browser localStorage
- Installable as a PWA on desktop and mobile

## Tech Stack

- **React 18** + TypeScript
- **Vite 8** + vite-plugin-pwa (service worker, offline support)
- **Tailwind CSS v4**
- **React Router v6**
- **date-fns** for date arithmetic
- **Vitest** + React Testing Library for tests

## Requirements

- Node.js 18+
- npm 9+

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Type-check + production build
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm test             # Run tests (single pass)
npm run test:watch   # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

## Investment Model

Each investment has:

| Field | Values |
|-------|--------|
| Start date | Any date (past or future) |
| Period | 6, 12, 18, 24, 25, 36, or 60 months |
| Interest frequency | Monthly, Biannual, Annual |
| Investment type | Bonds (0% fee), Bank Deposit (6% fee), or custom |
| Amount | Positive number |
| Currency | MDL, EUR, USD |
| Annual interest rate | 0–100% |
| Activated | Active / Inactive |

**Net income formula:**
```
Yearly net = Amount × (Rate / 100) × (1 - Fee / 100)
Per payment = Yearly net / payments_per_year
```

## Data Storage

All data is stored in `localStorage` under two keys:

- `invest_forecast_investments` — list of investment profiles
- `invest_forecast_settings` — investment types and theme preference

No backend, no account, no network requests.

## Development

This project was built with [Claude Code](https://claude.ai/code) — Anthropic's AI-powered CLI for software development. The entire application, including architecture, implementation, tests, and CI configuration, was created through an interactive session with Claude Sonnet 4.6 in approximately 2.5 hours.

## License

MIT License — Copyright (c) 2026 ConstantinKV

See [LICENSE](LICENSE) for full text.
