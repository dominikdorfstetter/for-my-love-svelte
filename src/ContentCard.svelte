<script lang="ts">
    import {_} from 'svelte-i18n';

    export let index: number = 0
    let greetings = 0;
    let showGreetings = false;

    setInterval(() => {
        index = Math.floor(Math.random() * $_('wishes').length);
        greetings = Math.floor(Math.random() * $_('greetings').length);
        showGreetings = !showGreetings;
    }, 10000);
</script>

<div class="content-card">
    {#if (showGreetings)}
        <div class="content-text text-4xl lg:text-5xl text-center">"{$_('greetings')[greetings].text}" - {$_('greetings')[greetings].from}</div>
    {:else}
        <div class="content-text text-4xl lg:text-5xl text-center">{$_('wishes')[index].text}</div>
    {/if}

</div>

<style lang="postcss">
    .content-card {
        background-color: var(--primary-color);
        color: var(--secondary-color);
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 60vh;
        width: 100vw;
        max-height: 40vh;
        min-height: 40vh;
    }
    .content-text {
        font-family: 'Playfair Display', serif;
    }
</style>