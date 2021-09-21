<script lang="ts">
    import {_} from 'svelte-i18n';

    export let index: number = 0;

    setInterval(() => {
        index = Math.floor(Math.random() * $_('wishes').length);
    }, 10000);
</script>

<div class="content-card">
    <div class="content-text text-4xl lg:text-5xl text-center">"{$_('wishes')[index].text}"</div>
</div>

<style lang="postcss">
    .content-card {
        background-color: var(--primary-color);
        color: var(--secondary-color);
        position: absolute;
        top: 70vh;
        width: 100vw;
        max-height: 30vh;
        min-height: 30vh;
        padding: 4em;
        padding-top: 6em;
    }
    .content-text {
        font-family: 'Playfair Display', serif;
    }
</style>