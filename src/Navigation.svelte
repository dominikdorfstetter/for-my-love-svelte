<script lang="ts">
    import { locale, _ } from 'svelte-i18n';
    import { onMount } from 'svelte';

    // Use $props() for Svelte 5 instead of export let
    const { language = 'en' } = $props();
    let appLanguage = $state(language);

    // Track dropdown open state
    let isDropdownOpen = $state(false);
    
    // Track focused menu item index
    let focusedIndex = $state(-1);
    
    // Computed property for available languages (excluding current)
    let availableLanguages = $derived([
        { code: 'es', name: $_('shortcode.es') },
        { code: 'de', name: $_('shortcode.de') },
        { code: 'en', name: $_('shortcode.en') }
    ].filter(item => item.code !== appLanguage));
    
    function changeLocale(l: string) {
        locale.set(l);
        appLanguage = l;
        isDropdownOpen = false;
    }
    
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) {
            // Set focus to first item when menu opens
            setTimeout(() => {
                focusedIndex = 0;
                const menuItem = document.getElementById(`lang-option-${focusedIndex}`);
                if (menuItem) menuItem.focus();
            }, 10);
        }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
        if (!isDropdownOpen) {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
                event.preventDefault();
                toggleDropdown();
            }
            return;
        }

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                isDropdownOpen = false;
                document.getElementById('language-selector')?.focus();
                break;
            case 'ArrowDown':
                event.preventDefault();
                focusedIndex = Math.min(focusedIndex + 1, availableLanguages.length - 1);
                document.getElementById(`lang-option-${focusedIndex}`)?.focus();
                break;
            case 'ArrowUp':
                event.preventDefault();
                focusedIndex = Math.max(focusedIndex - 1, 0);
                document.getElementById(`lang-option-${focusedIndex}`)?.focus();
                break;
            case 'Home':
                event.preventDefault();
                focusedIndex = 0;
                document.getElementById(`lang-option-${focusedIndex}`)?.focus();
                break;
            case 'End':
                event.preventDefault();
                focusedIndex = availableLanguages.length - 1;
                document.getElementById(`lang-option-${focusedIndex}`)?.focus();
                break;
        }
    }
    
    function handleMenuItemKeyDown(event: KeyboardEvent, langCode: string) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            changeLocale(langCode);
        }
    }
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown && !dropdown.contains(event.target as Node) && isDropdownOpen) {
            isDropdownOpen = false;
        }
    }
    
    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="navmenu p-4 lg:p-8">
    <nav class="navbar" aria-label="Main navigation">
        <a href="#main" class="skip-link">Skip to main content</a>
        
        <h1 class="heading">
            { $_('logoText') }
        </h1>
        
        <div class="dropdown inline-block relative">
            <button 
                id="language-selector"
                class="btnlanguage font-semibold py-2 px-4 rounded inline-flex items-center"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label="Select language"
                onclick={toggleDropdown}
                onkeydown={handleKeyDown}
            >
                <span>{ $_('language') }</span>
                <svg 
                    class="arrow" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </button>
            
            {#if isDropdownOpen && availableLanguages.length > 0}
                <ul 
                    class="dropdown-menu"
                    role="listbox"
                    aria-labelledby="language-selector"
                    tabindex="-1"
                >
                    {#each availableLanguages as item, index}
                        <li 
                            id="lang-option-{index}"
                            class="dropdown-item" 
                            role="option"
                            aria-selected={focusedIndex === index}
                            tabindex="0"
                            onclick={() => changeLocale(item.code)}
                            onkeydown={(e) => handleMenuItemKeyDown(e, item.code)}
                        >
                            { item.name }
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </nav>
</div>

<style lang="postcss">
    .navmenu {
        @apply z-30 bg-transparent absolute w-full top-0;
    }

    /* Make dropdown open on hover for mouse users, keyboard users will use the JS controls */
    @media (hover: hover) {
        .dropdown:hover .dropdown-menu {
            @apply block;
        }
    }

    .btnlanguage {
        @apply bg-primary text-secondary flex justify-between w-36;
        @apply border-2 border-solid border-secondary;
        /* Ensure good padding for touch targets */
        @apply py-2 px-4 rounded;
    }
    
    /* Focus and hover state */
    .btnlanguage:hover, 
    .btnlanguage:focus {
        @apply bg-secondary text-primary;
        @apply outline-none;
    }

    .dropdown-menu {
        @apply bg-primary border-2 border-secondary border-solid rounded;
        @apply text-secondary font-bold w-36 mt-0 absolute pt-1;
        /* Add a little shadow for depth */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .dropdown-item {
        @apply pr-5 pb-5 pl-5 cursor-pointer;
        /* Better padding for touch targets */
        @apply py-3 px-4;
        transition: background-color 0.2s;
    }
    
    /* Focus and hover state for items */
    .dropdown-item:hover,
    .dropdown-item:focus {
        @apply bg-secondary text-primary;
        @apply outline-none;
    }

    .arrow {
        @apply text-secondary fill-current h-4 w-4;
        @apply ml-2;
    }
    
    /* Flip arrow when dropdown is open */
    [aria-expanded="true"] .arrow {
        transform: rotate(180deg);
        transition: transform 0.2s;
    }

    .heading {
        @apply text-secondary font-bold;
        @apply text-xl leading-6 uppercase;
    }

    .navbar {
        @apply flex justify-between items-center max-w-screen-lg m-auto;
    }
</style>