<script lang="ts">
    import {_, json} from 'svelte-i18n';

    export let index: number = 0
    let greetings = 0;
    let showGreetings = false;

    setInterval(() => {
        index = Math.floor(Math.random() * $json('wishes').length);
        greetings = Math.floor(Math.random() * $json('greetings').length);
        showGreetings = !showGreetings;
    }, 10000);
</script>

<div class="content-card">
    {#if (showGreetings)}
        <div class="greeting">"{$json('greetings')[greetings].text}"<br><div class="greeter">{$_('greetings')[greetings].from}</div></div>
    {:else}
        <div class="greeting">{$json('wishes')[index].text}</div>
    {/if}

</div>

<style lang="postcss">
    .content-card {
        background-color: rgba(0,0,0,0);
        pointer-events: none;
        color: var(--secondary-color);
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 30vh;
        width: 100vw;
        max-height: 40vh;
        min-height: 40vh;
    }
    .greeter {
        margin-top: 1em;
        font-weight: bold;
    }
    .greeting {
        font-family: 'Playfair Display', serif;
        max-width: 960px;
        @apply text-4xl lg:text-5xl text-center leading-10 p-6;
    }
</style>