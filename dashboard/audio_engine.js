class CinematicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.bpm = 122;
    this.energy = 0.68;
    this.danceability = 0.72;
    this.valence = 0.58;
    this.acousticness = 0.18;
    this.step = 0;
    this.timerId = null;
    this.masterGain = null;
    this.analyser = null;
    this.dataArray = null;
    this.filterNode = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(1200 + this.energy * 3800, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.8;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.masterGain.connect(this.filterNode);
    this.filterNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  updateParams(params) {
    if (params.tempo) this.bpm = Math.max(50, Math.min(220, params.tempo));
    if (params.energy !== undefined) {
      this.energy = params.energy;
      if (this.filterNode && this.ctx) {
        const targetFreq = 400 + this.energy * 4500;
        this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      }
    }
    if (params.danceability !== undefined) this.danceability = params.danceability;
    if (params.valence !== undefined) this.valence = params.valence;
    if (params.acousticness !== undefined) this.acousticness = params.acousticness;
  }

  playKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 140 + this.energy * 80;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.38);

    const kickVolume = 0.85 * this.danceability + 0.15;
    gain.gain.setValueAtTime(kickVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }

  playHiHat(time) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6500 + (1 - this.acousticness) * 4500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * this.energy, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.04);
  }

  playChord(time, rootFreq, isMajor) {
    if (!this.ctx) return;
    const thirdMult = isMajor ? Math.pow(2, 4/12) : Math.pow(2, 3/12);
    const fifthMult = Math.pow(2, 7/12);
    const seventhMult = isMajor ? Math.pow(2, 11/12) : Math.pow(2, 10/12);

    const freqs = [rootFreq, rootFreq * thirdMult, rootFreq * fifthMult, rootFreq * seventhMult];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.acousticness > 0.6) {
        osc.type = "sine";
      } else if (this.energy > 0.75) {
        osc.type = "sawtooth";
      } else {
        osc.type = "triangle";
      }

      osc.frequency.setValueAtTime(freq, time);

      const duration = (60 / this.bpm) * 1.9;
      const noteVol = (0.07 / (idx + 1)) * (0.5 + this.energy * 0.5);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(noteVol, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  scheduleNextBeat() {
    if (!this.isPlaying) return;

    const secondsPerBeat = 60.0 / this.bpm;
    const sixteenthNoteTime = secondsPerBeat / 4;
    const now = this.ctx.currentTime;
    const currentStep = this.step % 16;

    
    if (currentStep % 4 === 0 && this.danceability > 0.3) {
      this.playKick(now);
    } else if (currentStep === 10 && this.danceability > 0.65) {
      this.playKick(now);
    }

    
    if (currentStep % 2 === 0 && this.energy > 0.3) {
      this.playHiHat(now);
    }

    
    if (currentStep === 0 || currentStep === 8) {
      const isMajor = this.valence >= 0.5;
      const rootFreq = currentStep === 0 ? 261.63 : (isMajor ? 349.23 : 220.00);
      this.playChord(now, rootFreq, isMajor);
    }

    this.step++;
    this.timerId = setTimeout(() => {
      this.scheduleNextBeat();
    }, sixteenthNoteTime * 1000);
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;
    this.scheduleNextBeat();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

window.cinematicAudioEngine = new CinematicAudioEngine();
