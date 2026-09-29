/* ==========================================================================
   AI VOICE AGENT: "HAPPY"
   Companion Mascot with Google Gemini API & Web Speech Synthesis
   ========================================================================== */

class HappyVoiceAgent {
  constructor() {
    this.widget = document.getElementById('happy-voice-widget');
    this.mascotBtn = document.getElementById('happy-mascot-trigger');
    this.greetingBubble = document.getElementById('happy-greeting-bubble');
    this.panel = document.getElementById('happy-dialogue-panel');
    this.closeBtn = document.getElementById('happy-panel-close-btn');
    this.messagesArea = document.getElementById('happy-messages-area');
    this.inputField = document.getElementById('happy-input-field');
    this.sendBtn = document.getElementById('happy-send-btn');
    this.micBtn = document.getElementById('happy-mic-btn');
    this.visualizer = document.getElementById('happy-audio-visualizer');

    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.chatHistory = [];

    this.init();
  }

  init() {
    // Mascot click: toggle panel
    if (this.mascotBtn) {
      this.mascotBtn.addEventListener('click', () => {
        this.togglePanel();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closePanel();
      });
    }

    // Send on button or enter
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (this.inputField) {
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Quick prompt chips
    const chips = document.querySelectorAll('.quick-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt') || chip.textContent;
        this.sendMessage(text);
      });
    });

    // Mic button: Speech-to-Text
    if (this.micBtn) {
      this.setupSpeechRecognition();
      this.micBtn.addEventListener('click', () => this.toggleListening());
    }

    // Pre-warm SpeechSynthesis voices for low-latency playback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Initial greeting in history
    this.addMessage("agent", "Hi Priya! 👋 I'm Happy AI Assistant, your smart companion created by Harish S. Whenever you need a joke, a quick laugh, or want me to open your story, just tap me!");
  }

  togglePanel() {
    if (!this.panel) return;
    const isOpen = this.panel.classList.contains('open');
    if (isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    if (this.panel) {
      this.panel.classList.add('open');
      if (this.greetingBubble) this.greetingBubble.style.display = 'none';
      if (window.soundEngine) window.soundEngine.playHappyChirp();

      // Trigger cute robo vector wave animation
      const wave = document.getElementById('robo-wave-indicator');
      if (wave) {
        wave.classList.remove('waving');
        void wave.offsetWidth;
        wave.classList.add('waving');
        setTimeout(() => wave.classList.remove('waving'), 2000);
      }

      if (this.inputField) this.inputField.focus();
    }
  }

  closePanel() {
    if (this.panel) {
      this.panel.classList.remove('open');
      this.stopSpeaking();
      this.stopListening();
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.micBtn) this.micBtn.classList.add('listening');
        if (window.showToast) window.showToast('Happy is listening... 🎙️');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (this.inputField) this.inputField.value = transcript;
          this.handleSendMessage();
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.stopListening();
      };
    } else {
      if (this.micBtn) {
        this.micBtn.title = 'Speech recognition not supported in this browser';
      }
    }
  }

  toggleListening() {
    if (!this.recognition) {
      if (window.showToast) window.showToast('Voice input requires Chrome/Edge speech support.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      try {
        this.stopSpeaking();
        this.recognition.start();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.micBtn) this.micBtn.classList.remove('listening');
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e){}
    }
  }

  handleSendMessage() {
    if (!this.inputField) return;
    const text = this.inputField.value.trim();
    if (!text) return;
    this.inputField.value = '';
    this.sendMessage(text);
  }

  addMessage(sender, text) {
    if (!this.messagesArea) return;

    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${sender}`;

    if (sender === 'agent') {
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      bubble.appendChild(textSpan);

      const speakBtn = document.createElement('button');
      speakBtn.className = 'bubble-speak-btn';
      speakBtn.title = 'Listen to Happy speak';
      speakBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      speakBtn.onclick = (e) => {
        e.stopPropagation();
        this.speakText(text);
      };
      bubble.appendChild(speakBtn);
    } else {
      bubble.textContent = text;
    }

    this.messagesArea.appendChild(bubble);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;

    this.chatHistory.push({ role: sender === 'user' ? 'user' : 'model', parts: [{ text }] });
  }

  async resolveWorkingModel(apiKey) {
    const cached = localStorage.getItem('pv_verified_model');
    if (cached) return cached;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await res.json();
      if (res.ok && data.models && data.models.length > 0) {
        const supported = data.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));

        console.log('[Happy AI] Available Gemini models:', supported);

        const currentSelected = window.settingsManager ? window.settingsManager.getModel() : 'gemini-3.1-live';

        let preferred = [];
        if (currentSelected.includes('3.8')) {
          preferred = ['gemini-3.8-flash', 'gemini-3.8-live', 'gemini-3.8-pro', 'gemini-3.1-pro', 'gemini-3.0-flash'];
        } else {
          preferred = ['gemini-3.1-pro', 'gemini-3.1-flash', 'gemini-3.1-live', 'gemini-3.8-flash', 'gemini-3.0-flash'];
        }
        preferred.push('gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro');

        let target = preferred.find(p => supported.includes(p)) || supported[0];
        if (target) {
          localStorage.setItem('pv_verified_model', target);
          return target;
        }
      }
    } catch (e) {
      console.warn('[Happy AI] Model resolution note:', e);
    }

    return 'gemini-3.0-flash';
  }

  async sendMessage(userText) {
    this.addMessage("user", userText);

    // Show thinking bubble
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'msg-bubble agent';
    thinkingBubble.innerHTML = '<i class="fa-solid fa-sparkles fa-spin"></i> Happy is thinking...';
    this.messagesArea.appendChild(thinkingBubble);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;

    // Check if the user is asking to open the story
    if (userText.toLowerCase().includes('read') || userText.toLowerCase().includes('story') || userText.toLowerCase().includes('book')) {
      thinkingBubble.remove();
      const reply = "Opening your story book 'Still Rooted' right now, Priya! Let me take you to Chapter 1! 📖✨";
      this.addMessage("agent", reply);
      this.speakText(reply);
      if (window.bookReader) {
        setTimeout(() => window.bookReader.openBook('main', 0), 1000);
      }
      return;
    }

    const apiKey = window.settingsManager ? window.settingsManager.getApiKey() : '';
    const systemPrompt = window.settingsManager ? window.settingsManager.getSystemPrompt() : '';
    const voiceName = window.settingsManager ? window.settingsManager.getVoiceName() : 'Aoede';

    if (!apiKey || apiKey.length < 8) {
      thinkingBubble.remove();
      const fallbackReply = this.getSmartFallbackResponse(userText);
      this.addMessage("agent", fallbackReply);
      this.speakText(fallbackReply);
      return;
    }

    try {
      // 1. Resolve exact working model
      let activeModel = await this.resolveWorkingModel(apiKey);

      // 2. Build multi-turn context payload with low token overhead for minimal latency
      const promptInstruction = `SYSTEM INSTRUCTION: You are Happy, a cheerful, witty, supportive AI companion mascot created by Harish S. for Priyavarshini (Priya). Speak with warm ${voiceName} voice tone. Keep responses conversational, concise, and helpful (1 to 3 short sentences max). Never be overly dramatic or romantic; be a great, funny, loyal friend.\n\nUSER MESSAGE: ${userText}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: promptInstruction }]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 250
        }
      };

      // 3. Low-latency fetch directly to active model
      let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = await res.json();

      // If model not found (404), invalidate and re-discover immediately
      if (!res.ok && data.error && (data.error.code === 404 || data.error.message.includes('not found') || data.error.message.includes('not supported'))) {
        localStorage.removeItem('pv_verified_model');
        activeModel = await this.resolveWorkingModel(apiKey);
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        data = await res.json();
      }

      thinkingBubble.remove();

      if (res.ok && data.candidates && data.candidates[0] && data.candidates[0].content) {
        const replyText = data.candidates[0].content.parts[0].text.trim();
        this.addMessage("agent", replyText);
        this.speakText(replyText);
      } else {
        const errorMsg = (data.error && data.error.message) ? data.error.message : 'No response from model';
        console.error('[Happy AI] Gemini API returned error:', data.error);
        if (window.showToast) window.showToast(`Gemini API: ${errorMsg}`, 5000);
        
        const fallback = this.getSmartFallbackResponse(userText);
        this.addMessage("agent", fallback);
        this.speakText(fallback);
      }

    } catch (err) {
      console.error('[Happy AI] Request exception:', err);
      thinkingBubble.remove();
      if (window.showToast) window.showToast(`Gemini check: ${err.message}`, 5000);
      const fallbackReply = this.getSmartFallbackResponse(userText);
      this.addMessage("agent", fallbackReply);
      this.speakText(fallbackReply);
    }
  }

  getSmartFallbackResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes('hard day') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('sad') || lower.includes('stressed')) {
      return "Take a breather, Priya! You've got this, and you don't have to carry the whole world on your shoulders today. Just like that resilient tree in 'Still Rooted', shake off the stress and remember your roots run deep! 🌿";
    }

    if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')) {
      const jokes = [
        "Why did the tree go to college? Because it wanted to branch out into greater things, just like you, Priya! 🌿😄",
        "What did one storm cloud say to the lightning? 'You're looking shockingly radiant today!' ⚡✨",
        "Why do programmers prefer dark mode? Because light attracts bugs! (Harish probably knows all about that one!) 😂💻",
        "Why was the book always calm? Because it knew how to keep things well-grounded! 📖😊"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (lower.includes('pep-talk') || lower.includes('inspire') || lower.includes('strength') || lower.includes('motivat')) {
      return "Listen to me, Priyavarshini! You have survived 100% of your hardest days so far. You are brilliant, unstoppable, and your roots run deep. Keep moving forward one step at a time! 🦸🏻‍♀️🔥";
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening')) {
      return "Hey Priya! ✨ Hope your day is treating you wonderfully! What's on your mind today? Ask me anything!";
    }

    if (lower.includes('harish') || lower.includes('author') || lower.includes('who made') || lower.includes('who wrote')) {
      return "Harish S. built this entire sanctuary and wrote 'Still Rooted' just for you! He wanted to give you a dedicated space to relax and smile whenever things get stressful. He also told me to ensure nobody messes with his code! 😄";
    }

    if (lower.includes('how are you') || lower.includes('how r u') || lower.includes('how you doing')) {
      return "I'm feeling super cheerful and ready to assist you, Priya! How are you doing today? 😊";
    }

    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('your name')) {
      return "I am Happy, your smart AI companion and assistant! I'm here to chat, read your story with you, cheer you up, tell jokes, and keep you company whenever you visit! 🤖✨";
    }

    if (lower.includes('what can you do') || lower.includes('help')) {
      return "I can read your story 'Still Rooted' to you, tell you jokes, give you a pep-talk when things get heavy, discuss your thoughts, or just chat with you in real-time! 📖🎤";
    }

    if (lower.includes('advice') || lower.includes('what should i do') || lower.includes('suggest')) {
      return "Whenever in doubt, take one slow breath. Focus only on the very next right step in front of you. You don't have to figure out the whole future at once! 🌿✨";
    }

    if (lower.includes('thank')) {
      return "You're most welcome, Priya! Always here for you whenever you need a smile or a chat! 🌸";
    }

    // Default intelligent conversational response
    return `That's a thoughtful question, Priya! Stay true to your pace, trust your instincts, and remember to take a break when things get busy. Ask Harish to save a Gemini key in Settings for infinite live answers! 🌟`;
  }

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      console.warn('[Happy AI] Speech synthesis not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      this.stopSpeaking();

      // Clean emojis and symbols that crash Windows Chrome TTS
      const cleanText = text
        .replace(/[*#_~`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[^\x00-\x7F]/g, ' ') // Strip non-ASCII/emojis for rock-solid Chrome speech
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance; // Prevent garbage collection in Chrome!

      const params = window.settingsManager ? window.settingsManager.getVoiceParams() : { rate: 1.0, pitch: 1.1 };
      const voiceName = window.settingsManager ? window.settingsManager.getVoiceName() : 'Aoede';

      utterance.rate = Math.max(0.8, Math.min(1.4, params.rate || 1.0));
      utterance.pitch = Math.max(0.8, Math.min(1.4, params.pitch || 1.1));

      // Voice selection
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let preferredVoice = null;
        if (voiceName === 'Aoede' || voiceName === 'Kore') {
          preferredVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria')) && v.lang.startsWith('en'))
            || voices.find(v => v.lang.startsWith('en'));
        } else if (voiceName === 'Charon') {
          preferredVoice = voices.find(v => (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Guy')) && v.lang.startsWith('en'))
            || voices.find(v => v.lang.startsWith('en'));
        } else {
          preferredVoice = voices.find(v => v.lang.startsWith('en'));
        }
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.visualizer) this.visualizer.classList.add('active');
      };

      utterance.onend = () => {
        this.stopSpeaking();
      };

      utterance.onerror = (e) => {
        console.warn('[Happy AI] SpeechSynthesis utterance error:', e);
        this.stopSpeaking();
      };

      // Workaround for Chrome paused speech state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Happy AI] speakText error:', err);
    }
  }

  stopSpeaking() {
    this.isSpeaking = false;
    if (this.visualizer) this.visualizer.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.happyAgent = new HappyVoiceAgent();
});
