<script lang="ts">
    import * as i18n from './i18n';
    import { _, locale } from 'svelte-i18n';
    import Navigation from "./Navigation.svelte";
    import Heart from "./Heart.svelte";
    import ContentCard from "./ContentCard.svelte";
    import { onMount } from 'svelte';

    i18n;

    let appTitle = $state('For my love Vici');
    let appLanguage = $state('de');
    let isContentRevealed = $state(false);

    // Accessibility text for click hint
    let heartClickHint = $derived($_('heart.clickHint'));

    function toggleOverlay() {
        const overlay_right = document.getElementById('overlay_right');
        const overlay_left = document.getElementById('overlay_left');
        const button = document.getElementById('overlay_button');
        const hint = document.getElementById('click_hint');

        overlay_left?.classList.add('scale-down-hor-right');
        overlay_right?.classList.add('scale-down-hor-left');
        button?.classList.add('rotate-center');
        hint?.classList.add('fade-out');

        // Set state to indicate content has been revealed after animation finishes (1.5s)
        setTimeout(() => {
            isContentRevealed = true;
        }, 1500);
    }

    onMount(() => {
        // Update document lang attribute dynamically based on the selected language
        document.documentElement.lang = appLanguage;
        document.title = appTitle;

        // Add pulsing animation to heart button to draw attention
        const heartButton = document.getElementById('overlay_button');
        if (heartButton) {
            heartButton.classList.add('pulse-animation');

            // Remove pulsing after the first click
            heartButton.addEventListener('click', () => {
                heartButton.classList.remove('pulse-animation');
            }, { once: true });
        }

    });
</script>

<!-- First element in the DOM - no hidden DOM elements before it -->
<Heart />

<!-- Rest of the application on top of it -->
<div class="app-container" role="application" aria-label="Interactive love message display">
    <header>
        <Navigation language={appLanguage} />
    </header>

    <main>
        <!-- Initial overlays that hide the content -->
        <div id="overlay_left" class="overlay overlay-left" aria-hidden="true"></div>
        <div id="overlay_right" class="overlay overlay-right" aria-hidden="true"></div>

        <!-- Click hint that only shows until content is revealed -->
        <div id="click_hint" class="click-hint" aria-hidden="true">
            <span class="hint-text">{heartClickHint}</span>
            <div class="arrow-down"></div>
        </div>

        <button 
            id="overlay_button" 
            class="heart-shape" 
            onclick={toggleOverlay}
            aria-label="Reveal content"
            tabindex="0"
        ></button>

        <!-- Content is hidden initially and only loaded after heart animation -->
        {#if isContentRevealed}
            <ContentCard />
        {/if}

        <!-- Copyright footer - always visible -->
        <footer class="copyright-footer">
            <p>© {new Date().getFullYear()} <a href="https://dorfstetter.at" target="_blank" rel="noopener noreferrer">dorfstetter.at</a></p>
            <p class="love-message">{$_('ui.footerMessage')}</p>
        </footer>
    </main>
</div>

<style global lang="postcss">
    @tailwind base;
	@tailwind components;
	@tailwind utilities;

	/* Import a nice cursive font for the footer love message */
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

    :root {
        @apply font-sans;
    }

    ::selection {
        @apply bg-primary text-white;
    }

    /* Globally applied focus styles for better keyboard navigation */
    *:focus {
        @apply outline-none ring-2 ring-offset-2 ring-secondary;
    }

    /* Hide focus styles when using mouse, but show when using keyboard */
    .js-focus-visible :focus:not(.focus-visible) {
        @apply outline-none ring-0 ring-offset-0;
    }

    /* Skip to main content link - visually hidden until focused */
    .skip-link {
        @apply absolute m-3 px-3 py-2 bg-secondary text-white -top-full;
        transition: top 0.2s;
    }

    .skip-link:focus {
        @apply top-0 z-50;
    }

    .app-container {
        @apply min-h-screen relative;
        background: transparent;
        z-index: 1;
    }

    main {
        @apply relative min-h-screen w-full;
        position: relative;
        z-index: 2;
        background: transparent;
    }

    .overlay {
        position: absolute;
        top: 0;
        z-index: 10;
        width: 50%;
        height: 100vh;
        background-color: var(--primary-color);
    }

    .overlay-left {
        right: 0;
    }

    .overlay-right {
        left: 0;
    }

    /* Click hint styling */
    .click-hint {
        @apply absolute z-50 flex flex-col items-center;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        animation: float 2s ease-in-out infinite;
    }

    .hint-text {
        @apply mb-2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-primary font-medium;
        @apply shadow-md text-center;
        border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .arrow-down {
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid rgba(255, 255, 255, 0.8);
        animation: bounce 1s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% {
            transform: translateX(-50%) translateY(0);
        }
        50% {
            transform: translateX(-50%) translateY(-10px);
        }
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(5px);
        }
    }

    #overlay_button {
        @apply absolute z-50 ml-auto mr-auto;
        @apply cursor-pointer;
        @apply border-none;
        top: calc(50% - 5em);  /* position the top edge of the element at the middle of the parent */
        left: calc(50% - 5em); /* position the left edge of the element at the middle of the parent */
        display: block !important; /* Ensure it's always displayed */
        transform: rotate(45deg);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Pulsing animation for the heart button */
    .pulse-animation {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: rotate(45deg) scale(1);
            box-shadow: 0 0 0 0 rgba(255, 165, 175, 0.7);
        }

        70% {
            transform: rotate(45deg) scale(1.05);
            box-shadow: 0 0 0 15px rgba(255, 165, 175, 0);
        }

        100% {
            transform: rotate(45deg) scale(1);
            box-shadow: 0 0 0 0 rgba(255, 165, 175, 0);
        }
    }

    /* This adds a subtle animation when heart button is focused for better visibility */
    #overlay_button:focus-visible {
        @apply ring-2 ring-white ring-offset-4 ring-offset-primary;
        transform: rotate(45deg) scale(1.05);
    }

    #overlay_button:hover {
        transform: rotate(45deg) scale(1.08);
        filter: brightness(1.1);
    }

    .scale-down-hor-right {
        animation: scale-down-hor-right 1.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation-fill-mode: forwards; 
    }

    .scale-down-hor-left {
        animation: scale-down-hor-left 1.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation-fill-mode: forwards;
    }

    .rotate-center {
        animation: fade-out 1.3s ease-in-out both;
        animation-fill-mode: forwards;
    }

    .fade-out {
        animation: fade-out 0.7s ease-in-out both;
        animation-fill-mode: forwards;
    }

    /**
     * ----------------------------------------
     * animation scale-down-hor-left
     * ----------------------------------------
     */
    @keyframes scale-down-hor-left {
        0% {
            transform: scaleX(1);
            transform-origin: 0% 0%;
        }
        100% {
            transform: scaleX(0);
            transform-origin: 0% 0%;
        }
    }

    @keyframes scale-down-hor-right {
        0% {
            transform: scaleX(1);
            transform-origin: 100% 100%;
        }
        100% {
            transform: scaleX(0);
            transform-origin: 100% 100%;
        }
    }

    @keyframes fade-out {
        0% {
            opacity: 1.0;
        }
        100% {
            opacity: 0;
            visibility: hidden;
        }
    }

    .heart-shape {
        @apply relative w-40 h-40 transform-gpu bg-secondary;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.35);
        position: absolute !important; /* Ensure it's positioned correctly */
        z-index: 50 !important; /* Make sure it's on top of other elements */
    }

    .heart-shape:before, .heart-shape:after {
        @apply absolute w-40 h-40 bg-secondary;
        content: '';
        border-radius: 50%;
    }

    .heart-shape:before {
        @apply bottom-0 -left-20;
    }

    .heart-shape:after {
        @apply right-0 -top-20;
    }

    /* Add reduced motion preferences for users who prefer reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .scale-down-hor-right,
        .scale-down-hor-left,
        .rotate-center,
        .fade-out,
        .pulse-animation,
        .click-hint,
        .arrow-down {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* Copyright Footer Styles */
    .copyright-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 0.75rem;
        padding-bottom: 1rem;
        text-align: center;
        font-size: 0.75rem;
        color: var(--secondary-color); /* Secondary color for better readability */
        z-index: 25; /* Above the heart but below the controls */
        pointer-events: none; /* Allow clicks to pass through */
    }

    .copyright-footer p {
        margin: 0.25rem 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* Text shadow for better readability */
    }

    .copyright-footer a {
        color: var(--secondary-color);
        text-decoration: none;
        pointer-events: auto; /* Make the link clickable */
        transition: color 0.2s, text-shadow 0.2s;
        font-weight: bold;
    }

    .copyright-footer a:hover,
    .copyright-footer a:focus {
        color: white;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        outline: none;
    }

    .love-message {
        font-family: 'Dancing Script', cursive;
        font-size: 1rem;
        color: var(--secondary-color);
    }
</style>
