document.addEventListener("DOMContentLoaded", () => {

function handleUrlHash() {
let rawHash = window.location.hash;
if (!rawHash) return;

const hashParts = rawHash.substring(1).split('#');
    const cleanHash = `#${hashParts[0]}`;


    try {
        const targetElement = document.querySelector(cleanHash);
        if (!targetElement) {
            console.warn("Target element for hash not found:", cleanHash);
            return;
        }

        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;

        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        targetElement.classList.add('highlight-scroll');
        setTimeout(() => {
            targetElement.classList.remove('highlight-scroll');
        }, 2500);

    } catch (error) {
        console.error("Error scrolling to hash:", error);
    }
}

window.addEventListener('load', handleUrlHash);

const animationFrameIds = new Map();

// ==========================================================
// 0. Settings Logic
// ==========================================================
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const accentedSanskritToggle = document.getElementById('accented-sanskrit-toggle');
const transliterationToggle = document.getElementById('transliteration-toggle');
const separateLinesToggle = document.getElementById('separate-lines-toggle');
const deityThemesDefaultToggle = document.getElementById('deity-themes-default-toggle');

let accentedSanskritEnabled = true;
let transliterationEnabled = true;
let separateLinesEnabled = true;
let deityThemesDefaultEnabled = true;

// Function to remove Vedic accents from a string
function removeVedicAccents(text) {
return text.replace(/[\u0951\u0952]/g, '');
}

// Function to apply settings to all stanzas
function applyDisplaySettings() {
    // A. View toggling (continuous vs. separate)
    document.querySelectorAll('.stanza-core-text').forEach(container => {
        const continuousView = container.querySelector('.continuous-view-content');
        const separateView = container.querySelector('.separate-lines-view-content');
        if (separateLinesEnabled) {
            continuousView.style.display = 'none';
            separateView.style.display = 'block';
        } else {
            continuousView.style.display = 'block';
            separateView.style.display = 'none';
        }
    });

    // B. Sanskrit accent toggling for both views
    // Continuous view segments
    document.querySelectorAll('.sanskrit-segment').forEach(segment => {
        const pipes = segment.dataset.pipes ? ' ' + segment.dataset.pipes : '';
        if (accentedSanskritEnabled) {
            segment.textContent = segment.dataset.fullSanskrit + pipes;
        } else {
            segment.textContent = segment.dataset.cleanSanskrit + pipes;
        }
    });
    // Separate lines view paragraphs
    document.querySelectorAll('.separate-lines-view-content .sanskrit-line').forEach(line => {
        const fullText = line.textContent;
        // Determine pipes by removing both versions of sanskrit text
        const pipes = fullText.replace(line.dataset.fullSanskrit, '').replace(line.dataset.cleanSanskrit, '').trim();
        if (accentedSanskritEnabled) {
            line.textContent = line.dataset.fullSanskrit + ' ' + pipes;
        } else {
            line.textContent = line.dataset.cleanSanskrit + ' ' + pipes;
        }
    });


    // C. Interlinear Transliteration lines (for both views)
    document.querySelectorAll('.translit-line-aufrecht').forEach(line => {
        line.style.display = transliterationEnabled ? 'block' : 'none';
    });

    // D. Word Meanings (Sanskrit part toggled)
    document.querySelectorAll('.word-meaning-box').forEach(box => {
        const sanskritEl = box.querySelector('.word-sanskrit');
        if (sanskritEl) {
            if (accentedSanskritEnabled) {
                sanskritEl.textContent = sanskritEl.dataset.fullSanskrit;
            } else {
                sanskritEl.textContent = sanskritEl.dataset.cleanSanskrit;
            }
        }
    });

    // E. Padas Section (Sanskrit part toggled)
    document.querySelectorAll('.pada-sanskrit').forEach(el => {
        if (accentedSanskritEnabled) {
            el.textContent = el.dataset.fullSanskrit;
        } else {
            el.textContent = el.dataset.cleanSanskrit;
        }
    });
}

// Load settings from localStorage
function loadSettings() {
const storedAccented = localStorage.getItem('accentedSanskritEnabled');
const storedTranslit = localStorage.getItem('transliterationEnabled');
const storedSeparateLines = localStorage.getItem('separateLinesEnabled');
const storedDeityDefault = localStorage.getItem('deityThemesDefaultEnabled');

if (storedAccented !== null) {
    accentedSanskritEnabled = JSON.parse(storedAccented);
    accentedSanskritToggle.checked = accentedSanskritEnabled;
}
if (storedTranslit !== null) {
    transliterationEnabled = JSON.parse(storedTranslit);
    transliterationToggle.checked = transliterationEnabled;
}
if (storedSeparateLines !== null) {
    separateLinesEnabled = JSON.parse(storedSeparateLines);
    separateLinesToggle.checked = separateLinesEnabled;
}
if (storedDeityDefault !== null) {
    deityThemesDefaultEnabled = JSON.parse(storedDeityDefault);
    deityThemesDefaultToggle.checked = deityThemesDefaultEnabled;
}

// Initial data attribute population and then apply settings
populateDataAttributes();
applyDisplaySettings();
}

// Save settings to localStorage
function saveSettings() {
localStorage.setItem('accentedSanskritEnabled', accentedSanskritEnabled);
localStorage.setItem('transliterationEnabled', transliterationEnabled);
localStorage.setItem('separateLinesEnabled', separateLinesEnabled);
localStorage.setItem('deityThemesDefaultEnabled', deityThemesDefaultEnabled);
}

// Function to populate data attributes
function populateDataAttributes() {
// This function primarily targets elements that don't have dual-rendering logic
document.querySelectorAll('.word-meaning-box .word-sanskrit').forEach(sanskritEl => {
if (sanskritEl && !sanskritEl.dataset.fullSanskrit) {
sanskritEl.dataset.fullSanskrit = sanskritEl.textContent;
sanskritEl.dataset.cleanSanskrit = removeVedicAccents(sanskritEl.textContent);
}
});
document.querySelectorAll('.pada-sanskrit').forEach(el => {
if (!el.dataset.fullSanskrit) {
el.dataset.fullSanskrit = el.textContent;
el.dataset.cleanSanskrit = removeVedicAccents(el.textContent);
}
});
}

// Event listeners for settings
settingsBtn.addEventListener('click', (event) => {
settingsModal.hidden = !settingsModal.hidden;
if (!settingsModal.hidden) {
accentedSanskritToggle.focus();
}
event.stopPropagation();
});

closeSettingsBtn.addEventListener('click', () => {
settingsModal.hidden = true;
});

accentedSanskritToggle.addEventListener('change', () => {
accentedSanskritEnabled = accentedSanskritToggle.checked;
saveSettings();
applyDisplaySettings();
});

transliterationToggle.addEventListener('change', () => {
transliterationEnabled = transliterationToggle.checked;
saveSettings();
applyDisplaySettings();
});

separateLinesToggle.addEventListener('change', () => {
separateLinesEnabled = separateLinesToggle.checked;
saveSettings();
applyDisplaySettings();
});

deityThemesDefaultToggle.addEventListener('change', () => {
deityThemesDefaultEnabled = deityThemesDefaultToggle.checked;
saveSettings();
});

document.addEventListener('click', (event) => {
if (!settingsModal.hidden && !settingsModal.contains(event.target) && !settingsBtn.contains(event.target)) {
settingsModal.hidden = true;
}
});

loadSettings();

// ==========================================================
// 1. AUDIO & HIGHLIGHTING LOGIC
// ==========================================================

function clearAllHighlights() {
    document.querySelectorAll('.sanskrit-line.highlight, .sanskrit-segment.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
}

function cancelHighlightAnimation(audioPlayer) {
const frameId = animationFrameIds.get(audioPlayer);
if (frameId) {
cancelAnimationFrame(frameId);
animationFrameIds.delete(audioPlayer);
}
clearAllHighlights();
}

function isElementMostlyInViewport(el) {
const rect = el.getBoundingClientRect();
const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
return visibleHeight / rect.height >= 0.5;
}

const globalPlayBtn = document.getElementById('global-play-btn');
const hymnAudioPlayer = document.getElementById('hymn-audio-player');

if (!globalPlayBtn || !hymnAudioPlayer) {
console.error('Global audio elements not found');
return;
}

let currentStanzaIndex = 0;
let isGlobalPlaying = false;
let isGlobalPaused = false;
let isPerStanzaOnly = false;
let globalAudioLoopId = null;
const stanzaCards = document.querySelectorAll('.stanza-card-item');

hymnAudioPlayer.volume = 0.8;

const stanzaData = Array.from(stanzaCards).map(card => {
const stanzaNum = parseInt(card.dataset.stanzaNum);
const dataScript = card.querySelector('.stanza-data-json');
let data;
try {
data = JSON.parse(dataScript.textContent.trim());
} catch (e) {
data = { audio_line_timings: [], stanza_start_ms: 0, stanza_end_ms: 0 };
}
return {
stanzaNum,
audioLineTimings: data.audio_line_timings || [],
stanzaStartMs: data.stanza_start_ms || 0,
stanzaEndMs: data.stanza_end_ms || 0,
card,
};
}).sort((a, b) => a.stanzaNum - b.stanzaNum);

function findCurrentStanzaIndex(currentTimeMs) {
return stanzaData.findIndex(d => currentTimeMs < d.stanzaEndMs);
}

// ==========================================================
// 2. LINE HIGHLIGHTING LOGIC (UPDATED)
// ==========================================================
function highlightLines(stanzaCard, timings, audioPlayer, stanzaEndTimeMs, stanzaStartMsOffset = 0) {
    if (!timings || timings.length === 0) {
        return;
    }

    const getLineElement = (lineNumber) => {
        const separateView = stanzaCard.querySelector('.separate-lines-view-content');
        if (separateView && window.getComputedStyle(separateView).display !== 'none') {
            const group = stanzaCard.querySelector(`.separate-lines-view-content .interlinear-line-group[data-line-num="${lineNumber}"]`);
            return group ? group.querySelector('.sanskrit-line') : null;
        } else {
            return stanzaCard.querySelector(`.continuous-view-content .sanskrit-segment[data-line-num="${lineNumber}"]`);
        }
    };

    let currentActiveLineElement = null;

    function updateHighlight() {
        if (audioPlayer.paused || audioPlayer.ended) {
            cancelHighlightAnimation(audioPlayer);
            return;
        }

        const currentTime = audioPlayer.currentTime * 1000;
        let newActiveLineNum = -1;
        for (let i = 0; i < timings.length; i++) {
            const timing = timings[i];
            const lineStartMs = timing.start_ms + stanzaStartMsOffset;
            const lineEndMs = timing.end_ms + stanzaStartMsOffset;

            if (currentTime >= lineStartMs && currentTime < lineEndMs) {
                newActiveLineNum = timing.line_num; // line_num is 1-based from data
                break;
            }
        }

        const newActiveLineElement = newActiveLineNum !== -1 ? getLineElement(newActiveLineNum) : null;

        if (newActiveLineElement !== currentActiveLineElement) {
            if (currentActiveLineElement) {
                currentActiveLineElement.classList.remove('highlight');
            }
            if (newActiveLineElement) {
                newActiveLineElement.classList.add('highlight');
            }
            currentActiveLineElement = newActiveLineElement;
        }

        if (currentTime >= stanzaEndTimeMs - 100) {
            if (currentActiveLineElement) currentActiveLineElement.classList.remove('highlight');
            cancelHighlightAnimation(audioPlayer);
            return;
        }

        animationFrameIds.set(audioPlayer, requestAnimationFrame(updateHighlight));
    }

    cancelHighlightAnimation(audioPlayer);
    animationFrameIds.set(audioPlayer, requestAnimationFrame(updateHighlight));
}


// --- Global Progression Loop (Handles Scrolling and Starting Highlight) ---
function startGlobalProgressionLoop() {
function checkProgression() {
if (hymnAudioPlayer.paused || hymnAudioPlayer.ended || !isGlobalPlaying) {
cancelAnimationFrame(globalAudioLoopId);
globalAudioLoopId = null;
return;
}

const currentTimeMs = hymnAudioPlayer.currentTime * 1000;
    const newStanzaIndex = findCurrentStanzaIndex(currentTimeMs);

    if (newStanzaIndex !== -1 && newStanzaIndex !== currentStanzaIndex) {
        currentStanzaIndex = newStanzaIndex;
        const currentStanza = stanzaData[currentStanzaIndex];

        if (!isElementMostlyInViewport(currentStanza.card)) {
            currentStanza.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        highlightLines(currentStanza.card, currentStanza.audioLineTimings, hymnAudioPlayer, currentStanza.stanzaEndMs, currentStanza.stanzaStartMs);

    } else if (currentStanzaIndex === 0 && currentTimeMs < stanzaData[0]?.stanzaStartMs) {
        clearAllHighlights();
    }

    globalAudioLoopId = requestAnimationFrame(checkProgression);
}

if (globalAudioLoopId) {
    cancelAnimationFrame(globalAudioLoopId);
}
globalAudioLoopId = requestAnimationFrame(checkProgression);

}

// --- Helper to start/resume global playback ---
function playGlobal(isFreshStart = false) {
hymnAudioPlayer.removeEventListener('timeupdate', hymnAudioPlayer.perStanzaListener);
delete hymnAudioPlayer.perStanzaListener;

hymnAudioPlayer.play().then(() => {
    globalPlayBtn.classList.add('is-playing');
    isGlobalPlaying = true;
    isGlobalPaused = false;

    startGlobalProgressionLoop();

    const currentTimeMs = hymnAudioPlayer.currentTime * 1000;
    const initialStanzaIndex = findCurrentStanzaIndex(currentTimeMs);

    if (initialStanzaIndex !== -1 && initialStanzaIndex < stanzaData.length) {
        currentStanzaIndex = initialStanzaIndex;
        const currentStanza = stanzaData[currentStanzaIndex];

        if (isFreshStart && !isElementMostlyInViewport(currentStanza.card)) {
            currentStanza.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        highlightLines(currentStanza.card, currentStanza.audioLineTimings, hymnAudioPlayer, currentStanza.stanzaEndMs, currentStanza.stanzaStartMs);
    } else if (initialStanzaIndex === -1 && stanzaData.length > 0) {
        currentStanzaIndex = stanzaData.length - 1;
    } else {
        clearAllHighlights();
    }
}).catch(error => {
    console.error(`Failed to play global audio:`, error);
    stopGlobalPlayback(true);
});

}

function stopGlobalPlayback(resetPosition = false) {
cancelHighlightAnimation(hymnAudioPlayer);
if (globalAudioLoopId) {
cancelAnimationFrame(globalAudioLoopId);
globalAudioLoopId = null;
}

hymnAudioPlayer.removeEventListener('timeupdate', hymnAudioPlayer.perStanzaListener);
delete hymnAudioPlayer.perStanzaListener;

hymnAudioPlayer.pause();
globalPlayBtn.classList.remove('is-playing');
isGlobalPlaying = false;

clearAllHighlights();

if (resetPosition) {
    hymnAudioPlayer.currentTime = 0;
    isGlobalPaused = false;
    currentStanzaIndex = 0;
} else {
    isGlobalPaused = true;
    const currentTimeMs = hymnAudioPlayer.currentTime * 1000;
    const newIndex = findCurrentStanzaIndex(currentTimeMs);
    currentStanzaIndex = newIndex !== -1 ? newIndex : stanzaData.length - 1;
}

}

globalPlayBtn.addEventListener('click', () => {
document.querySelectorAll('.play-stanza-btn').forEach(button => button.classList.remove('is-playing'));

isPerStanzaOnly = false; // Exit per-stanza-only mode when global button is clicked

const isFreshStart = hymnAudioPlayer.currentTime === 0 && !isGlobalPaused;

if (isGlobalPlaying) {
    stopGlobalPlayback(false);
} else {
    if (isFreshStart) {
        currentStanzaIndex = 0;
    }
    playGlobal(isFreshStart);
}

});

hymnAudioPlayer.addEventListener('ended', () => {
stopGlobalPlayback(true);
});

hymnAudioPlayer.addEventListener('error', function(e) {
console.error('Audio loading error:', e);
globalPlayBtn.style.display = 'none';

fetch(hymnAudioPlayer.src, { method: 'HEAD' })
    .then(response => {
         if (!response.ok) {
             console.log(`Audio file not found: ${hymnAudioPlayer.src}`);
         }
    })
    .catch(error => {
         console.log('Error checking audio file:', error);
    });

});

// ==========================================================
// QUICK PAUSE/RESUME ON STANZA CLICK - Global Audio Control
// ==========================================================
document.addEventListener('click', (event) => {
    // Skip if in per-stanza-only mode
    if (isPerStanzaOnly) {
        return;
    }
    
    // Only toggle if clicking inside a stanza card item
    const stanzaCard = event.target.closest('.stanza-card-item');
    if (!stanzaCard) {
        return;
    }
    
    // Exclude clicks on control tabs and translation filters within stanza card
    const controlTab = event.target.closest('.control-tab');
    const translationFilter = event.target.closest('.translation-filter-select');
    
    if (controlTab || translationFilter) {
        return;
    }
    
    // Toggle global audio on click/tap in stanza area
    if (isGlobalPlaying) {
        stopGlobalPlayback(false); // Pause, don't reset
    } else {
        playGlobal(false); // Resume
    }
});

// ==========================================================
// 3. PER-STANZA AUDIO CONTROL LOGIC
// ==========================================================
const playButtons = document.querySelectorAll('.play-stanza-btn');

playButtons.forEach(button => {
button.addEventListener('click', () => {
const stanzaCard = button.closest('.stanza-card-item');
const dataScript = stanzaCard.querySelector('.stanza-data-json');
const audioPlayer = hymnAudioPlayer;

let data;
    try {
        data = JSON.parse(dataScript.textContent.trim());
    } catch (e) {
        data = { audio_line_timings: [], stanza_start_ms: 0, stanza_end_ms: 0 };
    }
    const audioLineTimings = data.audio_line_timings || [];
    const stanzaStartMs = data.stanza_start_ms || 0;
    const stanzaEndMs = data.stanza_end_ms || 0;
    const stanzaStartSeconds = stanzaStartMs / 1000;
    const stanzaEndSeconds = stanzaEndMs / 1000;

    stopGlobalPlayback(false);
    isPerStanzaOnly = true; // Enter per-stanza-only mode

    document.querySelectorAll('.play-stanza-btn').forEach(otherButton => {
        if (otherButton !== button) {
            otherButton.classList.remove('is-playing');
        }
    });
    clearAllHighlights();

    audioPlayer.removeEventListener('timeupdate', audioPlayer.perStanzaListener);
    delete audioPlayer.perStanzaListener;

    if (button.classList.contains('is-playing')) {
        audioPlayer.pause();
        button.classList.remove('is-playing');
        cancelHighlightAnimation(audioPlayer);
        clearAllHighlights();
        isPerStanzaOnly = false;
        isGlobalPaused = true; // Ensure global audio stays paused when manually pausing stanza
    } else {
        audioPlayer.currentTime = stanzaStartSeconds;
        button.classList.add('is-playing');

        audioPlayer.play().then(() => {
            if (!isElementMostlyInViewport(stanzaCard)) {
                stanzaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            highlightLines(stanzaCard, audioLineTimings, audioPlayer, stanzaEndMs, stanzaStartMs);
        }).catch(error => {
            console.error('Playback failed:', error);
            alert('Sorry, the audio file could not be loaded or played.');
            button.classList.remove('is-playing');
            isPerStanzaOnly = false;
        });

        const perStanzaStopListener = () => {
            if (audioPlayer.currentTime >= stanzaEndSeconds - 0.2) {
                audioPlayer.pause();
                audioPlayer.currentTime = stanzaEndSeconds;
                button.classList.remove('is-playing');
                cancelHighlightAnimation(audioPlayer);
                clearAllHighlights();

                audioPlayer.removeEventListener('timeupdate', audioPlayer.perStanzaListener);
                delete audioPlayer.perStanzaListener;
                isPerStanzaOnly = false; // Exit per-stanza-only mode when stanza finishes
                isGlobalPaused = true; // Ensure global audio stays paused
            }
        };

        audioPlayer.perStanzaListener = perStanzaStopListener;
        audioPlayer.addEventListener('timeupdate', audioPlayer.perStanzaListener);

        audioPlayer.onpause = () => {
            if (!isGlobalPlaying) {
                button.classList.remove('is-playing');
                cancelHighlightAnimation(audioPlayer);
                clearAllHighlights();

                audioPlayer.removeEventListener('timeupdate', audioPlayer.perStanzaListener);
                delete audioPlayer.perStanzaListener;
                isPerStanzaOnly = false; // Exit per-stanza-only mode if audio is paused
                isGlobalPaused = true; // Ensure global audio stays paused
            }
        };
    }
});

});

// ==========================================================
// 4. TAB CONTROL & FILTER LOGIC
// ==========================================================
const controlTabs = document.querySelectorAll('.control-tab');

controlTabs.forEach(tab => {
tab.addEventListener('click', () => {
const targetTabId = tab.dataset.tab;
const targetContent = document.getElementById(targetTabId);
const parentStanza = tab.closest('.stanza-card-item');
const filterWrapper = parentStanza.querySelector('.controls-nav .translation-filter-wrapper');

const isActive = tab.classList.contains('active');

    parentStanza.querySelectorAll('.control-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    parentStanza.querySelectorAll('.content-tab').forEach(c => c.hidden = true);

    if (filterWrapper) filterWrapper.style.visibility = 'hidden';

    if (!isActive) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        targetContent.hidden = false;

        if (targetTabId.startsWith('translation-content-')) {
            if (filterWrapper) filterWrapper.style.visibility = 'visible';
        }
    }
});

});

document.querySelectorAll('.stanza-card-item').forEach(stanzaCard => {
const filterWrapper = stanzaCard.querySelector('.controls-nav .translation-filter-wrapper');
const translationTabButton = stanzaCard.querySelector('.control-tab[data-tab^="translation-content-"]');

if (filterWrapper) {
    if (translationTabButton && translationTabButton.classList.contains('active')) {
        filterWrapper.style.visibility = 'visible';
    } else {
        filterWrapper.style.visibility = 'hidden';
    }
}

});

const translationFilters = document.querySelectorAll('.translation-filter-select');

translationFilters.forEach(select => {
select.addEventListener('change', (event) => {
const selectedId = event.target.value;
const targetTextElementId = event.target.dataset.targetId;
const targetElement = document.getElementById(targetTextElementId);
const stanzaCard = event.target.closest('.stanza-card-item');

const stanzaDataScript = stanzaCard.querySelector('.stanza-data-json');

    if (!stanzaDataScript) return;

    try {
        const stanzaData = JSON.parse(stanzaDataScript.textContent.trim());
        const selectedTranslation = stanzaData.translations.find(t => t.id === selectedId);

        if (selectedTranslation) {
            targetElement.innerHTML = selectedTranslation.form.join('<br>');
        } else {
            targetElement.innerHTML = "Translation not found for this version.";
        }
    } catch (e) {
        console.error("Failed to parse or use stanza data:", e);
        targetElement.innerHTML = "Error loading translation.";
    }
});

});

console.log('Hymn detail script loaded.');

});