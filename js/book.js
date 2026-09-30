/* ==========================================================================
   STORY BOOK READER & 3D TURN ENGINE
   Interactive Comic / Graphic Novel Reader with Realistic Page Turn Animations,
   Scene-Based Audio, Font Config, First-Time Tutorial, & Reader Comments
   Author: Harish S.
   ========================================================================== */

const STORY_DATA = {
  main: {
    id: 'still-rooted',
    title: 'Still Rooted',
    subtitle: 'Growing Through the Storm',
    author: 'Harish S.',
    pages: [
      {
        pageNumber: 1,
        chapter: 'PROLOGUE',
        title: 'The Woman Who Wore A Smile',
        image: 'assets/images/scene_1.jpg',
        imageCaption: 'Scene 01: She showed up for everyone, carrying her world with quiet grace.',
        mood: 'storm',
        content: `
          <p class="story-paragraph">There was a woman 🦸🏻‍♀️ who had a strange habit.</p>
          <p class="story-paragraph">Whenever life became too heavy, she would smile gently and say, <strong>“I’m fine.”</strong></p>
          <p class="story-paragraph">She had family problems she couldn't always talk about, work that demanded more from her every day, and a mind that rarely gave her a moment of peace.</p>
          <p class="story-paragraph">Still, she showed up.</p>
          <div class="story-quote-highlight">
            She answered messages.<br>
            She finished her work.<br>
            She smiled at people.<br>
            She laughed when she could.
          </div>
          <p class="story-paragraph">Everyone saw her strength. Very few people saw how tired she really was.</p>
        `
      },
      {
        pageNumber: 2,
        chapter: 'CHAPTER I',
        title: 'The Midnight Question',
        image: 'assets/images/scene_2.jpg',
        imageCaption: 'Scene 02: By the quiet window, the heavy questions echoed.',
        mood: 'storm',
        content: `
          <p class="story-paragraph">At night, when the world became quiet and nobody was watching, she would sit by her window, look into the darkness, and quietly ask herself:</p>
          <div class="story-quote-highlight">
            “How much longer can I keep carrying all of this?”
          </div>
          <p class="story-paragraph">The quiet of her room held every unspoken thought, every silent battle she never told a soul about.</p>
          <p class="story-paragraph">She wrapped her arms around her warmth, watching the clouds gather across the night sky.</p>
        `
      },
      {
        pageNumber: 3,
        chapter: 'CHAPTER II',
        title: 'When The Tempest Came',
        image: 'assets/images/scene_3.jpg',
        imageCaption: 'Scene 03: The fury of the midnight tempest against the glass.',
        mood: 'storm',
        content: `
          <p class="story-paragraph">One night, a terrible storm arrived.</p>
          <p class="story-paragraph">The rain hit the window like it had something to prove. The wind shook the trees, the streets disappeared beneath the rain, and for a moment, even the strongest things outside looked fragile.</p>
          <p class="story-paragraph">She stood there watching the storm and thought:</p>
          <div class="story-quote-highlight">
            “Maybe life feels exactly like this right now.”
          </div>
          <p class="story-paragraph">The storm raged on without mercy, demanding to know what could withstand its power.</p>
        `
      },
      {
        pageNumber: 4,
        chapter: 'CHAPTER III',
        title: 'The Standing Tree',
        image: 'assets/images/scene_4.jpg',
        imageCaption: 'Scene 04: The morning after — battered, yet reaching for the dawn.',
        mood: 'dawn',
        content: `
          <p class="story-paragraph">The next morning, the rain had stopped. The sky was slowly becoming bright again.</p>
          <p class="story-paragraph">On her way to college, she walked past the same road she had seen through her window the night before.</p>
          <p class="story-paragraph">Trees had fallen. Branches were scattered everywhere. Leaves covered the ground.</p>
          <p class="story-paragraph"><strong>But then she noticed something.</strong></p>
          <p class="story-paragraph">A small tree was still standing.</p>
          <div class="story-quote-highlight">
            Its branches were broken.<br>
            Most of its leaves were gone.<br>
            It looked tired and damaged.<br>
            <strong>But it was still there. Still rooted. Still reaching toward the sunlight.</strong>
          </div>
        `
      },
      {
        pageNumber: 5,
        chapter: 'CHAPTER IV',
        title: 'Roots In The Storm',
        image: 'assets/images/scene_5.jpg',
        imageCaption: 'Scene 05: A quiet stillness within — understanding true resilience.',
        mood: 'dawn',
        content: `
          <p class="story-paragraph">She stopped walking. For a few seconds, she simply looked at it. And something inside her became quiet.</p>
          <p class="story-paragraph">She realized that maybe strength was never about being untouched by the storm.</p>
          <div class="story-gold-highlight">
            “Maybe strength was about staying rooted while the storm passed.”
          </div>
          <p class="story-paragraph">She didn't need to have everything figured out. She didn't need to solve her family problems in one day.</p>
          <p class="story-paragraph">She didn't need to carry every responsibility perfectly. She didn't need to pretend that she wasn't tired.</p>
          <p class="story-paragraph">She only needed to keep moving. One day at a time. One difficult morning at a time. One small step at a time.</p>
        `
      },
      {
        pageNumber: 6,
        chapter: 'CHAPTER V',
        title: 'The Unstoppable Heart',
        image: 'assets/images/scene_6.jpg',
        imageCaption: 'Scene 06: Standing in radiant morning light — victorious and serene.',
        mood: 'dawn',
        content: `
          <p class="story-paragraph">Because sometimes strength is waking up when your heart feels exhausted.</p>
          <p class="story-paragraph">Sometimes it's going to college or work with a thousand thoughts in your head and still doing your best. Sometimes it's loving your family while silently fighting your own battles.</p>
          <p class="story-paragraph">Sometimes it's crying when you're alone, wiping your tears, and choosing to try again tomorrow.</p>
          <div class="story-quote-highlight">
            “This is hard. This hurts.<br>
            <strong>But this will not be the end of me.”</strong>
          </div>
          <p class="story-paragraph">So let the storms come. Let difficult days come. Let people misunderstand you. You don't have to explain your strength to everyone. You don't have to prove your worth.</p>
          <div class="story-gold-highlight">
            Just keep your roots deep.
          </div>
        `
      },
      {
        pageNumber: 7,
        chapter: 'EPILOGUE',
        title: '“I Knew I Could”',
        image: 'assets/images/scene_6.jpg',
        imageCaption: 'Scene 07: You grew through every storm, Priyavarshini.',
        mood: 'dawn',
        isEndPage: false,
        content: `
          <p class="story-paragraph">Because storms don't last forever.</p>
          <p class="story-paragraph">One morning, the rain will stop. The sky will open. And you will look back at the person who thought she couldn't make it through...</p>
          <p class="story-paragraph"><em>…and realize she was stronger than she ever knew.</em></p>
          <div class="story-gold-highlight">
            You didn't just survive the storm.<br>
            <strong>You grew through it.</strong>
          </div>
          <p class="story-paragraph">And one day, you'll stand in the sunlight, look at everything you've achieved, and quietly smile—</p>
          <h2 class="story-final-smile">“I knew I could.” ✨</h2>
          <div class="story-signature">
            Rooting for you always, Priya! 🌿<br>
            <span style="font-size: 0.95rem; font-family: var(--font-sans); color: #9c6c21; font-weight: 700; display: block; margin-top: 0.35rem;">— Author: Harish S.</span>
          </div>
        `
      },
      {
        pageNumber: 8,
        chapter: 'SPECIAL EPILOGUE',
        title: 'Priya’s Thoughts & Review ✍️',
        image: 'assets/images/book_cover.jpg',
        imageCaption: 'Still Rooted • The End of Volume I • Dedicated to Priyavarshini ✨',
        mood: 'dawn',
        isCommentPage: true,
        content: `
          <p class="story-paragraph">Special Epilogue: Priya's Thoughts & Review. Leave your honest reactions, feelings, and review for Harish!</p>
        `
      }
    ]
  }
};

class BookReader {
  constructor() {
    this.modal = document.getElementById('story-reader-modal');
    this.bookTitleEl = document.getElementById('reader-title');
    this.pageLeftEl = document.getElementById('reader-page-left');
    this.pageRightEl = document.getElementById('reader-page-right');
    this.prevBtn = document.getElementById('reader-prev-btn');
    this.nextBtn = document.getElementById('reader-next-btn');
    this.closeBtn = document.getElementById('reader-close-btn');
    this.readAloudBtn = document.getElementById('reader-read-btn');
    this.pageIndicator = document.getElementById('reader-page-indicator');
    this.turnOverlay = document.getElementById('turning-overlay');
    this.sceneSoundPill = document.getElementById('reader-sound-pill');
    this.tutorialOverlay = document.getElementById('reader-tutorial-overlay');
    this.tutorialCloseBtn = document.getElementById('tutorial-dismiss-btn');
    this.tipsBtn = document.getElementById('reader-tips-btn');

    // Font controls
    this.fontMenuBtn = document.getElementById('reader-font-btn');
    this.fontMenuPopup = document.getElementById('font-menu-popup');

    this.currentBookKey = 'main';
    this.currentPageIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isNarrating = false;
    this.currentFontSize = '1.05rem';
    this.currentFontFamily = "'Playfair Display', serif";

    this.init();
  }

  init() {
    // Navigation buttons
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevPage());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextPage());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeBook());

    // Click backdrop to close
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal || e.target.classList.contains('reader-book-viewport')) {
          this.closeBook();
        }
      });
    }

    // Read aloud button
    if (this.readAloudBtn) {
      this.readAloudBtn.addEventListener('click', () => this.toggleReadAloud());
    }

    // Font Menu Toggle
    if (this.fontMenuBtn && this.fontMenuPopup) {
      this.fontMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.fontMenuPopup.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!this.fontMenuPopup.contains(e.target) && e.target !== this.fontMenuBtn) {
          this.fontMenuPopup.classList.remove('show');
        }
      });
    }

    // Font size controls
    const sizeBtns = document.querySelectorAll('.font-size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.getAttribute('data-size');
        this.setFontSize(size);
      });
    });

    // Font family control
    const fontSelect = document.getElementById('font-family-select');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        this.setFontFamily(e.target.value);
      });
    }

    // Scene Sound Pill
    if (this.sceneSoundPill) {
      this.sceneSoundPill.addEventListener('click', () => {
        this.toggleSceneSound();
      });
    }

    // Tutorial close
    if (this.tutorialCloseBtn) {
      this.tutorialCloseBtn.addEventListener('click', () => {
        if (this.tutorialOverlay) this.tutorialOverlay.classList.remove('show');
        localStorage.setItem('pv_reader_tutorial_seen', 'true');
      });
    }

    // Tips button to reopen tutorial anytime
    if (this.tipsBtn) {
      this.tipsBtn.addEventListener('click', () => {
        if (this.tutorialOverlay) this.tutorialOverlay.classList.add('show');
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.modal || !this.modal.classList.contains('active')) return;
      if (e.key === 'ArrowRight') this.nextPage();
      if (e.key === 'ArrowLeft') this.prevPage();
      if (e.key === 'Escape') this.closeBook();
    });

    // Touch Swipe gestures for mobile
    const viewport = document.querySelector('.reader-book-viewport');
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleGesture();
      }, { passive: true });
    }

    // Load saved font prefs
    this.loadFontPreferences();
  }

  loadFontPreferences() {
    try {
      const saved = localStorage.getItem('pv_reader_font_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.fontSize) this.currentFontSize = prefs.fontSize;
        if (prefs.fontFamily) this.currentFontFamily = prefs.fontFamily;
      }
    } catch(e){}
  }

  saveFontPreferences() {
    try {
      localStorage.setItem('pv_reader_font_prefs', JSON.stringify({
        fontSize: this.currentFontSize,
        fontFamily: this.currentFontFamily
      }));
    } catch(e){}
  }

  setFontSize(size) {
    if (size === 'sm') this.currentFontSize = '0.94rem';
    else if (size === 'md') this.currentFontSize = '1.05rem';
    else if (size === 'lg') this.currentFontSize = '1.22rem';

    this.applyFontStyles();
    this.saveFontPreferences();
  }

  setFontFamily(family) {
    if (family === 'serif') this.currentFontFamily = "'Playfair Display', serif";
    else if (family === 'sans') this.currentFontFamily = "'Plus Jakarta Sans', sans-serif";
    else if (family === 'comic') this.currentFontFamily = "'Cinzel', serif";

    this.applyFontStyles();
    this.saveFontPreferences();
  }

  applyFontStyles() {
    if (this.pageRightEl) {
      const storyTexts = this.pageRightEl.querySelectorAll('.story-paragraph, .story-quote-highlight, .story-gold-highlight');
      storyTexts.forEach(el => {
        el.style.fontSize = this.currentFontSize;
        el.style.fontFamily = this.currentFontFamily;
      });
    }
  }

  toggleSceneSound() {
    if (!window.soundEngine) return;
    const isEnabled = window.soundEngine.toggleReaderAmbient();
    if (this.sceneSoundPill) {
      this.sceneSoundPill.classList.toggle('muted', !isEnabled);
      const icon = this.sceneSoundPill.querySelector('i');
      const text = this.sceneSoundPill.querySelector('.sound-label');
      if (isEnabled) {
        const book = STORY_DATA[this.currentBookKey];
        const page = book.pages[this.currentPageIndex];
        const mood = page.mood || 'dawn';
        window.soundEngine.setSceneMood(mood);
        if (icon) icon.className = mood === 'storm' ? 'fa-solid fa-cloud-rain' : 'fa-solid fa-sun';
        if (text) text.textContent = mood === 'storm' ? 'Storm Rain' : 'Dawn Chimes';
      } else {
        if (icon) icon.className = 'fa-solid fa-volume-xmark';
        if (text) text.textContent = 'Muted';
      }
    }
  }

  openBook(bookKey = 'main', startPage = 0) {
    this.currentBookKey = bookKey;
    this.currentPageIndex = startPage;
    const book = STORY_DATA[this.currentBookKey];
    if (!book) return;

    if (this.bookTitleEl) {
      this.bookTitleEl.innerHTML = `${book.title} <span style="font-size:0.82rem; color:var(--gold-primary); font-weight:500; margin-left:0.5rem;"><i class="fa-solid fa-pen-nib"></i> By ${book.author}</span>`;
    }

    this.renderCurrentSpread();
    if (this.modal) {
      this.modal.classList.add('active');
    }

    if (window.soundEngine) {
      window.soundEngine.playPageTurn();
      // Auto-start scene audio if enabled
      window.soundEngine.readerAmbientEnabled = true;
      const page = book.pages[this.currentPageIndex];
      window.soundEngine.setSceneMood(page.mood || 'storm');
      if (this.sceneSoundPill) {
        this.sceneSoundPill.classList.remove('muted');
        const icon = this.sceneSoundPill.querySelector('i');
        const text = this.sceneSoundPill.querySelector('.sound-label');
        if (icon) icon.className = page.mood === 'dawn' ? 'fa-solid fa-sun' : 'fa-solid fa-cloud-rain';
        if (text) text.textContent = page.mood === 'dawn' ? 'Dawn Chimes' : 'Storm Rain';
      }
    }

    // Hide floating mascot widget while reading
    const happyWidget = document.getElementById('happy-voice-widget');
    if (happyWidget) happyWidget.style.display = 'none';

    // Check first-time tutorial
    const tutorialSeen = localStorage.getItem('pv_reader_tutorial_seen');
    if (!tutorialSeen && this.tutorialOverlay) {
      setTimeout(() => {
        this.tutorialOverlay.classList.add('show');
      }, 400);
    }
  }

  closeBook() {
    if (this.isNarrating) {
      window.speechSynthesis.cancel();
      this.isNarrating = false;
      this.updateNarrateBtn();
    }
    if (window.soundEngine) {
      window.soundEngine.stopReaderAmbience();
    }
    if (this.modal) {
      this.modal.classList.remove('active');
    }
    // Restore floating mascot widget
    const happyWidget = document.getElementById('happy-voice-widget');
    if (happyWidget) happyWidget.style.display = '';
  }

  renderCurrentSpread() {
    const book = STORY_DATA[this.currentBookKey];
    if (!book) return;

    const page = book.pages[this.currentPageIndex];
    if (!page) return;

    // Render Left Page: Comic Panel Graphic Artwork
    this.pageLeftEl.innerHTML = `
      <div class="comic-artwork-frame">
        <img src="${page.image}" alt="${page.title}" loading="lazy">
        <div class="comic-caption-badge">
          <i class="fa-solid fa-paintbrush"></i> ${page.imageCaption}
        </div>
      </div>
      <div class="page-num-footer">
        <span>${book.title} • By Harish S.</span>
        <span>• Illustration ${page.pageNumber} •</span>
      </div>
    `;

    // Render Right Page: Story Prose or Dedicated Guestbook Page
    let rightContent = '';

    if (page.isCommentPage) {
      rightContent = `
        <div class="story-text-container guestbook-page-container">
          <div class="chapter-number">${page.chapter}</div>
          <h2 class="chapter-heading">${page.title}</h2>

          <div class="mobile-comic-artwork-frame">
            <img src="${page.image}" alt="${page.title}">
            <div class="comic-caption-badge">
              <i class="fa-solid fa-paintbrush"></i> ${page.imageCaption}
            </div>
          </div>
          
          <p class="story-paragraph guestbook-intro">
            Thank you for reading <em>Still Rooted</em>, Priya! 🌿<br>
            Leave your honest thoughts, roast, or review for Harish below. Your reactions are preserved right here in your sanctuary:
          </p>

          <div class="story-comments-wrapper standalone-comments-page">
            <div class="guestbook-reaction-prompt">
              <i class="fa-solid fa-pen-nib" style="color:var(--rose-primary);"></i> How did the story make you feel?
            </div>

            <div class="emoji-reaction-picker" id="reaction-picker">
              <button type="button" class="reaction-emoji-btn selected" data-emoji="🌟" title="Inspired">🌟</button>
              <button type="button" class="reaction-emoji-btn" data-emoji="☕" title="Warm & Cozy">☕</button>
              <button type="button" class="reaction-emoji-btn" data-emoji="🦸🏻‍♀️" title="Unstoppable">🦸🏻‍♀️</button>
              <button type="button" class="reaction-emoji-btn" data-emoji="😂" title="Loved It">😂</button>
              <button type="button" class="reaction-emoji-btn" data-emoji="💯" title="Masterpiece">💯</button>
            </div>

            <div class="comment-input-box-row">
              <textarea id="story-comment-input" class="comment-input-textarea" rows="3" placeholder="Tell Harish what you thought of the story! Your honest thoughts, roast, or review... 😄"></textarea>
              <button type="button" id="save-comment-btn" class="submit-comment-btn">
                <i class="fa-solid fa-paper-plane"></i> Save Reaction
              </button>
            </div>

            <div class="saved-comments-feed" id="saved-comments-feed">
              <!-- Loaded dynamically -->
            </div>
          </div>

          <div class="page-num-footer">
            <span><i class="fa-solid fa-feather-pointed" style="color:var(--gold-primary);"></i> Dedicated to Priyavarshini</span>
            <span>Page ${page.pageNumber} of ${book.pages.length}</span>
          </div>
        </div>
      `;
    } else {
      rightContent = `
        <div class="story-text-container">
          <div class="chapter-number">${page.chapter}</div>
          <h2 class="chapter-heading">${page.title}</h2>

          <div class="mobile-comic-artwork-frame">
            <img src="${page.image}" alt="${page.title}">
            <div class="comic-caption-badge">
              <i class="fa-solid fa-paintbrush"></i> ${page.imageCaption}
            </div>
          </div>

          <div class="story-body-text">
            ${page.content}
          </div>
          <div class="page-num-footer">
            <span><i class="fa-solid fa-feather-pointed" style="color:var(--gold-primary);"></i> Dedicated to Priyavarshini</span>
            <span>Page ${page.pageNumber} of ${book.pages.length}</span>
          </div>
        </div>
      `;
    }

    this.pageRightEl.innerHTML = rightContent;
    // Each page begins at its illustration/title, even when the previous page was scrolled.
    this.pageRightEl.scrollTop = 0;
    document.querySelector('.reader-book-viewport')?.scrollTo({ top: 0, behavior: 'auto' });
    this.applyFontStyles();

    // Bind comments functionality if on dedicated comment page
    if (page.isCommentPage) {
      this.bindCommentsLogic();
    }

    // Update indicator & nav buttons
    if (this.pageIndicator) {
      const pageLabel = `Page ${page.pageNumber} of ${book.pages.length}`;
      this.pageIndicator.textContent = `${page.pageNumber} / ${book.pages.length}`;
      this.pageIndicator.setAttribute('aria-label', pageLabel);
      this.pageIndicator.title = pageLabel;
    }

    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentPageIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentPageIndex === book.pages.length - 1;
    }

    // Update scene ambient sound
    if (window.soundEngine && window.soundEngine.readerAmbientEnabled) {
      window.soundEngine.setSceneMood(page.mood || 'dawn');
      if (this.sceneSoundPill) {
        const icon = this.sceneSoundPill.querySelector('i');
        const text = this.sceneSoundPill.querySelector('.sound-label');
        if (icon) icon.className = page.mood === 'dawn' ? 'fa-solid fa-sun' : 'fa-solid fa-cloud-rain';
        if (text) text.textContent = page.mood === 'dawn' ? 'Dawn Chimes' : 'Storm Rain';
      }
    }
  }

  bindCommentsLogic() {
    const picker = document.getElementById('reaction-picker');
    const input = document.getElementById('story-comment-input');
    const saveBtn = document.getElementById('save-comment-btn');
    const feed = document.getElementById('saved-comments-feed');

    let selectedEmoji = '🌟';

    if (picker) {
      const emojiBtns = picker.querySelectorAll('.reaction-emoji-btn');
      emojiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          emojiBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedEmoji = btn.getAttribute('data-emoji');
        });
      });
    }

    const renderComments = () => {
      if (!feed) return;
      try {
        const comments = JSON.parse(localStorage.getItem('pv_still_rooted_comments') || '[]');
        if (comments.length === 0) {
          feed.innerHTML = '<p style="font-size:0.78rem; color:#8c7b68; font-style:italic;">No reactions added yet. Be the first to leave one, Priya!</p>';
        } else {
          feed.innerHTML = comments.map(c => `
            <div class="comment-item-card">
              <div class="comment-meta">
                <span>${c.emoji} Priyavarshini</span>
                <span>${c.date}</span>
              </div>
              <p>${c.text}</p>
            </div>
          `).join('');
        }
      } catch(e){}
    };

    renderComments();

    if (saveBtn && input) {
      saveBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;

        try {
          const comments = JSON.parse(localStorage.getItem('pv_still_rooted_comments') || '[]');
          const newEntry = {
            emoji: selectedEmoji,
            text: text,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
          comments.unshift(newEntry);
          localStorage.setItem('pv_still_rooted_comments', JSON.stringify(comments));
          input.value = '';
          renderComments();
          if (window.showToast) window.showToast('Your reaction was saved, Priya! ✨');
        } catch(e){}
      });
    }
  }

  nextPage() {
    const book = STORY_DATA[this.currentBookKey];
    if (!book || this.currentPageIndex >= book.pages.length - 1) return;

    this.triggerPageTurnAnimation('forward');
    this.currentPageIndex++;
    if (window.soundEngine) window.soundEngine.playPageTurn();

    setTimeout(() => {
      this.renderCurrentSpread();
      if (this.isNarrating) this.narrateCurrentPage();
    }, 280);
  }

  prevPage() {
    if (this.currentPageIndex <= 0) return;

    this.triggerPageTurnAnimation('backward');
    this.currentPageIndex--;
    if (window.soundEngine) window.soundEngine.playPageTurn();

    setTimeout(() => {
      this.renderCurrentSpread();
      if (this.isNarrating) this.narrateCurrentPage();
    }, 280);
  }

  handleGesture() {
    const diff = this.touchEndX - this.touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) this.nextPage();
      else this.prevPage();
    }
  }

  triggerPageTurnAnimation(direction) {
    if (!this.turnOverlay) return;
    this.turnOverlay.className = 'turning-page-overlay';
    void this.turnOverlay.offsetWidth;
    this.turnOverlay.classList.add(direction === 'forward' ? 'turn-forward' : 'turn-backward');
    setTimeout(() => {
      this.turnOverlay.className = 'turning-page-overlay';
    }, 650);
  }

  toggleReadAloud() {
    if (this.isNarrating) {
      window.speechSynthesis.cancel();
      this.isNarrating = false;
      this.updateNarrateBtn();
    } else {
      this.isNarrating = true;
      this.updateNarrateBtn();
      this.narrateCurrentPage();
    }
  }

  narrateCurrentPage() {
    if (!('speechSynthesis' in window)) {
      if (window.showToast) window.showToast('Speech narration not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const book = STORY_DATA[this.currentBookKey];
    const page = book.pages[this.currentPageIndex];
    if (!page) return;

    const tmp = document.createElement('div');
    tmp.innerHTML = page.content;
    const textToRead = `${page.chapter}. ${page.title}. ${tmp.textContent || tmp.innerText}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      this.isNarrating = false;
      this.updateNarrateBtn();
    };

    utterance.onerror = () => {
      this.isNarrating = false;
      this.updateNarrateBtn();
    };

    window.speechSynthesis.speak(utterance);
  }

  updateNarrateBtn() {
    if (!this.readAloudBtn) return;
    if (this.isNarrating) {
      this.readAloudBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Narrating...';
      this.readAloudBtn.style.color = '#ffd700';
    } else {
      this.readAloudBtn.innerHTML = '<i class="fa-solid fa-headphones"></i> Read to Me';
      this.readAloudBtn.style.color = '';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bookReader = new BookReader();
});
