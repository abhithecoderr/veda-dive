class ThemeManager {
    constructor() {
        this.themeControlWrapper = document.getElementById('theme-control-wrapper');
        if (!this.themeControlWrapper) return; // Exit if no theme controls on page

        this.isThemeActive = false;
        this.selectedTheme = 'default'; // e.g., 'default', 'mixed', 'indra'
        this.currentDeity = 'default'; // The deity whose theme is *currently* playing

        this.availableDeities = [];
        this.totalHymnDuration = 30000; // Default duration in ms
        this.mixedThemeIntervalId = null;
        this.mixedThemeIndex = 0;

        // DOM Elements
        this.backgroundVideo = document.getElementById('background-video');
        this.themeAudio = document.getElementById('theme-audio');
        this.themeStylesheet = document.getElementById('deity-theme');

        // NEW UI Elements
        this.themeToggleButton = document.getElementById('theme-toggle-btn');
        this.themeSelectModal = document.getElementById('theme-select-modal');
        this.themeOptionsContainer = document.getElementById('theme-options-container');
        this.closeThemeButton = document.getElementById('close-theme-btn');

        this.init();
    }

    init() {
        const deitiesData = this.themeControlWrapper.dataset.deities;
        const durationData = this.themeControlWrapper.dataset.hymnDuration;

        try {
            const potentialDeities = JSON.parse(deitiesData);
            this.availableDeities = [...new Set( // Ensure unique deities
                potentialDeities
                .map(d => this.normalizeDeityName(d))
                .filter(d => DEITY_CONFIG[d] && DEITY_CONFIG[d].theme !== 'default')
            )];
        } catch (e) {
            console.error("Could not parse deity data:", e);
            this.availableDeities = [];
        }

        this.totalHymnDuration = parseInt(durationData, 10) || 30000;

        if (this.availableDeities.length === 0) {
            this.themeControlWrapper.style.display = 'none';
            return;
        }

        this.populateThemeOptions(); // Updated method call
        this.availableDeities.forEach(deityKey => this.preloadDeityAssets(deityKey));
        this.setupEventListeners();
        this.loadThemeState();

        // Apply initial theme without showing a notification
        this.handleThemeChange(false, this.selectedTheme);
    }

    // NEW: Populates the modal with radio buttons
    populateThemeOptions() {
        this.themeOptionsContainer.innerHTML = ''; // Clear previous options

        const createOption = (value, label) => {
            const optionWrapper = document.createElement('label');
            optionWrapper.className = 'theme-option-item';
            optionWrapper.innerHTML = `
                <input type="radio" name="theme-selection" value="${value}">
                <span>${label}</span>
            `;
            this.themeOptionsContainer.appendChild(optionWrapper);
        };

        if (this.availableDeities.length > 1) {
            createOption('mixed', 'Mixed Theme');
        }

        this.availableDeities.forEach(deityKey => {
            const deityName = DEITY_CONFIG[deityKey]?.name || deityKey;
            createOption(deityKey, `${deityName} Theme`);
        });

        createOption('default', 'Default Theme');
    }

    preloadDeityAssets(deityKey) {
        const deityConfig = DEITY_CONFIG[deityKey];
        if (!deityConfig) return;

        if (deityConfig.theme && deityConfig.theme !== 'default') this.preloadAsset(`/css/themes/${deityConfig.theme}.css`, 'style');
        if (deityConfig.video) this.preloadAsset(deityConfig.video, 'video');
        if (deityConfig.audio) this.preloadAsset(deityConfig.audio, 'audio');
    }

    preloadAsset(url, asType) {
        if (document.head.querySelector(`link[rel="preload"][href="${url}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = asType;
        if (asType === 'video' || asType === 'audio') link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    normalizeDeityName(deityName) {
        const lowerName = deityName.toLowerCase().trim();
        return DEITY_NAME_MAP[lowerName] || lowerName;
    }

    // UPDATED: Manages all events for the new UI
    setupEventListeners() {
        if (this.themeToggleButton) {
            this.themeToggleButton.addEventListener('click', (event) => {
                this.themeSelectModal.hidden = !this.themeSelectModal.hidden;
                event.stopPropagation();
            });
        }

        if (this.closeThemeButton) {
            this.closeThemeButton.addEventListener('click', () => {
                this.themeSelectModal.hidden = true;
            });
        }

        if (this.themeOptionsContainer) {
            this.themeOptionsContainer.addEventListener('change', (event) => {
                if (event.target.name === 'theme-selection') {
                    this.handleThemeChange(true, event.target.value);
                    setTimeout(() => { this.themeSelectModal.hidden = true; }, 200);
                }
            });
        }

        document.addEventListener('click', (event) => {
            if (!this.themeSelectModal.hidden && !this.themeControlWrapper.contains(event.target)) {
                this.themeSelectModal.hidden = true;
            }
        });

        if (this.backgroundVideo) {
            this.backgroundVideo.addEventListener('loadeddata', () => {
                if (this.isThemeActive) this.backgroundVideo.classList.add('playing');
            });
            this.backgroundVideo.addEventListener('error', (e) => console.error('Video loading error:', e));
        }
        if (this.themeAudio) {
            this.themeAudio.addEventListener('error', (e) => console.error('Audio loading error:', e));
        }
    }

    // UPDATED: Now accepts the new theme value directly
    handleThemeChange(showNotif = true, newThemeValue) {
        // Prevent running if the theme hasn't actually changed
        if (this.selectedTheme === newThemeValue && showNotif) return;

        this.selectedTheme = newThemeValue;
        this.saveThemeState();
        this.stopAllThemes(true);

        setTimeout(() => {
            this.updateToggleButtonState();
            if (this.selectedTheme === 'default') {
                this.isThemeActive = false;
                if (showNotif) this.showThemeNotification('Themes', false);
            } else if (this.selectedTheme === 'mixed') {
                this.isThemeActive = true;
                this.startMixedThemeLoop(showNotif);
            } else {
                this.isThemeActive = true;
                this.currentDeity = this.selectedTheme;
                this.applyTheme(this.currentDeity, true, showNotif);
            }
        }, 510);
    }

    startMixedThemeLoop(showNotif = true) {
        if (this.mixedThemeIntervalId) clearInterval(this.mixedThemeIntervalId);
        if (this.availableDeities.length < 1) return;

        if (this.availableDeities.length === 1) {
            this.applyTheme(this.availableDeities[0], true, showNotif);
            return;
        }

        const intervalDuration = Math.max(8000, this.totalHymnDuration / this.availableDeities.length);

        const playNextTheme = (isFirstRun) => {
            const deityToPlay = this.availableDeities[this.mixedThemeIndex];
            this.mixedThemeIndex = (this.mixedThemeIndex + 1) % this.availableDeities.length;
            this.currentDeity = deityToPlay;
            this.applyTheme(deityToPlay, false, isFirstRun && showNotif);
        };

        playNextTheme(true);
        this.mixedThemeIntervalId = setInterval(() => playNextTheme(false), intervalDuration);
    }

    stopMixedThemeLoop() {
        if (this.mixedThemeIntervalId) {
            clearInterval(this.mixedThemeIntervalId);
            this.mixedThemeIntervalId = null;
        }
        this.mixedThemeIndex = 0;
    }

    applyTheme(deityKey, loopAudio = false, showNotif = true) {
        const deityConfig = DEITY_CONFIG[deityKey];
        if (!deityConfig) return this.removeTheme();

        document.body.className.split(' ').forEach(cls => {
            if (cls.startsWith('theme-') && cls !== `theme-${deityKey}`) {
                document.body.classList.remove(cls);
            }
        });

        this.updateCSSVariables(deityConfig.colors);
        this.themeStylesheet.href = `/css/themes/${deityConfig.theme}.css`;

        setTimeout(() => {
            document.body.classList.add('theme-active', `theme-${deityKey}`);
            this.loadBackgroundVideo(deityConfig.video);
            this.loadThemeAudio(deityConfig.audio, loopAudio);
            if (showNotif) this.showThemeNotification(this.selectedTheme === 'mixed' ? 'Mixed' : deityConfig.name, true);
        }, 50);
    }

    stopAllThemes(withTransition = false) {
        this.stopMixedThemeLoop();
        this.removeTheme(withTransition);
    }

    removeTheme(withTransition = false) {
        if (this.backgroundVideo) {
            this.backgroundVideo.classList.remove('playing');
            setTimeout(() => {
                this.backgroundVideo.pause();
                this.backgroundVideo.src = '';
                this.backgroundVideo.style.display = 'none';
            }, withTransition ? 500 : 0);
        }

        if (this.themeAudio) {
            this.themeAudio.pause();
            this.themeAudio.src = '';
        }

        document.body.classList.remove('theme-active');
        document.body.className.split(' ').forEach(cls => {
            if (cls.startsWith('theme-')) document.body.classList.remove(cls);
        });
        this.resetCSSVariables();

        setTimeout(() => {
            this.themeStylesheet.href = '/css/themes/default.css';
        }, withTransition ? 500 : 0);
    }

    loadBackgroundVideo(videoUrl) {
        if (!videoUrl || !this.backgroundVideo) {
            if (this.backgroundVideo) this.backgroundVideo.style.display = 'none';
            return;
        }
        this.backgroundVideo.style.display = 'block';
        this.backgroundVideo.src = videoUrl;
        this.backgroundVideo.play().catch(e => console.warn('Video playback prevented:', e));
    }

    loadThemeAudio(audioUrl, loop = false) {
        if (!audioUrl || !this.themeAudio) {
            if (this.themeAudio) { this.themeAudio.pause(); this.themeAudio.src = ''; }
            return;
        }
        this.themeAudio.loop = loop;
        this.themeAudio.src = audioUrl;
        this.themeAudio.volume = 0.2;
        this.themeAudio.play().catch(e => console.warn('Theme audio playback prevented:', e));
    }

    updateCSSVariables(colors) {
        const root = document.documentElement;
        const defaultColors = DEITY_CONFIG['default'].colors;
        root.style.setProperty('--color-accent-playing', colors.primary || defaultColors.primary);
        root.style.setProperty('--color-heading-warm', colors.secondary || defaultColors.secondary);
        root.style.setProperty('--color-accent-gold', colors.accent || defaultColors.accent);
        root.style.setProperty('--color-sanskrit-highlight', colors.highlight || defaultColors.highlight);
    }

    resetCSSVariables() {
        const root = document.documentElement;
        root.style.removeProperty('--color-accent-playing');
        root.style.removeProperty('--color-heading-warm');
        root.style.removeProperty('--color-accent-gold');
        root.style.removeProperty('--color-sanskrit-highlight');
    }

    showThemeNotification(themeName, isEnabled) {
        const oldNotification = document.getElementById('theme-notification');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.id = 'theme-notification';
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000; font-family: var(--font-body); opacity: 0; transition: opacity 0.3s ease;`;
        notification.textContent = isEnabled ? `${themeName} theme enabled` : `Themes disabled`;
        document.body.appendChild(notification);

        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    saveThemeState() {
        localStorage.setItem(`hymnTheme-${window.location.pathname}`, this.selectedTheme);
    }

    // UPDATED: Now checks the correct radio button on load
    loadThemeState() {
        const isDefaultEnabled = localStorage.getItem('deityThemesDefaultEnabled') !== 'false';
        const savedTheme = localStorage.getItem(`hymnTheme-${window.location.pathname}`);

        let initialTheme = 'default';
        if (savedTheme) {
            const optionExists = this.themeOptionsContainer.querySelector(`input[value="${savedTheme}"]`);
            if (optionExists) initialTheme = savedTheme;
        } else if (isDefaultEnabled && this.availableDeities.length > 0) {
            initialTheme = this.availableDeities.length > 1 ? 'mixed' : this.availableDeities[0];
        }
        this.selectedTheme = initialTheme;

        const radioToSelect = this.themeOptionsContainer.querySelector(`input[value="${this.selectedTheme}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
        this.updateToggleButtonState();
    }

    // NEW: Toggles the active class on the main button
    updateToggleButtonState() {
        if (this.themeToggleButton) {
            if (this.selectedTheme !== 'default') {
                this.themeToggleButton.classList.add('active');
            } else {
                this.themeToggleButton.classList.remove('active');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof DEITY_CONFIG === 'undefined' || typeof DEITY_NAME_MAP === 'undefined') {
        console.error("DEITY_CONFIG or DEITY_NAME_MAP not found. Ensure deity_config.js is loaded.");
        return;
    }
    new ThemeManager();
});
