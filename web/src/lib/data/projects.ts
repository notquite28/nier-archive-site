export interface Project {
    name: string;
    description: string;
    url: string;
    tags: string[];
    status: 'live' | 'wip' | 'archived';
}

export const projects: Project[] = [
    {
        name: 'Pixel Room',
        description: 'Real-time cursor sharing with immersive pixel art aesthetics. See other visitors exploring alongside you.',
        url: 'https://github.com/yourname/pixel-room',
        tags: ['SvelteKit', 'WebSocket', 'Cloudflare'],
        status: 'live'
    },
    {
        name: 'Project Alpha',
        description: 'A creative experiment in web immersion. Work in progress.',
        url: '',
        tags: ['TypeScript', 'Canvas', 'WebGL'],
        status: 'wip'
    },
    {
        name: 'Project Beta',
        description: 'Archived project from the early archives.',
        url: '',
        tags: ['React', 'Node.js', 'PostgreSQL'],
        status: 'archived'
    }
];
