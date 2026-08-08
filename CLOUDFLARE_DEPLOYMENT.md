# Cloudflare Deployment Guide

This guide explains how to deploy the period tracking app to Cloudflare using Workers, Pages, D1, and KV.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works)
- Wrangler CLI installed: `npm install -g wrangler`

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser to authenticate with your Cloudflare account.

### 3. Create D1 Database

```bash
npm run db:create
```

This will create a D1 database and output a database ID. Copy this ID.

### 4. Update wrangler.jsonc

Replace the placeholder IDs in `wrangler.jsonc` with your actual IDs:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "daurung-db",
      "database_id": "YOUR_ACTUAL_DB_ID", // Replace this
      "migrations_dir": "./migrations"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "YOUR_ACTUAL_KV_ID" // Replace this
    }
  ]
}
```

### 5. Create KV Namespace

```bash
npm run kv:create
```

Copy the KV namespace ID and update `wrangler.jsonc`.

### 6. Run Database Migrations

For local development:
```bash
npm run db:migrate:local
```

For production:
```bash
npm run db:migrate:remote
```

## Development

### Run Worker Locally

```bash
npm run worker:dev
```

This will start the Worker API at `http://localhost:8787`.

### Run Frontend Locally

Create a `.env.local` file (copy from `env.example`):
```bash
cp env.example .env.local
```

Then run:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Deployment

### Deploy Worker (API)

Deploy to production:
```bash
npm run worker:deploy
```

Deploy to staging:
```bash
npm run worker:deploy:staging
```

### Deploy Frontend to Cloudflare Pages

There are two ways to deploy the frontend:

#### Option 1: Using Cloudflare Pages Dashboard

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Click "Create a project"
3. Connect to your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variable: `VITE_API_URL` with your Worker URL
6. Deploy

#### Option 2: Using Wrangler (if you have a Pages project)

```bash
npm run build
wrangler pages deploy dist --project-name=daurung-frontend
```

### Update Frontend API URL

After deploying the Worker, get the Worker URL from the Cloudflare dashboard and update:

1. In Cloudflare Pages project settings, add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-worker-name.YOUR_SUBDOMAIN.workers.dev`

2. Or update `.env.local` for local development.

## Architecture

### Components

- **Cloudflare Workers**: API backend (Hono.js framework)
- **Cloudflare Pages**: Frontend React application
- **Cloudflare D1**: SQLite database for logs, cycles, settings
- **Cloudflare KV**: Key-value store for caching

### API Endpoints

- `GET /` - Health check
- `GET /api/logs` - Get all logs
- `GET /api/logs/:date` - Get log for specific date
- `POST /api/logs` - Create/update log
- `DELETE /api/logs/:date` - Delete log
- `GET /api/cycles` - Get all cycles
- `GET /api/cycles/:id` - Get specific cycle
- `POST /api/cycles` - Create cycle
- `PUT /api/cycles/:id` - Update cycle
- `DELETE /api/cycles/:id` - Delete cycle
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save user settings

### Database Schema

The D1 database has the following tables:

- `users` - User accounts (for future multi-user support)
- `daily_logs` - Daily period tracking logs
- `period_cycles` - Menstrual cycle records
- `cycle_settings` - User cycle settings

## Environment Variables

### Worker (wrangler.jsonc)
- `ENVIRONMENT` - "production" or "staging"

### Frontend (Cloudflare Pages)
- `VITE_API_URL` - URL of the deployed Worker

## Monitoring

### View Worker Logs

```bash
wrangler tail
```

### Check Worker Status

```bash
wrangler deployments list
```

## Troubleshooting

### Worker deployment fails

- Check that database and KV IDs are correct in `wrangler.jsonc`
- Ensure migrations have been applied: `npm run db:migrate:remote`
- Check logs: `wrangler tail`

### Frontend can't connect to API

- Verify `VITE_API_URL` is set correctly
- Check CORS settings in Worker (configured to allow all origins)
- Ensure Worker is deployed and accessible

### Database errors

- Verify migrations ran successfully
- Check database schema in Cloudflare dashboard
- Review Worker logs for SQL errors

## Cost

This setup uses Cloudflare's free tier:

- **Workers**: 100,000 requests/day free
- **Pages**: Unlimited bandwidth, 500 builds/month free
- **D1**: 5GB storage, 5 million reads/day free
- **KV**: 100,000 reads/day, 1,000 writes/day free

For a personal period tracking app, this should be more than sufficient.

## Security Considerations

- Add proper authentication (currently uses simple user ID header)
- Implement rate limiting
- Add HTTPS enforcement
- Consider adding Cloudflare Turnstile for bot protection
- Use Cloudflare Secrets for sensitive data

## Future Enhancements

- Add user authentication with Cloudflare Access
- Implement proper user accounts
- Add email notifications for period reminders
- Implement data export/import via API
- Add analytics with Cloudflare Analytics Engine
