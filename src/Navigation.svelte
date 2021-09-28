<script lang="ts">
    import { locale, _ } from 'svelte-i18n';

    function changeLocale(l: string) {
        locale.set(l)
    }
</script>

<div class="navmenu p-4 lg:p-8">
    <nav class="navbar">
        <div class="heading">
            { $_('logoText') }
        </div>
        <div class="dropdown inline-block relative">
            <button class="btnlanguage font-semibold py-2 px-4 rounded inline-flex items-center">
                <span>{ $_('language') }</span>
                <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
            </button>
            <ul class="dropdown-menu">
                <li class="p-5 hover:cursor-pointer hover:underline" on:click={() => changeLocale('es')}>{ $_('shortcode.es') }</li>
                <li class="dropdown-item" on:click={() => changeLocale('de')}>{ $_('shortcode.de') }</li>
                <li class="dropdown-item" on:click={() => changeLocale('en')}>{ $_('shortcode.en') }</li>
            </ul>
        </div>
    </nav>
</div>

<style lang="postcss">
    .navmenu {
        @apply z-30 bg-transparent absolute w-full top-0;
    }

    .dropdown:hover .dropdown-menu {
        @apply block;
    }

    .btnlanguage {
        @apply bg-primary text-secondary flex justify-between w-36;
        @apply border-2 border-solid border-secondary;
    }

    .dropdown-menu {
        @apply bg-primary border-2 border-secondary border-solid rounded;
        @apply text-secondary font-bold w-36 -mt-0.5 absolute hidden pt-1;
    }

    .dropdown-item {
        @apply pr-5 pb-5 pl-5 hover:cursor-pointer hover:underline;
    }

    .arrow {
        @apply text-secondary fill-current h-4 w-4;
    }

    .heading {
        @apply text-secondary font-bold pointer-events-none;
        @apply text-xl leading-6 uppercase;
    }

    .navbar {
        @apply flex justify-between items-center max-w-screen-lg m-auto;
    }
</style>