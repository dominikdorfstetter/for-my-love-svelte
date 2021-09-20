<script lang="ts">
    import * as i18n from './i18n';
    import Navigation from "./Navigation.svelte";
    import { _ } from 'svelte-i18n';
    import Heart from "./Heart.svelte";

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
<!--<div id="overlay_left"></div>
<div id="overlay_right"></div>
<div id="overlay_button" class="heart-shape" on:click={toggleOverlay}></div>-->

<Heart />
<div class="text uppercase m-a">{ $_('greeting') }</div>

<style global lang="postcss">
    @tailwind base;
	@tailwind components;
	@tailwind utilities;

    :root {
        --primary-color: #fec5bb;
        --secondary-color: #5F4A47;
    }

    .text {
        position: absolute;
        bottom: 1em;
        color: white;
        font-size: 2.5em;
        text-align: center;
        width: 100%;
    }

    #overlay_left {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        width: 50vw;
        height: 100vh;
        background: var(--primary-color);
    }

    #overlay_right {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 50vw;
        height: 100vh;
        background: var(--primary-color);
    }

    #overlay_button {
        position: absolute;
        z-index: 2;
        background: var(--secondary-color);
        margin-left: auto;
        margin-right: auto;
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
        position: relative;
        width: 10em;
        height: 10em;
        transform: rotate(45deg);
        background-color: var(--secondary-color);
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.35);
    }

    .heart-shape:before, .heart-shape:after {
        position: absolute;
        width: 10em;
        height: 10em;
        content: '';
        border-radius: 50%;
        background-color: var(--secondary-color);
    }

    .heart-shape:before {
        bottom: 0;
        left: -5em;
    }

    .heart-shape:after {
        top: -5em;
        right: 0;
    }
</style>