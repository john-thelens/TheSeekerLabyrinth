import gemCollectUrl from './assets/audio/gem-collect.wav?url';
import caughtUrl from './assets/audio/caught.mp3?url';
import stepUrl from './assets/audio/step.wav?url';

function rampParam(param, value, context, duration = 0.22) {
  param.cancelScheduledValues(context.currentTime);
  param.linearRampToValueAtTime(value, context.currentTime + duration);
}

export class AmbientSoundscape {
  constructor() {
    this.context = null;
    this.master = null;
    this.sfx = null;
    this.drone = null;
    this.pulse = null;
    this.gemBuffer = null;
    this.gemBufferPromise = null;
    this.caughtBuffer = null;
    this.caughtBufferPromise = null;
    this.stepBuffer = null;
    this.stepBufferPromise = null;
    this.runLoopSource = null;
    this.runLoopGain = null;
    this.runLoopEndsAt = 0;
    this.muted = false;
  }

  async start() {
    if (!this.context) this.createGraph();
    if (this.context.state !== 'running') await this.context.resume();
    void this.loadGemBuffer();
    void this.loadCaughtBuffer();
    void this.loadStepBuffer();
  }

  createGraph() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.18;
    this.master.connect(this.context.destination);

    this.sfx = this.context.createGain();
    this.sfx.gain.value = 0.82;
    this.sfx.connect(this.context.destination);

    this.drone = this.context.createGain();
    this.drone.gain.value = 0.18;
    this.drone.connect(this.master);

    [130.81, 196, 261.63].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = index === 1 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.018 : 0.012;
      oscillator.connect(gain).connect(this.drone);
      oscillator.start();
    });

    this.pulse = this.context.createGain();
    this.pulse.gain.value = 0;
    this.pulse.connect(this.master);

    const alarm = this.context.createOscillator();
    alarm.type = 'square';
    alarm.frequency.value = 92;
    const alarmFilter = this.context.createBiquadFilter();
    alarmFilter.type = 'lowpass';
    alarmFilter.frequency.value = 320;
    alarm.connect(alarmFilter).connect(this.pulse);
    alarm.start();
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) this.stopRunLoop(0.04);
    if (!this.context || !this.master) return;
    rampParam(this.master.gain, muted ? 0 : 0.18, this.context, 0.18);
    if (this.sfx) rampParam(this.sfx.gain, muted ? 0 : 0.82, this.context, 0.18);
  }

  setDanger(amount) {
    if (!this.context || !this.pulse) return;
    rampParam(this.pulse.gain, this.muted ? 0 : Math.min(0.18, amount * 0.18), this.context, 0.16);
  }

  chime() {
    if (!this.context || this.muted) return;
    if (this.playGemSample()) return;
    void this.loadGemBuffer();
    this.playFallbackChime();
  }

  loadGemBuffer() {
    return this.loadAudioBuffer(gemCollectUrl, 'gemBuffer', 'gemBufferPromise');
  }

  loadCaughtBuffer() {
    return this.loadAudioBuffer(caughtUrl, 'caughtBuffer', 'caughtBufferPromise');
  }

  loadStepBuffer() {
    return this.loadAudioBuffer(stepUrl, 'stepBuffer', 'stepBufferPromise');
  }

  loadAudioBuffer(url, bufferKey, promiseKey) {
    if (!this.context || this[bufferKey]) return this[promiseKey];
    if (this[promiseKey]) return this[promiseKey];

    this[promiseKey] = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load sound: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => this.context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this[bufferKey] = buffer;
        return buffer;
      })
      .catch(() => {
        this[promiseKey] = null;
        return null;
      });

    return this[promiseKey];
  }

  playGemSample() {
    if (!this.context || !this.gemBuffer || !this.sfx) return false;
    const source = this.context.createBufferSource();
    source.buffer = this.gemBuffer;
    source.connect(this.sfx);
    source.start(this.context.currentTime);
    return true;
  }

  playFallbackChime() {
    const start = this.context.currentTime;
    [740, 988, 1318].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start + index * 0.045);
      gain.gain.setValueAtTime(0.0001, start + index * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.28, start + 0.04 + index * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.52 + index * 0.045);
      oscillator.connect(gain).connect(this.master);
      oscillator.start(start + index * 0.045);
      oscillator.stop(start + 0.62 + index * 0.045);
    });
  }

  caught() {
    if (!this.context || this.muted) return;
    if (this.playCaughtSample()) return;
    void this.loadCaughtBuffer();
    this.playFallbackCaught();
  }

  playCaughtSample() {
    if (!this.context || !this.caughtBuffer || !this.sfx) return false;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.caughtBuffer;
    gain.gain.value = 0.95;
    source.connect(gain).connect(this.sfx);
    source.start(this.context.currentTime);
    return true;
  }

  playFallbackCaught() {
    const start = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, start);
    oscillator.frequency.exponentialRampToValueAtTime(55, start + 0.55);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.24, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.72);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + 0.74);
  }

  setRunLoop(active) {
    if (!this.context || this.muted) {
      this.stopRunLoop();
      return;
    }
    if (!active) {
      this.stopRunLoop();
      return;
    }
    if (!this.stepBuffer || !this.sfx) {
      void this.loadStepBuffer();
      return;
    }

    const now = this.context.currentTime;
    if (this.runLoopSource && now < this.runLoopEndsAt - 0.08) return;
    this.stopRunLoop(0);

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.stepBuffer;
    source.loop = true;
    gain.gain.setValueAtTime(0.32, now);
    source.connect(gain).connect(this.sfx);
    source.start(now);
    source.stop(now + 2);
    this.runLoopSource = source;
    this.runLoopGain = gain;
    this.runLoopEndsAt = now + 2;
    source.onended = () => {
      if (this.runLoopSource === source) {
        this.runLoopSource = null;
        this.runLoopGain = null;
        this.runLoopEndsAt = 0;
      }
    };
  }

  stopRunLoop(fade = 0.08) {
    if (!this.context || !this.runLoopSource) return;
    const source = this.runLoopSource;
    const gain = this.runLoopGain;
    const now = this.context.currentTime;
    if (gain && fade > 0) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + fade);
    }
    try {
      source.stop(now + fade);
    } catch {
      // A scheduled source can already be stopped by its own timer.
    }
    this.runLoopSource = null;
    this.runLoopGain = null;
    this.runLoopEndsAt = 0;
  }
}
