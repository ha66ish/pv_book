const DEFAULT_PRIYA_PHOTOS = [
  { id: 'photo-field-day-01', path: 'assets/images/priya-gallery/field-day-outdoors-01.webp', title: 'A Day Outdoors', description: 'Priya leading a fun activity with her classmates.' },
  { id: 'photo-field-day-02', path: 'assets/images/priya-gallery/field-day-outdoors-02.webp', title: 'Together as a Class', description: 'A happy moment with the whole group.' },
  { id: 'photo-sales-talk', path: 'assets/images/priya-gallery/classroom-sales-talk.webp', title: 'The Sales Talk', description: 'Presenting an idea to the class.' },
  { id: 'photo-classroom-activity', path: 'assets/images/priya-gallery/classroom-activity.webp', title: 'Classroom Activity', description: 'Working through a classroom demonstration together.' },
  { id: 'photo-craft-01', path: 'assets/images/priya-gallery/craft-workshop-01.webp', title: 'Making Something Together', description: 'A hands-on craft session with friends.' },
  { id: 'photo-craft-02', path: 'assets/images/priya-gallery/craft-workshop-02.webp', title: 'Creative Workshop', description: 'Colorful materials and a shared project.' },
  { id: 'photo-patriotic-song', path: 'assets/images/priya-gallery/patriotic-song.webp', title: 'Patriotic Song', description: 'A school performance with classmates.' },
  { id: 'photo-presentation-01', path: 'assets/images/priya-gallery/classroom-presentation-01.webp', title: 'A Classroom Presentation', description: 'Sharing a project in front of the class.' },
  { id: 'photo-presentation-02', path: 'assets/images/priya-gallery/classroom-presentation-02.webp', title: 'Sales Talk Practice', description: 'Practicing a presentation with classmates.' },
  { id: 'photo-presentation-03', path: 'assets/images/priya-gallery/classroom-presentation-03.webp', title: 'A Lively Discussion', description: 'Students sharing ideas in class.' },
  { id: 'photo-outdoor-class', path: 'assets/images/priya-gallery/outdoor-class-activity.webp', title: 'Learning Outdoors', description: 'An outdoor activity with the group.' },
  { id: 'photo-book-elder', path: 'assets/images/priya-gallery/book-presentation-with-elder.webp', title: 'A Book to Remember', description: 'Sharing a favorite book during a special visit.' },
  { id: 'photo-classroom-demo', path: 'assets/images/priya-gallery/classroom-demonstration.webp', title: 'In Front of the Class', description: 'A classroom lesson shared with friends.' },
  { id: 'photo-craft-wide', path: 'assets/images/priya-gallery/craft-project-wide.webp', title: 'Working on a Project', description: 'Making a colorful project together.' },
  { id: 'photo-book-harish', path: 'assets/images/priya-gallery/book-moment-together.webp', title: 'Between the Lines', description: 'A special book moment together.' },
  { id: 'photo-craft-detail', path: 'assets/images/priya-gallery/craft-project-detail.webp', title: 'Little Details', description: 'A close-up of the handmade craft project.' }
];

class PriyaPhotoGallery {
  constructor() {
    this.storageKey = 'pv_priya_photos';
    this.grid = document.getElementById('photo-gallery-grid');
    this.empty = document.getElementById('photo-gallery-empty');
    this.form = document.getElementById('add-photo-form');
    this.photos = this.readPhotos();
    this.seedDefaults();
    this.createPreview();
    this.addButton = document.getElementById('open-add-photo-btn');
    this.addButton?.addEventListener('click', () => {
      if (!this.form) return;
      this.form.hidden = !this.form.hidden;
      this.addButton.setAttribute('aria-expanded', String(!this.form.hidden));
      if (!this.form.hidden) document.getElementById('photo-image-path')?.focus();
    });
    this.form?.addEventListener('submit', event => {
      event.preventDefault();
      const path = document.getElementById('photo-image-path').value.trim();
      const title = document.getElementById('photo-title').value.trim();
      const description = document.getElementById('photo-description').value.trim();
      if (!path || !title) return;
      this.photos.unshift({ id: crypto.randomUUID?.() || String(Date.now()), path, title, description });
      this.save();
      this.form.reset();
      this.form.hidden = true;
      this.render();
      window.showToast?.('Photo added to Priya’s album.');
    });
    this.render();
  }

  readPhotos() {
    try {
      const value = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }

  seedDefaults() {
    const seedKey = 'pv_priya_photos_seed_v1';
    if (localStorage.getItem(seedKey)) return;
    const existingPaths = new Set(this.photos.map(photo => photo.path));
    DEFAULT_PRIYA_PHOTOS.forEach(photo => {
      if (!existingPaths.has(photo.path)) this.photos.push({ ...photo });
    });
    this.save();
    localStorage.setItem(seedKey, 'true');
  }

  save() { localStorage.setItem(this.storageKey, JSON.stringify(this.photos)); }

  createPreview() {
    this.preview = document.createElement('dialog');
    this.preview.className = 'photo-preview-dialog';
    this.preview.setAttribute('aria-label', 'Photo preview');
    this.preview.innerHTML = `
      <button type="button" class="photo-preview-close" aria-label="Close preview"><i class="fa-solid fa-xmark"></i></button>
      <div class="photo-preview-stage">
        <img class="photo-preview-image" alt="">
        <div class="photo-zoom-controls" role="group" aria-label="Image zoom controls">
          <button type="button" class="photo-zoom-step" data-zoom="out" aria-label="Zoom out" title="Zoom out"><i class="fa-solid fa-minus"></i></button>
          <button type="button" class="photo-zoom-reset" aria-label="Reset zoom" title="Reset zoom">100%</button>
          <button type="button" class="photo-zoom-step" data-zoom="in" aria-label="Zoom in" title="Zoom in"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <div class="photo-preview-caption"><h2></h2><button type="button" class="photo-edit-button photo-preview-edit"><i class="fa-solid fa-pen"></i><span>Edit</span></button></div>
      <form class="inline-memory-form photo-preview-form" hidden>
        <label>Title<input name="title" required></label>
        <label>Description <span class="optional-label">optional</span><textarea name="description" rows="2"></textarea></label>
        <div class="photo-preview-form-actions"><button type="submit" class="inline-form-submit">Save details</button><button type="button" class="photo-preview-cancel">Cancel</button><button type="button" class="photo-delete-button photo-preview-delete"><i class="fa-solid fa-trash-can"></i><span>Delete photo</span></button></div>
      </form>`;
    document.body.append(this.preview);
    this.previewImage = this.preview.querySelector('.photo-preview-image');
    this.previewStage = this.preview.querySelector('.photo-preview-stage');
    this.zoomLevel = 1;
    this.previewTitle = this.preview.querySelector('.photo-preview-caption h2');
    this.previewForm = this.preview.querySelector('.photo-preview-form');
    this.preview.querySelector('.photo-preview-close').addEventListener('click', () => this.preview.close());
    this.preview.addEventListener('click', event => { if (event.target === this.preview) this.preview.close(); });
    this.preview.querySelector('.photo-preview-cancel').addEventListener('click', () => this.setPreviewEditing(false));
    this.preview.querySelector('.photo-preview-edit').addEventListener('click', () => this.setPreviewEditing(true));
    this.preview.querySelector('.photo-preview-delete').addEventListener('click', () => this.deletePhoto(this.previewPhoto));
    this.preview.querySelectorAll('.photo-zoom-step').forEach(button => button.addEventListener('click', () => {
      this.setZoom(this.zoomLevel + (button.dataset.zoom === 'in' ? .25 : -.25));
    }));
    this.preview.querySelector('.photo-zoom-reset').addEventListener('click', () => this.setZoom(1));
    let pan = null;
    this.previewStage.addEventListener('pointerdown', event => {
      if (this.zoomLevel <= 1 || event.target !== this.previewImage || event.pointerType === 'touch') return;
      pan = { x: event.clientX, y: event.clientY, left: this.previewStage.scrollLeft, top: this.previewStage.scrollTop };
      this.previewStage.classList.add('is-panning');
      this.previewStage.setPointerCapture(event.pointerId);
    });
    this.previewStage.addEventListener('pointermove', event => {
      if (!pan) return;
      this.previewStage.scrollLeft = pan.left - (event.clientX - pan.x);
      this.previewStage.scrollTop = pan.top - (event.clientY - pan.y);
    });
    const stopPan = () => { pan = null; this.previewStage.classList.remove('is-panning'); };
    this.previewStage.addEventListener('pointerup', stopPan);
    this.previewStage.addEventListener('pointercancel', stopPan);
    this.previewStage.addEventListener('wheel', event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      this.setZoom(this.zoomLevel + (event.deltaY < 0 ? .25 : -.25));
    }, { passive: false });
    this.preview.addEventListener('keydown', event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key === '+' || event.key === '=') { event.preventDefault(); this.setZoom(this.zoomLevel + .25); }
      if (event.key === '-') { event.preventDefault(); this.setZoom(this.zoomLevel - .25); }
      if (event.key === '0') { event.preventDefault(); this.setZoom(1); }
    });
    this.previewForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!this.previewPhoto) return;
      const data = new FormData(this.previewForm);
      this.previewPhoto.title = String(data.get('title') || '').trim();
      this.previewPhoto.description = String(data.get('description') || '').trim();
      this.save();
      this.preview.close();
      this.render();
      window.showToast?.('Photo details saved.');
    });
  }

  setPreviewEditing(editing) {
    this.previewForm.hidden = !editing;
    this.preview.querySelector('.photo-preview-caption').hidden = editing;
    if (editing) this.previewForm.elements.title.focus();
  }

  setZoom(level) {
    this.zoomLevel = Math.max(.5, Math.min(3, Math.round(level * 100) / 100));
    this.previewImage.style.transform = `scale(${this.zoomLevel})`;
    const reset = this.preview.querySelector('.photo-zoom-reset');
    reset.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    reset.setAttribute('aria-label', `Reset zoom, currently ${Math.round(this.zoomLevel * 100)} percent`);
    this.preview.querySelector('[data-zoom="out"]').disabled = this.zoomLevel <= .5;
    this.preview.querySelector('[data-zoom="in"]').disabled = this.zoomLevel >= 3;
    this.previewStage.classList.toggle('is-zoomed', this.zoomLevel > 1);
  }

  openPreview(photo, editing = false) {
    this.previewPhoto = photo;
    this.setZoom(1);
    this.previewImage.src = photo.path;
    this.previewImage.alt = photo.title || 'Priya’s photo';
    this.previewTitle.textContent = photo.title;
    this.previewForm.elements.title.value = photo.title || '';
    this.previewForm.elements.description.value = photo.description || '';
    this.setPreviewEditing(editing);
    this.preview.showModal();
  }

  deletePhoto(photo) {
    if (!photo) return;
    const confirmed = window.confirm(`Remove “${photo.title}” from Priya’s album? The image file will stay in the project.`);
    if (!confirmed) return;
    this.photos = this.photos.filter(item => item.id !== photo.id);
    this.save();
    this.preview.close();
    this.render();
    window.showToast?.('Photo removed from the album.');
  }

  render() {
    if (!this.grid) return;
    this.grid.replaceChildren();
    this.empty.hidden = this.photos.length > 0;
    const count = document.getElementById('photo-count-label');
    if (count) count.textContent = this.photos.length ? `${this.photos.length} ${this.photos.length === 1 ? 'photo' : 'photos'}` : 'Your collection';

    this.photos.forEach(photo => {
      const card = document.createElement('article');
      card.className = 'photo-card';
      const image = document.createElement('img');
      image.src = photo.path;
      image.alt = photo.title || 'Priya’s photo';
      image.loading = 'lazy';
      image.addEventListener('error', () => card.classList.add('photo-missing'), { once: true });
      const imageButton = document.createElement('button');
      imageButton.type = 'button';
      imageButton.className = 'photo-card-preview';
      imageButton.setAttribute('aria-label', `Preview ${photo.title}`);
      imageButton.addEventListener('click', () => this.openPreview(photo));
      imageButton.append(image);
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'photo-edit-button photo-card-edit';
      edit.innerHTML = '<i class="fa-solid fa-pen"></i>';
      edit.setAttribute('aria-label', `Edit ${photo.title}`);
      edit.title = `Edit ${photo.title}`;
      edit.addEventListener('click', () => this.openPreview(photo, true));
      const media = document.createElement('div');
      media.className = 'photo-card-media';
      media.append(imageButton, edit);
      const info = document.createElement('div');
      info.className = 'photo-card-info';
      const title = document.createElement('h3');
      title.textContent = photo.title;
      const actions = document.createElement('div');
      actions.className = 'photo-card-actions';
      info.append(title);
      card.append(media, info);
      this.grid.append(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => { window.priyaPhotoGallery = new PriyaPhotoGallery(); });
