# Deployment Guide

Complete guide to deploying The Archive to Cloudflare.

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+
- Wrangler CLI (`npx wrangler` or install globally)

## Deployment Overview

| Step | Action |
|------|--------|
| 1 | `npx wrangler login` |
| 2 | Deploy cursor-server; note Workers URL |
| 3 | Create KV namespace; add binding in Pages dashboard |
| 4 | Create Pages project if needed |
| 5 | Set environment variables in Pages |
| 6 | Build and deploy web app |
| 7 | Configure ALLOWED_ORIGINS in cursor-server |
| 8 | Verify deployment |

---

## Step 1: Login to Cloudflare

```bash
npx wrangler login
```

Opens a browser to authenticate.

---

## Step 2: Deploy the Cursor Server

Uses Durable Objects for real-time WebSocket connections.

```bash
cd cursor-server
npm install
npm run deploy
```

Note the URL from the output, e.g. `https://cursor-server.<your-subdomain>.workers.dev`. The WebSocket endpoint is `wss://cursor-server.<your-subdomain>.workers.dev/ws`.

---

## Step 3: Create KV Namespace and Bind to Pages

1. Go to Dashboard: **Workers & Pages → KV → Create namespace**
2. Name it (e.g. `archive-site-analytics`) and copy the **Namespace ID**
3. Bind to Pages:
   - **Workers & Pages → archive-site → Settings → Functions**
   - **KV namespace bindings → Add binding**
   - Variable name: `ANALYTICS` (must match code)
   - Select your KV namespace → Save

Optional: Set the namespace ID in `web/wrangler.toml` under `[[kv_namespaces]]` for local preview.

---

## Step 4: Create Pages Project (First Time Only)

```bash
cd web
npx wrangler pages project create archive-site --production-branch=main
```

Cloudflare assigns a URL like `https://archive-site-XXXX.pages.dev`.

---

## Step 5: Set Environment Variables

In **Cloudflare Dashboard → Workers & Pages → archive-site → Settings → Environment variables** (Production):

| Variable | Type | Value |
|----------|------|-------|
| `VITE_WS_URL` | Plaintext | `wss://cursor-server.<your-subdomain>.workers.dev/ws` |
| `ANALYTICS_ADMIN_TOKEN` | Secret | A secret string for analytics reset |

> **Important:** `VITE_WS_URL` is baked into the client bundle at build time.

---

## Step 6: Build and Deploy the Web App

```bash
cd web
npm install
VITE_WS_URL=wss://cursor-server.<your-subdomain>.workers.dev/ws npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=archive-site
```

Use your actual Workers URL in `VITE_WS_URL`. Note your Pages URL after deploy.

---

## Step 7: Configure ALLOWED_ORIGINS

Update `cursor-server/wrangler.toml` to include your Pages host:

```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:4173,https://archive-site-79d.pages.dev"
```

The server allows exact origins and any subdomain of listed hosts. Add custom domains as needed.

Redeploy:
```bash
cd cursor-server
npm run deploy
```

---

## Step 8: Verify

1. Open your site in a browser
2. Open the same URL in another tab or incognito window
3. Move cursor in each tab — you should see both cursors
4. Check Network tab for `POST /api/analytics` (no 404)

---

## Auto Deploy from Git

To have Cloudflare build and deploy on every push to GitHub:

1. **Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git**
2. Authorize GitHub and select your repo
3. Configure build:
   - **Root directory:** `web`
   - **Framework preset:** None
   - **Build command:** `npm ci && npm run build`
   - **Build output directory:** `.svelte-kit/cloudflare`
   - **Node.js version:** 18 or 20
4. Set environment variables (see Step 5)
5. Save and deploy

> **Note:** The cursor-server Worker must be deployed manually with `cd cursor-server && npm run deploy`.

---

## Local Development with WebSocket

The app falls back to `ws://localhost:8787/ws` when `VITE_WS_URL` is not set.

Option A: Run cursor-server locally
```bash
cd cursor-server && npm run dev
```

Option B: Use production WebSocket
```bash
# In web/.env
VITE_WS_URL=wss://cursor-server.<your-subdomain>.workers.dev/ws
```

---

## Custom Domain (Optional)

### For Pages (web app)
1. Pages → archive-site → Custom domains → Add
2. Enter your domain and update DNS

### For Cursor Server
1. Workers → cursor-server → Settings → Triggers
2. Add custom domain or route

Then update:
- `cursor-server/wrangler.toml` → `ALLOWED_ORIGINS`
- Pages env var `VITE_WS_URL`

---

## Analytics API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get visit count + top referrers |
| POST | `/api/analytics` | Record a visit (body: `{ referrer?: string }`) |
| DELETE | `/api/analytics` | Reset all analytics (requires auth) |

### Reset Analytics
```bash
curl -X DELETE "https://your-site.pages.dev/api/analytics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Environment Variables Reference

### Web App (Cloudflare Pages)

| Variable | Description |
|----------|-------------|
| `VITE_WS_URL` | WebSocket server URL (build-time) |
| `ANALYTICS_ADMIN_TOKEN` | Secret for analytics reset |

### Cursor Server

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Comma-separated allowed origins for CORS |

---

## Cost (Cloudflare Free Tier)

| Resource | Free Limit |
|----------|------------|
| Pages requests | 100K/day |
| Workers requests | 100K/day |
| Durable Objects requests | 1M/month |
| Durable Objects duration | 400K GB-sec/month |
| KV reads | 100K/day |
| KV writes | 1K/day |
| KV storage | 1GB |

For a hobby cursor sharing app, you'll stay well within free limits.
