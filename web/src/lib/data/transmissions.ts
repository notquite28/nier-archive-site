/**
 * Transmissions (blog posts). Data is built at compile time by vite-plugin-transmissions
 * from src/content/transmissions/*.md — add a new .md file and rebuild to add a post.
 * Parsing runs in Node at build time only (gray-matter/marked are not allowed in Cloudflare Workers).
 */
import { transmissionsData } from 'virtual:transmissions-data';

export interface Transmission {
	slug: string;
	title: string;
	date: string;
	description: string;
	content: string;
	html: string;
}

export async function loadTransmissions(): Promise<Transmission[]> {
	return [...transmissionsData].sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadTransmission(slug: string): Promise<Transmission | null> {
	return transmissionsData.find((t) => t.slug === slug) ?? null;
}
