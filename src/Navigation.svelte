<script lang="ts">
    import { locale } from 'svelte-i18n';

    function changeLocale(l: string) {
        locale.set(l)
    }
</script>

<div class="navmenu container mx-auto p-8">
    <nav class="flex justify-between">
        <div class="text-xl">
            Victoria
        </div>
        <ul class="flex flex-row">
            <li class="pr-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('es')}>ES</li>
            <li class="pr-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('de')}>DE</li>
            <li class="pr-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('en')}>EN</li>
        </ul>
    </nav>
</div>

<style lang="postcss">
    .navmenu {
        z-index: 3;
        background-color: var(--primary-color);
    }
</style>