window.Drone = class Drone {
  constructor(scene, spawnPos) {
    this.scene = scene;
    this.pos = spawnPos.clone();
    this.vel = new THREE.Vector3();
    this.rotation = new THREE.Euler();
    this.speed = CONFIG.DRONE_SPEED;
    this.battery = CONFIG.DRONE_BATTERY;
    this.alive = true;
    this.deployed = false;
    this.mesh = window.AssetLoader ? new AssetLoader().createDroneMesh() : new THREE.Group();
    this.mesh.position.copy(this.pos);
    this.scene.add(this.mesh);
    this.rotorAngle = 0;
  }

  update(dt) {
    this.battery -= dt;
    if (this.battery <= 0) {
      this.alive = false;
    }

    this.pos.add(this.vel.clone().multiplyScalar(dt));
    this.mesh.position.copy(this.pos);

    this.rotorAngle += dt * 20;
    const rotorIndices = [2, 4, 6, 8];
    for (let i = 0; i < rotorIndices.length; i++) {
      const rotor = this.mesh.children[rotorIndices[i]];
      if (rotor) {
        rotor.rotation.y = this.rotorAngle;
      }
    }

    const speed = this.vel.length();
    if (speed > 0.001) {
      const tiltAmount = Math.min(speed * 0.1, 0.3);
      this.mesh.rotation.x = (this.vel.z / (speed + 0.001)) * -tiltAmount;
      this.mesh.rotation.z = (this.vel.x / (speed + 0.001)) * -tiltAmount;
    } else {
      this.mesh.rotation.x = 0;
      this.mesh.rotation.z = 0;
    }

    this.vel.multiplyScalar(0.92);
  }

  move(dx, dy, dz) {
    this.vel.x += dx;
    this.vel.y += dy;
    this.vel.z += dz;
  }

  clampAltitude() {
    this.pos.y = Math.max(0.5, Math.min(this.pos.y, CONFIG.DRONE_MAX_ALTITUDE));
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.alive = false;
  }

  getBatteryPercent() {
    return Math.max(0, (this.battery / CONFIG.DRONE_BATTERY) * 100);
  }

  getDistanceTo(pos) {
    return this.pos.distanceTo(pos);
  }
};
