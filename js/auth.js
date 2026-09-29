/* ==========================================================================
   AUTHENTICATION MODULE (Gatekeeper for Priyavarshini)
   Credentials:
   Username: priyavarshini
   Password: priya1703
   ========================================================================== */

const AUTH_CONFIG = {
  VALID_USER: 'priyavarshini',
  VALID_PASS: 'priya1703',
  STORAGE_KEY: 'pv_auth_token',
  REMEMBER_KEY: 'pv_remember_me'
};

class AuthManager {
  constructor() {
    this.overlay = document.getElementById('auth-overlay');
    this.form = document.getElementById('auth-form');
    this.userInput = document.getElementById('auth-username');
    this.passInput = document.getElementById('auth-password');
    this.rememberCheck = document.getElementById('auth-remember');
    this.errorMsg = document.getElementById('auth-error');
    this.togglePwdBtn = document.getElementById('toggle-password-btn');
    this.logoutBtn = document.getElementById('logout-btn');

    this.init();
  }

  init() {
    // Check saved session
    const savedToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY) || sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
    if (savedToken === 'authenticated_pv') {
      this.hideAuth(true);
    } else {
      this.showAuth();
    }

    // Toggle password eye
    if (this.togglePwdBtn) {
      this.togglePwdBtn.addEventListener('click', () => {
        const isPwd = this.passInput.type === 'password';
        this.passInput.type = isPwd ? 'text' : 'password';
        this.togglePwdBtn.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
      });
    }

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Logout
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }
  }

  showAuth() {
    if (this.overlay) {
      this.overlay.classList.remove('hidden');
    }
  }

  hideAuth(instant = false) {
    if (this.overlay) {
      if (instant) {
        this.overlay.classList.add('hidden');
      } else {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
          this.overlay.classList.add('hidden');
          this.overlay.style.opacity = '';
        }, 500);
      }
    }
  }

  handleLogin() {
    const user = (this.userInput.value || '').trim().toLowerCase();
    const pass = (this.passInput.value || '').trim();

    if (user === AUTH_CONFIG.VALID_USER && pass === AUTH_CONFIG.VALID_PASS) {
      this.errorMsg.textContent = '';
      if (this.rememberCheck && this.rememberCheck.checked) {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, 'authenticated_pv');
      } else {
        sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEY, 'authenticated_pv');
      }

      if (window.soundEngine) {
        window.soundEngine.playHappyChirp();
      }

      this.hideAuth();
      if (window.showToast) {
        window.showToast('Welcome to your book rack, Priya! 📚✨');
      }

      // Show the guide letter if not set to 'Don't repeat'
      if (window.introLetterManager) {
        setTimeout(() => {
          window.introLetterManager.checkAndShow();
        }, 500);
      }
    } else {
      this.errorMsg.textContent = "Oops! That key didn't match. Ask your friend Harish if you forgot it! 🗝️😄";
      this.passInput.value = '';
      this.passInput.focus();
    }
  }

  handleLogout() {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
    if (this.userInput) this.userInput.value = '';
    if (this.passInput) this.passInput.value = '';
    this.showAuth();
    if (window.showToast) {
      window.showToast('Logged out safely. See you soon, Priya!');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});
