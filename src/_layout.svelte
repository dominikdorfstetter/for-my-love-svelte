<script context="module">
    import { waitLocale } from 'svelte-i18n';

    export async function preload() {
        // awaits for the loading of the 'en-US' and 'en' dictionaries
        return waitLocale();
    }
</script>
