export interface Project {
    name: string;
    description: string;
    url: string;
    tags: string[];
    status: 'live' | 'wip' | 'archived';
}

export const projects: Project[] = [
    {
        name: 'Shared Cursors',
        description: 'Real-time cursor sharing inspired by Nier Automata\'s Ending E. See other visitors exploring alongside you.',
        url: 'https://github.com/notquite28/nier-archive-site',
        tags: ['SvelteKit', 'WebSocket', 'Cloudflare'],
        status: 'live'
    },
    {
        name: 'WebSocket Server',
        description: 'Lightweight real-time relay for cursor synchronization.',
        url: 'https://github.com/notquite28/nier-archive-site',
        tags: ['TypeScript', 'Cloudflare Workers'],
        status: 'live'
    }
];
