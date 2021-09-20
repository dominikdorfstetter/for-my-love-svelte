<script lang="ts">
    import { locale, _ } from 'svelte-i18n';

    function changeLocale(l: string) {
        locale.set(l)
    }
</script>

<div class="navmenu container mx-auto p-8">
    <nav class="flex justify-between">
        <div style="color: var(--secondary-color); font-weight: bold;" class="text-xl leading-10">
            Victoria
        </div>
        <div class="dropdown inline-block relative">
            <button class="btnlanguage font-semibold py-2 px-4 rounded inline-flex items-center">
                <span class="mr-1">{ $_('language') }</span>
                <svg class="pfeil fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
            </button>
            <ul class="dropdown-menu absolute hidden text-gray-700 pt-1 bg-white">
                <li class="p-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('es')}>{ $_('shortcode.es') }</li>
                <li class="pr-5 pb-5 pl-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('de')}>{ $_('shortcode.de') }</li>
                <li class="pr-5 pb-5 pl-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('en')}>{ $_('shortcode.en') }</li>
            </ul>
        </div>
    </nav>
</div>

<style lang="postcss">
    .navmenu {
        z-index: 3;
        background-color: var(--primary-color);
    }

    .dropdown:hover .dropdown-menu {
        display: block;
    }

    .btnlanguage {
        background-color: var(--primary-color);
        border: 2px var(--secondary-color) solid;
        color: var(--secondary-color);
    }

    .dropdown-menu {
        background-color: var(--primary-color);
        color: var(--secondary-color);
        font-weight: bold;
        width: 8em;
    }

    .pfeil {
        color: var(--secondary-color);
    }
</style>