// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Platform {
			env?: {
				ANALYTICS?: {
					get(key: string, type?: 'json'): Promise<string | null>;
					put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
					delete(key: string): Promise<void>;
					list(options: { prefix: string }): Promise<{ keys: { name: string }[] }>;
				};
				ANALYTICS_ADMIN_TOKEN?: string;
			};
		}
	}
}

export {};

declare module 'virtual:transmissions-data' {
	export const transmissionsData: Array<{
		slug: string;
		title: string;
		date: string;
		description: string;
		content: string;
		html: string;
	}>;
}
