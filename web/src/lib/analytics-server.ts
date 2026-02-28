/** Shared analytics logic for SvelteKit /api/analytics (uses platform.env from adapter-cloudflare). */

export interface AnalyticsEnv {
	ANALYTICS: {
		get(key: string): Promise<string | null>;
		get(key: string, type: 'json'): Promise<unknown>;
		put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
		delete(key: string): Promise<void>;
		list(options: { prefix: string }): Promise<{ keys: { name: string }[] }>;
	};
	ANALYTICS_ADMIN_TOKEN?: string;
}

interface ReferrerData {
	[referrer: string]: number;
}

const REFERRER_TTL = 60 * 60 * 24 * 30;
const RATE_LIMIT_TTL = 60;
const RATE_LIMIT_MAX = 10;

function getClientIP(request: Request): string {
	return (
		request.headers.get('CF-Connecting-IP') ||
		request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
		'unknown'
	);
}

async function checkRateLimit(env: AnalyticsEnv, ip: string): Promise<boolean> {
	const key = `ratelimit:${ip}`;
	const current = parseInt((await env.ANALYTICS.get(key)) || '0');
	if (current >= RATE_LIMIT_MAX) return false;
	await env.ANALYTICS.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_TTL });
	return true;
}

function getTodayKey(): string {
	return `referrers:${new Date().toISOString().split('T')[0]}`;
}

function extractDomain(referrer: string | undefined): string | null {
	if (!referrer) return null;
	try {
		const url = new URL(referrer);
		return url.hostname.replace('www.', '');
	} catch {
		return null;
	}
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return result === 0;
}

const json = (body: object, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});

export async function handleAnalyticsGet(env: AnalyticsEnv): Promise<Response> {
	if (!env.ANALYTICS) return json({ error: 'Analytics not configured' }, 503);
	try {
		const totalVisits = parseInt((await env.ANALYTICS.get('total_visits')) || '0');
		const referrerMap: ReferrerData = {};
		const today = new Date();
		for (let i = 0; i < 7; i++) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			const key = `referrers:${date.toISOString().split('T')[0]}`;
			const data = (await env.ANALYTICS.get(key, 'json')) as ReferrerData | null;
			if (data && typeof data === 'object') {
				for (const [ref, count] of Object.entries(data)) {
					referrerMap[ref] = (referrerMap[ref] || 0) + (Number(count) || 0);
				}
			}
		}
		const topReferrers = Object.entries(referrerMap)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([referrer, count]) => ({ referrer, count }));
		return json({ visits: totalVisits, referrers: topReferrers });
	} catch (e) {
		console.error('Failed to fetch analytics:', e);
		return json({ error: 'Failed to fetch analytics' }, 500);
	}
}

export async function handleAnalyticsPost(env: AnalyticsEnv, request: Request): Promise<Response> {
	if (!env.ANALYTICS) return json({ error: 'Analytics not configured' }, 503);
	const ip = getClientIP(request);
	if (!(await checkRateLimit(env, ip))) return json({ error: 'Too many requests' }, 429);
	try {
		const body = await request.json().catch(() => ({}));
		const referrer = extractDomain(body.referrer as string | undefined);
		const current = parseInt((await env.ANALYTICS.get('total_visits')) || '0');
		await env.ANALYTICS.put('total_visits', String(current + 1));
		if (referrer) {
			const todayKey = getTodayKey();
			const existing = ((await env.ANALYTICS.get(todayKey, 'json')) as ReferrerData | null) || {};
			existing[referrer] = (existing[referrer] || 0) + 1;
			await env.ANALYTICS.put(todayKey, JSON.stringify(existing), { expirationTtl: REFERRER_TTL });
		}
		return json({ success: true });
	} catch (e) {
		console.error('Failed to record visit:', e);
		return json({ error: 'Failed to record visit' }, 500);
	}
}

export async function handleAnalyticsDelete(env: AnalyticsEnv, request: Request): Promise<Response> {
	const authHeader = request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '') || '';
	const expected = env.ANALYTICS_ADMIN_TOKEN || '';
	if (!expected || !timingSafeEqual(token, expected)) {
		return json({ error: 'Unauthorized' }, 401);
	}
	if (!env.ANALYTICS) return json({ error: 'Analytics not configured' }, 503);
	try {
		await env.ANALYTICS.put('total_visits', '0');
		const list = await env.ANALYTICS.list({ prefix: 'referrers:' });
		for (const key of list.keys) await env.ANALYTICS.delete(key.name);
		return json({ success: true, message: 'Analytics reset' });
	} catch (e) {
		console.error('Failed to reset analytics:', e);
		return json({ error: 'Failed to reset analytics' }, 500);
	}
}
