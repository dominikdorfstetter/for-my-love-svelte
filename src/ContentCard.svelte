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

        // Set interval for future rotations
        activeInterval = setInterval(() => {
            if (!isPaused) {
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

                // Reset progress animation when message changes
                resetProgressBar();
            }
        }, messageInterval);
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

        // Set interval for message rotations
        activeInterval = setInterval(() => {
            if (!isPaused && historyPosition === -1) { // Only rotate if we're not looking at history
                // Use the changeMessage function to change to a new message
                changeMessage();
            }
        }, messageInterval);
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

        // First message change in 3 seconds, but don't set up a new interval
        const firstChangeTimeout = setTimeout(() => {
            // Use the changeMessage function to change to a new message
            changeMessage();

            // We don't need to set up a new interval here since we already started
            // message rotation at the beginning of onMount
        }, 3000);

        return () => {
            clearTimeout(firstChangeTimeout);
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

    .greeting {
        position: relative;
        text-align: center;
        line-height: 1.6;
        max-width: 55rem; /* Increased from 42rem to 55rem for wider display */
        width: 90vw; /* Take 90% of viewport width */
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        pointer-events: auto; /* Make this element clickable */
        border-radius: 0.75rem;
        padding: 1.5rem; /* Slightly more padding */

        /* Apply cursive font directly */
        font-family: "Dancing Script", cursive !important;
        font-size: clamp(1.5rem, 4vw, 2.3rem); /* Adjusted responsive font size */

        /* Semi-transparent background */
        background-color: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);

        /* Added scrolling for long content */
        max-height: 70vh; /* Limit height */
        overflow-y: auto; /* Enable vertical scrolling */

        /* Smooth scrolling */
        scroll-behavior: smooth;

        /* Style scrollbar */
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: rgba(255, 255, 255, 0.5) transparent; /* Firefox */

        display: flex;
        flex-direction: column;
        justify-content: flex-start; /* Align content to top for scrolling */
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

    /* Controls */
    .controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        max-width: 28rem;
        width: 100%;
        border-radius: 9999px;
        background-color: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        padding: 0.75rem 1rem 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        pointer-events: auto; /* Make controls clickable */
        border: 1px solid rgba(255, 255, 255, 0.3);
        position: relative; /* For absolute positioning of progress bar */
    }

    /* Top progress bar container */
    .top-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background-color: rgba(255, 255, 255, 0.2);
        overflow: hidden;
        z-index: 100; /* Ensure it appears above everything */
        pointer-events: none; /* Allow clicks to pass through */
    }

    /* Actual top progress bar */
    .top-progress-bar {
        height: 100%;
        background-color: var(--secondary-color);
        transition: width 0.1s linear;
        box-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
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

    /* Pause button */
    .pause-button {
        background-color: var(--secondary-color);
        color: var(--primary-color);
        border-radius: 9999px;
        width: 2.5rem;
        height: 2.5rem; 
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
        transition: transform 0.2s;
    }

    .pause-button:hover,
    .pause-button:focus {
        transform: scale(1.1);
        outline: none;
        box-shadow: 0 0 0 2px white, 0 0 0 4px var(--secondary-color);
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

    /* History navigation styling */
    .history-navigation {
        display: flex;
        gap: 0.5rem;
        margin-left: 0.75rem;
    }

    .nav-button {
        width: 2rem;
        height: 2rem;
        border-radius: 9999px;
        background-color: var(--secondary-color);
        color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: transform 0.2s, opacity 0.2s;
        padding: 0; /* Remove default padding */
        line-height: 1; /* Ensure consistent line height */
    }

    .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem; /* Increased size for better visibility */
        height: 100%;
        width: 100%;
        position: relative;
    }

    /* Make sure both icons are centered properly */
    .prev-button .nav-icon,
    .next-button .nav-icon {
        display: block;
        text-align: center;
        line-height: 2rem; /* Match the button height */
    }

    /* Make the prev icon slightly larger to match the next icon's visual size */
    .prev-button .nav-icon {
        font-size: 1.1rem; /* Slightly larger than the base size */
    }

    .nav-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .nav-button:not(:disabled):hover,
    .nav-button:not(:disabled):focus {
        transform: scale(1.1);
        outline: none;
    }

    /* Custom slider styling */
    .speed-slider {
        width: 100%;
        height: 0.5rem;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.3);
        outline: none;
        border-radius: 15px;
    }

    .speed-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        background-color: var(--secondary-color);
        border-radius: 9999px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: transform 0.1s;
    }

    .speed-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background-color: var(--secondary-color);
        border-radius: 9999px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        border: none;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .speed-slider::-webkit-slider-thumb:hover,
    .speed-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
    }

    .speed-slider:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 4px var(--secondary-color);
        opacity: 0.5;
    }

    /* Focus styles for accessibility */
    .speed-slider:focus::-webkit-slider-thumb {
        box-shadow: 0 0 0 2px white;
    }

    .speed-slider:focus::-moz-range-thumb {
        box-shadow: 0 0 0 2px white;
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
