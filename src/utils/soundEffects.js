/**
 * KBC Sound Effects & Web Speech Synthesizer Engine
 * Uses Web Audio API for zero-dependency, ultra-low latency tension sounds,
 * clock ticking, answer locks, and win fanfares.
 * Integrates Web Speech API for host voice announcement.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.speechEnabled = true;
    this.suspenseOsc = null;
    this.suspenseGain = null;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSuspense();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    return this.isMuted;
  }

  toggleSpeech() {
    this.speechEnabled = !this.speechEnabled;
    if (!this.speechEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    return this.speechEnabled;
  }

  // Ticking sound for timer
  playTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  // Dramatic tension tone when an answer is locked
  playLock() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(110, t); // Low A
      osc1.frequency.linearRampToValueAtTime(95, t + 0.8);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(164.81, t); // E
      osc2.frequency.linearRampToValueAtTime(140, t + 0.8);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.9);
      osc2.stop(t + 0.9);
    } catch (e) {
      console.warn(e);
    }
  }

  // Correct answer fanfare
  playCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        gain.gain.setValueAtTime(0.2, t + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.5);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Wrong answer buzzer / somber tone
  playWrong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.9);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.9);
    } catch (e) {
      console.warn(e);
    }
  }

  // Lifeline chime
  playLifeline() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0.2, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.4);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Milestone or Grand Jackpot Win
  playGrandWin() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.25, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 1.8);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Cash register / prize payout sound
  playCashRegister() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Two rapid bright metallic chimes
      [1567.98, 2093.00, 3135.96].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0.2, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.6);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Stamp thump sound
  playStamp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {
      console.warn(e);
    }
  }

  // Ambient tension drone while reading question
  startSuspense() {
    if (this.isMuted || this.suspenseOsc) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.suspenseOsc = this.ctx.createOscillator();
      this.suspenseGain = this.ctx.createGain();

      this.suspenseOsc.type = "sine";
      this.suspenseOsc.frequency.setValueAtTime(55, t); // Sub-bass A1
      this.suspenseGain.gain.setValueAtTime(0.05, t);

      this.suspenseOsc.connect(this.suspenseGain);
      this.suspenseGain.connect(this.ctx.destination);

      this.suspenseOsc.start(t);
    } catch (e) {
      console.warn(e);
    }
  }

  stopSuspense() {
    if (this.suspenseOsc) {
      try {
        this.suspenseOsc.stop();
        this.suspenseOsc.disconnect();
      } catch {
        // ignore
      }
      this.suspenseOsc = null;
      this.suspenseGain = null;
    }
  }

  // Web Speech API Voice narration (Amitabh Bachchan style host voice)
  speak(text, lang = "en") {
    if (!this.speechEnabled || this.isMuted) return;
    if (!("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.9; // Deeper baritone voice tone

      // Try to find an English (India) or Hindi (India) voice based on selection
      const voices = window.speechSynthesis.getVoices();
      let targetVoice = null;

      if (lang === "hi") {
        targetVoice = voices.find((v) => v.lang.startsWith("hi") || v.lang.includes("hi-IN"));
      }

      if (!targetVoice) {
        targetVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
      }

      if (targetVoice) {
        utterance.voice = targetVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  }
}

export const sounds = new SoundEngine();
