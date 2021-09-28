<script lang="ts">
    import {json} from 'svelte-i18n';

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
        <div class="greeting">"{$json('greetings')[greetings].text}"<br><div class="greeter">{$json('greetings')[greetings].from}</div></div>
    {:else}
        <div class="greeting">{$json('wishes')[index].text}</div>
    {/if}

</div>

<style lang="postcss">
    .content-card {
        @apply absolute items-center justify-center flex max-h-36;
        @apply bg-transparent pointer-events-none text-secondary font-serif;
        @apply top-1/2 w-full text-center;
    }
    .greeter {
        @apply font-bold mt-4;
    }
    .greeting {
        @apply text-4xl lg:text-5xl text-center leading-10 p-6;
        @apply max-w-screen-lg;
    }
</style>