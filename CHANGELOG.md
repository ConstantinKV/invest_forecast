# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-22

### Added
- Investment list with sortable columns (date, period, amount, rate, yearly net)
- Add / edit / delete investment profiles
- Investment fields: start date, period, interest frequency, type, amount, currency, annual rate, activated
- Automatic calculation of yearly net income and per-payment amounts after fee deduction
- Summary dashboard: total capital, average rate, total yearly net, monthly average, current month forecast
- Future investments support: plan ahead, shown with reduced opacity in the list
- "Include future investments" toggle above the table — controls both list visibility and summary calculations
- Configurable investment types with per-type fee rates (default: Bonds 0%, Bank Deposit 6%)
- Light / Dark / System theme
- Responsive layout: top navigation on desktop, bottom tab bar on mobile
- PWA: installable on Android and iOS, works offline via service worker
- GitHub Pages deployment at https://constantinkv.github.io/invest_forecast/
- GitHub Actions CI: lint → test → build on every push
- 122 tests with Vitest + React Testing Library
