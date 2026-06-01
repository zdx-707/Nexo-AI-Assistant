window.AudioManager = class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.sounds = {};
    this.ambientSource = null;
    this.initialized = false;
    this.muted = false;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = CONFIG.MASTER_VOLUME;

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = CONFIG.SFX_VOLUME;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = CONFIG.AMBIENT_VOLUME;

    this.sfxGain.connect(this.masterGain);
    this.ambientGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.initialized = true;
  }

  register(name, generatorFn) {
    this.sounds[name] = generatorFn;
  }

  play(name, options) {
    if (!this.initialized) this.init();
    const generator = this.sounds[name];
    if (!generator) return;
    const opts = Object.assign({ volume: 1, pitch: 1, loop: false }, options);
    const source = generator(this.ctx, opts);
    if (!source) return;
    source.loop = opts.loop;
    if (source.playbackRate) source.playbackRate.value = opts.pitch;
    source.connect(this.sfxGain);
    source.start(0);
  }

  playAmbient(generatorFn) {
    if (!this.initialized) this.init();
    this.stopAmbient();
    const source = generatorFn(this.ctx);
    if (!source) return;
    source.loop = true;
    source.connect(this.ambientGain);
    source.start(0);
    this.ambientSource = source;
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch (e) {}
      this.ambientSource = null;
    }
  }

  setVolume(master, sfx, ambient) {
    if (!this.initialized) this.init();
    if (master != null) this.masterGain.gain.value = master;
    if (sfx != null) this.sfxGain.gain.value = sfx;
    if (ambient != null) this.ambientGain.gain.value = ambient;
  }

  mute() {
    if (!this.initialized) this.init();
    this.masterGain.gain.value = 0;
    this.muted = true;
  }

  unmute() {
    if (!this.initialized) this.init();
    this.masterGain.gain.value = CONFIG.MASTER_VOLUME;
    this.muted = false;
  }

  get isReady() {
    return this.initialized;
  }
};
