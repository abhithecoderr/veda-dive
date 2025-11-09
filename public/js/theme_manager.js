class ThemeManager {
  constructor() {
    this.themeControlWrapper = document.getElementById("theme-control-wrapper");
    this.musicControlWrapper = document.getElementById("music-control-wrapper");
    if (!this.themeControlWrapper && !this.musicControlWrapper) return;

    // Theme State
    this.isThemeActive = false;
    this.selectedTheme = "default";
    this.currentDeity = "default";
    this.availableDeities = [];
    this.totalHymnDuration = 30000;
    this.mixedThemeIntervalId = null;
    this.mixedThemeIndex = 0;

    // DOM Elements
    this.backgroundVideo = document.getElementById("background-video");
    this.themeStylesheet = document.getElementById("deity-theme");
    this.musicPlayer = document.getElementById("music-player");

    // Theme UI
    this.themeToggleButton = document.getElementById("theme-toggle-btn");
    this.themeSelectModal = document.getElementById("theme-select-modal");
    this.themeOptionsContainer = document.getElementById(
      "theme-options-container"
    );
    this.closeThemeButton = document.getElementById("close-theme-btn");
    this.themeSfxToggle = document.getElementById("theme-sfx-toggle");
    this.themeSfxAudio = new Audio(); // For one-shot sound effects

    // Music UI
    this.musicToggleButton = document.getElementById("music-toggle-btn");
    this.musicSelectModal = document.getElementById("music-select-modal");
    this.musicOptionsContainer = document.getElementById(
      "music-options-container"
    );
    this.closeMusicButton = document.getElementById("close-music-btn");
    this.musicVolumeSlider = document.getElementById("music-volume-slider");

    this.init();
  }

  init() {
    if (this.themeControlWrapper) {
      const deitiesData = this.themeControlWrapper.dataset.deities;
      const durationData = this.themeControlWrapper.dataset.hymnDuration;
      try {
        const potentialDeities = JSON.parse(deitiesData);
        this.availableDeities = [
          ...new Set(
            potentialDeities
              .map((d) => this.normalizeDeityName(d))
              .filter(
                (d) => DEITY_CONFIG[d] && DEITY_CONFIG[d].theme !== "default"
              )
          ),
        ];
      } catch (e) {
        console.error("Could not parse deity data:", e);
      }
      this.totalHymnDuration = parseInt(durationData, 10) || 30000;

      if (this.availableDeities.length === 0) {
        this.themeControlWrapper.style.display = "none";
      } else {
        this.populateThemeOptions();
      }
    }

    this.setupEventListeners();
    this.loadState();

    // Apply initial theme state without notification
    this.handleThemeChange(false, this.selectedTheme);
  }

  populateThemeOptions() {
    this.themeOptionsContainer.innerHTML = "";
    const createOption = (value, label) => {
      const optionWrapper = document.createElement("label");
      optionWrapper.className = "theme-option-item";
      optionWrapper.innerHTML = `<input type="radio" name="theme-selection" value="${value}"><span>${label}</span>`;
      this.themeOptionsContainer.appendChild(optionWrapper);
    };

    if (this.availableDeities.length > 1) createOption("mixed", "Mixed Theme");
    this.availableDeities.forEach((deityKey) => {
      const deityName = DEITY_CONFIG[deityKey]?.name || deityKey;
      createOption(deityKey, `${deityName} Theme`);
    });
    createOption("default", "Default Theme");
  }

  populateMusicOptions(deityKey) {
    this.musicOptionsContainer.innerHTML = "";
    const musicTracks =
      DEITY_CONFIG[deityKey] && DEITY_CONFIG[deityKey].music
        ? DEITY_CONFIG[deityKey].music
        : [];

    if (musicTracks.length === 0) {
      this.musicOptionsContainer.innerHTML =
        '<p class="no-music-notice">No music available.</p>';
      this.musicToggleButton.style.display = "none";
      return;
    }

    this.musicToggleButton.style.display = "flex";
    musicTracks.forEach((track) => {
      const button = document.createElement("button");
      button.className = "music-option-btn";
      button.dataset.url = track.url;
      button.innerHTML = `<i class="fas fa-play"></i><i class="fas fa-pause"></i><span>${track.name}</span>`;
      this.musicOptionsContainer.appendChild(button);
    });
  }

  saveState() {
    localStorage.setItem(
      `hymnTheme-${window.location.pathname}`,
      this.selectedTheme
    );
    if (this.themeSfxToggle)
      localStorage.setItem("themeSfxEnabled", this.themeSfxToggle.checked);
    if (this.musicVolumeSlider)
      localStorage.setItem("musicVolume", this.musicVolumeSlider.value);
  }

  loadState() {
    // Theme State
    const isDefaultThemeEnabled =
      localStorage.getItem("deityThemesDefaultEnabled") !== "false";
    const savedTheme = localStorage.getItem(
      `hymnTheme-${window.location.pathname}`
    );
    let initialTheme = "default";
    if (
      savedTheme &&
      this.themeOptionsContainer &&
      this.themeOptionsContainer.querySelector(`input[value="${savedTheme}"]`)
    ) {
      initialTheme = savedTheme;
    } else if (isDefaultThemeEnabled && this.availableDeities.length > 0) {
      initialTheme =
        this.availableDeities.length > 1 ? "mixed" : this.availableDeities[0];
    }
    this.selectedTheme = initialTheme;

    if (this.themeOptionsContainer) {
      const radioToSelect = this.themeOptionsContainer.querySelector(
        `input[value="${this.selectedTheme}"]`
      );
      if (radioToSelect) radioToSelect.checked = true;
    }
    this.updateToggleButtonState();

    // SFX State
    if (this.themeSfxToggle) {
      this.themeSfxToggle.checked =
        localStorage.getItem("themeSfxEnabled") !== "false";
    }

    // Music Volume State
    if (this.musicVolumeSlider) {
      const savedVolume = localStorage.getItem("musicVolume");
      this.musicVolumeSlider.value =
        savedVolume !== null ? parseFloat(savedVolume) : 0.3; // Default volume lower
      if (this.musicPlayer)
        this.musicPlayer.volume = this.musicVolumeSlider.value;
    }
  }

  setupEventListeners() {
    // Theme Events
    if (this.themeToggleButton)
      this.themeToggleButton.addEventListener("click", (e) => {
        this.themeSelectModal.hidden = !this.themeSelectModal.hidden;
        e.stopPropagation();
      });
    if (this.closeThemeButton)
      this.closeThemeButton.addEventListener("click", () => {
        this.themeSelectModal.hidden = true;
      });
    if (this.themeOptionsContainer) {
      this.themeOptionsContainer.addEventListener("change", (e) => {
        if (e.target.name === "theme-selection") {
          this.handleThemeChange(true, e.target.value);
          setTimeout(() => {
            this.themeSelectModal.hidden = true;
          }, 200);
        }
      });
    }
    if (this.themeSfxToggle)
      this.themeSfxToggle.addEventListener("change", () => {
        this.saveState();
        if (!this.themeSfxToggle.checked && this.themeSfxAudio) {
          // Immediately stop sound effect if unchecked
          this.themeSfxAudio.pause();
          this.themeSfxAudio.currentTime = 0;
        } else if (this.themeSfxToggle.checked && this.isThemeActive) {
          // Play sound effect if rechecked and a theme is active
          const deityConfig = DEITY_CONFIG[this.currentDeity];
          if (deityConfig) {
            this.playThemeSoundEffect(deityConfig);
          }
        }
      });

    // Music Events
    if (this.musicToggleButton)
      this.musicToggleButton.addEventListener("click", (e) => {
        this.musicSelectModal.hidden = !this.musicSelectModal.hidden;
        e.stopPropagation();
      });
    if (this.closeMusicButton)
      this.closeMusicButton.addEventListener("click", () => {
        this.musicSelectModal.hidden = true;
      });
    if (this.musicVolumeSlider) {
      this.musicVolumeSlider.addEventListener("input", () => {
        if (this.musicPlayer)
          this.musicPlayer.volume = this.musicVolumeSlider.value;
        this.saveState();
      });
    }
    if (this.musicOptionsContainer)
      this.musicOptionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".music-option-btn");
        if (btn) this.handleMusicSelection(btn);
      });
    if (this.musicPlayer) {
      this.musicPlayer.addEventListener("play", () => this.updateMusicUI(true));
      this.musicPlayer.addEventListener("pause", () =>
        this.updateMusicUI(false)
      );
      this.musicPlayer.addEventListener("ended", () =>
        this.updateMusicUI(false)
      ); // For non-looping tracks if ever used
    }

    // Global Events
    document.addEventListener("click", (event) => {
      if (
        this.themeSelectModal &&
        !this.themeSelectModal.hidden &&
        !this.themeControlWrapper.contains(event.target)
      )
        this.themeSelectModal.hidden = true;
      if (
        this.musicSelectModal &&
        !this.musicSelectModal.hidden &&
        !this.musicControlWrapper.contains(event.target)
      )
        this.musicSelectModal.hidden = true;
    });
    if (this.backgroundVideo)
      this.backgroundVideo.addEventListener("loadeddata", () => {
        if (this.isThemeActive) this.backgroundVideo.classList.add("playing");
      });
  }

  handleThemeChange(showNotif = true, newThemeValue) {
    if (this.selectedTheme === newThemeValue && showNotif) return;

    this.selectedTheme = newThemeValue;
    this.saveState();
    this.stopAllThemes(true);

    setTimeout(() => {
      this.updateToggleButtonState();
      if (this.selectedTheme === "default") {
        this.isThemeActive = false;
        this.populateMusicOptions("default");
        if (showNotif) this.showThemeNotification("Themes", false);
      } else if (this.selectedTheme === "mixed") {
        this.isThemeActive = true;
        this.startMixedThemeLoop(showNotif);
      } else {
        this.isThemeActive = true;
        this.currentDeity = this.selectedTheme;
        this.applyTheme(this.currentDeity, showNotif);
      }
    }, 510);
  }

  startMixedThemeLoop(showNotif = true) {
    if (this.mixedThemeIntervalId) clearInterval(this.mixedThemeIntervalId);
    if (this.availableDeities.length < 1) return;

    const intervalDuration = Math.max(
      8000,
      this.totalHymnDuration / this.availableDeities.length
    );

    const playNextTheme = (isFirstRun) => {
      const deityToPlay = this.availableDeities[this.mixedThemeIndex];
      this.mixedThemeIndex =
        (this.mixedThemeIndex + 1) % this.availableDeities.length;
      this.currentDeity = deityToPlay;
      this.applyTheme(deityToPlay, isFirstRun && showNotif);
    };

    playNextTheme(true);
    this.mixedThemeIntervalId = setInterval(
      () => playNextTheme(false),
      intervalDuration
    );
  }

  applyTheme(deityKey, showNotif = true) {
    const deityConfig = DEITY_CONFIG[deityKey];
    if (!deityConfig) return this.removeTheme();

    this.updateCSSVariables(deityConfig.colors);
    this.themeStylesheet.href = `/css/themes/${deityConfig.theme}.css`;
    this.populateMusicOptions(deityKey);

    setTimeout(() => {
      document.body.classList.add("theme-active", `theme-${deityKey}`);
      this.loadBackgroundVideo(deityConfig.video);

      if (showNotif) {
        this.showThemeNotification(
          this.selectedTheme === "mixed" ? "Mixed" : deityConfig.name,
          true
        );
      }
      this.playThemeSoundEffect(deityConfig);

      this.playDefaultMusic(deityConfig);
    }, 50);
  }

  playThemeSoundEffect(deityConfig) {
    if (!this.themeSfxToggle || !this.themeSfxToggle.checked) return;
    const sfx = deityConfig.soundEffects;
    if (!sfx || sfx.length === 0) return;

    const sfxUrl = sfx[Math.floor(Math.random() * sfx.length)];
    this.themeSfxAudio.src = sfxUrl;
    this.themeSfxAudio.volume = 0.4;
    this.themeSfxAudio.loop = true;
    this.themeSfxAudio
      .play()
      .catch((e) => console.warn("SFX playback prevented", e));
  }

  playDefaultMusic(deityConfig) {
    const music = deityConfig.music;
    if (!this.musicPlayer || !music || music.length === 0) return;

    const defaultTrack = music[0];
    this.musicPlayer.src = defaultTrack.url;
    this.musicPlayer.loop = true;
    this.musicPlayer
      .play()
      .catch((e) => console.warn("Default music playback prevented", e));
  }

  stopAllThemes(withTransition = false) {
    this.stopMixedThemeLoop();
    this.removeTheme(withTransition);
  }

  removeTheme(withTransition = false) {
    if (this.backgroundVideo) {
      this.backgroundVideo.classList.remove("playing");
      setTimeout(
        () => {
          this.backgroundVideo.pause();
          this.backgroundVideo.src = "";
          this.backgroundVideo.style.display = "none";
        },
        withTransition ? 500 : 0
      );
    }

    if (this.musicPlayer) {
      this.musicPlayer.pause();
      this.musicPlayer.src = "";
    }

    document.body.classList.remove("theme-active");
    document.body.className.split(" ").forEach((cls) => {
      if (cls.startsWith("theme-")) document.body.classList.remove(cls);
    });
    this.resetCSSVariables();
    if (this.themeStylesheet)
      setTimeout(
        () => {
          this.themeStylesheet.href = "/css/themes/default.css";
        },
        withTransition ? 500 : 0
      );
  }

  handleMusicSelection(button) {
    const urlToPlay = button.dataset.url;
    if (button.classList.contains("playing")) {
      this.musicPlayer.pause();
    } else {
      this.musicPlayer.src = urlToPlay;
      this.musicPlayer
        .play()
        .catch((e) => console.error("Music playback failed:", e));
    }
  }

  updateMusicUI(isPlaying) {
    const currentSrc = this.musicPlayer.currentSrc;
    this.musicOptionsContainer
      .querySelectorAll(".music-option-btn")
      .forEach((btn) => {
        btn.classList.toggle(
          "playing",
          isPlaying && currentSrc.includes(btn.dataset.url)
        );
      });
    this.musicToggleButton.classList.toggle("active", isPlaying);
  }

  updateToggleButtonState() {
    if (this.themeToggleButton) {
      this.themeToggleButton.classList.toggle(
        "active",
        this.selectedTheme !== "default"
      );
    }
  }

  // --- UTILITY METHODS (UNCHANGED) ---
  normalizeDeityName(deityName) {
    const lowerName = deityName.toLowerCase().trim();
    return DEITY_NAME_MAP[lowerName] || lowerName;
  }
  loadBackgroundVideo(videoUrl) {
    if (!videoUrl || !this.backgroundVideo) {
      if (this.backgroundVideo) this.backgroundVideo.style.display = "none";
      return;
    }
    this.backgroundVideo.style.display = "block";
    this.backgroundVideo.src = videoUrl;
    this.backgroundVideo
      .play()
      .catch((e) => console.warn("Video playback prevented:", e));
  }
  updateCSSVariables(colors) {
    const root = document.documentElement;
    const defaultColors = DEITY_CONFIG["default"].colors;
    if (!colors) colors = {};
    root.style.setProperty(
      "--color-accent-playing",
      colors.primary || defaultColors.primary
    );
    root.style.setProperty(
      "--color-heading-warm",
      colors.secondary || defaultColors.secondary
    );
    root.style.setProperty(
      "--color-accent-gold",
      colors.accent || defaultColors.accent
    );
    root.style.setProperty(
      "--color-sanskrit-highlight",
      colors.highlight || defaultColors.highlight
    );
  }
  resetCSSVariables() {
    const root = document.documentElement;
    root.style.removeProperty("--color-accent-playing");
    root.style.removeProperty("--color-heading-warm");
    root.style.removeProperty("--color-accent-gold");
    root.style.removeProperty("--color-sanskrit-highlight");
  }
  showThemeNotification(themeName, isEnabled) {
    const old = document.getElementById("theme-notification");
    if (old) old.remove();
    const n = document.createElement("div");
    n.id = "theme-notification";
    n.style.cssText = `position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000; font-family: var(--font-body); opacity: 0; transition: opacity 0.3s ease;`;
    n.textContent = isEnabled
      ? `${themeName} theme enabled`
      : `Themes disabled`;
    document.body.appendChild(n);
    setTimeout(() => (n.style.opacity = "1"), 10);
    setTimeout(() => {
      n.style.opacity = "0";
      setTimeout(() => n.remove(), 300);
    }, 2000);
  }
  stopMixedThemeLoop() {
    if (this.mixedThemeIntervalId) {
      clearInterval(this.mixedThemeIntervalId);
      this.mixedThemeIntervalId = null;
    }
    this.mixedThemeIndex = 0;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (
    typeof DEITY_CONFIG === "undefined" ||
    typeof DEITY_NAME_MAP === "undefined"
  ) {
    console.error(
      "DEITY_CONFIG or DEITY_NAME_MAP not found. Ensure deity_config.js is loaded."
    );
    return;
  }
  new ThemeManager();
});
