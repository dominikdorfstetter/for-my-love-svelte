<script lang="ts">
    import {onMount} from 'svelte';
    import {_} from 'svelte-i18n';

    // Accessibility translations
    let heartDescription = $derived($_('heart.description', {default: 'Floating hearts background'}));

    // Number of hearts to create
    const HEART_COUNT = 30;

    // Function to calculate color based on size
    // Smaller hearts are lighter, bigger hearts are darker
    function calculateHeartColor(size: number): string {
        // Size ranges from 10px to 40px
        // Map this to a lightness value (lighter for smaller hearts)
        // The secondary color is #5F4A47 (brown)

        // Normalize size to 0-1 range (where 0 is smallest, 1 is largest)
        const normalizedSize = (size - 10) / 30;

        // Calculate lightness (smaller hearts are lighter)
        // Range from 60% (lightest) to 30% (darkest)
        const lightness = 60 - (normalizedSize * 30);

        // Return the color in HSL format
        // Hue: 10 (reddish-brown), Saturation: 15% (muted)
        return `hsl(10, 15%, ${lightness}%)`;
    }

    // Generate hearts with better distribution using a grid-based approach
    function generateHearts() {
        const result = [];

        // Define a grid to ensure better distribution
        // Divide the screen into a 6x5 grid (30 cells for 30 hearts)
        const gridCols = 6;
        const gridRows = 5;

        // Create a heart for each cell in the grid
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                // Calculate the base position for this grid cell
                const baseX = (col / gridCols) * 100;
                const baseY = (row / gridRows) * 100;

                // Add some randomness within the cell (±33% of cell size)
                const cellWidth = 100 / gridCols;
                const cellHeight = 100 / gridRows;
                const randomX = baseX + (Math.random() * 0.66 * cellWidth);
                const randomY = baseY + (Math.random() * 0.66 * cellHeight);

                const size = Math.random() * 30 + 10; // Random size between 10px and 40px

                result.push({
                    id: Math.random().toString(36).substring(2, 9),
                    size: size,
                    x: randomX, // Grid-based x position with randomness
                    y: randomY, // Grid-based y position with randomness
                    duration: Math.random() * 15 + 15, // Random animation duration (15-30s)
                    delay: Math.random() * 10, // Random delay (0-10s)
                    opacity: Math.random() * 0.6 + 0.2, // Random opacity (0.2-0.8)
                    horizontalMovement: Math.random() * 10 - 5, // Random horizontal movement (-5% to 5%)
                    color: calculateHeartColor(size), // Calculate color based on size
                    baseRotation: 45, // Base rotation for heart shape
                    rotationVariation: Math.random() * 10 - 5 // Small random rotation variation (-5 to 5 degrees)
                });
            }
        }

        return result;
    }

    let hearts = $state(generateHearts());

    // Handle window resize
    function handleResize() {
        // No specific resize handling needed for CSS animations
    }

    onMount(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
</script>

<div class="hearts-container"
     role="region"
     aria-label={heartDescription}>
    {#each hearts as heart (heart.id)}
        <div class="heart" 
             style="--size: {heart.size}px; 
                    --x: {heart.x}%; 
                    --y: {heart.y}%; 
                    --duration: {heart.duration}s; 
                    --delay: {heart.delay}s; 
                    --opacity: {heart.opacity}; 
                    --horizontal-movement: {heart.horizontalMovement}%;
                    --heart-color: {heart.color};
                    --base-rotation: {heart.baseRotation}deg;
                    --rotation-variation: {heart.rotationVariation}deg;"
             aria-hidden="true">
        </div>
    {/each}
</div>

<style lang="postcss">
    .hearts-container {
        @apply fixed top-0 left-0 w-screen h-screen overflow-hidden;
        z-index: -10;
        background-color: var(--primary-color);
    }

    /* Heart shape using CSS - improved shape */
    .heart {
        @apply absolute block;
        width: var(--size);
        height: var(--size);
        opacity: var(--opacity);
        left: var(--x);
        top: var(--y);
        animation: float var(--duration) ease-in-out infinite;
        animation-delay: var(--delay);
        will-change: transform;
        position: relative;
        background-color: var(--heart-color, var(--secondary-color));
        /* Apply initial rotation to ensure hearts are oriented correctly before animation starts */
        transform: rotate(calc(var(--base-rotation) + var(--rotation-variation) * 0));
    }

    .heart:before, .heart:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: var(--heart-color, var(--secondary-color));
        border-radius: 50%;
    }

    .heart:before {
        left: -50%;
        top: 0;
    }

    .heart:after {
        top: -50%;
        left: 0;
    }

    @keyframes float {
        0% {
            transform: translateY(0) translateX(0) rotate(calc(var(--base-rotation) + var(--rotation-variation) * 0));
        }
        25% {
            transform: translateY(-20px) translateX(calc(var(--horizontal-movement) * 0.5)) rotate(calc(var(--base-rotation) + var(--rotation-variation) * 0.5));
        }
        50% {
            transform: translateY(-40px) translateX(var(--horizontal-movement)) rotate(calc(var(--base-rotation) + var(--rotation-variation)));
        }
        75% {
            transform: translateY(-20px) translateX(calc(var(--horizontal-movement) * 0.5)) rotate(calc(var(--base-rotation) + var(--rotation-variation) * 0.5));
        }
        100% {
            transform: translateY(0) translateX(0) rotate(calc(var(--base-rotation) + var(--rotation-variation) * 0));
        }
    }

    /* Reduce motion for users who prefer reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .heart {
            animation: none;
        }
    }
</style>
