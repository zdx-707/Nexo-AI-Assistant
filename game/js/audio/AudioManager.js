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

  playSpatial(name, sourcePos, listenerPos, maxDist) {
    if (!this.initialized) this.init();
    const generator = this.sounds[name];
    if (!generator) return;
    const dx = sourcePos.x - listenerPos.x;
    const dz = sourcePos.z - listenerPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > maxDist) return;

    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = maxDist;
    panner.rolloffFactor = 1;
    panner.positionX.value = sourcePos.x;
    panner.positionY.value = sourcePos.y || 0;
    panner.positionZ.value = sourcePos.z;
    panner.connect(this.sfxGain);

    const source = generator(this.ctx, { volume: 1, pitch: 1, loop: false });
    if (!source) return;
    source.connect(panner);
    source.start(0);
  }

  updateListener(pos, yaw) {
    if (!this.initialized) return;
    const listener = this.ctx.listener;
    if (listener.positionX) {
      listener.positionX.value = pos.x;
      listener.positionY.value = pos.y || 0;
      listener.positionZ.value = pos.z;
      listener.forwardX.value = Math.sin(yaw);
      listener.forwardY.value = 0;
      listener.forwardZ.value = Math.cos(yaw);
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    } else {
      listener.setPosition(pos.x, pos.y || 0, pos.z);
      listener.setOrientation(Math.sin(yaw), 0, Math.cos(yaw), 0, 1, 0);
    }
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
