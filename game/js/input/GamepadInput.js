window.GamepadInput = class GamepadInput {
  constructor() {
    this.gamepad = null;
    this.deadzone = 0.15;

    this.AXIS = {
      LX: 0,
      LY: 1,
      RX: 2,
      RY: 3,
    };

    this.BUTTON = {
      A:      0,
      B:      1,
      X:      2,
      Y:      3,
      LB:     4,
      RB:     5,
      LT:     6,
      RT:     7,
      SELECT: 8,
      START:  9,
      L3:     10,
      R3:     11,
      UP:     12,
      DOWN:   13,
      LEFT:   14,
      RIGHT:  15,
    };

    window.addEventListener('gamepadconnected', (e) => {
      this.gamepad = e.gamepad;
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepad = null;
    });
  }

  update() {
    const pads = navigator.getGamepads();
    this.gamepad = (pads && pads[0]) ? pads[0] : null;
  }

  axis(index) {
    if (!this.gamepad) return 0;
    const raw = this.gamepad.axes[index] || 0;
    if (Math.abs(raw) < this.deadzone) return 0;
    const sign = raw < 0 ? -1 : 1;
    const scaled = (Math.abs(raw) - this.deadzone) / (1 - this.deadzone);
    return sign * Math.min(1, Math.max(0, scaled));
  }

  button(index) {
    if (!this.gamepad || !this.gamepad.buttons[index]) {
      return { pressed: false, value: 0 };
    }
    const btn = this.gamepad.buttons[index];
    return { pressed: btn.pressed, value: btn.value };
  }

  isConnected() {
    return this.gamepad !== null;
  }
};
