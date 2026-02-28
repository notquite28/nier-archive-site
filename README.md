# The Archive

Real-time cursor sharing with YoRHa-inspired aesthetics from NieR: Automata.

## Structure

```
├── cursor-server/      # WebSocket server (Cloudflare Workers + Durable Objects)
├── web/                # SvelteKit frontend
│   ├── vite-plugin-transmissions.ts   # Build-time: parses .md → virtual module
│   ├── src/routes/api/analytics/       # Analytics API (SvelteKit route, KV)
│   ├── src/content/transmissions/      # Markdown blog posts (add file + build)
│   └── functions/api/                  # Optional Pages Functions (same logic)
```

## Quick Start (Local Dev)

### 1. Start the Cursor Server

```bash
cd cursor-server
npm install
npm run dev
```

### 2. Start the Svelte Frontend

```bash
cd web
npm install
npm run dev
```

### 3. Open http://localhost:5173

Open multiple tabs to see cursor sharing in action.

## Features

- **Live cursor sharing** - See other visitors' cursors in real-time
- **Viewer count** - Shows how many people are currently on the page
- **Visit counter** - Tracks total page visits
- **YoRHa theme** - Beige/cream color palette inspired by NieR: Automata
- **Accordion navigation** - Collapsible sections for content
- **Background music** - Play/pause button (50% volume)
- **Easter eggs** - Konami code and rapid-click achievements
- **Blog system** - Markdown-based transmissions (auto-loaded)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | SvelteKit 5 + Svelte runes |
| WebSocket | Cloudflare Workers + Durable Objects |
| Hosting | Cloudflare Pages |
| Analytics | Cloudflare KV |
| Font | Helvetica (system) |

## Adding Transmissions (Blog Posts)

Drop markdown files in `web/src/content/transmissions/`:

```markdown
---
title: Your Title
date: 2024-03-01
description: "A short description"
---

Your markdown content here...
```

Files are sorted by date (newest first). Filename becomes the URL slug (e.g., `005-new-post.md` → `/transmissions/005-new-post`). **Add a new .md file and run `npm run build`** — a Vite plugin parses them at build time and embeds the data (no code edit needed). Parsing runs in Node only; Cloudflare Workers cannot run gray-matter/marked (they use eval).

---

## Deployment to Cloudflare

### Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+
- Wrangler CLI (`npx wrangler` or install globally)

### Deployment checklist (order matters)

| Step | Action |
|------|--------|
| 1 | `npx wrangler login` |
| 2 | Deploy cursor-server; note Workers URL |
| 3 | Create KV namespace; add binding in Pages dashboard |
| 4 | Create Pages project if needed (`wrangler pages project create archive-site`) |
| 5 | Set **VITE_WS_URL** and **ANALYTICS_ADMIN_TOKEN** in Pages → Settings → Environment variables |
| 6 | Build web **with** `VITE_WS_URL` set, then deploy |
| 7 | Set **ALLOWED_ORIGINS** in cursor-server to include your Pages host(s); redeploy cursor-server |
| 8 | Verify site, WebSocket, and `/api/analytics` |

---

### Step 1: Login to Cloudflare

```bash
npx wrangler login
```

Opens a browser to authenticate.

---

### Step 2: Deploy the Cursor Server

Uses Durable Objects for real-time WebSocket connections.

```bash
cd cursor-server
npm install
npm run deploy
```

Note the URL from the output, e.g. `https://cursor-server.<your-subdomain>.workers.dev`. The WebSocket endpoint is `wss://cursor-server.<your-subdomain>.workers.dev/ws`.

---

### Step 3: Create KV Namespace and bind to Pages

Create a KV namespace (e.g. in Dashboard: Workers & Pages → KV → Create namespace). Name it (e.g. `archive-site-analytics`) and copy the **Namespace ID**.

Then bind it to the Pages app:

1. Workers & Pages → **archive-site** → **Settings** → **Functions**
2. **KV namespace bindings** → **Add binding**
3. Variable name: **ANALYTICS** (must match code)
4. Select your KV namespace → Save

Optional: set the same namespace ID in `web/wrangler.toml` under `[[kv_namespaces]]` if you use `wrangler pages deploy` so local preview has KV.

---

### Step 4: Create Pages project (first time only)

If the project does not exist yet:

```bash
cd web
npx wrangler pages project create archive-site --production-branch=main
```

Cloudflare will show a URL like `https://archive-site-XXXX.pages.dev` (the exact subdomain is assigned by Cloudflare).

---

### Step 5: Set Environment Variables (Pages)

In **Cloudflare Dashboard → Workers & Pages → archive-site → Settings → Environment variables** (Production):

| Variable | Type | Value |
|----------|------|-------|
| `VITE_WS_URL` | **Plaintext** | `wss://cursor-server.<your-subdomain>.workers.dev/ws` |
| `ANALYTICS_ADMIN_TOKEN` | **Secret** | A secret string for analytics reset |

`VITE_WS_URL` is baked into the client bundle at **build time**, so you must build with it set (see Step 6).

---

### Step 6: Build and deploy the web app

Build **must** set `VITE_WS_URL` so the client connects to your Worker. Then deploy the SvelteKit output.

```bash
cd web
npm install
VITE_WS_URL=wss://cursor-server.<your-subdomain>.workers.dev/ws npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=archive-site
```

Use your actual Workers URL in `VITE_WS_URL`. After deploy, note your Pages URL (e.g. `https://archive-site-79d.pages.dev` or the deployment alias).

---

### Step 7: Allow your Pages origin on the cursor server

Update `cursor-server/wrangler.toml` so `ALLOWED_ORIGINS` includes your Pages host. The server allows exact origins and any subdomain of a listed host (e.g. deployment URLs like `https://abc123.archive-site-79d.pages.dev`).

```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:4173,https://archive-site-79d.pages.dev"
```

Add `https://yourcustomdomain.com` if you use a custom domain. Then redeploy:

```bash
cd cursor-server
npm run deploy
```

---

### Step 8: Verify

1. Open your site (e.g. `https://archive-site-79d.pages.dev` or the alias URL).
2. Open the same URL in another tab or incognito window.
3. Move the cursor in each tab — you should see both cursors and the viewer count update.
4. Visit counter and analytics should work; check Network tab for `POST /api/analytics` (no 404).

---

## Auto deploy from Git (Cloudflare Pages)

To have Cloudflare build and deploy on every push to GitHub:

1. **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. **Authorize GitHub** (if needed), then choose repo **notquite28/nier-archive-site**, branch **main**.
3. **Configure build:**
   - **Project name:** `archive-site` (to keep the same Pages URL; or any name and update env/ALLOWED_ORIGINS later).
   - **Root directory:** `web` (so the build runs from the SvelteKit app).
   - **Framework preset:** None.
   - **Build command:** `npm ci && npm run build`
   - **Build output directory:** `.svelte-kit/cloudflare`
   - **Node.js version:** 18 or 20 (in Environment variables or Settings).
4. **Environment variables:** If the Dashboard says "Environment variables are being managed through wrangler.toml", then **VITE_WS_URL** must be set in `web/wrangler.toml` under `[vars]` (replace `your-subdomain` with your Workers subdomain). Only **Secrets** (e.g. **ANALYTICS_ADMIN_TOKEN**) can be added in the Dashboard in that case. Otherwise add both in the Dashboard.
5. **Save** and deploy. Every push to `main` will trigger a new deployment.

**Note:** The **cursor-server** Worker is not built from this repo by Git; deploy it with `cd cursor-server && npm run deploy` when you change it. KV binding is set in **Settings → Functions**.

---

## Local development (WebSocket)

The app falls back to `ws://localhost:8787/ws` when **VITE_WS_URL** is not set. Either:

- **Run the cursor-server locally:** `cd cursor-server && npm run dev` (serves on 8787), then run the web app; or  
- **Use production WebSocket:** copy `web/.env.example` to `web/.env` and set `VITE_WS_URL` to your deployed Worker URL.

---

## Custom Domain (Optional)

### For Pages (web app)

1. Pages → archive-site → Custom domains → Add
2. Enter your domain
3. Update DNS as instructed

### For Cursor Server

1. Workers → cursor-server → Settings → Triggers
2. Add custom domain or route

Then update:
- `cursor-server/wrangler.toml` → `ALLOWED_ORIGINS` with new domain
- Pages env var `VITE_WS_URL` with new WebSocket URL

---

## Analytics API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get visit count + top referrers |
| POST | `/api/analytics` | Record a visit (body: `{ referrer?: string }`) |
| DELETE | `/api/analytics` | Reset all analytics (requires auth) |

### Reset Analytics

```bash
curl -X DELETE "https://archive-site-79d.pages.dev/api/analytics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Replace the host with your actual Pages URL if different.

---

## Environment Variables

### Web App (Cloudflare Pages)

| Variable | Description |
|----------|-------------|
| `VITE_WS_URL` | WebSocket server URL; **build-time** (Plaintext). Set when running `npm run build` or in dashboard before a Cloudflare-built deploy. |
| `ANALYTICS_ADMIN_TOKEN` | Secret for analytics reset (Secret in dashboard). |

### Cursor Server

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Comma-separated allowed origins for CORS |

---

## Assets

Assets are stored in `web/static/assets/`:

| File | Description |
|------|-------------|
| `cursor.svg` | Custom cursor |
| `track.mp3` | Background music |

---

## Development

```bash
# Type checking (web)
cd web && npm run check

# Type checking (cursor-server)
cd cursor-server && npm run check

# Build (web)
cd web && npm run build

# Preview production build
cd web && npm run preview
```

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

For a hobby cursor sharing app, you'll likely stay well within free limits.

---

## Credits

Design and functionality inspired by:

- **[YoRHa Theme](https://metakirby5.github.io/yorha/)** by metakirby5 - CSS styling, color palette, and UI components
- **[NieR List Template](https://hoanganhdinhngoc.github.io/cdn/)** by HoangAnhDinhNgoc - Accordion navigation pattern
- **[Daniele Avolio](https://www.danieleavolio.it/)** - Additional design inspiration
