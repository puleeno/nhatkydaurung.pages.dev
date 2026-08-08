<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Daurung - Period Tracking App

A modern period tracking application built with React, now migrated to Cloudflare infrastructure.

View your app in AI Studio: https://ai.studio/apps/418faf78-f64b-4ae7-87bd-a88691d45be5

## 🚀 Cloudflare Deployment

This app has been migrated to use Cloudflare's edge computing platform:

- **Cloudflare Workers**: API backend (Hono.js)
- **Cloudflare Pages**: Frontend React application
- **Cloudflare D1**: SQLite database for data storage
- **Cloudflare KV**: Key-value store for caching

### Quick Start with Cloudflare

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Cloudflare**:
   ```bash
   wrangler login
   npm run db:create
   npm run kv:create
   npm run db:migrate:remote
   ```

3. **Update wrangler.jsonc** with your database and KV IDs

4. **Deploy Worker**:
   ```bash
   npm run worker:deploy
   ```

5. **Build and deploy frontend**:
   ```bash
   npm run build
   # Deploy to Cloudflare Pages via dashboard or wrangler
   ```

For detailed deployment instructions, see [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md).

## 💻 Local Development

**Prerequisites:** Node.js

### Frontend Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from `env.example`:
   ```bash
   cp env.example .env.local
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

### Worker Development

1. Start the Worker API:
   ```bash
   npm run worker:dev
   ```

The Worker API will be available at `http://localhost:8787`.

## 📁 Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── services/         # API service layer
│   ├── utils/           # Utility functions
│   ├── worker/          # Cloudflare Worker backend
│   │   ├── routes/      # API route handlers
│   │   └── middleware/  # Custom middleware
│   ├── App.tsx          # Main React app
│   └── types.ts         # TypeScript types
├── migrations/          # D1 database migrations
├── wrangler.jsonc       # Cloudflare Worker config
├── _headers             # Cloudflare Pages headers
├── _redirects           # Cloudflare Pages redirects
└── CLOUDFLARE_DEPLOYMENT.md  # Deployment guide
```

## 🔧 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run worker:dev` - Start Worker development server
- `npm run worker:deploy` - Deploy Worker to production
- `npm run db:migrate:local` - Apply database migrations locally
- `npm run db:migrate:remote` - Apply database migrations to production
- `npm run types` - Generate TypeScript types from wrangler config

## 🏗️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Vite
- **Backend**: Cloudflare Workers, Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV
- **Hosting**: Cloudflare Pages

## 📊 Features

- Track daily menstrual cycle logs
- Calendar view with cycle predictions
- Health tips and statistics
- Data export/import functionality
- Multi-device sync via cloud database
- Responsive design for mobile and desktop

## 🔒 Privacy

All data is stored in your personal Cloudflare D1 database. No data is shared with third parties.

## 📄 License

SPDX-License-Identifier: Apache-2.0
