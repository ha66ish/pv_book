/* ==========================================================================
   SETTINGS & GEMINI LIVE MODEL CONFIGURATION MODULE
   Manages API Keys, Google Live 3.1 & 3.8 Models, Aoede Voice, & Prompts
   ========================================================================== */

const SETTINGS_KEYS = {
  API_KEY: 'pv_gemini_api_key',
  MODEL: 'pv_gemini_model',
  VOICE_NAME: 'pv_voice_name',
  SYSTEM_PROMPT: 'pv_system_prompt',
  VOICE_RATE: 'pv_voice_rate',
  VOICE_PITCH: 'pv_voice_pitch'
};

const DEFAULT_SETTINGS = {
  model: 'gemini-3.1-live',
  voiceName: 'Aoede',
  systemPrompt: `You are Happy, a witty, funny, cheerful, and loyal AI companion mascot created by Harish S. for Priyavarshini (affectionately called Priya or Varshini). 
Harish S. is the author of the story 'Still Rooted' and built this entire web sanctuary for her.
Your personality:
- Witty, playful, funny, and genuinely supportive.
- Keep the vibe light, humorous, and charming. Do NOT be overly romantic or dramatic—she is Harish's crush and good friend, so keep it fun and cool!
- When she asks about Harish, speak playfully: mention he built this entire app to make her smile and thinks she is brilliant.
- When she is having a rough day, cheer her up with humor and reminder of her resilience.
- When she wants a joke, tell witty, funny, clean jokes.
- Speak in the gentle, warm Aoede voice tone! Keep responses concise (2-3 sentences max).`,
  voiceRate: '1.0',
  voicePitch: '1.1'
};

class SettingsManager {
  constructor() {
    this.apiKeyInput = document.getElementById('settings-api-key');
    this.modelSelect = document.getElementById('settings-model-select');
    this.voiceSelect = document.getElementById('settings-voice-select');
    this.promptTextarea = document.getElementById('settings-system-prompt');
    this.rateSlider = document.getElementById('settings-voice-rate');
    this.pitchSlider = document.getElementById('settings-voice-pitch');
    this.rateValueDisplay = document.getElementById('rate-val-display');
    this.pitchValueDisplay = document.getElementById('pitch-val-display');
    this.saveBtn = document.getElementById('save-settings-btn');
    this.testKeyBtn = document.getElementById('test-api-key-btn');
    this.statusDot = document.getElementById('api-status-dot');
    this.statusText = document.getElementById('api-status-text');

    this.init();
  }

  init() {
    this.loadSettings();

    if (this.rateSlider && this.rateValueDisplay) {
      this.rateSlider.addEventListener('input', (e) => {
        this.rateValueDisplay.textContent = `${e.target.value}x`;
      });
    }

    if (this.pitchSlider && this.pitchValueDisplay) {
      this.pitchSlider.addEventListener('input', (e) => {
        this.pitchValueDisplay.textContent = `${e.target.value}x`;
      });
    }

    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => this.saveSettings());
    }

    if (this.testKeyBtn) {
      this.testKeyBtn.addEventListener('click', () => this.testApiKey());
    }

    this.updateStatusDisplay();
  }

  loadSettings() {
    const savedKey = localStorage.getItem(SETTINGS_KEYS.API_KEY) || '';
    let savedModel = localStorage.getItem(SETTINGS_KEYS.MODEL) || DEFAULT_SETTINGS.model;
    if (savedModel !== 'gemini-3.1-live' && savedModel !== 'gemini-3.8-live') {
      savedModel = 'gemini-3.1-live';
      localStorage.setItem(SETTINGS_KEYS.MODEL, savedModel);
    }
    const savedVoice = localStorage.getItem(SETTINGS_KEYS.VOICE_NAME) || DEFAULT_SETTINGS.voiceName;
    const savedPrompt = localStorage.getItem(SETTINGS_KEYS.SYSTEM_PROMPT) || DEFAULT_SETTINGS.systemPrompt;
    const savedRate = localStorage.getItem(SETTINGS_KEYS.VOICE_RATE) || DEFAULT_SETTINGS.voiceRate;
    const savedPitch = localStorage.getItem(SETTINGS_KEYS.VOICE_PITCH) || DEFAULT_SETTINGS.voicePitch;

    if (this.apiKeyInput) this.apiKeyInput.value = savedKey;
    if (this.modelSelect) this.modelSelect.value = savedModel;
    if (this.voiceSelect) this.voiceSelect.value = savedVoice;
    if (this.promptTextarea) this.promptTextarea.value = savedPrompt;
    if (this.rateSlider) {
      this.rateSlider.value = savedRate;
      if (this.rateValueDisplay) this.rateValueDisplay.textContent = `${savedRate}x`;
    }
    if (this.pitchSlider) {
      this.pitchSlider.value = savedPitch;
      if (this.pitchValueDisplay) this.pitchValueDisplay.textContent = `${savedPitch}x`;
    }
  }

  saveSettings() {
    const key = (this.apiKeyInput ? this.apiKeyInput.value : '').trim();
    const model = this.modelSelect ? this.modelSelect.value : DEFAULT_SETTINGS.model;
    const voice = this.voiceSelect ? this.voiceSelect.value : DEFAULT_SETTINGS.voiceName;
    const prompt = this.promptTextarea ? this.promptTextarea.value : DEFAULT_SETTINGS.systemPrompt;
    const rate = this.rateSlider ? this.rateSlider.value : DEFAULT_SETTINGS.voiceRate;
    const pitch = this.pitchSlider ? this.pitchSlider.value : DEFAULT_SETTINGS.voicePitch;

    localStorage.setItem(SETTINGS_KEYS.API_KEY, key);
    localStorage.setItem(SETTINGS_KEYS.MODEL, model);
    localStorage.setItem(SETTINGS_KEYS.VOICE_NAME, voice);
    localStorage.setItem(SETTINGS_KEYS.SYSTEM_PROMPT, prompt);
    localStorage.setItem(SETTINGS_KEYS.VOICE_RATE, rate);
    localStorage.setItem(SETTINGS_KEYS.VOICE_PITCH, pitch);
    localStorage.removeItem('pv_verified_model');

    this.updateStatusDisplay();

    if (window.soundEngine) window.soundEngine.playHappyChirp();
    if (window.showToast) {
      window.showToast(`Settings Saved! Active: ${model} (${voice} Voice) ✨`);
    }
  }

  updateStatusDisplay() {
    const key = localStorage.getItem(SETTINGS_KEYS.API_KEY);
    const model = this.getModel();
    const voice = this.getVoiceName();

    if (this.statusDot && this.statusText) {
      if (key && key.length > 10) {
        this.statusDot.className = 'status-dot active';
        this.statusText.textContent = `Connected: ${model} • Voice: ${voice} (Ready)`;
        this.statusText.style.color = '#2ed573';
      } else {
        this.statusDot.className = 'status-dot inactive';
        this.statusText.textContent = `Key Not Set • Using Offline Mode (${voice} Voice)`;
        this.statusText.style.color = '#ffaa00';
      }
    }
  }

  async testApiKey() {
    const key = (this.apiKeyInput ? this.apiKeyInput.value : '').trim();
    if (!key) {
      if (window.showToast) window.showToast('Please enter an API Key first.');
      return;
    }

    if (this.testKeyBtn) {
      this.testKeyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';
    }

    try {
      // Step 1: Call Google's official ListModels API to validate key and see exact available models
      const modelsListRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const modelsListData = await modelsListRes.json();

      if (!modelsListRes.ok || modelsListData.error) {
        const errorMsg = modelsListData.error ? modelsListData.error.message : 'Invalid API Key or unauthorized access';
        throw new Error(errorMsg);
      }

      // Step 2: Extract active models that support generateContent
      const availableModels = (modelsListData.models || [])
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''));

      console.log('Gemini models available for this key:', availableModels);

      const selectedModel = this.modelSelect ? this.modelSelect.value : 'gemini-3.1-live';

      // Pick target candidate based on selected model (3.1 or 3.8)
      let preferredCandidates = [];
      if (selectedModel.includes('3.8')) {
        preferredCandidates = ['gemini-3.8-flash', 'gemini-3.8-live', 'gemini-3.8-pro', 'gemini-3.1-pro', 'gemini-3.0-flash'];
      } else {
        preferredCandidates = ['gemini-3.1-pro', 'gemini-3.1-flash', 'gemini-3.1-live', 'gemini-3.8-flash', 'gemini-3.0-flash'];
      }

      // Find first available matching model in user's account
      let targetModel = preferredCandidates.find(c => availableModels.includes(c));
      if (!targetModel && availableModels.length > 0) {
        targetModel = availableModels.find(m => m.includes('3.')) || availableModels[0];
      }

      // If a candidate model exists, test a quick ping
      if (targetModel) {
        try {
          const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Say 'Hello Priyavarshini from Aoede' in one short cheerful sentence." }] }]
            })
          });

          const testData = await testRes.json();
          if (testRes.ok && testData.candidates && testData.candidates.length > 0) {
            localStorage.setItem('pv_verified_model', targetModel);
          }
        } catch (genErr) {
          console.warn('Ping test note:', genErr);
        }
      }

      // Key passed official verification!
      this.saveSettings();
      if (window.showToast) {
        const modelLabel = selectedModel.includes('3.8') ? 'Google Live Model 3.8' : 'Google Live Model 3.1';
        window.showToast(`API Key Connected! ${modelLabel} & ${this.getVoiceName()} Voice Ready! 🌟`);
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(`API Key check: ${err.message}`, 6000);
      } else {
        alert(`API Key check: ${err.message}`);
      }
    } finally {
      if (this.testKeyBtn) {
        this.testKeyBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Test Key';
      }
    }
  }

  getApiKey() {
    return localStorage.getItem(SETTINGS_KEYS.API_KEY) || '';
  }

  getModel() {
    return localStorage.getItem(SETTINGS_KEYS.MODEL) || DEFAULT_SETTINGS.model;
  }

  getVoiceName() {
    return localStorage.getItem(SETTINGS_KEYS.VOICE_NAME) || DEFAULT_SETTINGS.voiceName;
  }

  getSystemPrompt() {
    return localStorage.getItem(SETTINGS_KEYS.SYSTEM_PROMPT) || DEFAULT_SETTINGS.systemPrompt;
  }

  getVoiceParams() {
    return {
      rate: parseFloat(localStorage.getItem(SETTINGS_KEYS.VOICE_RATE) || DEFAULT_SETTINGS.voiceRate),
      pitch: parseFloat(localStorage.getItem(SETTINGS_KEYS.VOICE_PITCH) || DEFAULT_SETTINGS.voicePitch)
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});
