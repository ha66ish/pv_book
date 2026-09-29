/* ==========================================================================
   APP CONTROLLER & VISUAL EFFECTS
   Tabs, Starry Ambient Canvas, Loading Screen, & Book Click Handlers
   ========================================================================== */

// Global toast helper
window.showToast = function(message, duration = 3500) {
  const toast = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
};

// ==========================================================================
// LIVELY ROSE PETALS & ROSE LEAVES CANVAS SIMULATION
// ==========================================================================
function initRoseBreezeCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let isEnabled = localStorage.getItem('pv_petals_enabled') !== 'false';
  let mouseX = -1000;
  let mouseY = -1000;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  const particles = [];
  const particleCount = Math.min(65, Math.max(35, Math.floor(width / 24)));

  function createParticle(initialY) {
    const isLeaf = Math.random() < 0.28; // ~28% rose leaves, 72% rose petals
    const size = isLeaf ? (Math.random() * 8 + 8) : (Math.random() * 11 + 9);
    
    // Rose petal color palettes
    const petalColors = [
      { start: 'rgba(255, 182, 193,', mid: 'rgba(235, 120, 145,', end: 'rgba(217, 107, 130,' },
      { start: 'rgba(255, 204, 213,', mid: 'rgba(244, 164, 178,', end: 'rgba(224, 115, 136,' },
      { start: 'rgba(254, 215, 226,', mid: 'rgba(242, 143, 163,', end: 'rgba(201, 80, 105,' },
      { start: 'rgba(255, 225, 235,', mid: 'rgba(248, 187, 208,', end: 'rgba(216, 112, 147,' }
    ];

    // Rose leaf color palettes
    const leafColors = [
      { start: 'rgba(142, 182, 155,', mid: 'rgba(107, 144, 128,', end: 'rgba(82, 121, 111,' },
      { start: 'rgba(163, 177, 138,', mid: 'rgba(132, 169, 140,', end: 'rgba(82, 107, 88,' },
      { start: 'rgba(178, 201, 171,', mid: 'rgba(118, 155, 132,', end: 'rgba(64, 94, 76,' }
    ];

    return {
      type: isLeaf ? 'leaf' : 'petal',
      x: Math.random() * width,
      y: initialY !== undefined ? initialY : Math.random() * height,
      size,
      alpha: Math.random() * 0.45 + 0.5,
      speedX: Math.random() * 0.16 + 0.08, // Slow, peaceful horizontal drift
      speedY: Math.random() * 0.32 + 0.18, // Slow, gentle downward float
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.008, // Graceful slow spin
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.01 + 0.006, // Calming sway
      swayAmplitude: Math.random() * 0.85 + 0.4,
      flipAngle: Math.random() * Math.PI * 2,
      flipSpeed: Math.random() * 0.012 + 0.005, // Slow realistic 3D tumble
      colors: isLeaf 
        ? leafColors[Math.floor(Math.random() * leafColors.length)]
        : petalColors[Math.floor(Math.random() * petalColors.length)],
      veinAlpha: Math.random() * 0.2 + 0.15
    };
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle());
  }

  // Draw realistic curved rose petal with organic contours & delicate central fold
  function drawPetal(p, flipScale) {
    const s = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(flipScale, 1);

    // Gradient fill
    const grad = ctx.createRadialGradient(0, -s * 0.3, s * 0.2, 0, 0, s * 1.2);
    grad.addColorStop(0, `${p.colors.start} ${p.alpha})`);
    grad.addColorStop(0.5, `${p.colors.mid} ${p.alpha * 0.95})`);
    grad.addColorStop(1, `${p.colors.end} ${p.alpha * 0.85})`);

    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.bezierCurveTo(s * 0.85, -s * 0.8, s * 1.05, s * 0.5, 0, s * 1.15);
    ctx.bezierCurveTo(-s * 1.05, s * 0.5, -s * 0.85, -s * 0.8, 0, -s * 1.15);
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(217, 107, 130, 0.22)';
    ctx.fill();

    // Subtle petal vein highlight
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.quadraticCurveTo(s * 0.08, 0, 0, s * 0.9);
    ctx.strokeStyle = `rgba(255, 255, 255, ${p.veinAlpha})`;
    ctx.lineWidth = 0.85;
    ctx.stroke();

    ctx.restore();
  }

  // Draw lively serrated rose leaf with central stem vein
  function drawLeaf(p, flipScale) {
    const s = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(flipScale, 1);

    const grad = ctx.createLinearGradient(0, -s * 1.3, 0, s * 1.3);
    grad.addColorStop(0, `${p.colors.start} ${p.alpha * 0.95})`);
    grad.addColorStop(0.5, `${p.colors.mid} ${p.alpha})`);
    grad.addColorStop(1, `${p.colors.end} ${p.alpha * 0.85})`);

    ctx.beginPath();
    ctx.moveTo(0, -s * 1.35); // Pointed leaf tip
    ctx.bezierCurveTo(s * 0.75, -s * 0.6, s * 0.7, s * 0.6, 0, s * 1.3);
    ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.75, -s * 0.6, 0, -s * 1.35);
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(107, 144, 128, 0.25)';
    ctx.fill();

    // Leaf midrib & primary veins
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.lineTo(0, s * 1.1);
    ctx.strokeStyle = `rgba(255, 255, 255, ${p.veinAlpha + 0.15})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Lateral veins
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.lineTo(s * 0.35, -s * 0.15);
    ctx.moveTo(0, -s * 0.4);
    ctx.lineTo(-s * 0.35, -s * 0.15);
    ctx.moveTo(0, s * 0.2);
    ctx.lineTo(s * 0.3, s * 0.45);
    ctx.moveTo(0, s * 0.2);
    ctx.lineTo(-s * 0.3, s * 0.45);
    ctx.strokeStyle = `rgba(255, 255, 255, ${p.veinAlpha * 0.8})`;
    ctx.lineWidth = 0.65;
    ctx.stroke();

    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (isEnabled) {
      for (let p of particles) {
        p.swayAngle += p.swaySpeed;
        p.flipAngle += p.flipSpeed;
        p.rotation += p.rotationSpeed;

        // Downward drift & horizontal breeze
        const sway = Math.sin(p.swayAngle) * p.swayAmplitude;
        p.x += p.speedX + sway;
        p.y += p.speedY;

        // Interactive mouse / touch breeze gust
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (1 - dist / 140) * 1.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Loop around edges smoothly
        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 40) {
          p.x = -30;
        } else if (p.x < -40) {
          p.x = width + 20;
        }

        const flipScale = Math.cos(p.flipAngle);
        if (p.type === 'leaf') {
          drawLeaf(p, flipScale);
        } else {
          drawPetal(p, flipScale);
        }
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Toggle Functionality
  const ambientBg = document.querySelector('.ambient-bg');
  const toggleBtn = document.getElementById('petals-toggle-btn');

  function updatePetalsState(enabled, showFeedback = false) {
    isEnabled = enabled;
    localStorage.setItem('pv_petals_enabled', isEnabled ? 'true' : 'false');

    if (toggleBtn) {
      toggleBtn.classList.toggle('active', isEnabled);
      toggleBtn.title = isEnabled ? 'Pause Rose Leaves & Petals' : 'Enable Lively Rose Leaves & Petals';
      toggleBtn.innerHTML = isEnabled 
        ? '<i class="fa-solid fa-spa"></i>' 
        : '<i class="fa-solid fa-leaf"></i>';
    }

    if (ambientBg) {
      ambientBg.classList.toggle('petals-off', !isEnabled);
    }

    if (showFeedback && window.showToast) {
      window.showToast(isEnabled 
        ? 'Lively rose leaves & petals breeze enabled 🌸🍃' 
        : 'Rose petals breeze paused 🍃');
    }
  }

  // Set initial state from localStorage
  updatePetalsState(isEnabled, false);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      updatePetalsState(!isEnabled, true);
    });
  }

  window.toggleRosePetals = (enabled) => updatePetalsState(enabled, true);
}

// Navigation Tabs Switcher
function initNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const views = {
    'tab-books': document.getElementById('view-books'),
    'tab-gallery': document.getElementById('view-gallery'),
    'tab-settings': document.getElementById('view-settings')
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      // Update button active state
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update view active state
      Object.keys(views).forEach(key => {
        if (views[key]) {
          views[key].classList.toggle('active', key === targetId);
        }
      });

      // Play soft click chime
      if (window.soundEngine) {
        window.soundEngine.init();
      }
    });
  });

  // Brand Home click to return to books rack
  const brandHomeBtn = document.getElementById('brand-home-btn');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => {
      const booksTabBtn = document.querySelector('.nav-tab-btn[data-target="tab-books"]');
      if (booksTabBtn) booksTabBtn.click();
    });
  }

  // Ambient sound toggle button in header
  const soundBtn = document.getElementById('ambient-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.soundEngine) {
        const isPlaying = window.soundEngine.toggleAmbient();
        soundBtn.classList.toggle('active', isPlaying);
        soundBtn.innerHTML = isPlaying 
          ? '<i class="fa-solid fa-volume-high"></i>' 
          : '<i class="fa-solid fa-cloud-rain"></i>';
        
        window.showToast(isPlaying ? 'Ambient rain soundscape playing 🌧️' : 'Ambient sound muted');
      }
    });
  }
}

// Book Click Bindings
function initBookRack() {
  const mainBookCard = document.getElementById('book-card-main');
  const lettersBookCard = document.getElementById('book-card-letters');
  const fierceBookCard = document.getElementById('book-card-fierce');

  if (mainBookCard) {
    mainBookCard.addEventListener('click', () => {
      if (window.bookReader) {
        window.bookReader.openBook('main', 0);
      }
    });
  }

  if (lettersBookCard) {
    lettersBookCard.addEventListener('click', () => {
      if (window.showToast) {
        window.showToast('Volume II is coming soon! Harish S. is currently drafting this one for you 😄');
      }
    });
  }

  if (fierceBookCard) {
    fierceBookCard.addEventListener('click', () => {
      if (window.showToast) {
        window.showToast('Volume III is coming soon! Harish S. is currently drafting this one for you 😄');
      }
    });
  }
}

// Romantic Initial Loading Screen
function handleLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add('hidden');
  }, 1600);
}

// Dynamic Greeting based on System Time
function updateSystemTimeGreeting() {
  const greetingEl = document.getElementById('system-time-greeting');
  const userGreetingPill = document.getElementById('user-greeting-pill');
  if (!greetingEl && !userGreetingPill) return;

  const hour = new Date().getHours();
  let greetingText = 'Good morning, Priya';
  let icon = '☀️';

  if (hour >= 5 && hour < 12) {
    greetingText = 'Good morning, Priya';
    icon = '☀️';
  } else if (hour >= 12 && hour < 17) {
    greetingText = 'Good afternoon, Priya';
    icon = '🌤️';
  } else if (hour >= 17 && hour < 21) {
    greetingText = 'Good evening, Priya';
    icon = '✨';
  } else {
    greetingText = 'Good night, Priya';
    icon = '🌙';
  }

  if (greetingEl) {
    greetingEl.innerHTML = `${greetingText} ${icon}`;
  }
  if (userGreetingPill) {
    userGreetingPill.textContent = 'Priya';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initRoseBreezeCanvas();
  initNavigation();
  initBookRack();
  handleLoadingScreen();
  updateSystemTimeGreeting();
  setInterval(updateSystemTimeGreeting, 60000);
});
