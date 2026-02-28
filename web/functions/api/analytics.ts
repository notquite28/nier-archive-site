interface Env {
    ANALYTICS: KVNamespace;
    ANALYTICS_ADMIN_TOKEN: string;
}

interface ReferrerData {
    [referrer: string]: number;
}

const REFERRER_TTL = 60 * 60 * 24 * 30;
const RATE_LIMIT_TTL = 60;
const RATE_LIMIT_MAX = 10;

function getClientIP(request: Request): string {
    return request.headers.get('CF-Connecting-IP') || 
           request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 
           'unknown';
}

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
    const key = `ratelimit:${ip}`;
    const current = parseInt(await env.ANALYTICS.get(key) || '0');
    
    if (current >= RATE_LIMIT_MAX) {
        return false;
    }
    
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
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
    const { env } = context;
    
    try {
        const totalVisits = parseInt(await env.ANALYTICS.get('total_visits') || '0');
        
        const referrerMap: ReferrerData = {};
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = `referrers:${date.toISOString().split('T')[0]}`;
            const data = await env.ANALYTICS.get<ReferrerData>(key, 'json');
            if (data) {
                for (const [ref, count] of Object.entries(data)) {
                    referrerMap[ref] = (referrerMap[ref] || 0) + count;
                }
            }
        }
        
        const topReferrers = Object.entries(referrerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([referrer, count]) => ({ referrer, count }));
        
        return new Response(JSON.stringify({
            visits: totalVisits,
            referrers: topReferrers
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch analytics' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context: { env: Env; request: Request }): Promise<Response> {
    const { env, request } = context;
    
    const ip = getClientIP(request);
    if (!(await checkRateLimit(env, ip))) {
        return new Response(JSON.stringify({ error: 'Too many requests' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const body = await request.json().catch(() => ({}));
        const referrer = extractDomain(body.referrer as string | undefined);
        
        await env.ANALYTICS.increment('total_visits', 1);
        
        if (referrer) {
            const todayKey = getTodayKey();
            const existing = await env.ANALYTICS.get<ReferrerData>(todayKey, 'json') || {};
            existing[referrer] = (existing[referrer] || 0) + 1;
            await env.ANALYTICS.put(todayKey, JSON.stringify(existing), {
                expirationTtl: REFERRER_TTL
            });
        }
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to record visit:', error);
        return new Response(JSON.stringify({ error: 'Failed to record visit' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context: { env: Env; request: Request }): Promise<Response> {
    const { env, request } = context;
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const expectedToken = env.ANALYTICS_ADMIN_TOKEN || '';
    
    if (!expectedToken || !timingSafeEqual(token, expectedToken)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        await env.ANALYTICS.put('total_visits', '0');
        
        const list = await env.ANALYTICS.list({ prefix: 'referrers:' });
        for (const key of list.keys) {
            await env.ANALYTICS.delete(key.name);
        }
        
        console.log('Analytics reset successfully');
        return new Response(JSON.stringify({ success: true, message: 'Analytics reset' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to reset analytics:', error);
        return new Response(JSON.stringify({ error: 'Failed to reset analytics' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
