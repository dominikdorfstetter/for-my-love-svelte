import App from './App.svelte';
import type { SvelteComponent } from 'svelte';

const app = new (App as unknown as new (options: { target: HTMLElement }) => SvelteComponent)({
    target: document.body
});

export default app;
