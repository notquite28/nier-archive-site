import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { transmissionsPlugin } from './vite-plugin-transmissions';

export default defineConfig({
	plugins: [transmissionsPlugin(), sveltekit()]
});
