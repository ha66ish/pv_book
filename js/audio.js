/* ==========================================================================
   AUDIO SYNTHESIZER & AMBIENT ENGINE (Web Audio API)
   Generates authentic paper flips, gentle ambient soundscapes, & mascot tones
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.ambientSource = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic paper page flip sound
  playPageTurn() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.18; // ~180ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft friction noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter to simulate warm crisp paper
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.18);
    } catch (e) {
      console.warn('Page sound error:', e);
    }
  }

  // Cute mascot chime tone for Happy
  playHappyChirp() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Chirp sound error:', e);
    }
  }

  // Toggle relaxing ambient rain / gentle sound
  toggleAmbient(forceState) {
    this.init();
    if (!this.ctx) return false;

    if (this.isAmbientPlaying || forceState === false) {
      if (this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.ambientSource) {
            try { this.ambientSource.stop(); } catch(e){}
            this.ambientSource.disconnect();
          }
          this.isAmbientPlaying = false;
        }, 800);
      }
      return false;
    } else {
      // Create soothing gentle rain/whisper sound
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.ambientSource = whiteNoise;
      this.isAmbientPlaying = true;
      return true;
    }
  }

  // Scene-specific Soundscape Engine for Story Book
  setSceneMood(mood) {
    this.init();
    if (!this.ctx || !this.readerAmbientEnabled) return;

    if (mood === 'storm') {
      this.playStormAmbience();
    } else if (mood === 'dawn') {
      this.playDawnAmbience();
    }
  }

  toggleReaderAmbient() {
    this.readerAmbientEnabled = !this.readerAmbientEnabled;
    if (!this.readerAmbientEnabled) {
      this.stopReaderAmbience();
      return false;
    } else {
      return true;
    }
  }

  playStormAmbience() {
    this.stopReaderAmbience();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.sceneGain = this.ctx.createGain();
      this.sceneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.sceneGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(this.sceneGain);
      this.sceneGain.connect(this.ctx.destination);

      noise.start(0);
      this.currentSceneSource = noise;
      this.currentSceneMood = 'storm';
    } catch(e) {
      console.warn('Storm audio error:', e);
    }
  }

  playDawnAmbience() {
    this.stopReaderAmbience();
    if (!this.ctx) return;

    try {
      // Soft morning breeze + periodic gentle chimes
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.03;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.sceneGain = this.ctx.createGain();
      this.sceneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.sceneGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(this.sceneGain);
      this.sceneGain.connect(this.ctx.destination);

      noise.start(0);
      this.currentSceneSource = noise;
      this.currentSceneMood = 'dawn';

      // Play soft dawn chime
      this.playGentleChime(523.25); // C5
      setTimeout(() => this.playGentleChime(659.25), 600); // E5
      setTimeout(() => this.playGentleChime(783.99), 1200); // G5
    } catch(e) {
      console.warn('Dawn audio error:', e);
    }
  }

  playGentleChime(freq) {
    if (!this.ctx || !this.readerAmbientEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.0);
    } catch(e) {}
  }

  stopReaderAmbience() {
    if (this.sceneGain && this.ctx) {
      try {
        this.sceneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      } catch(e){}
    }
    setTimeout(() => {
      if (this.currentSceneSource) {
        try { this.currentSceneSource.stop(); } catch(e){}
        try { this.currentSceneSource.disconnect(); } catch(e){}
        this.currentSceneSource = null;
      }
    }, 500);
  }
}

window.soundEngine = new SoundEngine();
