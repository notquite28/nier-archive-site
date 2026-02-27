# Pixel Room

Real-time cursor sharing with pixel art aesthetics.

## Structure

```
├── server/         # WebSocket server (ultimate-ws + uWebSockets.js)
├── web/            # SvelteKit frontend
│   └── functions/  # Cloudflare Pages Functions (analytics API)
```

## Quick Start (Local Dev)

### 1. Start the WebSocket server

```bash
cd server
npm install
npm run dev
```

### 2. Start the Svelte frontend

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

### 3. Open http://localhost:5173

Open multiple tabs to see cursor sharing in action.

## Features

- **Live cursor sharing** - See other visitors' cursors in real-time
- **Viewer count** - Shows how many people are currently on the page
- **Visit counter** - Tracks total page visits with referrer data
- **Visibility detection** - Cursors hide when tab is not focused

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | SvelteKit 5 + Svelte stores |
| WebSocket | ultimate-ws (uWebSockets.js) |
| Hosting | Cloudflare Pages |
| Analytics | Cloudflare KV |
| Font | Press Start 2P (Google Fonts) |

## Deployment (Cloudflare Pages)

### 1. Create KV Namespace

```bash
# Via Wrangler CLI
npx wrangler kv:namespace create ANALYTICS
```

Or via Cloudflare Dashboard:
1. Workers & Pages → KV → Create namespace
2. Copy the namespace ID

### 2. Update wrangler.toml

Replace `your-kv-namespace-id-here` with your actual namespace ID:

```toml
[[kv_namespaces]]
binding = "ANALYTICS"
id = "abc123youractualid"
```

### 3. Set Environment Variables

In Cloudflare Pages dashboard:
- Settings → Environment variables → Production

| Variable | Description |
|----------|-------------|
| `VITE_WS_URL` | Your WebSocket server URL (e.g., `wss://ws.yourdomain.com`) |
| `ANALYTICS_ADMIN_TOKEN` | Secret token for resetting analytics |

### 4. Deploy

**Option A: Connect GitHub repo**
1. Cloudflare Pages → Create project → Connect Git
2. Select repo, set build settings:
   - Build command: `npm run build`
   - Build output: `.svelte-kit/cloudflare`
3. Deploy

**Option B: CLI deploy**
```bash
cd web
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```

### 5. Configure KV Binding

In Pages dashboard:
- Settings → Functions → KV namespace bindings
- Add: `ANALYTICS` → your KV namespace

## Analytics API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get visit count + top referrers |
| POST | `/api/analytics` | Record a visit (body: `{ referrer?: string }`) |
| DELETE | `/api/analytics?token=SECRET` | Reset all analytics |

### Reset Analytics

```bash
curl -X DELETE "https://yoursite.pages.dev/api/analytics?token=YOUR_ADMIN_TOKEN"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_WS_URL` | `ws://localhost:3001` | WebSocket server URL |
| `ANALYTICS_ADMIN_TOKEN` | - | Secret for analytics reset (set in CF dashboard) |

## Assets

Assets are stored in `web/static/assets/`:

| File | Description |
|------|-------------|
| `cursor.svg` | Custom cursor (currently NieR-themed) |
| `track.mp3` | Background music |

### Music Configuration

Edit the track name in `web/src/lib/components/MusicPlayer.svelte`:

```js
const trackName = "Your Track Name";
const artistName = "Artist Name";
```

## Development

```bash
# Type checking
cd web && npm run check

# Build
cd web && npm run build

# Preview production build
cd web && npm run preview
```

## Cost (Cloudflare Free Tier)

| Resource | Free Limit |
|----------|------------|
| Pages requests | 100K/day |
| KV reads | 100K/day |
| KV writes | 1K/day |
| KV storage | 1GB |
