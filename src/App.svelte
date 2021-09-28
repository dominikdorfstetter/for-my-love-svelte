<script lang="ts">
    import * as i18n from './i18n';
    import Navigation from "./Navigation.svelte";
    import Heart from "./Heart.svelte";
    import ContentCard from "./ContentCard.svelte";

    // initializes localization
    i18n;

    function toggleOverlay() {
        const overlay_right = document.getElementById('overlay_right');
        const overlay_left = document.getElementById('overlay_left');
        const button = document.getElementById('overlay_button');

        overlay_left.classList.add('scale-down-hor-right');
        overlay_right.classList.add('scale-down-hor-left');
        button.classList.add('rotate-center');
    }
</script>
<Navigation />
<div id="overlay_left" class="overlay overlay-left"></div>
<div id="overlay_right" class="overlay overlay-right"></div>
<div id="overlay_button" class="heart-shape" on:click={toggleOverlay}></div>

<Heart />
<ContentCard />

<style global lang="postcss">
    @tailwind base;
	@tailwind components;
	@tailwind utilities;

    :root {
        @apply font-sans;
    }

    ::selection {
        @apply bg-primary text-white;
    }

    .overlay {
        @apply absolute top-0 z-10 w-1/2 h-screen bg-primary;
    }

    .overlay-left {
        @apply right-0;
    }

    .overlay-right {
        @apply left-0;
    }

    #overlay_button {
        @apply absolute z-20 ml-auto mr-auto;
        top: calc(50% - 5em);  /* position the top  edge of the element at the middle of the parent */
        left: calc(50% - 5em); /* position the left edge of the element at the middle of the parent */
    }

    .scale-down-hor-right {
        animation: scale-down-hor-right 3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }

    .scale-down-hor-left {
        animation: scale-down-hor-left 3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }

    .rotate-center {
        animation: fade-out 2.5s ease-in-out both;
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
        @apply relative w-40 h-40 transform-gpu bg-secondary rotate-45;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.35);
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
</style>