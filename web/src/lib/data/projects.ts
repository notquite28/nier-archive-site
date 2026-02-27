export interface Project {
    name: string;
    description: string;
    url: string;
    tags: string[];
}

export const projects: Project[] = [
    {
        name: 'Pixel Room',
        description: 'Real-time cursor sharing with immersive pixel art aesthetics. See other visitors exploring alongside you.',
        url: 'https://github.com/yourname/pixel-room',
        tags: ['SvelteKit', 'WebSocket', 'Cloudflare']
    },
    {
        name: 'Project Alpha',
        description: 'A creative experiment in web immersion. Details pending.',
        url: '#',
        tags: ['TypeScript', 'Canvas', 'WebGL']
    },
    {
        name: 'Project Beta',
        description: 'Another project in the archive. Awaiting data recovery.',
        url: '#',
        tags: ['React', 'Node.js', 'PostgreSQL']
    }
];
