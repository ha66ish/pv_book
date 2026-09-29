/* ==========================================================================
   AI VOICE AGENT: "HAPPY"
   Continuous Live Speak-to-Speech Companion with Instant Cut-Off & Multi-Model Failover
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

    // Live Interaction & State Management
    this.liveVoiceMode = false;       // When true: continuous live speak-to-speech loop
    this.isListening = false;         // Microphone actively streaming
    this.isSpeaking = false;          // Speech synthesis actively speaking
    this.isOpen = false;              // Dialogue panel open state
    this.recognition = null;          // SpeechRecognition instance
    this.chatHistory = [];            // Conversation transcript
    this.activeAbortController = null;// In-flight API call canceller
    this.currentThinkingBubble = null;// DOM reference to active thinking indicator
    this.autoRestartTimer = null;     // Timer to restart mic after agent speech ends
    this.currentUtterance = null;     // Chrome GC protection

    this.init();
  }

  init() {
    // Mascot click: toggle panel
    if (this.mascotBtn) {
      this.mascotBtn.addEventListener('click', () => {
        this.togglePanel();
      });
    }

    // Close button: instant cut-off and close panel
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePanel();
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

    // Pre-warm SpeechSynthesis voices for zero-latency audio playback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Initial greeting message
    this.addMessage("agent", "Hi Priya! 👋 I'm Happy AI Assistant, your smart companion created by Harish S. Whenever you need a joke, a quick laugh, or want me to open your story, just tap the mic to speak live or type below!");
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

    // Trigger cute robo wave animation
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
    // IMMEDIATELY cut off any active voice, listening, or thinking
    this.cutOffAllInteraction('panel_closed');
  }

  /* --------------------------------------------------------------------------
     IMMEDIATE CUT-OFF / CANCELLATION
     Instantly terminates microphone, speech playback, network calls, and thinking
     -------------------------------------------------------------------------- */
  cutOffAllInteraction(reason = 'user') {
    console.log(`[Happy AI] ⏹️ Cut-off executed immediately (${reason})`);

    // 1. Instantly silence Web Speech Synthesis playback
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.currentUtterance = null;

    // 2. Clear any pending auto-restart timers
    if (this.autoRestartTimer) {
      clearTimeout(this.autoRestartTimer);
      this.autoRestartTimer = null;
    }

    // 3. Instantly abort microphone speech recognition
    if (this.recognition) {
      try {
        this.recognition.abort(); // abort() kills audio stream immediately without waiting
      } catch (e) {}
    }
    this.isListening = false;

    // 4. Instantly abort any in-flight Gemini API fetch
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch (e) {}
      this.activeAbortController = null;
    }

    // 5. Instantly remove any "Happy is thinking..." bubble from UI
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
    this.recognition.lang = 'en-US';

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

        // Stop listening temporarily while processing and speaking reply
        this.stopListeningOnly();
        this.sendMessage(transcript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[Happy AI] Speech recognition status:', event.error);
      
      // If aborted by user, do not auto-restart
      if (event.error === 'aborted') {
        this.isListening = false;
        return;
      }

      this.isListening = false;
      if (this.micBtn) this.micBtn.classList.remove('listening');

      // If in continuous live mode and user went silent (no-speech), restart gently
      if (this.liveVoiceMode && this.isOpen && !this.isSpeaking) {
        this.scheduleRestartListening(700);
      } else {
        this.updateStatusDisplay('idle');
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.micBtn) this.micBtn.classList.remove('listening');

      // If live mode is still active, agent isn't speaking, and panel is open, keep listening
      if (this.liveVoiceMode && this.isOpen && !this.isSpeaking && !this.currentThinkingBubble) {
        this.scheduleRestartListening(500);
      } else if (!this.liveVoiceMode) {
        this.updateStatusDisplay('idle');
      }
    };
  }

  /* --------------------------------------------------------------------------
     LIVE SPEAK-TO-SPEECH CONTROLS
     -------------------------------------------------------------------------- */
  toggleLiveVoice() {
    if (!this.recognition) {
      if (window.showToast) window.showToast('Voice input requires Chrome or Edge browser.');
      return;
    }

    if (this.liveVoiceMode) {
      // User tapped mic button to turn it OFF -> Instant Cut-Off
      this.liveVoiceMode = false;
      this.cutOffAllInteraction('mic_turned_off');
      if (window.showToast) window.showToast('Live voice turned off 🔇');
    } else {
      // User tapped mic button to turn it ON
      this.cutOffAllInteraction('fresh_mic_start');
      this.liveVoiceMode = true;
      if (this.micBtn) {
        this.micBtn.classList.add('live-active');
        this.micBtn.title = "Live Speak-to-Speech is ON. Click to stop.";
      }
      this.updateStatusDisplay('listening');
      this.startListening();
      if (window.showToast) window.showToast('🎙️ Live Speak-to-Speech active! Talk freely to Happy.');
    }
  }

  startListening() {
    if (!this.recognition || this.isListening || this.isSpeaking) return;
    try {
      this.recognition.start();
    } catch (e) {
      // Recognition may already be starting
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
     MESSAGING & GEMINI MULTI-MODEL FALLBACK ENGINE
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
      speakBtn.title = 'Replay Happy voice';
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

  async sendMessage(userText) {
    // If speaking, interrupt immediately
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
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
      const reply = "Opening your story book 'Still Rooted' right now, Priya! Let me take you to Chapter 1! 📖✨";
      this.addMessage("agent", reply);
      this.speakText(reply);
      if (window.bookReader) {
        setTimeout(() => window.bookReader.openBook('main', 0), 1000);
      }
      return;
    }

    // 2. Settings & Keys
    const apiKey = window.settingsManager ? window.settingsManager.getApiKey() : '';
    const voiceName = window.settingsManager ? window.settingsManager.getVoiceName() : 'Aoede';

    if (!apiKey || apiKey.length < 8) {
      if (this.currentThinkingBubble) this.currentThinkingBubble.remove();
      this.currentThinkingBubble = null;
      const fallbackReply = this.getSmartFallbackResponse(userText);
      this.addMessage("agent", fallbackReply);
      this.speakText(fallbackReply);
      return;
    }

    // 3. Multi-Model Failover Order (Handles 503 Service Unavailable / High Demand)
    const selectedModel = window.settingsManager ? window.settingsManager.getModel() : 'gemini-3.1-live';
    
    // Model candidate cascade: selected first, then guaranteed low-latency high-availability models
    const candidateModels = [];
    if (selectedModel.includes('3.8')) {
      candidateModels.push('gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite');
    } else {
      candidateModels.push('gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash');
    }
    // Deduplicate
    const uniqueCandidates = [...new Set(candidateModels)];

    const promptInstruction = `SYSTEM INSTRUCTION: You are Happy, a cheerful, witty, warm AI companion created by Harish S. for Priyavarshini (Priya). Speak with warm ${voiceName} tone. Keep responses conversational, concise, and helpful (1 to 3 short sentences max). Never be overly dramatic or romantic; be a great, funny, loyal friend.\n\nUSER MESSAGE: ${userText}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptInstruction }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 250 }
    };

    let replySuccess = false;
    this.activeAbortController = new AbortController();

    // Iterate through model candidates until one succeeds
    for (const model of uniqueCandidates) {
      if (!this.currentThinkingBubble) {
        // User closed panel or toggled mic off mid-request
        return;
      }

      try {
        console.log(`[Happy AI] Querying Gemini model: ${model}...`);
        
        // Timeout per model attempt: 5.5s
        const modelAbort = new AbortController();
        const timeoutId = setTimeout(() => modelAbort.abort(), 5500);

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: modelAbort.signal
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (res.ok && data.candidates && data.candidates[0] && data.candidates[0].content) {
          const replyText = data.candidates[0].content.parts[0].text.trim();
          
          if (this.currentThinkingBubble) {
            this.currentThinkingBubble.remove();
            this.currentThinkingBubble = null;
          }
          this.activeAbortController = null;

          this.addMessage("agent", replyText);
          this.speakText(replyText);
          replySuccess = true;
          break; // Succeeded!
        } else {
          const errCode = (data.error && data.error.code) || res.status;
          console.warn(`[Happy AI] Model ${model} returned error status ${errCode}:`, data.error?.message);
          // Continue to next candidate model seamlessly!
        }
      } catch (err) {
        console.warn(`[Happy AI] Model ${model} network error:`, err.message);
        // Continue to next candidate model
      }
    }

    // If all online models were busy (503/429) or unreachable
    if (!replySuccess) {
      if (this.currentThinkingBubble) {
        this.currentThinkingBubble.remove();
        this.currentThinkingBubble = null;
      }
      this.activeAbortController = null;

      const fallbackReply = this.getSmartFallbackResponse(userText);
      this.addMessage("agent", fallbackReply);
      this.speakText(fallbackReply);
    }
  }

  /* --------------------------------------------------------------------------
     SMART CONVERSATIONAL FALLBACK GENERATOR
     -------------------------------------------------------------------------- */
  getSmartFallbackResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes('tamil') || lower.includes('vanakkam')) {
      return "Vanakkam Priya! Eppadi irukkeenga? Harish S. ungalukaaga intha sanctuary-ah create pannirukaaru! Ungalukku eppovum smile thara naanum ready! 🌸✨";
    }

    if (lower.includes('hard day') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('sad') || lower.includes('stressed')) {
      return "Take a slow, deep breath, Priya! You've got this, and you don't have to carry the whole world on your shoulders today. Just like the resilient tree in 'Still Rooted', shake off the stress—your roots run deep! 🌿";
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
      return "Listen to me, Priyavarshini! You have survived 100% of your hardest days so far. You are brilliant, unstoppable, and your roots run deep. Keep moving forward one proud step at a time! 🦸🏻‍♀️🔥";
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening')) {
      return "Hey Priya! ✨ Hope your day is treating you wonderfully! What's on your mind today? Ask me anything!";
    }

    if (lower.includes('harish') || lower.includes('author') || lower.includes('who made') || lower.includes('who wrote')) {
      return "Harish S. built this entire sanctuary and wrote 'Still Rooted' just for you! He wanted to give you a dedicated space to relax and smile whenever things get stressful. He also told me to ensure nobody messes with his code! 😄";
    }

    if (lower.includes('how are you') || lower.includes('how r u') || lower.includes('how you doing')) {
      return "I'm feeling super cheerful and ready to talk with you, Priya! How are you doing today? 😊";
    }

    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('your name')) {
      return "I am Happy, your smart AI companion and assistant! I'm here to chat, read your story with you, cheer you up, tell jokes, and keep you company whenever you visit! 🤖✨";
    }

    if (lower.includes('what can you do') || lower.includes('help')) {
      return "I can read your story 'Still Rooted' to you, tell you jokes, give you a pep-talk when things get heavy, discuss your thoughts, or just chat with you in live voice! 📖🎤";
    }

    if (lower.includes('advice') || lower.includes('what should i do') || lower.includes('suggest')) {
      return "Whenever in doubt, take one slow breath. Focus only on the very next right step in front of you. You don't have to figure out the whole future at once! 🌿✨";
    }

    if (lower.includes('thank')) {
      return "You're most welcome, Priya! Always right here whenever you need a smile, a laugh, or a chat! 🌸";
    }

    return "That's a great thought, Priya! Stay true to your pace, trust your instincts, and remember to take a break when things get busy. I'm always right here with you! 🌟";
  }

  /* --------------------------------------------------------------------------
     TEXT-TO-SPEECH (TTS) PLAYBACK & CONTINUOUS LIVE VOICE LOOP
     -------------------------------------------------------------------------- */
  speakText(text) {
    if (!('speechSynthesis' in window)) {
      console.warn('[Happy AI] Speech synthesis not supported');
      return;
    }

    try {
      // Cancel previous speech immediately
      window.speechSynthesis.cancel();
      this.isSpeaking = false;

      // Clean non-ASCII emojis that cause Windows Chrome TTS to stutter or crash
      const cleanText = text
        .replace(/[*#_~`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[^\x00-\x7F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance; // Prevent Chrome garbage collection bug

      const params = window.settingsManager ? window.settingsManager.getVoiceParams() : { rate: 1.0, pitch: 1.1 };
      const voiceName = window.settingsManager ? window.settingsManager.getVoiceName() : 'Aoede';

      utterance.rate = Math.max(0.85, Math.min(1.3, params.rate || 1.0));
      utterance.pitch = Math.max(0.85, Math.min(1.3, params.pitch || 1.1));

      // Choose natural voice
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
        this.updateStatusDisplay('speaking');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (this.visualizer) this.visualizer.classList.remove('active');

        // Continuous Live Loop: If live mode is ON and panel is open, auto-listen for Priya's reply!
        if (this.liveVoiceMode && this.isOpen) {
          this.updateStatusDisplay('listening');
          this.scheduleRestartListening(400); // 400ms pause to prevent hearing own speaker audio
        } else {
          this.updateStatusDisplay('idle');
        }
      };

      utterance.onerror = (e) => {
        console.warn('[Happy AI] SpeechSynthesis utterance error:', e);
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (this.visualizer) this.visualizer.classList.remove('active');

        if (this.liveVoiceMode && this.isOpen) {
          this.scheduleRestartListening(400);
        } else {
          this.updateStatusDisplay('idle');
        }
      };

      // Chrome paused state workaround
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.warn('[Happy AI] speakText error:', err);
      this.isSpeaking = false;
    }
  }

  /* --------------------------------------------------------------------------
     UI STATUS DISPLAY
     -------------------------------------------------------------------------- */
  updateStatusDisplay(state) {
    if (!this.statusLine) return;

    if (state === 'listening') {
      this.statusLine.innerHTML = '<span style="color: #ff4757; font-weight:700;">● 🎙️ Live Listening... Speak now</span>';
    } else if (state === 'thinking') {
      this.statusLine.innerHTML = '<span style="color: #e67e22; font-weight:700;">● ✨ Happy is thinking...</span>';
    } else if (state === 'speaking') {
      this.statusLine.innerHTML = '<span style="color: var(--rose-primary); font-weight:700;">● 🔊 Happy is speaking...</span>';
    } else {
      if (this.liveVoiceMode) {
        this.statusLine.innerHTML = '<span style="color: #2ed573; font-weight:700;">● 🎙️ Live Voice Ready</span>';
      } else {
        this.statusLine.innerHTML = '<span style="color: #2ed573;">● Smart Companion • Aoede Live</span>';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.happyAgent = new HappyVoiceAgent();
});
