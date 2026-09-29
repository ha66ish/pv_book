/* ==========================================================================
   INTRO LETTER CONTROLLER - HARISH'S LETTER FOR MS. PRIYA VARSHINI
   Presents a charming paper-landing letter modal guiding Priya through
   the 3D Book Rack, Video Gallery, navigation, and Happy AI mascot.
   ========================================================================== */

class IntroLetterManager {
  constructor() {
    this.STORAGE_KEY = 'pv_intro_dont_repeat';
    this.modal = document.getElementById('intro-letter-modal');
    this.paper = document.getElementById('intro-letter-paper');
    this.backdrop = document.getElementById('intro-letter-backdrop');
    this.closeX = document.getElementById('intro-letter-close-x');
    this.skipBtn = document.getElementById('intro-letter-skip-btn');
    this.exploreBtn = document.getElementById('intro-letter-explore-btn');
    this.dontRepeatCheck = document.getElementById('intro-dont-repeat-checkbox');
    this.openBtn = document.getElementById('open-intro-letter-btn');

    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.modal) return;

    // Attach button listeners
    if (this.closeX) {
      this.closeX.addEventListener('click', () => this.close());
    }
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.close());
    }
    if (this.exploreBtn) {
      this.exploreBtn.addEventListener('click', () => {
        this.close();
        if (window.showToast) {
          window.showToast('Enjoy your reading & memories, Priya! 📚🎬✨');
        }
      });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Header shortcut button to re-read anytime
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => {
        this.open(true);
      });
    }

    // Keyboard accessibility (ESC to close)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Embedded on-page letter toggle
    const embeddedCard = document.getElementById('page-embedded-letter');
    const togglePageLetterBtn = document.getElementById('page-letter-toggle-btn');
    if (embeddedCard && togglePageLetterBtn) {
      togglePageLetterBtn.addEventListener('click', () => {
        embeddedCard.classList.toggle('collapsed');
      });
    }

    // Check if user is already authenticated on load
    this.checkInitialLoad();
  }

  checkInitialLoad() {
    const isAuth = localStorage.getItem('pv_auth_token') === 'authenticated_pv' ||
                   sessionStorage.getItem('pv_auth_token') === 'authenticated_pv';
    if (isAuth) {
      // Small delay after loading screen finishes
      setTimeout(() => {
        this.checkAndShow();
      }, 1200);
    }
  }

  checkAndShow() {
    const dontRepeat = localStorage.getItem(this.STORAGE_KEY);
    if (dontRepeat !== 'true') {
      this.open(false);
    }
  }

  open(isManual = false) {
    if (!this.modal) return;
    this.isOpen = true;

    // If opening manually, load the current preference state
    if (this.dontRepeatCheck) {
      this.dontRepeatCheck.checked = (localStorage.getItem(this.STORAGE_KEY) === 'true');
    }

    // Reset closing classes if any
    this.modal.classList.remove('closing');
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');

    // Trigger realistic paper flutter sound
    if (window.soundEngine && typeof window.soundEngine.playPageTurn === 'function') {
      try {
        window.soundEngine.playPageTurn();
      } catch (err) {
        console.warn('Paper audio cue skipped:', err);
      }
    }
  }

  close() {
    if (!this.modal || !this.isOpen) return;

    // Save "Don't repeat" preference
    if (this.dontRepeatCheck) {
      if (this.dontRepeatCheck.checked) {
        localStorage.setItem(this.STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }

    // Play subtle smooth fold/dismiss
    this.modal.classList.add('closing');

    setTimeout(() => {
      this.modal.classList.remove('active');
      this.modal.classList.remove('closing');
      this.modal.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
    }, 380);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.introLetterManager = new IntroLetterManager();
});
