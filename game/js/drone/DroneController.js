window.DroneController = class DroneController {
  constructor(drone, keyboard, gamepad) {
    this.drone = drone;
    this.keyboard = keyboard;
    this.gamepad = gamepad;
    this.active = false;
    this.yaw = 0;
  }

  activate() {
    this.active = true;
    if (this.drone.mesh) {
      this.drone.mesh.visible = false;
    }
  }

  deactivate() {
    this.active = false;
    if (this.drone.mesh) {
      this.drone.mesh.visible = true;
    }
  }

  update(dt) {
    if (!this.active || !this.drone.alive) return;

    const kb = this.keyboard;
    const speed = CONFIG.DRONE_SPEED;
    const yawSpeed = Math.PI;

    let moveX = 0;
    let moveY = 0;
    let moveZ = 0;
    let yawDelta = 0;

    if (kb.isDown(kb.KEYS.Q)) yawDelta += yawSpeed * dt;
    if (kb.isDown(kb.KEYS.E)) yawDelta -= yawSpeed * dt;

    this.yaw += yawDelta;

    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    if (kb.isDown(kb.KEYS.W)) {
      moveX += forward.x;
      moveZ += forward.z;
    }
    if (kb.isDown(kb.KEYS.S)) {
      moveX -= forward.x;
      moveZ -= forward.z;
    }
    if (kb.isDown(kb.KEYS.D)) {
      moveX += right.x;
      moveZ += right.z;
    }
    if (kb.isDown(kb.KEYS.A)) {
      moveX -= right.x;
      moveZ -= right.z;
    }

    if (kb.isDown(kb.KEYS.SPACE)) moveY += 1;
    if (kb.isDown(kb.KEYS.C) || kb.isDown(kb.KEYS.SHIFT)) moveY -= 1;

    if (this.gamepad && this.gamepad.isConnected()) {
      const gp = this.gamepad;

      const lx = gp.axis(gp.AXIS.LX);
      const ly = gp.axis(gp.AXIS.LY);
      const rx = gp.axis(gp.AXIS.RX);
      const ry = gp.axis(gp.AXIS.RY);

      moveX += forward.x * (-ly) + right.x * lx;
      moveZ += forward.z * (-ly) + right.z * lx;

      moveY += -ry;

      this.yaw += -rx * yawSpeed * dt;
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 1) {
      moveX /= len;
      moveZ /= len;
    }

    this.drone.move(moveX * speed * dt, moveY * speed * dt, moveZ * speed * dt);
    this.drone.clampAltitude();
    this.drone.update(dt);
  }

  getYaw() {
    return this.yaw;
  }

  setYaw(y) {
    this.yaw = y;
  }
};
