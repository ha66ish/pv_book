/* ==========================================================================
   VARSHINI'S GOOGLE DRIVE VIDEO GALLERY MODULE
   Dedicated Google Drive integration, responsive embeds, & custom Drive links
   ========================================================================== */

class DriveGallery {
  constructor() {
    this.primaryUrlInput = document.getElementById('drive-primary-url');
    this.connectBtn = document.getElementById('connect-drive-btn');
    this.openDriveBtn = document.getElementById('open-drive-external-btn');
    this.embedViewer = document.getElementById('drive-embed-viewer');
    this.emptyPlaceholder = document.getElementById('drive-empty-placeholder');
    this.cardsContainer = document.getElementById('drive-video-cards-grid');

    // Add modal elements
    this.addModal = document.getElementById('add-video-modal');
    this.openAddBtn = document.getElementById('open-add-video-btn');
    this.closeAddBtn = document.getElementById('close-add-modal-btn');
    this.addForm = document.getElementById('add-video-form');

    this.primaryStorageKey = 'pv_drive_primary_url';
    this.videosStorageKey = 'pv_drive_videos_list';

    this.videos = [];
    this.init();
  }

  init() {
    this.loadState();

    if (this.connectBtn) {
      this.connectBtn.addEventListener('click', () => this.handleConnectPrimary());
    }

    if (this.openDriveBtn) {
      this.openDriveBtn.addEventListener('click', () => {
        const url = (this.primaryUrlInput ? this.primaryUrlInput.value : '').trim();
        if (url) {
          window.open(url, '_blank');
        } else {
          if (window.showToast) window.showToast('Please enter a Google Drive link first.');
        }
      });
    }

    // Modal bindings
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
        this.handleAddDriveVideo();
      });
    }
  }

  // Convert any Google Drive URL into an embeddable preview URL
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

  loadState() {
    const savedPrimary = localStorage.getItem(this.primaryStorageKey) || '';
    if (this.primaryUrlInput) this.primaryUrlInput.value = savedPrimary;

    try {
      this.videos = JSON.parse(localStorage.getItem(this.videosStorageKey) || '[]');
    } catch(e) {
      this.videos = [];
    }

    if (savedPrimary) {
      this.renderPrimaryViewer(savedPrimary);
    } else {
      this.renderEmptyState();
    }

    this.renderVideoCards();
  }

  handleConnectPrimary() {
    const url = (this.primaryUrlInput ? this.primaryUrlInput.value : '').trim();
    if (!url) {
      if (window.showToast) window.showToast('Please paste a Google Drive link.');
      return;
    }

    localStorage.setItem(this.primaryStorageKey, url);
    this.renderPrimaryViewer(url);

    if (window.soundEngine) window.soundEngine.playHappyChirp();
    if (window.showToast) {
      window.showToast('Google Drive link connected successfully! 📁✨');
    }
  }

  renderPrimaryViewer(url) {
    const embedUrl = this.formatDriveEmbedUrl(url);

    if (this.emptyPlaceholder) this.emptyPlaceholder.style.display = 'none';
    if (this.embedViewer) {
      this.embedViewer.style.display = 'block';
      this.embedViewer.innerHTML = `
        <div class="drive-cinema-frame">
          <iframe src="${embedUrl}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture"></iframe>
        </div>
        <div class="drive-viewer-actions" style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">💡 If video doesn't play inside the frame, ensure link sharing is set to "Anyone with the link can view".</span>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="drive-open-external-btn" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: var(--rose-700); text-decoration: none; padding: 6px 14px; background: #ffffff; border: 1px solid var(--rose-200); border-radius: 999px; box-shadow: var(--shadow-sm); transition: all 0.2s ease;">
            <span>Open in Google Drive</span> ↗
          </a>
        </div>
      `;
    }
  }

  renderEmptyState() {
    if (this.embedViewer) this.embedViewer.style.display = 'none';
    if (this.emptyPlaceholder) this.emptyPlaceholder.style.display = 'flex';
  }

  renderVideoCards() {
    if (!this.cardsContainer) return;
    this.cardsContainer.innerHTML = '';

    const countEl = document.getElementById('gallery-video-count');
    if (countEl) {
      countEl.textContent = `${this.videos.length} Drive Media Items`;
    }

    if (this.videos.length === 0) {
      return;
    }

    this.videos.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'drive-item-card';
      const embedUrl = this.formatDriveEmbedUrl(item.url);

      card.innerHTML = `
        <div class="drive-item-preview">
          <iframe src="${embedUrl}" loading="lazy"></iframe>
        </div>
        <div class="drive-item-info">
          <h4>${item.title}</h4>
          <p>${item.desc || 'Google Drive Memory'}</p>
          <div class="drive-item-footer">
            <span><i class="fa-solid fa-clock"></i> ${item.date}</span>
            <button class="remove-drive-item-btn" data-index="${index}" title="Remove memory">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;

      const removeBtn = card.querySelector('.remove-drive-item-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeVideo(index);
        });
      }

      this.cardsContainer.appendChild(card);
    });
  }

  handleAddDriveVideo() {
    const title = (document.getElementById('new-vid-title').value || '').trim();
    const url = (document.getElementById('new-vid-url').value || '').trim();
    const desc = (document.getElementById('new-vid-desc').value || '').trim();

    if (!title || !url) return;

    const newItem = {
      title,
      url,
      desc,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    this.videos.unshift(newItem);
    localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));

    // If primary was empty, set it
    const currentPrimary = localStorage.getItem(this.primaryStorageKey);
    if (!currentPrimary) {
      localStorage.setItem(this.primaryStorageKey, url);
      if (this.primaryUrlInput) this.primaryUrlInput.value = url;
      this.renderPrimaryViewer(url);
    }

    this.renderVideoCards();

    if (this.addModal) this.addModal.classList.remove('active');
    if (this.addForm) this.addForm.reset();

    if (window.showToast) {
      window.showToast('Drive memory added to gallery! 🎬');
    }
  }

  removeVideo(index) {
    this.videos.splice(index, 1);
    localStorage.setItem(this.videosStorageKey, JSON.stringify(this.videos));
    this.renderVideoCards();
    if (window.showToast) window.showToast('Item removed.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.driveGallery = new DriveGallery();
});
