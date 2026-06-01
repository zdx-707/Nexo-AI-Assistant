window.MouseInput = class MouseInput {
  constructor(canvas) {
    this.canvas = canvas;
    this.dx = 0;
    this.dy = 0;
    this.buttons = {};
    this.clicked = {};
    this.locked = false;
    this.sensitivity = 0.002;

    this._onMouseMove = (e) => {
      if (this.locked) {
        this.dx += e.movementX;
        this.dy += e.movementY;
      }
    };

    this._onMouseDown = (e) => {
      this.buttons[e.button] = true;
      this.clicked[e.button] = true;
    };

    this._onMouseUp = (e) => {
      this.buttons[e.button] = false;
    };

    this._onPointerLockChange = () => {
      this.locked = document.pointerLockElement === this.canvas;
    };

    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  requestLock() {
    this.canvas.requestPointerLock();
  }

  unlock() {
    document.exitPointerLock();
  }

  update() {
    this.dx = 0;
    this.dy = 0;
    this.clicked = {};
  }

  isDown(btn) {
    return !!this.buttons[btn];
  }

  wasClicked(btn) {
    return !!this.clicked[btn];
  }
};
