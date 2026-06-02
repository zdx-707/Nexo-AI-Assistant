window.TouchInput = class TouchInput {
  constructor() {
    this.active = false;
    this.joystickTouchId = null;
    this.lookTouchId = null;
    this.joystickOrigin = { x: 0, y: 0 };
    this.joystickPos = { x: 0, y: 0 };
    this.lookLast = { x: 0, y: 0 };
    this.dx = 0;
    this.dy = 0;
    this._pendingPressed = {};
    this._pendingKeys = {};
    this._buildDOM();
    this._bind();
  }

  _buildDOM() {
    const el = document.createElement('div');
    el.id = 'touch-hud';
    el.innerHTML = `
      <div id="joy-zone"></div>
      <div id="joy-base"><div id="joy-thumb"></div></div>
      <div id="look-zone"></div>
      <div id="touch-btns">
        <button class="tbtn tbtn-e" data-key="KeyE">E<span>لصقة</span></button>
        <button class="tbtn tbtn-f" data-key="KeyF">F<span>درون</span></button>
        <button class="tbtn tbtn-space" data-key="Space">▲</button>
        <button class="tbtn tbtn-c" data-key="KeyC">▼</button>
      </div>
      <button id="tbtn-pause" class="tbtn">⏸</button>
    `;
    document.body.appendChild(el);
    this.el = el;

    this.joyBase  = el.querySelector('#joy-base');
    this.joyThumb = el.querySelector('#joy-thumb');
    this.joyZone  = el.querySelector('#joy-zone');
    this.lookZone = el.querySelector('#look-zone');
  }

  _bind() {
    const jz = this.joyZone;
    const lz = this.lookZone;

    // Joystick
    jz.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (this.joystickTouchId === null) {
          this.joystickTouchId = t.identifier;
          const r = jz.getBoundingClientRect();
          this.joystickOrigin = { x: t.clientX, y: t.clientY };
          this.joyBase.style.left = (t.clientX - r.left - 48) + 'px';
          this.joyBase.style.top  = (t.clientY - r.top  - 48) + 'px';
          this.joyBase.style.opacity = '1';
        }
      }
    }, { passive: false });

    jz.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this.joystickTouchId) {
          const dx = t.clientX - this.joystickOrigin.x;
          const dy = t.clientY - this.joystickOrigin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxR = 44;
          const clamped = dist > maxR ? maxR / dist : 1;
          this.joystickPos = { x: dx * clamped, y: dy * clamped };
          this.joyThumb.style.transform = `translate(${this.joystickPos.x}px, ${this.joystickPos.y}px)`;
        }
      }
    }, { passive: false });

    const endJoy = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.joystickPos = { x: 0, y: 0 };
          this.joyThumb.style.transform = 'translate(0,0)';
          this.joyBase.style.opacity = '0.4';
        }
      }
    };
    jz.addEventListener('touchend', endJoy, { passive: false });
    jz.addEventListener('touchcancel', endJoy, { passive: false });

    // Look zone
    lz.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (this.lookTouchId === null) {
          this.lookTouchId = t.identifier;
          this.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });

    lz.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.dx += (t.clientX - this.lookLast.x);
          this.dy += (t.clientY - this.lookLast.y);
          this.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });

    const endLook = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };
    lz.addEventListener('touchend', endLook, { passive: false });
    lz.addEventListener('touchcancel', endLook, { passive: false });

    // Action buttons
    this.el.querySelectorAll('.tbtn[data-key]').forEach(btn => {
      const key = btn.dataset.key;
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        this._pendingKeys[key] = true;
        this._pendingPressed[key] = true;
        btn.classList.add('active');
      }, { passive: false });
      const up = e => {
        e.preventDefault();
        this._pendingKeys[key] = false;
        btn.classList.remove('active');
      };
      btn.addEventListener('touchend', up, { passive: false });
      btn.addEventListener('touchcancel', up, { passive: false });
    });

    // Pause
    document.getElementById('tbtn-pause').addEventListener('touchstart', e => {
      e.preventDefault();
      this._pendingPressed['Escape'] = true;
    }, { passive: false });
  }

  apply(keyboard, mouse) {
    if (!this.active) return;

    // Inject look deltas
    mouse.dx += this.dx;
    mouse.dy += this.dy;
    this.dx = 0;
    this.dy = 0;

    // Inject joystick as WASD
    const deadzone = 10;
    const jx = this.joystickPos.x;
    const jy = this.joystickPos.y;

    keyboard.keys['KeyW'] = jy < -deadzone;
    keyboard.keys['KeyS'] = jy >  deadzone;
    keyboard.keys['KeyA'] = jx < -deadzone;
    keyboard.keys['KeyD'] = jx >  deadzone;

    // Inject action keys
    for (const k of Object.keys(this._pendingKeys)) {
      keyboard.keys[k] = this._pendingKeys[k];
    }

    // Inject pressed (one-frame)
    for (const k of Object.keys(this._pendingPressed)) {
      keyboard.pressed[k] = true;
    }
    this._pendingPressed = {};
  }

  show() {
    this.active = true;
    this.el.style.display = 'block';
  }

  hide() {
    this.active = false;
    this.el.style.display = 'none';
    this.joystickTouchId = null;
    this.lookTouchId = null;
    this.joystickPos = { x: 0, y: 0 };
    this.dx = 0;
    this.dy = 0;
  }

  static isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  }
};
