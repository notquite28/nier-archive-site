import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadTransmission } from '$lib/data/transmissions';

export const GET: RequestHandler = async ({ params }) => {
    const transmission = await loadTransmission(params.slug);
    
    if (!transmission) {
        return json({ error: 'Not found' }, { status: 404 });
    }
    
    return json({
        title: transmission.title,
        date: transmission.date.replace(/-/g, '.'),
        html: transmission.html
    });
};
