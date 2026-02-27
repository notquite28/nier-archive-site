import matter from 'gray-matter';
import { marked } from 'marked';

export interface Transmission {
    slug: string;
    title: string;
    date: string;
    description: string;
    content: string;
    html: string;
}

export async function loadTransmissions(): Promise<Transmission[]> {
    const files = import.meta.glob('/src/content/transmissions/*.md', { query: '?raw', import: 'default' });
    
    const transmissions: Transmission[] = [];
    
    for (const [path, loader] of Object.entries(files)) {
        const raw = await loader() as string;
        const { data, content } = matter(raw);
        const slug = path.split('/').pop()?.replace('.md', '') || '';
        
        transmissions.push({
            slug,
            title: data.title || 'Untitled',
            date: data.date || '',
            description: data.description || '',
            content,
            html: await marked(content)
        });
    }
    
    return transmissions.sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadTransmission(slug: string): Promise<Transmission | null> {
    const transmissions = await loadTransmissions();
    return transmissions.find(t => t.slug === slug) || null;
}
