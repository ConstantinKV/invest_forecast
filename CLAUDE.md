# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Invest Forecast** is a personal investment forecasting PWA that tracks investments and calculates expected interest income.

## Tech Stack

- React 18 + TypeScript
- Vite 8 + vite-plugin-pwa (PWA / service worker)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router v6 for navigation
- date-fns for date calculations
- localStorage for persistence (no backend)

## Commands

```bash
npm run dev       # start dev server
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # preview production build
```

## Directory Structure

```
src/
  types/index.ts          # TypeScript interfaces (Investment, InvestmentType, AppSettings)
  hooks/
    useLocalStorage.ts    # generic localStorage hook
    useInvestments.ts     # CRUD for investments (key: invest_forecast_investments)
    useSettings.ts        # app settings (key: invest_forecast_settings)
  utils/
    calculations.ts       # financial calculations (yearly net, per-payment, summary)
    formatters.ts         # currency/date formatting helpers
  components/
    Layout.tsx            # responsive layout: bottom tab bar (mobile) / top nav (desktop)
    InvestmentForm.tsx    # add/edit form with validation
    InvestmentRow.tsx     # table row for desktop list
    InvestmentCard.tsx    # card for mobile list
    Summary.tsx           # summary stats section with future-toggle
    SettingsPage.tsx      # investment types management + theme selector
    InvestmentList.tsx    # main list page (table on desktop, cards on mobile)
  App.tsx                 # router, theme management
  main.tsx
  index.css               # Tailwind import + base styles
public/
  invest_forecast.png     # app icon (also used as PWA icon)
```

## Key Notes

- All data stored in localStorage; no API calls
- Theme (light/dark/system) is applied via `dark` class on `<html>` element
- Future investments (startDate > today) shown at opacity-50 with a blue tint
- Summary excludes future investments by default (toggle to include them)
- Summary only counts `activated=true` investments
- install dependencies with `--legacy-peer-deps` due to vite-plugin-pwa peer dep constraints on Vite 8
