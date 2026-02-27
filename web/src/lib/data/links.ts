export interface Link {
    name: string;
    url: string;
    icon: string;
}

export const links: Link[] = [
    { name: 'GitHub', url: 'https://github.com/yourname', icon: '◈' },
    { name: 'Twitter', url: 'https://twitter.com/yourname', icon: '◇' },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/yourname', icon: '◆' },
    { name: 'RSS Feed', url: '/rss.xml', icon: '▣' }
];
