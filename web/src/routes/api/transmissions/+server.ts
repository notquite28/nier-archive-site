import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadTransmissions } from '$lib/data/transmissions';

export const GET: RequestHandler = async () => {
    const transmissions = await loadTransmissions();
    
    const list = transmissions.map(t => ({
        slug: t.slug,
        title: t.title,
        date: t.date.replace(/-/g, '.')
    }));
    
    return json(list);
};
