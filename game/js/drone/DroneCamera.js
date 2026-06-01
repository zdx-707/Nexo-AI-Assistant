window.DroneCamera = class DroneCamera {
  constructor(camera, drone) {
    this.camera = camera;
    this.drone = drone;
    this.yaw = 0;
    this.pitch = -20;
    this.mode = 'fpv';
  }

  update(dt, mouseDx, mouseDy) {
    this.yaw += mouseDx * 0.003;
    this.pitch += mouseDy * 0.002;
    this.pitch = Math.max(-80, Math.min(10, this.pitch));

    const pitchRadFinal = THREE.MathUtils.degToRad(this.pitch);
    const yawRadFinal = this.yaw;

    if (this.mode === 'fpv') {
      this.camera.position.copy(this.drone.pos);
      this.camera.rotation.set(pitchRadFinal, yawRadFinal, 0, 'YXZ');
    } else {
      const backward = new THREE.Vector3(
        Math.sin(yawRadFinal),
        0,
        Math.cos(yawRadFinal)
      );
      this.camera.position.copy(this.drone.pos)
        .addScaledVector(backward, 5)
        .add(new THREE.Vector3(0, 2, 0));
      this.camera.lookAt(this.drone.pos);
    }
  }

  toggleMode() {
    this.mode = this.mode === 'fpv' ? 'chase' : 'fpv';
  }

  getMode() {
    return this.mode;
  }

  detach() {
    this.camera.position.set(0, 0, 0);
    this.camera.rotation.set(0, 0, 0);
    this.camera.quaternion.identity();
  }
};
