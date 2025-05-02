<script lang="ts">
    import {json, _} from 'svelte-i18n';
    import { onMount } from 'svelte';

    // Force load the Dancing Script font
    const loadFont = () => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    };

    // Maintain history of messages for back/next navigation
    type MessageHistory = {
        index: number;
        isGreeting: boolean;
    };

    let currentIndex = $state(Math.floor(Math.random() * 17)); // Random index from 0-16 (wishes)
    let greetings = $state(Math.floor(Math.random() * 16));    // Random index from 0-15 (greetings)
    let showGreetings = $state(Math.random() < 0.5);           // 50% chance to show greetings first
    let isPaused = $state(false);
    let isHighContrast = $state(false);
    let messageInterval = $state(10000); // Default 10 seconds
    let activeInterval: ReturnType<typeof setInterval>;
    let progressValue = $state(0);       // Progress bar value (0-100)
    let progressInterval: ReturnType<typeof setInterval> | undefined;  // For progress bar animation

    // History management - store last 3 messages
    // Initialize with empty array, will be populated in onMount
    let messageHistory = $state<MessageHistory[]>([]);
    let historyPosition = $state(-1); // -1 means we're at the current message, not in history

    // Translations for the slider with derived values
    let speedLabel = $derived($_('ui.messageSpeed'));
    let slowLabel = $derived($_('ui.slow'));
    let mediumLabel = $derived($_('ui.medium'));
    let fastLabel = $derived($_('ui.fast'));

    function getWishesLength(): number {
        return Object.keys($json('wishes') as object || {}).length;
    }

    function getGreetingsLength(): number {
        return Object.keys($json('greetings') as object || {}).length;
    }

    function togglePause() {
        isPaused = !isPaused;

        // When unpausing, make sure the progress bar is properly reset
        if (!isPaused) {
            resetProgressBar();
        }
    }

    // Function to update the message rotation speed
    function updateSpeed(event: Event) {
        // Make sure we can parse the value as a number
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        if (isNaN(value)) return;

        // Store previous interval for reference
        const previousInterval = messageInterval;

        // Map slider values (1-3) to actual intervals in milliseconds
        switch(value) {
            case 1: // Slow
                messageInterval = 15000; // 15 seconds
                break;
            case 2: // Medium
                messageInterval = 10000; // 10 seconds
                break;
            case 3: // Fast
                messageInterval = 5000; // 5 seconds
                break;
            default:
                messageInterval = 10000; // Default to medium
        }

        // Clear existing intervals
        if (activeInterval) {
            clearInterval(activeInterval);
        }

        // Start new rotation with updated timing
        startMessageRotationWithoutChangingMessage();

        // Make sure progress bar is updated with new interval but maintains current progress
        resetProgressBar(true);
    }

    // Start rotation without changing the current message
    function startMessageRotationWithoutChangingMessage() {
        // Clear any existing interval
        if (activeInterval) {
            clearInterval(activeInterval);
        }

        // We no longer need to set an interval for message rotations
        // because the progress bar will trigger the message change when it reaches 100%
        // This ensures the message only changes when the progress bar completes

        // The activeInterval variable is still used in other parts of the code,
        // but it's no longer needed for message rotation
        activeInterval = null;
    }

    // Helper function to properly render emoji characters
    function formatText(text: string): string {
        // Replace any escaped unicode sequences with actual characters
        return text
            .replace(/\\n/g, '\n')                           // Replace escaped newlines
            .replace(/\\u([0-9a-fA-F]{4})/g, (m: string, code: string) => {  // Replace unicode escapes
                return String.fromCharCode(parseInt(code, 16));
            });
    }

    // Function to handle message rotation
    // Navigate to previous message in history
    function goToPreviousMessage() {
        if (messageHistory.length === 0) return;

        // If we're not already in history, save current state before moving back
        if (historyPosition === -1) {
            historyPosition = 0;
        } else {
            // If we're already navigating history, move back one more step
            historyPosition = Math.min(historyPosition + 1, messageHistory.length - 1);
        }

        // Get the message from history
        const historyItem = messageHistory[historyPosition];

        // Apply the historical message
        currentIndex = historyItem.index;
        showGreetings = historyItem.isGreeting;

        // Reset progress bar without pausing
        resetProgressBar();
    }

    // Navigate to next message in history or generate new random message
    function goToNextMessage() {
        // If we're already at the latest message or history is empty
        if (historyPosition <= 0 || messageHistory.length === 0) {
            // Use the changeMessage function to change to a new message
            changeMessage();

            // Reset history position to current message
            historyPosition = -1;

            return;
        }

        // Move forward in history
        historyPosition--;

        // Apply the message from history
        const historyItem = messageHistory[historyPosition];
        currentIndex = historyItem.index;
        showGreetings = historyItem.isGreeting;
    }

    // Add current message to history before changing
    function addToHistory() {
        // Create new history entry
        const historyEntry: MessageHistory = {
            index: showGreetings ? greetings : currentIndex,
            isGreeting: showGreetings
        };

        // Add to start of array (most recent first)
        messageHistory = [historyEntry, ...messageHistory.slice(0, 2)];

        // Reset position since we've added a new item
        historyPosition = -1;
    }

    // Function to change to a new random message
    function changeMessage() {
        // Store current message in history before changing
        addToHistory();

        // Compute new random values that are different from current ones
        let newIndex, newGreetings;

        do {
            newIndex = Math.floor(Math.random() * getWishesLength());
        } while (newIndex === currentIndex && getWishesLength() > 1);

        do {
            newGreetings = Math.floor(Math.random() * getGreetingsLength());
        } while (newGreetings === greetings && getGreetingsLength() > 1);

        // Update with new random values
        currentIndex = newIndex;
        greetings = newGreetings;
        showGreetings = !showGreetings;

        // Reset progress bar animation
        resetProgressBar();
    }

    // Reset progress bar animation
    function resetProgressBar(maintainProgress: boolean = false) {
        // Clear existing progress interval if any
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = undefined;
        }

        // Reset progress to 0 only when we're not paused and not maintaining progress
        if (!isPaused && !maintainProgress) {
            progressValue = 0;
        }

        // Don't start progress if paused
        if (isPaused) return;

        // Set up progress update interval - update every 50ms for smoother animation
        // Ensure we reach 100% exactly at the message interval
        let duration = messageInterval - 100; // Subtract 100ms to ensure we reach 100% before the message changes

        // If maintaining progress, adjust duration based on current progress
        if (maintainProgress && progressValue > 0) {
            // Calculate remaining time based on current progress
            duration = duration * (1 - (progressValue / 100));
        }

        const increment = 100 / (duration / 50);

        // If we're maintaining progress, we don't need to reset the initial value
        // Otherwise, force an initial update to make sure the progress bar shows some value
        if (!maintainProgress) {
            progressValue = increment;
        }

        progressInterval = setInterval(() => {
            if (!isPaused) {
                // Update progress, ensuring we don't exceed 100
                progressValue = Math.min(progressValue + increment, 100);

                // If progress reaches 100%, trigger message change immediately
                if (progressValue >= 100 && historyPosition === -1) {
                    // Clear the current interval to prevent double triggers
                    if (activeInterval) {
                        clearInterval(activeInterval);
                    }

                    // Trigger message change immediately
                    changeMessage();

                    // Restart the message rotation with the new interval
                    startMessageRotationWithoutChangingMessage();
                }
            }
        }, 50);
    }

    function startMessageRotation() {
        // Clear any existing interval
        if (activeInterval) {
            clearInterval(activeInterval);
        }

        // Start progress bar immediately - this needs to happen FIRST
        resetProgressBar();

        // We no longer need to set an interval for message rotations
        // because the progress bar will trigger the message change when it reaches 100%
        // This ensures the message only changes when the progress bar completes
    }

    // Ensure the progress bar is initialized right away
    $effect(() => {
        if (!isPaused && !progressInterval) {
            resetProgressBar();
        }
    });

    onMount(() => {
        // Load the Dancing Script font
        loadFont();

        // Check for high contrast preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
        isHighContrast = prefersHighContrast.matches;

        // Set up a listener for changes
        prefersHighContrast.addEventListener('change', (e) => {
            isHighContrast = e.matches;
        });

        // Store initial message in history immediately
        const initialEntry: MessageHistory = {
            index: showGreetings ? greetings : currentIndex,
            isGreeting: showGreetings
        };
        messageHistory = [initialEntry];

        // Force start progress bar immediately
        progressValue = 0;
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = undefined;
        }

        // Start the timer immediately
        isPaused = false;
        resetProgressBar();

        // Start message rotation immediately
        startMessageRotation();

        // Instead of changing the message after a fixed timeout,
        // we'll let the progress bar naturally reach 100% for the first change
        // This ensures the first message change is also synchronized with the progress bar

        return () => {
            // No need to clear firstChangeTimeout as it no longer exists
            if (activeInterval) clearInterval(activeInterval);
            if (progressInterval) clearInterval(progressInterval);
            prefersHighContrast.removeEventListener('change', () => {});
        };
    });

    // Get text from the dictionary using object notation with $derived
    const currentText = $derived(
        showGreetings 
            ? $json(`greetings.${greetings}.text`)
            : $json(`wishes.${currentIndex}.text`)
    );

    // Get sender name with default to "Dominik" if missing
    const currentFrom = $derived(
        showGreetings
            ? ($json(`greetings.${greetings}.from`) || "Dominik") // Use "Dominik" as default author
            : null
    );

    // Get current speed setting for the slider
    const currentSpeedValue = $derived(
        messageInterval === 15000 ? 1 :
        messageInterval === 5000 ? 3 : 2
    );
</script>

<section 
    id="main" 
    class="content-display-container" 
    class:high-contrast={isHighContrast}
    aria-live="polite"
>
    <!-- Progress bar at the top of the page -->
    <div class="top-progress-container" 
         role="progressbar" 
         aria-valuenow={progressValue} 
         aria-valuemin="0" 
         aria-valuemax="100"
         aria-label={$_('ui.progressBar')}
    >
        <div 
            class="top-progress-bar" 
            style="width: {progressValue}%;"
            class:paused={isPaused}
        ></div>
    </div>
    <div class="greeting-container">
        <div class="greeting" aria-label={showGreetings ? $_('ui.greetingLabel') : $_('ui.messageLabel')}>
            <p class="message">
                {#if showGreetings}"{currentText}"{/if}
                {#if !showGreetings}{currentText}{/if}
            </p>

            {#if showGreetings}
                <div class="greeter" aria-label={$_('ui.fromLabel')}>
                    {currentFrom}
                </div>
            {/if}
        </div>
    </div>

    <!-- Controls at the bottom of the page -->
    <div class="controls-container">
        <div class="controls">
            <button 
                class="pause-button" 
                onclick={togglePause}
                aria-label={isPaused ? $_('ui.resumeButton') : $_('ui.pauseButton')}
                title={isPaused ? $_('ui.resumeButton') : $_('ui.pauseButton')}
            >
                {isPaused ? '▶' : '❚❚'}
            </button>

            <div class="speed-control" role="group" aria-labelledby="speed-label">
                <span id="speed-label" class="speed-label">{speedLabel}</span>
                <div class="slider-container">
                    <span class="slider-label">{slowLabel}</span>
                    <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        value={currentSpeedValue} 
                        class="speed-slider"
                        onchange={updateSpeed}
                        aria-valuemin="1"
                        aria-valuemax="3"
                        aria-valuenow={currentSpeedValue}
                        aria-valuetext={currentSpeedValue === 1 
                            ? slowLabel 
                            : currentSpeedValue === 3 
                                ? fastLabel 
                                : mediumLabel
                        }
                    />
                    <span class="slider-label">{fastLabel}</span>
                </div>
            </div>

            <!-- Navigation buttons for message history -->
            <div class="history-navigation" role="group" aria-label={$_('ui.messageNavigation')}>
                <button 
                    class="nav-button prev-button" 
                    onclick={goToPreviousMessage}
                    disabled={messageHistory.length === 0}
                    aria-label={$_('ui.prevButton')}
                    title={$_('ui.prevButton')}
                >
                    <span class="nav-icon" aria-hidden="true">&#x25C0;</span>
                </button>
                <button 
                    class="nav-button next-button" 
                    onclick={goToNextMessage}
                    disabled={false} 
                    aria-label={$_('ui.nextButton')}
                    title={$_('ui.nextButton')}
                >
                    <span class="nav-icon" aria-hidden="true">&#x25B6;</span>
                </button>
            </div>
        </div>
    </div>
</section>
<style lang="postcss">
    /* Direct font styles - we'll load the font dynamically in the script */

    /* Consolidated CSS variables */
    :root {
        /* Greeting card variables */
        --greeting-max-width: 55rem;
        --greeting-width: 90vw;
        --greeting-box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        --greeting-border-radius: 0.75rem;
        --greeting-padding: 1.5rem;
        --greeting-font-size: clamp(1.5rem, 4vw, 2.3rem);
        --greeting-bg-color: rgba(255, 255, 255, 0.2);
        --greeting-blur: 10px;
        --greeting-max-height: 70vh;
        --greeting-scrollbar-color: rgba(255, 255, 255, 0.5);

        /* Controls variables */
        --controls-max-width: 28rem;
        --controls-gap: 1rem;
        --controls-bg-color: rgba(255, 255, 255, 0.3);
        --controls-blur: 8px;
        --controls-padding: 0.75rem 1rem 0.5rem;
        --controls-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        /* Progress bar variables */
        --progress-height: 4px;
        --progress-bg-color: rgba(255, 255, 255, 0.2);
        --progress-z-index: 100;
        --progress-transition: width 0.1s linear;
        --progress-shadow: 0 0 3px rgba(255, 255, 255, 0.5);

        /* Button variables */
        --button-size: 2.5rem;
        --button-font-size: 1.25rem;
        --button-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        --button-transition: transform 0.2s;
        --button-focus-shadow: 0 0 0 2px white, 0 0 0 4px var(--secondary-color);
        --button-scale: 1.1;
        --disabled-opacity: 0.5;

        /* Navigation button variables */
        --nav-button-size: 2rem;
        --nav-button-gap: 0.5rem;
        --nav-margin-left: 0.75rem;
        --nav-transition: transform 0.2s, opacity 0.2s;
        --nav-icon-font-size: 1rem;
        --nav-icon-line-height: 2rem;
        --prev-icon-font-size: 1.1rem;
        --button-hover-scale: 1.1;

        /* Slider variables */
        --slider-height: 0.5rem;
        --slider-margin: 0.5rem;
        --slider-bg: rgba(255, 255, 255, 0.3);
        --slider-radius: 15px;
        --thumb-size: 18px;
        --thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        --thumb-transition: transform 0.1s;
        --thumb-hover-scale: 1.2;
        --slider-focus-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 4px var(--secondary-color);
        --slider-focus-opacity: 0.5;
        --thumb-focus-shadow: 0 0 0 2px white;
    }

    .content-display-container {
        @apply fixed inset-0 flex flex-col justify-between overflow-hidden;
        @apply bg-transparent text-secondary;
        @apply z-20 pointer-events-none; /* Allow clicks to pass through to the heart */
        height: 100vh; /* Use viewport height */
        max-height: 100vh; /* Prevent scrolling */
    }

    /* High contrast mode version */
    .content-display-container.high-contrast {
        @apply text-white;
        text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000;
    }

    /* Greeting container - perfectly centered vertically and horizontally */
    .greeting-container {
        @apply flex items-center justify-center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        height: 100%;
        @apply px-4;
    }

    /* Greeting card styling */

    .greeting {
        @apply relative text-center mx-auto pointer-events-auto flex flex-col justify-start;
        line-height: 1.6;
        max-width: var(--greeting-max-width);
        width: var(--greeting-width);
        box-shadow: var(--greeting-box-shadow);
        border-radius: var(--greeting-border-radius);
        padding: var(--greeting-padding);

        /* Apply cursive font directly */
        font-family: "Dancing Script", cursive !important;
        font-size: var(--greeting-font-size);

        /* Semi-transparent background */
        background-color: var(--greeting-bg-color);
        backdrop-filter: blur(var(--greeting-blur));
        -webkit-backdrop-filter: blur(var(--greeting-blur));
        @apply border border-white/10;

        /* Added scrolling for long content */
        max-height: var(--greeting-max-height);
        @apply overflow-y-auto;

        /* Smooth scrolling */
        scroll-behavior: smooth;

        /* Style scrollbar */
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: var(--greeting-scrollbar-color) transparent; /* Firefox */
    }

    /* Webkit scrollbar styling */
    .greeting::-webkit-scrollbar {
        width: 6px;
    }

    .greeting::-webkit-scrollbar-track {
        background: transparent;
    }

    .greeting::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
    }

    .message {
        margin-bottom: 1rem;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
        text-align: center;
        font-family: "Dancing Script", cursive !important;
        white-space: pre-line; /* Preserve newlines in text */
    }

    .greeter {
        font-weight: bold;
        margin-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding-top: 0.75rem;
        font-size: 0.85em; /* Slightly smaller than the message */
        text-align: center;
    }

    /* Controls container fixed at the bottom */
    .controls-container {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 5rem; /* Increased from 3rem to 5rem to make more room for footer */
        padding-left: 1rem;
        padding-right: 1rem;
        pointer-events: none; /* Allow clicks to reach underneath */
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 30; /* Ensure controls are above other elements */
    }

    /* Controls styling */

    /* Controls */
    .controls {
        @apply flex flex-row items-center justify-center relative w-full pointer-events-auto;
        @apply rounded-full border border-white/30;
        gap: var(--controls-gap);
        max-width: var(--controls-max-width);
        background-color: var(--controls-bg-color);
        backdrop-filter: blur(var(--controls-blur));
        -webkit-backdrop-filter: blur(var(--controls-blur));
        padding: var(--controls-padding);
        box-shadow: var(--controls-box-shadow);
    }

    /* Progress bar styling */

    /* Top progress bar container */
    .top-progress-container {
        @apply fixed top-0 left-0 right-0 overflow-hidden pointer-events-none;
        height: var(--progress-height);
        background-color: var(--progress-bg-color);
        z-index: var(--progress-z-index); /* Ensure it appears above everything */
    }

    /* Actual top progress bar */
    .top-progress-bar {
        @apply h-full bg-secondary;
        transition: var(--progress-transition);
        box-shadow: var(--progress-shadow);
    }

    /* Style for paused progress */
    .top-progress-bar.paused {
        opacity: 0.5;
        background-image: linear-gradient(
            45deg, 
            rgba(255, 255, 255, 0.3) 25%, 
            transparent 25%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.3) 50%, 
            rgba(255, 255, 255, 0.3) 75%, 
            transparent 75%, 
            transparent
        );
        background-size: 10px 10px;
        animation: progressStripes 1s linear infinite;
    }

    @keyframes progressStripes {
        0% { background-position: 0 0; }
        100% { background-position: 20px 0; }
    }

    /* Define variables for pause button */
    :root {
        --button-size: 2.5rem;
        --button-font-size: 1.25rem;
        --button-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        --button-transition: transform 0.2s;
        --button-focus-shadow: 0 0 0 2px white, 0 0 0 4px var(--secondary-color);
        --button-scale: 1.1;
    }

    /* Pause button */
    .pause-button {
        @apply bg-secondary text-primary rounded-full flex items-center justify-center border-none flex-shrink-0;
        width: var(--button-size);
        height: var(--button-size); 
        font-size: var(--button-font-size);
        box-shadow: var(--button-shadow);
        transition: var(--button-transition);
    }

    .pause-button:hover,
    .pause-button:focus {
        @apply outline-none;
        transform: scale(var(--button-scale));
        box-shadow: var(--button-focus-shadow);
    }

    /* Speed control container */
    .speed-control {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-left: 0.5rem;
    }

    .speed-label {
        font-size: 0.875rem;
        font-weight: 500;
        width: 100%;
        text-align: center;
        margin-bottom: 0.25rem;
    }

    /* Slider container */
    .slider-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
    }

    .slider-label {
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;
    }

    /* Define variables for navigation buttons */
    :root {
        --nav-button-size: 2rem;
        --nav-button-gap: 0.5rem;
        --nav-margin-left: 0.75rem;
        --nav-transition: transform 0.2s, opacity 0.2s;
    }

    /* History navigation styling */
    .history-navigation {
        @apply flex;
        gap: var(--nav-button-gap);
        margin-left: var(--nav-margin-left);
    }

    .nav-button {
        @apply rounded-full bg-secondary text-primary flex items-center justify-center;
        @apply border-none cursor-pointer p-0 leading-none;
        width: var(--nav-button-size);
        height: var(--nav-button-size);
        transition: var(--nav-transition);
    }

    /* Define variables for nav icon */
    :root {
        --nav-icon-font-size: 1rem;
    }

    .nav-icon {
        @apply flex items-center justify-center relative h-full w-full;
        font-size: var(--nav-icon-font-size); /* Increased size for better visibility */
    }

    /* Define variables for button icon alignment */
    :root {
        --nav-icon-line-height: 2rem; /* Match the button height */
        --prev-icon-font-size: 1.1rem; /* Slightly larger than the base size */
    }

    /* Make sure both icons are centered properly */
    .prev-button .nav-icon,
    .next-button .nav-icon {
        @apply block text-center;
        line-height: var(--nav-icon-line-height);
    }

    /* Make the prev icon slightly larger to match the next icon's visual size */
    .prev-button .nav-icon {
        font-size: var(--prev-icon-font-size);
    }

    /* Define variables for button states */
    :root {
        --disabled-opacity: 0.5;
        --button-hover-scale: 1.1;
    }

    .nav-button:disabled {
        @apply cursor-not-allowed;
        opacity: var(--disabled-opacity);
    }

    .nav-button:not(:disabled):hover,
    .nav-button:not(:disabled):focus {
        @apply outline-none;
        transform: scale(var(--button-hover-scale));
    }

    /* Define variables for slider */
    :root {
        --slider-height: 0.5rem;
        --slider-margin: 0.5rem;
        --slider-bg: rgba(255, 255, 255, 0.3);
        --slider-radius: 15px;
    }

    /* Custom slider styling */
    .speed-slider {
        @apply w-full outline-none;
        height: var(--slider-height);
        margin-left: var(--slider-margin);
        margin-right: var(--slider-margin);
        -webkit-appearance: none;
        appearance: none;
        background: var(--slider-bg);
        border-radius: var(--slider-radius);
    }

    /* Define variables for slider thumb */
    :root {
        --thumb-size: 18px;
        --thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        --thumb-transition: transform 0.1s;
    }

    .speed-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: var(--thumb-size);
        height: var(--thumb-size);
        @apply bg-secondary rounded-full cursor-pointer;
        box-shadow: var(--thumb-shadow);
        transition: var(--thumb-transition);
    }

    .speed-slider::-moz-range-thumb {
        width: var(--thumb-size);
        height: var(--thumb-size);
        @apply bg-secondary rounded-full cursor-pointer border-none;
        box-shadow: var(--thumb-shadow);
        transition: var(--thumb-transition);
    }

    /* Define variables for slider states */
    :root {
        --thumb-hover-scale: 1.2;
        --slider-focus-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 4px var(--secondary-color);
        --slider-focus-opacity: 0.5;
    }

    .speed-slider::-webkit-slider-thumb:hover,
    .speed-slider::-moz-range-thumb:hover {
        transform: scale(var(--thumb-hover-scale));
    }

    .speed-slider:focus {
        @apply outline-none;
        box-shadow: var(--slider-focus-shadow);
        opacity: var(--slider-focus-opacity);
    }

    /* Define variables for thumb focus */
    :root {
        --thumb-focus-shadow: 0 0 0 2px white;
    }

    /* Focus styles for accessibility */
    .speed-slider:focus::-webkit-slider-thumb {
        box-shadow: var(--thumb-focus-shadow);
    }

    .speed-slider:focus::-moz-range-thumb {
        box-shadow: var(--thumb-focus-shadow);
    }

    /* Media query for smaller screens */
    @media (max-width: 640px) {
        .greeting {
            padding: 1rem;
            width: 95vw; /* Take more width on mobile */
            max-width: 95vw;
            font-size: clamp(1.2rem, 5vw, 1.8rem); /* Smaller font on mobile */
        }

        .controls {
            flex-direction: column;
            padding: 0.75rem;
            border-radius: 0.75rem;
            max-width: min(90vw, 300px);
        }

        .speed-control {
            margin-top: 0.5rem;
            margin-left: 0;
            width: 100%;
        }

        .history-navigation {
            margin-left: 0;
            margin-top: 0.5rem;
            justify-content: center;
        }
    }

    /* For very short screens */
    @media (max-height: 500px) {
        .greeting {
            max-height: 50vh; /* Reduced maximum height */
            padding: 0.75rem;
            font-size: clamp(1rem, 3.5vw, 1.4rem); /* Smaller font */
            margin-bottom: 70px; /* Push up more to make room for controls and footer */
        }

        .controls-container {
            margin-bottom: 4rem; /* More space for footer */
        }

        .controls {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            transform: scale(0.9); /* Slightly smaller controls */
        }

        .greeting-container {
            align-items: center; /* Keep centered vertically */
            padding-bottom: 80px; /* Increased offset for controls and footer */
        }
    }

    /* For extra wide screens */
    @media (min-width: 1600px) {
        .greeting {
            max-width: 65rem; /* Even wider on large screens */
            padding: 2rem;
        }
    }
</style>
