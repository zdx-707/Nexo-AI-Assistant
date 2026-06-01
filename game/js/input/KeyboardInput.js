window.KeyboardInput = class KeyboardInput {
  constructor() {
    this.keys = {};
    this.pressed = {};
    this.released = {};

    this.KEYS = {
      W:     'KeyW',
      A:     'KeyA',
      S:     'KeyS',
      D:     'KeyD',
      E:     'KeyE',
      F:     'KeyF',
      R:     'KeyR',
      Q:     'KeyQ',
      C:     'KeyC',
      SPACE: 'Space',
      SHIFT: 'ShiftLeft',
      CTRL:  'ControlLeft',
      ESC:   'Escape',
      TAB:   'Tab',
      ENTER: 'Enter',
      UP:    'ArrowUp',
      DOWN:  'ArrowDown',
      LEFT:  'ArrowLeft',
      RIGHT: 'ArrowRight',
    };

    this._onKeyDown = (e) => {
      if (!this.keys[e.code]) {
        this.pressed[e.code] = true;
      }
      this.keys[e.code] = true;
    };

    this._onKeyUp = (e) => {
      this.keys[e.code] = false;
      this.released[e.code] = true;
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  isDown(key) {
    return !!this.keys[key];
  }

  wasPressed(key) {
    return !!this.pressed[key];
  }

  wasReleased(key) {
    return !!this.released[key];
  }

  update() {
    this.pressed = {};
    this.released = {};
  }
};
