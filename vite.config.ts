import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/invest_forecast/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['invest_forecast.png'],
      manifest: {
        name: 'Invest Forecast',
        short_name: 'InvForecast',
        description: 'Personal investment forecasting tool',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/invest_forecast/',
        icons: [
          {
            src: 'invest_forecast.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'invest_forecast.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
