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

    // Mini on-page letter card (compact bar): opens full letter modal
    const miniCard = document.getElementById('mini-letter-card');
    if (miniCard) {
      miniCard.addEventListener('click', () => {
        this.open(true);
      });
      miniCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open(true);
        }
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
    const shownOnce = localStorage.getItem('pv_intro_shown_once');
    const dontRepeat = localStorage.getItem(this.STORAGE_KEY);
    if (shownOnce === 'true' || dontRepeat === 'true') {
      return; // Never auto-pop after initial view
    }
    this.open(false);
  }

  open(isManual = false) {
    if (!this.modal) return;
    this.isOpen = true;

    // Mark as shown once so it will never pop up again automatically on future logins
    localStorage.setItem('pv_intro_shown_once', 'true');
    localStorage.setItem(this.STORAGE_KEY, 'true');

    // If opening manually, load the current preference state
    if (this.dontRepeatCheck) {
      this.dontRepeatCheck.checked = true;
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

    // Permanently remember that the letter has been viewed/dismissed
    localStorage.setItem('pv_intro_shown_once', 'true');
    localStorage.setItem(this.STORAGE_KEY, 'true');
    if (this.dontRepeatCheck) {
      this.dontRepeatCheck.checked = true;
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
