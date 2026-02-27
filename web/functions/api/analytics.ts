interface Env {
    ANALYTICS: KVNamespace;
    ANALYTICS_ADMIN_TOKEN: string;
}

interface ReferrerData {
    [referrer: string]: number;
}

const REFERRER_TTL = 60 * 60 * 24 * 30; // 30 days

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
        return new Response(JSON.stringify({ error: 'Failed to fetch analytics' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context: { env: Env; request: Request }): Promise<Response> {
    const { env, request } = context;
    
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
        return new Response(JSON.stringify({ error: 'Failed to record visit' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context: { env: Env; request: Request }): Promise<Response> {
    const { env, request } = context;
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!env.ANALYTICS_ADMIN_TOKEN || token !== env.ANALYTICS_ADMIN_TOKEN) {
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
        
        return new Response(JSON.stringify({ success: true, message: 'Analytics reset' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to reset analytics' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
