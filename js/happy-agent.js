/* ==========================================================================
   AI VOICE AGENT: "HAPPY"
   Gemini Neural Model Voice Engine (Zephyr / Aoede / Puck / Charon)
   Studio-Grade HTML5 Audio Engine + Mozhi-Inspired Natural Tamil & English Cadence
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
    this.statusLine = document.querySelector('.happy-status-line');
    this.langToggleBtn = document.getElementById('happy-lang-toggle-btn');
    this.langBadge = document.getElementById('happy-lang-badge');

    // Live Interaction & State
    this.liveVoiceMode = false;         // Hands-free continuous speak-to-speech loop
    this.isListening = false;           // Mic active
    this.isSpeaking = false;            // Gemini model audio active
    this.isOpen = false;                // Panel open
    this.recognition = null;            // SpeechRecognition
    this.chatHistory = [];              // Conversation history
    this.activeAbortController = null;  // In-flight network cancel
    this.currentThinkingBubble = null;  // Thinking DOM element
    this.autoRestartTimer = null;       // Restart listening timer
    
    // Studio Audio Player (Clean Native HTML5 Audio with Pitch Preservation)
    this.currentAudioElement = null;
    this.currentBlobUrl = null;

    this.init();
  }

  init() {
    // Mascot click: toggle panel
    if (this.mascotBtn) {
      this.mascotBtn.addEventListener('click', () => {
        this.togglePanel();
      });
    }

    // Close button: instant cut-off
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePanel();
      });
    }

    // Quick Language Toggle Button in panel header
    if (this.langToggleBtn) {
      this.langToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLanguage();
      });
    }

    // Send button or Enter key in text box
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

    // Mic button: Live Speak-to-Speech Toggle
    if (this.micBtn) {
      this.setupSpeechRecognition();
      this.micBtn.addEventListener('click', () => this.toggleLiveVoice());
    }

    // Sync initial language & voice settings
    this.syncSettings();

    // Initial greeting message
    const isTamil = (window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN') === 'ta-IN';
    const initialGreeting = isTamil 
      ? "வணக்கம் பிரியா! 👋 நான் தான் ஹேப்பி, Harish S. உருவாக்கிய உங்கள் AI நண்பன்! என்னோடு பேச மைக் பட்டனைத் தட்டுங்கள்!"
      : "Hi Priya! 👋 I'm Happy, your smart companion with Gemini model voice created by Harish S. Tap the mic to speak live or type below!";

    this.addMessage("agent", initialGreeting);
  }

  /* --------------------------------------------------------------------------
     SYNC SETTINGS & LANGUAGE MAPPING
     -------------------------------------------------------------------------- */
  syncSettings() {
    const lang = window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN';
    const voice = window.settingsManager ? window.settingsManager.getVoiceName() : 'Zephyr';

    if (this.langBadge) {
      this.langBadge.textContent = lang === 'ta-IN' ? '🇮🇳 தமிழ்' : '🇮🇳 EN';
    }

    if (this.recognition) {
      this.recognition.lang = lang; // 'ta-IN' or 'en-IN'
    }

    if (this.statusLine && !this.isListening && !this.isSpeaking) {
      this.statusLine.innerHTML = `● Smart Companion • ${voice} Voice`;
    }
  }

  toggleLanguage() {
    const current = window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN';
    const next = current === 'ta-IN' ? 'en-IN' : 'ta-IN';
    if (window.settingsManager) {
      window.settingsManager.setLanguage(next);
    }
    this.syncSettings();
    if (window.showToast) {
      const label = next === 'ta-IN' ? 'Tamil (தமிழ்)' : 'Indian English';
      window.showToast(`Switched language to ${label}! 🗣️`);
    }
  }

  /* --------------------------------------------------------------------------
     PANEL LIFECYCLE
     -------------------------------------------------------------------------- */
  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    if (!this.panel) return;
    this.isOpen = true;
    this.panel.classList.add('open');
    if (this.greetingBubble) this.greetingBubble.style.display = 'none';
    if (window.soundEngine) window.soundEngine.playHappyChirp();

    // Trigger robo wave animation
    const wave = document.getElementById('robo-wave-indicator');
    if (wave) {
      wave.classList.remove('waving');
      void wave.offsetWidth;
      wave.classList.add('waving');
      setTimeout(() => wave.classList.remove('waving'), 2000);
    }

    if (this.inputField) this.inputField.focus();
  }

  closePanel() {
    this.isOpen = false;
    if (this.panel) {
      this.panel.classList.remove('open');
    }
    // Hard cut-off on close
    this.cutOffAllInteraction('panel_closed');
  }

  /* --------------------------------------------------------------------------
     IMMEDIATE CUT-OFF / CANCELLATION
     Silences model audio instantly, aborts mic stream and network requests
     -------------------------------------------------------------------------- */
  cutOffAllInteraction(reason = 'user') {
    console.log(`[Happy AI] ⏹️ Immediate cut-off (${reason})`);

    // 1. Instantly silence and terminate HTML5 Audio
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if (this.currentBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch (e) {}
      this.currentBlobUrl = null;
    }
    this.isSpeaking = false;

    // 2. Clear any pending auto-restart timers
    if (this.autoRestartTimer) {
      clearTimeout(this.autoRestartTimer);
      this.autoRestartTimer = null;
    }

    // 3. Instantly abort microphone speech recognition
    if (this.recognition) {
      try {
        this.recognition.abort(); // abort() terminates mic stream instantly
      } catch (e) {}
    }
    this.isListening = false;

    // 4. Instantly abort in-flight Gemini API fetch
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch (e) {}
      this.activeAbortController = null;
    }

    // 5. Remove thinking bubble immediately
    if (this.currentThinkingBubble) {
      try {
        this.currentThinkingBubble.remove();
      } catch (e) {}
      this.currentThinkingBubble = null;
    }

    // 6. Stop visualizer animation
    if (this.visualizer) {
      this.visualizer.classList.remove('active');
    }

    // 7. Reset mic button styling
    if (this.micBtn) {
      this.micBtn.classList.remove('listening');
      this.micBtn.classList.remove('live-active');
      this.micBtn.title = "Speak to Happy (Live Speak-to-Speech)";
    }

    // 8. Reset header status line
    this.updateStatusDisplay('idle');
  }

  /* --------------------------------------------------------------------------
     SPEECH RECOGNITION (SPEECH-TO-TEXT) SETUP
     -------------------------------------------------------------------------- */
  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.micBtn) {
        this.micBtn.title = 'Speech recognition not supported in this browser';
      }
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    
    // Set language from settings (ta-IN or en-IN)
    const lang = window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN';
    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.micBtn) {
        this.micBtn.classList.add('listening', 'live-active');
      }
      this.updateStatusDisplay('listening');
    };

    this.recognition.onresult = (event) => {
      if (!this.liveVoiceMode && !this.isListening) return;

      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        console.log('[Happy AI] Speech transcript recognized:', transcript);
        if (this.inputField) this.inputField.value = transcript;

        // Stop listening temporarily while agent processes and speaks reply
        this.stopListeningOnly();
        this.sendMessage(transcript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[Happy AI] Speech recognition error:', event.error);
      if (event.error === 'aborted') {
        this.isListening = false;
        return;
      }

      this.isListening = false;
      if (this.micBtn) this.micBtn.classList.remove('listening');

      if (this.liveVoiceMode && this.isOpen && !this.isSpeaking) {
        this.scheduleRestartListening(700);
      } else {
        this.updateStatusDisplay('idle');
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.micBtn) this.micBtn.classList.remove('listening');

      if (this.liveVoiceMode && this.isOpen && !this.isSpeaking && !this.currentThinkingBubble) {
        this.scheduleRestartListening(500);
      } else if (!this.liveVoiceMode) {
        this.updateStatusDisplay('idle');
      }
    };
  }

  toggleLiveVoice() {
    if (!this.recognition) {
      if (window.showToast) window.showToast('Voice input requires Chrome or Edge browser.');
      return;
    }

    if (this.liveVoiceMode) {
      // Turn OFF -> Immediate cut off
      this.liveVoiceMode = false;
      this.cutOffAllInteraction('mic_turned_off');
      if (window.showToast) window.showToast('Live voice turned off 🔇');
    } else {
      // Turn ON
      this.cutOffAllInteraction('fresh_mic_start');
      this.liveVoiceMode = true;
      if (this.micBtn) {
        this.micBtn.classList.add('live-active');
        this.micBtn.title = "Live Speak-to-Speech ON. Click to stop.";
      }
      this.updateStatusDisplay('listening');
      this.startListening();
      if (window.showToast) window.showToast('🎙️ Live Speak-to-Speech active! Talk freely to Happy.');
    }
  }

  startListening() {
    if (!this.recognition || this.isListening || this.isSpeaking) return;
    try {
      const lang = window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN';
      this.recognition.lang = lang;
      this.recognition.start();
    } catch (e) {
      console.warn('[Happy AI] recognition.start caught:', e);
    }
  }

  stopListeningOnly() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.micBtn) this.micBtn.classList.remove('listening');
  }

  scheduleRestartListening(delayMs = 400) {
    if (this.autoRestartTimer) clearTimeout(this.autoRestartTimer);
    if (!this.liveVoiceMode || !this.isOpen || this.isSpeaking) return;

    this.autoRestartTimer = setTimeout(() => {
      if (this.liveVoiceMode && this.isOpen && !this.isSpeaking && !this.currentThinkingBubble) {
        this.startListening();
      }
    }, delayMs);
  }

  /* --------------------------------------------------------------------------
     MESSAGING & GEMINI PIPELINE
     -------------------------------------------------------------------------- */
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
      speakBtn.title = 'Replay Gemini model voice';
      speakBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      speakBtn.onclick = (e) => {
        e.stopPropagation();
        this.generateAndPlayGeminiVoice(text);
      };
      bubble.appendChild(speakBtn);
    } else {
      bubble.textContent = text;
    }

    this.messagesArea.appendChild(bubble);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;

    this.chatHistory.push({ role: sender === 'user' ? 'user' : 'model', parts: [{ text }] });
  }

  async sendMessage(userText) {
    // If speaking, cut off immediately
    if (this.isSpeaking) {
      this.cutOffAllInteraction('new_message_interrupt');
    }

    this.addMessage("user", userText);

    // Show thinking bubble
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'msg-bubble agent';
    thinkingBubble.innerHTML = '<i class="fa-solid fa-sparkles fa-spin"></i> Happy is thinking...';
    this.messagesArea.appendChild(thinkingBubble);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    this.currentThinkingBubble = thinkingBubble;
    this.updateStatusDisplay('thinking');

    // 1. Check for story / book commands
    const lower = userText.toLowerCase();
    if (lower.includes('read') || lower.includes('story') || lower.includes('book')) {
      if (this.currentThinkingBubble) this.currentThinkingBubble.remove();
      this.currentThinkingBubble = null;
      const isTamil = (window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN') === 'ta-IN';
      const reply = isTamil
        ? "உங்கள் 'Still Rooted' கதையை இப்போதே திறக்கிறேன், பிரியா! அத்தியாயம் 1-க்கு போகலாம்! 📖✨"
        : "Opening your story book 'Still Rooted' right now, Priya! Let me take you to Chapter 1! 📖✨";
      this.addMessage("agent", reply);
      this.generateAndPlayGeminiVoice(reply);
      if (window.bookReader) {
        setTimeout(() => window.bookReader.openBook('main', 0), 1000);
      }
      return;
    }

    const apiKey = window.settingsManager ? window.settingsManager.getApiKey() : '';
    const lang = window.settingsManager ? window.settingsManager.getLanguage() : 'en-IN';
    const voiceName = window.settingsManager ? window.settingsManager.getVoiceName() : 'Zephyr';

    if (!apiKey || apiKey.length < 8) {
      if (this.currentThinkingBubble) this.currentThinkingBubble.remove();
      this.currentThinkingBubble = null;
      const fallbackReply = this.getSmartFallbackResponse(userText, lang);
      this.addMessage("agent", fallbackReply);
      this.generateAndPlayGeminiVoice(fallbackReply);
      return;
    }

    // High availability models (tested on v1beta)
    const textModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];

    let languageDirective = "";
    if (lang === 'ta-IN') {
      languageDirective = "IMPORTANT: Respond in warm, natural colloquial Tamil with friendly conversational flow (e.g. 'வணக்கம் பிரியா! எப்படி இருக்கீங்க?'). Keep it concise and witty (1 to 2 short sentences).";
    } else {
      languageDirective = "IMPORTANT: Respond in natural, friendly Indian English. Keep responses witty, warm, concise, and helpful (1 to 3 short sentences max). Be a great, funny, loyal companion.";
    }

    const promptInstruction = `SYSTEM INSTRUCTION: You are Happy, a cheerful, witty AI companion created by Harish S. for Priyavarshini (Priya). Speak with warm ${voiceName} tone. ${languageDirective}\n\nUSER MESSAGE: ${userText}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptInstruction }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 220 }
    };

    let replyText = "";
    this.activeAbortController = new AbortController();

    // Query text generation
    for (const model of textModels) {
      if (!this.currentThinkingBubble) return;

      try {
        const timeoutAbort = new AbortController();
        const timeoutId = setTimeout(() => timeoutAbort.abort(), 6000);

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: timeoutAbort.signal
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (res.ok && data.candidates && data.candidates[0] && data.candidates[0].content) {
          replyText = data.candidates[0].content.parts[0].text.trim();
          break;
        }
      } catch (err) {
        console.warn(`[Happy AI] Text generation failed on ${model}:`, err.message);
      }
    }

    if (!replyText) {
      replyText = this.getSmartFallbackResponse(userText, lang);
    }

    if (this.currentThinkingBubble) {
      this.currentThinkingBubble.remove();
      this.currentThinkingBubble = null;
    }
    this.activeAbortController = null;

    this.addMessage("agent", replyText);

    // Speak using Gemini's native model voice!
    await this.generateAndPlayGeminiVoice(replyText);
  }

  /* --------------------------------------------------------------------------
     MOZHI-INSPIRED NATURAL PRONUNCIATION FORMATTING
     Ensures neural TTS models articulate Tamil and Indian English smoothly
     -------------------------------------------------------------------------- */
  formatSpokenScript(text) {
    if (!text) return "";
    let clean = text.replace(/[*#_~`]/g, '').replace(/https?:\/\/\S+/g, '').trim();

    // Check if text contains Tamil characters
    const hasTamil = /[\u0B80-\u0BFF]/.test(clean);

    if (hasTamil) {
      // Natural conversational phonetic dictionary mapping for fluent Tamil speech
      const tamilMap = [
        [/வணக்கம்/g, 'Vanakkam'],
        [/பிரியா/g, 'Priya'],
        [/எப்படி/g, 'eppadi'],
        [/இருக்கீங்க|இருக்கிறீர்கள்/g, 'irukkeenga'],
        [/நலமாக/g, 'nalamaaga'],
        [/நான்/g, 'naan'],
        [/ஹேப்பி/g, 'Happy'],
        [/உங்கள்|உங்க/g, 'unga'],
        [/நண்பன்|தோழன்/g, 'friend'],
        [/உதவி/g, 'uthavi'],
        [/வேணும்|வேண்டும்/g, 'venum'],
        [/சொல்லுங்க/g, 'sollunga'],
        [/கதை/g, 'kathai'],
        [/திறக்கிறேன்/g, 'thirakiren'],
        [/இப்போதே/g, 'ippothae'],
        [/போகலாம்/g, 'pogalaam'],
        [/அத்தியாயம்/g, 'Chapter'],
        [/கவலைப்படாதீங்க/g, 'kavalai padaatheenga'],
        [/மூச்சு/g, 'moochu'],
        [/விடுங்கள்/g, 'vidunga'],
        [/சிரி/g, 'siri'],
        [/நன்றி/g, 'nandri'],
        [/உருவாக்கினார்/g, 'create panninaaru'],
        [/அழகான/g, 'azhagaana'],
        [/நம்பிக்கை/g, 'nambikkai'],
        [/சிந்தனை/g, 'yosanai'],
        [/மரங்கள்/g, 'marangal'],
        [/புயல்/g, 'puyal'],
        [/தாங்கும்/g, 'thaangum'],
        [/சக்தி/g, 'sakthi']
      ];

      for (const [pattern, replacement] of tamilMap) {
        clean = clean.replace(pattern, replacement);
      }
    }

    // Direct Gemini 3.8 TTS with directorial performance cues for human-like warmth
    return `[Direction: Speak warmly, smiling, friendly, and naturally with human-like conversational cadence and relaxed pace] ${clean}`;
  }

  /* --------------------------------------------------------------------------
     GEMINI NEURAL MODEL AUDIO GENERATION & STUDIO HTML5 AUDIO PLAYBACK
     -------------------------------------------------------------------------- */
  async generateAndPlayGeminiVoice(text) {
    const apiKey = window.settingsManager ? window.settingsManager.getApiKey() : '';
    const voiceName = window.settingsManager ? window.settingsManager.getVoiceName() : 'Zephyr';
    const pace = window.settingsManager ? window.settingsManager.getVoicePace() : 1.0;

    if (!apiKey || apiKey.length < 8) {
      console.warn('[Happy AI] No Gemini API Key configured for neural voice.');
      if (window.showToast) window.showToast('Configure Gemini API Key in Settings for real Zephyr model voice! 🔑');
      return;
    }

    // Prepare speech script with natural conversational prosody
    const speechScript = this.formatSpokenScript(text);

    // Available TTS models in order of speed and capability
    const ttsModels = [
      'gemini-3.8-flash-lite-tts',
      'gemini-3.8-flash-tts',
      'gemini-3.1-flash-tts-preview',
      'gemini-2.5-pro-preview-tts'
    ];

    const ttsPayload = {
      contents: [
        {
          parts: [{ text: speechScript }]
        }
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName // "Zephyr", "Aoede", "Puck", "Charon", etc.
            }
          }
        }
      }
    };

    let audioPlayed = false;

    for (const ttsModel of ttsModels) {
      if (!this.isOpen && !this.liveVoiceMode) return;

      try {
        console.log(`[Happy AI] Synthesizing voice with model: ${ttsModel} (${voiceName} voice)...`);
        
        const ttsAbort = new AbortController();
        const timeoutId = setTimeout(() => ttsAbort.abort(), 7500);

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ttsPayload),
          signal: ttsAbort.signal
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (res.ok && data.candidates && data.candidates[0] && data.candidates[0].content) {
          const parts = data.candidates[0].content.parts;
          const audioPart = parts.find(p => p.inlineData && p.inlineData.data);
          
          if (audioPart) {
            const base64Audio = audioPart.inlineData.data;
            const mimeType = audioPart.inlineData.mimeType || 'audio/wav';
            
            console.log(`[Happy AI] 🎙️ Gemini audio received (${mimeType}). Playing neatly via Studio Audio Engine...`);
            await this.playGeminiAudio(base64Audio, mimeType, pace);
            audioPlayed = true;
            break;
          }
        } else {
          console.warn(`[Happy AI] TTS model ${ttsModel} status:`, data.error?.message || res.status);
        }
      } catch (err) {
        console.warn(`[Happy AI] TTS model ${ttsModel} failed:`, err.message);
      }
    }

    if (!audioPlayed) {
      console.warn('[Happy AI] Could not generate audio from Gemini TTS models.');
      if (this.liveVoiceMode && this.isOpen) {
        this.scheduleRestartListening(400);
      }
    }
  }

  /* --------------------------------------------------------------------------
     STUDIO AUDIO PLAYER: Native HTML5 Audio with Preserved Pitch & Fast Cut-Off
     -------------------------------------------------------------------------- */
  playGeminiAudio(base64Data, mimeType = 'audio/wav', pace = 1.0) {
    return new Promise((resolve) => {
      try {
        // Cut off any existing playing audio
        if (this.currentAudioElement) {
          try {
            this.currentAudioElement.pause();
            this.currentAudioElement.currentTime = 0;
          } catch (e) {}
          this.currentAudioElement = null;
        }
        if (this.currentBlobUrl) {
          try {
            URL.revokeObjectURL(this.currentBlobUrl);
          } catch (e) {}
          this.currentBlobUrl = null;
        }

        // Convert base64 string to Uint8Array
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        let audioBytes = bytes;
        let finalMime = mimeType;

        // If raw PCM returned without RIFF header, prepend a clean 44-byte WAV header (24kHz, 16-bit, mono)
        if (mimeType.includes('pcm') || mimeType.includes('L16') || (!bytes.slice(0, 4).toString().includes('RIFF') && bytes.length > 44)) {
          audioBytes = this.createWavHeaderBuffer(bytes, 24000);
          finalMime = 'audio/wav';
        }

        const blob = new Blob([audioBytes], { type: finalMime });
        const blobUrl = URL.createObjectURL(blob);
        this.currentBlobUrl = blobUrl;

        const audio = new Audio(blobUrl);

        // Crucial for natural human sound: preserve pitch!
        audio.preservesPitch = true;
        // Clamp speed to natural bounds (0.85x to 1.25x)
        audio.playbackRate = Math.max(0.85, Math.min(1.25, pace));

        this.currentAudioElement = audio;
        this.isSpeaking = true;
        if (this.visualizer) this.visualizer.classList.add('active');
        this.updateStatusDisplay('speaking');

        audio.onended = () => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
          }
          if (this.visualizer) this.visualizer.classList.remove('active');

          // Live speak-to-speech loop
          if (this.liveVoiceMode && this.isOpen) {
            this.updateStatusDisplay('listening');
            this.scheduleRestartListening(400); // 400ms pause prevents echo
          } else {
            this.updateStatusDisplay('idle');
          }
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('[Happy AI] Audio element error:', e);
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (this.visualizer) this.visualizer.classList.remove('active');
          resolve();
        };

        audio.play().catch(playErr => {
          console.warn('[Happy AI] Audio play exception:', playErr);
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (this.visualizer) this.visualizer.classList.remove('active');
          resolve();
        });

      } catch (err) {
        console.error('[Happy AI] playGeminiAudio exception:', err);
        this.isSpeaking = false;
        resolve();
      }
    });
  }

  // Prepend standard RIFF WAV header for raw 16-bit 24kHz PCM audio
  createWavHeaderBuffer(pcmData, sampleRate = 24000) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Copy PCM samples
    new Uint8Array(buffer, 44).set(pcmData);
    return new Uint8Array(buffer);
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /* --------------------------------------------------------------------------
     SMART CONVERSATIONAL FALLBACK (TAMIL & ENGLISH)
     -------------------------------------------------------------------------- */
  getSmartFallbackResponse(text, lang = 'en-IN') {
    const lower = text.toLowerCase();
    const isTamil = lang === 'ta-IN' || lower.includes('tamil') || lower.includes('vanakkam');

    if (isTamil) {
      if (lower.includes('vanakkam') || lower.includes('hello') || lower.includes('hi')) {
        return "வணக்கம் பிரியா! நலமாக இருக்கிறீர்களா? Harish S. உருவாக்கிய இந்த அழகான sanctuary-க்கு உங்களை வரவேற்கிறேன்! 🌸✨";
      }
      if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh') || lower.includes('சிரி')) {
        return "ஏன் மரங்கள் எப்பவும் புத்திசாலியா இருக்கு தெரியுமா பிரியா? ஏன்னா அவைகளுக்கு ஸ்ட்ராங்கான Roots இருக்கு! Still Rooted போல! 😄🌿";
      }
      if (lower.includes('hard day') || lower.includes('tired') || lower.includes('கஷ்டம்')) {
        return "கவலைப்படாதீங்க பிரியா! ஒரு மெதுவான மூச்சு விடுங்கள். எப்பேர்ப்பட்ட புயலையும் தாங்கும் சக்தி உங்களுக்கு இருக்கு! 🌿💪";
      }
      if (lower.includes('harish')) {
        return "Harish S. உங்களை சிரிக்க வைக்கவும், உங்கள் முகத்தில் எப்போதும் புன்னகை இருக்கவும்தான் இந்த செயலியை உருவாக்கினார்! 😊";
      }
      return "மிக அருமையான சிந்தனை, பிரியா! உங்கள் நம்பிக்கை என்றும் உங்களுடன் இருக்கும். நான் எப்போதும் உங்களுக்கு துணையாக இருப்பேன்! 🌟";
    }

    // Indian English
    if (lower.includes('hard day') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('stressed')) {
      return "Take a slow, deep breath, Priya! You've got this, and you don't have to carry the whole world on your shoulders today. Just like in 'Still Rooted', shake off the stress—your roots run deep! 🌿";
    }

    if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')) {
      const jokes = [
        "Why did the tree go to college? Because it wanted to branch out into greater things, just like you, Priya! 🌿😄",
        "What did one storm cloud say to the lightning? 'You're looking shockingly radiant today!' ⚡✨",
        "Why do programmers prefer dark mode? Because light attracts bugs! (Harish knows all about that one!) 😂💻"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hey Priya! ✨ Hope your day is treating you wonderfully! What's on your mind today? Ask me anything!";
    }

    if (lower.includes('harish') || lower.includes('author')) {
      return "Harish S. built this sanctuary and wrote 'Still Rooted' just for you to smile whenever life gets busy! 😄";
    }

    return "That's a thoughtful question, Priya! Stay true to your pace, trust your instincts, and remember to take a break when things get busy. I'm always right here with you! 🌟";
  }

  /* --------------------------------------------------------------------------
     STATUS INDICATOR
     -------------------------------------------------------------------------- */
  updateStatusDisplay(state) {
    if (!this.statusLine) return;
    const voice = window.settingsManager ? window.settingsManager.getVoiceName() : 'Zephyr';

    if (state === 'listening') {
      this.statusLine.innerHTML = '<span style="color: #ff4757; font-weight:700;">● 🎙️ Live Listening... Speak now</span>';
    } else if (state === 'thinking') {
      this.statusLine.innerHTML = '<span style="color: #e67e22; font-weight:700;">● ✨ Happy is thinking...</span>';
    } else if (state === 'speaking') {
      this.statusLine.innerHTML = `<span style="color: var(--rose-primary); font-weight:700;">● 🔊 Gemini ${voice} Voice Speaking...</span>`;
    } else {
      if (this.liveVoiceMode) {
        this.statusLine.innerHTML = '<span style="color: #2ed573; font-weight:700;">● 🎙️ Live Voice Ready</span>';
      } else {
        this.statusLine.innerHTML = `<span style="color: #2ed573;">● Smart Companion • ${voice} Voice</span>`;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.happyAgent = new HappyVoiceAgent();
});
