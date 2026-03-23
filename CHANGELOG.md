# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-23

### Added
- PIN lock screen with SHA-256 hashed PIN stored in localStorage
- PIN management in Settings: enable, change, and remove PIN
- Summary section now appears above the investments table
- Summary cards show red corner indicators with tap-to-show hint toasts (all screen sizes)
- "Include future investments" toggle moved below Summary
- About section in Settings with app info and GitHub link
- `mobile-web-app-capable` meta tag for Android PWA

### Changed
- Default sort direction changed to descending (newest entries on top)
- Status bar color now matches app background per theme (white for light, `#111827` for dark)
- Status bar icons adapt automatically: dark icons on light background, white icons on dark background
- iOS status bar style updates dynamically with theme changes
- PWA service worker disabled in dev mode to allow HMR to work correctly
- Manifest href changed to relative path so Vite base URL is applied correctly
- Deploy workflow now only runs after CI passes

### Fixed
- Hard reload no longer served stale cached files in development
- Manifest syntax error in browser console caused by incorrect href

## [0.1.0] - 2026-03-22

### Added
- Initial release
- Investment tracking with CRUD operations
- Summary statistics (total amount, avg rate, yearly net, monthly average, current month forecast)
- Desktop table view and mobile card view
- Sortable columns (date, period, amount, rate, yearly net)
- Investment types management with configurable fees
- Light / dark / system theme selector
- PWA support with service worker and installability
- LocalStorage persistence (no backend)
- GitHub Pages deployment via CI/CD
