window.PlayerAnimator = class PlayerAnimator {
  constructor(camera) {
    this.camera = camera;
    this.bobTimer = 0;
    this.bobAmount = 0.05;
    this.bobSpeed = 6;
    this.currentBob = 0;
    this.swayOffset = new THREE.Vector3();
    this.baseY = camera.position.y;
    this._baseYSet = false;
    this._landImpulse = 0;
    this._interactSway = 0;
  }

  update(dt, isMoving, speed, isCrouching) {
    if (!this._baseYSet) {
      this.baseY = this.camera.position.y;
      this._baseYSet = true;
    }

    if (isMoving) {
      this.bobTimer += dt * this.bobSpeed * (speed / 5);
      const targetBob = Math.sin(this.bobTimer) * this.bobAmount;
      this.currentBob = Utils.lerp(this.currentBob, targetBob, 0.15);
    } else {
      this.currentBob = Utils.lerp(this.currentBob, 0, 0.15);
    }

    if (this._landImpulse !== 0) {
      this.currentBob = Utils.lerp(this.currentBob, this._landImpulse, 0.3);
      this._landImpulse = Utils.lerp(this._landImpulse, 0, 0.2);
      if (Math.abs(this._landImpulse) < 0.001) {
        this._landImpulse = 0;
      }
    }

    if (this._interactSway !== 0) {
      this._interactSway = Utils.lerp(this._interactSway, 0, 0.25);
      if (Math.abs(this._interactSway) < 0.001) {
        this._interactSway = 0;
      }
    }

    this.camera.position.y = this.baseY + this.currentBob + this._interactSway;

    if (isCrouching) {
      const crouchSway = new THREE.Quaternion();
      crouchSway.setFromEuler(new THREE.Euler(0, 0, Math.sin(this.bobTimer * 0.5) * 0.02));
      this.camera.quaternion.slerp(crouchSway, 0.05);
    } else {
      const neutral = new THREE.Quaternion();
      neutral.setFromEuler(new THREE.Euler(
        this.camera.rotation.x,
        this.camera.rotation.y,
        0
      ));
      this.camera.quaternion.slerp(neutral, 0.1);
    }
  }

  landEffect() {
    this._landImpulse = -0.08;
  }

  interactEffect() {
    this._interactSway = 0.03;
    setTimeout(() => {
      this._interactSway = -0.03;
    }, 80);
  }

  setBaseY(y) {
    this.baseY = y;
  }
};
