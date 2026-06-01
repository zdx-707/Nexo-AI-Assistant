window.GameLoop = class GameLoop {
  constructor() {
    this.running = false;
    this.lastTime = 0;
    this.dt = 0;
    this.fps = 0;
    this._fpsAccum = 0;
    this._fpsFrames = 0;
    this._rafId = null;
    this._updateFns = [];
    this._renderFns = [];
    this._paused = false;
    this._tick = this._tick.bind(this);
  }

  addUpdate(fn) {
    this._updateFns.push(fn);
  }

  addRender(fn) {
    this._renderFns.push(fn);
  }

  removeUpdate(fn) {
    const i = this._updateFns.indexOf(fn);
    if (i !== -1) this._updateFns.splice(i, 1);
  }

  removeRender(fn) {
    const i = this._renderFns.indexOf(fn);
    if (i !== -1) this._renderFns.splice(i, 1);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._paused = false;
    this.lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.running = false;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }

  _tick(now) {
    this._rafId = requestAnimationFrame(this._tick);

    const raw = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.dt = Math.min(Math.max(raw, 0), 0.05);

    this._fpsAccum += this.dt;
    this._fpsFrames += 1;
    if (this._fpsFrames >= 60) {
      this.fps = this._fpsAccum > 0 ? this._fpsFrames / this._fpsAccum : 0;
      this._fpsAccum = 0;
      this._fpsFrames = 0;
    }

    if (!this._paused) {
      for (let i = 0; i < this._updateFns.length; i++) {
        this._updateFns[i](this.dt);
      }
    }

    for (let i = 0; i < this._renderFns.length; i++) {
      this._renderFns[i]();
    }
  }
};
