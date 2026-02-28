import {
	handleAnalyticsGet,
	handleAnalyticsPost,
	handleAnalyticsDelete
} from '$lib/analytics-server';

export async function GET({ platform }) {
	const env = platform?.env;
	if (!env?.ANALYTICS) {
		return new Response(JSON.stringify({ error: 'Analytics not configured' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return handleAnalyticsGet(env);
}

export async function POST({ platform, request }) {
	const env = platform?.env;
	if (!env?.ANALYTICS) {
		return new Response(JSON.stringify({ error: 'Analytics not configured' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return handleAnalyticsPost(env, request);
}

export async function DELETE({ platform, request }) {
	const env = platform?.env;
	if (!env?.ANALYTICS) {
		return new Response(JSON.stringify({ error: 'Analytics not configured' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return handleAnalyticsDelete(env, request);
}
