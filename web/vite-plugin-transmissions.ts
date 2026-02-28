/**
 * Build-time plugin: reads src/content/transmissions/*.md, parses with gray-matter + marked
 * (in Node), and exposes pre-parsed data via virtual:transmissions-data.
 * This avoids running gray-matter/marked in Cloudflare Workers (they use eval and are not allowed).
 * Add new .md files to content/transmissions/ and rebuild — no code changes needed.
 */
import path from 'path';
import fs from 'fs';

const VIRTUAL_ID = '\0virtual:transmissions-data';

export function transmissionsPlugin() {
	let cachedCode: string | null = null;

	return {
		name: 'transmissions',
		enforce: 'pre',
		async buildStart() {
			const dir = path.join(process.cwd(), 'src/content/transmissions');
			if (!fs.existsSync(dir)) {
				cachedCode = 'export const transmissionsData = [];';
				return;
			}
			const matter = (await import('gray-matter')).default;
			const { marked } = await import('marked');
			const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.md'));
			const list: { slug: string; title: string; date: string; description: string; content: string; html: string }[] = [];

			for (const f of files) {
				const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
				const { data, content } = matter(raw);
				const slug = f.replace(/\.md$/i, '');
				const html = typeof marked.parse === 'function' ? await marked.parse(content) : (marked as (s: string) => string)(content);
				list.push({
					slug,
					title: data.title || 'Untitled',
					date: String(data.date || ''),
					description: data.description || '',
					content,
					html: String(html)
				});
			}
			list.sort((a, b) => b.date.localeCompare(a.date));
			cachedCode = `export const transmissionsData = ${JSON.stringify(list)};`;
		},
		resolveId(id: string) {
			if (id === 'virtual:transmissions-data') return VIRTUAL_ID;
			return null;
		},
		load(id: string) {
			if (id === VIRTUAL_ID) return cachedCode ?? 'export const transmissionsData = [];';
			return null;
		}
	};
}
