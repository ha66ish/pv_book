/* ==========================================================================
   VARSHINI'S VIDEO MEMORIES & CLIPS MODULE
   Mobile-Optimized Video Grid, Custom Cover Posters, & Lightbox Cinema Player
   ========================================================================== */

class DriveGallery {
  constructor() {
    this.primaryUrlInput = document.getElementById('drive-primary-url');
    this.connectBtn = document.getElementById('connect-drive-btn');
    this.openDriveBtn = document.getElementById('open-drive-external-btn');
    this.emptyPlaceholder = document.getElementById('drive-empty-placeholder');
    this.cardsContainer = document.getElementById('drive-video-cards-grid');

    // Video Player Modal elements
    this.playerModal = document.getElementById('video-player-modal');
    this.playerFrame = document.getElementById('cinema-media-frame');
    this.playerTitle = document.getElementById('cinema-player-title');
    this.playerDesc = document.getElementById('cinema-player-desc');
    this.playerExternalLink = document.getElementById('cinema-external-link');
    this.playerCloseBtn = document.getElementById('cinema-close-btn');

    // Add Video Modal elements
    this.addModal = document.getElementById('add-video-modal');
    this.openAddBtn = document.getElementById('open-add-video-btn');
    this.closeAddBtn = document.getElementById('close-add-modal-btn');
    this.addForm = document.getElementById('add-video-form');

    // Edit Video Modal elements
    this.editModal = document.getElementById('edit-video-modal');
    this.closeEditBtn = document.getElementById('close-edit-modal-btn');
    this.editForm = document.getElementById('edit-video-form');

    this.primaryStorageKey = 'pv_drive_primary_url';
    this.videosStorageKey = 'pv_drive_videos_list';

    this.videos = [];
    this.init();
  }

  init() {
    this.loadState();

    // Quick Add Bar button
    if (this.connectBtn) {
      this.connectBtn.addEventListener('click', () => this.handleQuickAddClip());
    }

    if (this.primaryUrlInput) {
      this.primaryUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleQuickAddClip();
        }
      });
    }

    if (this.openDriveBtn) {
      this.openDriveBtn.addEventListener('click', () => {
        const url = (this.primaryUrlInput ? this.primaryUrlInput.value : '').trim();
        if (url) {
          window.open(url, '_blank');
        } else {
          window.open('https://drive.google.com', '_blank');
        }
      });
    }

    // Modal bindings: Add Video Modal
    if (this.openAddBtn) {
      this.openAddBtn.addEventListener('click', () => {
        if (this.addModal) this.addModal.classList.add('active');
      });
    }

    if (this.closeAddBtn) {
      this.closeAddBtn.addEventListener('click', () => {
        if (this.addModal) this.addModal.classList.remove('active');
      });
    }

    if (this.addForm) {
      this.addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCustomAddClip();
      });
    }

    // Modal bindings: Edit Video Modal
    if (this.closeEditBtn) {
      this.closeEditBtn.addEventListener('click', () => {
        if (this.editModal) this.editModal.classList.remove('active');
      });
    }

    if (this.editForm) {
      this.editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveEditedClip();
      });
    }

    if (this.editModal) {
      this.editModal.addEventListener('click', (e) => {
        if (e.target === this.editModal) {
          this.editModal.classList.remove('active');
        }
      });
    }

    // Modal bindings: Cinema Player Modal
    if (this.playerCloseBtn) {
      this.playerCloseBtn.addEventListener('click', () => this.closePlayerModal());
    }

    if (this.playerModal) {
      this.playerModal.addEventListener('click', (e) => {
        if (e.target === this.playerModal) {
          this.closePlayerModal();
        }
      });
    }

    // ESC key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.playerModal && this.playerModal.classList.contains('active')) {
          this.closePlayerModal();
        }
        if (this.addModal && this.addModal.classList.contains('active')) {
          this.addModal.classList.remove('active');
        }
        if (this.editModal && this.editModal.classList.contains('active')) {
          this.editModal.classList.remove('active');
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     CLEAN & BEAUTIFUL TITLE FORMATTING
     -------------------------------------------------------------------------- */
  beautifyTitle(rawTitle, url = '') {
    if (!rawTitle || !rawTitle.trim()) {
      if (url.includes('drive.google.com')) return "Varshini's Stage Spotlight 🌟";
      return "Special Memory Clip 🎬";
    }

    let clean = rawTitle.trim();
    // Strip common video extensions
    clean = clean.replace(/\.(mp4|mov|avi|mkv|webm|wmv|m4v)$/i, '');
    // Replace underscores, hyphens, and file noise with spaces
    clean = clean.replace(/^[VID|IMG|MOV][-_0-9]+/i, '');
    clean = clean.replace(/[_-]+/g, ' ').trim();

    if (!clean) clean = "Varshini's Special Moment";

    // Capitalize words nicely
    clean = clean.split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    // Add playful touch if no emoji present
    if (!clean.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/)) {
      clean += ' 🌟';
    }

    return clean;
  }

  /* --------------------------------------------------------------------------
     URL & THUMBNAIL COVER PARSING
     -------------------------------------------------------------------------- */
  formatDriveEmbedUrl(url) {
    if (!url) return '';
    const clean = url.trim();

    // File link: /file/d/FILE_ID/view... -> /file/d/FILE_ID/preview
    const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    // Folder link: /drive/folders/FOLDER_ID -> embeddedfolderview
    const folderMatch = clean.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
    }

    // YouTube fallback
    if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
      let vidId = '';
      if (clean.includes('watch?v=')) vidId = clean.split('watch?v=')[1].split('&')[0];
      else if (clean.includes('youtu.be/')) vidId = clean.split('youtu.be/')[1].split('?')[0];
      if (vidId) return `https://www.youtube.com/embed/${vidId}`;
    }

    return clean;
  }

  getCoverImageForUrl(url, customCover = '') {
    if (customCover && customCover.trim()) return customCover;

    // Google Drive video thumbnail
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      // High-res Google Drive thumbnail
      return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w800`;
    }

    // YouTube thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let vidId = '';
      if (url.includes('watch?v=')) vidId = url.split('watch?v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1].split('?')[0];
      if (vidId) return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
    }

    // Default warm aesthetic theater stage cover
    return 'assets/images/stage_curtain_cover.jpg';
  }

  /* --------------------------------------------------------------------------
     STATE & DATA LOADING
     -------------------------------------------------------------------------- */
  loadState() {
    const DEFAULT_VIDEOS = [
      {
        title: "Pretty Little Baby Song By 😎",
        url: "https://drive.google.com/file/d/12YvHUZqxsfQy3pZcTg4zrPiNKffHWhlF/view?usp=drive_link",
        desc: "Varshini's charming rendition of Pretty Little Baby! 🎵✨",
        cover: "",
        date: "Special Memory"
      },
      {
        title: "Alagiya Singer Yaru? 🎤",
        url: "https://drive.google.com/file/d/1fBTzehrjVj7F_o4l8AZk-I5dz1ykIZJs/view?usp=sharing",
        desc: "Guess who the sweetest singer is? Varshini in the spotlight! 🎶",
        cover: "",
        date: "Music Memory"
      },
      {
        title: "Who Is Priyavarshini ✨",
        url: "https://drive.google.com/file/d/1-g2iPFMXen-qt3F92zBoLLtWhnneJm_z/view?usp=sharing",
        desc: "A special spotlight celebrating everything wonderful about Priyavarshini.",
        cover: "",
        date: "Spotlight"
      },
      {
        title: "Oodha Poo Song 🌸",
        url: "https://drive.google.com/file/d/1zIkhZBtRVJq_UV07XeYyMRKtMp58uZ6g/view?usp=sharing",
        desc: "A beautiful melody captured with sweet smiles and joyful vibes.",
        cover: "",
        date: "Classic Tune"
      },
      {
        title: "Ooh Rose Of Germany 🌹",
        url: "https://drive.google.com/file/d/1g2UVTVXVJuMBucuBn6himXXqeA-Ri34N/view?usp=sharing",
        desc: "Classic performance and graceful stage presence by Varshini.",
        cover: "",
        date: "Stage Spotlight"
      }
    ];

    const savedPrimary = localStorage.getItem(this.primaryStorageKey) || '';
    if (this.primaryUrlInput && savedPrimary) {
      this.primaryUrlInput.value = savedPrimary;
    }

    try {
      this.videos = JSON.parse(localStorage.getItem(this.videosStorageKey) || '[]');
    } catch(e) {
      this.videos = [];
    }

    // If empty or containing the old dummy placeholder, upgrade to the 5 real clips
    const hasDummy = this.videos.some(v => v.url && v.url.includes('1Gq_stage_memory'));
    if (this.videos.length === 0 || hasDummy) {
      this.videos = DEFAULT_VIDEOS;
      localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));
      if (!savedPrimary || savedPrimary.includes('1Gq_stage_memory')) {
        localStorage.setItem(this.primaryStorageKey, DEFAULT_VIDEOS[0].url);
        if (this.primaryUrlInput) this.primaryUrlInput.value = DEFAULT_VIDEOS[0].url;
      }
    }

    this.renderVideoCards();
  }

  /* --------------------------------------------------------------------------
     RENDER VIDEO CLIPS (MOBILE-FIRST GRID WITH NEAT POSTERS)
     -------------------------------------------------------------------------- */
  renderVideoCards() {
    if (!this.cardsContainer) return;
    this.cardsContainer.innerHTML = '';

    if (this.videos.length === 0) {
      if (this.emptyPlaceholder) this.emptyPlaceholder.style.display = 'flex';
      return;
    } else {
      if (this.emptyPlaceholder) this.emptyPlaceholder.style.display = 'none';
    }

    this.videos.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'clip-item-card';

      const safeTitle = item.title || "Varshini's Video Clip";
      const safeDesc = item.desc || "Special memory clip for Priyavarshini.";
      const coverUrl = this.getCoverImageForUrl(item.url, item.cover);

      card.innerHTML = `
        <div class="clip-poster-wrap">
          <img src="${coverUrl}" alt="${safeTitle}" class="clip-poster-img" onerror="this.src='assets/images/stage_curtain_cover.jpg'">
          <div class="clip-poster-gradient"></div>
          <div class="clip-play-badge" title="Watch Video">
            <i class="fa-solid fa-play"></i>
          </div>
          <div class="clip-badge-pill">
            <i class="fa-solid fa-film"></i> HD Memory
          </div>
        </div>
        <div class="clip-info-content">
          <h4 class="clip-title">${safeTitle}</h4>
          <p class="clip-desc">${safeDesc}</p>
          <div class="clip-card-footer">
            <span class="clip-date"><i class="fa-regular fa-clock"></i> ${item.date || 'Memories'}</span>
            <div class="clip-actions-group">
              <button class="clip-watch-btn" title="Watch Clip">
                <i class="fa-solid fa-play"></i> Watch
              </button>
              <button class="edit-clip-btn" data-index="${index}" title="Edit Clip Details">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="clip-drive-link-btn" title="Open in Google Drive">
                <i class="fa-brands fa-google-drive"></i>
              </a>
              <button class="remove-clip-btn" data-index="${index}" title="Remove Clip">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Tap card or "Watch" button to open mobile-friendly lightbox player
      const poster = card.querySelector('.clip-poster-wrap');
      const watchBtn = card.querySelector('.clip-watch-btn');
      const editBtn = card.querySelector('.edit-clip-btn');
      
      const openHandler = (e) => {
        e.stopPropagation();
        this.openPlayerModal(item);
      };

      if (poster) poster.addEventListener('click', openHandler);
      if (watchBtn) watchBtn.addEventListener('click', openHandler);

      // Edit button
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEditModal(index);
        });
      }

      // Remove button
      const removeBtn = card.querySelector('.remove-clip-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeVideo(index);
        });
      }

      this.cardsContainer.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     MOBILE-OPTIMIZED CINEMA LIGHTBOX PLAYER
     -------------------------------------------------------------------------- */
  openPlayerModal(item) {
    if (!this.playerModal || !this.playerFrame) return;

    const embedUrl = this.formatDriveEmbedUrl(item.url);

    if (this.playerTitle) this.playerTitle.textContent = item.title;
    if (this.playerDesc) this.playerDesc.textContent = item.desc || 'Special video memory for Priyavarshini.';
    if (this.playerExternalLink) this.playerExternalLink.href = item.url;

    // Responsive 16:9 iframe injected on demand
    this.playerFrame.innerHTML = `
      <iframe src="${embedUrl}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
    `;

    this.playerModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll on mobile

    if (window.soundEngine) window.soundEngine.playPageFlip();
  }

  closePlayerModal() {
    if (!this.playerModal) return;

    this.playerModal.classList.remove('active');
    // Clear iframe to cut audio and free mobile RAM immediately
    if (this.playerFrame) {
      this.playerFrame.innerHTML = '';
    }
    document.body.style.overflow = ''; // Restore scroll
  }

  /* --------------------------------------------------------------------------
     ADD VIDEO HANDLERS
     -------------------------------------------------------------------------- */
  handleQuickAddClip() {
    const urlInput = this.primaryUrlInput;
    if (!urlInput) return;
    const url = urlInput.value.trim();

    if (!url) {
      if (window.showToast) window.showToast('Please paste a Google Drive video link.');
      return;
    }

    const title = this.beautifyTitle('', url);
    const newItem = {
      title,
      url,
      desc: "Special moment saved to Varshini's Video Gallery.",
      cover: "assets/images/stage_curtain_cover.jpg",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    this.videos.unshift(newItem);
    localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));
    localStorage.setItem(this.primaryStorageKey, url);
    urlInput.value = '';

    this.renderVideoCards();

    if (window.soundEngine) window.soundEngine.playHappyChirp();
    if (window.showToast) window.showToast('Video clip added to gallery! 🎬✨');
  }

  handleCustomAddClip() {
    const titleRaw = (document.getElementById('new-vid-title')?.value || '').trim();
    const url = (document.getElementById('new-vid-url')?.value || '').trim();
    const desc = (document.getElementById('new-vid-desc')?.value || '').trim();

    if (!url) {
      if (window.showToast) window.showToast('Please provide a video URL.');
      return;
    }

    const title = this.beautifyTitle(titleRaw, url);
    const newItem = {
      title,
      url,
      desc: desc || "Special memory clip for Priyavarshini.",
      cover: "assets/images/stage_curtain_cover.jpg",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    this.videos.unshift(newItem);
    localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));
    this.renderVideoCards();

    if (this.addModal) this.addModal.classList.remove('active');
    if (this.addForm) this.addForm.reset();

    if (window.soundEngine) window.soundEngine.playHappyChirp();
    if (window.showToast) window.showToast('Custom video memory saved! 🎬');
  }

  openEditModal(index) {
    const item = this.videos[index];
    if (!item) return;

    const idxField = document.getElementById('edit-vid-index');
    const titleField = document.getElementById('edit-vid-title');
    const urlField = document.getElementById('edit-vid-url');
    const descField = document.getElementById('edit-vid-desc');

    if (idxField) idxField.value = index;
    if (titleField) titleField.value = item.title || '';
    if (urlField) urlField.value = item.url || '';
    if (descField) descField.value = item.desc || '';

    if (this.editModal) this.editModal.classList.add('active');
  }

  handleSaveEditedClip() {
    const idxField = document.getElementById('edit-vid-index');
    const index = parseInt(idxField ? idxField.value : '-1', 10);

    if (isNaN(index) || index < 0 || !this.videos[index]) return;

    const titleRaw = (document.getElementById('edit-vid-title')?.value || '').trim();
    const url = (document.getElementById('edit-vid-url')?.value || '').trim();
    const desc = (document.getElementById('edit-vid-desc')?.value || '').trim();

    if (!url) {
      if (window.showToast) window.showToast('Please provide a valid video link.');
      return;
    }

    const title = titleRaw || this.beautifyTitle('', url);

    // Update the video item
    this.videos[index].title = title;
    this.videos[index].url = url;
    this.videos[index].desc = desc || "Special memory clip for Priyavarshini.";

    localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));
    this.renderVideoCards();

    if (this.editModal) this.editModal.classList.remove('active');

    if (window.soundEngine) window.soundEngine.playHappyChirp();
    if (window.showToast) window.showToast('Memory clip updated successfully! ✨');
  }

  removeVideo(index) {
    this.videos.splice(index, 1);
    localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));
    this.renderVideoCards();
    if (window.showToast) window.showToast('Clip removed.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.driveGallery = new DriveGallery();
});
