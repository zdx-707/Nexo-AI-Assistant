window.AlienGuard = class AlienGuard {
  constructor(scene, pos, patrolPoints) {
    this.id = Utils.uuid();
    this.scene = scene;
    this.pos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    this.patrolPoints = patrolPoints;
    this.patrolIndex = 0;
    this.yaw = 0;
    this.speed = 2.5;
    this.state = 'patrol';
    this.alertLevel = 0;
    this.target = null;
    this.alive = true;
    this.mesh = new AssetLoader().createGuardMesh();
    this.mesh.position.copy(this.pos);
    scene.add(this.mesh);
  }

  update(dt) {
    if (!this.alive) return;
    if (window.GuardAI) {
      window.GuardAI.update(this, dt);
      return;
    }
    if (!this.patrolPoints || this.patrolPoints.length === 0) return;
    const pt = this.patrolPoints[this.patrolIndex];
    const target = new THREE.Vector3(pt[0], pt[1], pt[2]);
    const dist = this.pos.distanceTo(target);
    if (dist < 0.2) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
    } else {
      this.moveTo(target, dt);
    }
  }

  setAlert(level) {
    this.alertLevel = Utils.clamp(level, 0, 1);
    if (this.alertLevel === 0) {
      this.state = 'patrol';
    } else if (this.alertLevel < 0.5) {
      this.state = 'suspicious';
    } else {
      this.state = 'alert';
    }
  }

  isAlerted() {
    return this.alertLevel >= 0.5;
  }

  isSuspicious(playerPos) {
    const range = CONFIG.GUARD_SIGHT_RANGE;
    const halfAngle = Utils.deg2rad(CONFIG.GUARD_SIGHT_ANGLE / 2);
    const dist = this.pos.distanceTo(playerPos);
    if (dist > range) return false;
    const dx = playerPos.x - this.pos.x;
    const dz = playerPos.z - this.pos.z;
    const angleToPlayer = Math.atan2(dx, dz);
    const diff = Math.abs(Utils.normalizeAngle(angleToPlayer - this.yaw));
    return diff <= halfAngle;
  }

  lookAt(targetPos) {
    const dx = targetPos.x - this.pos.x;
    const dz = targetPos.z - this.pos.z;
    this.yaw = Math.atan2(dx, dz);
    if (this.mesh) {
      this.mesh.rotation.y = this.yaw;
    }
  }

  moveTo(targetPos, dt) {
    const dx = targetPos.x - this.pos.x;
    const dz = targetPos.z - this.pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.001) return;
    const step = this.speed * dt;
    const ratio = Math.min(step / dist, 1);
    this.pos.x += dx * ratio;
    this.pos.z += dz * ratio;
    this.yaw = Math.atan2(dx, dz);
    if (this.mesh) {
      this.mesh.position.copy(this.pos);
      this.mesh.rotation.y = this.yaw;
    }
  }

  distanceTo(pos) {
    return this.pos.distanceTo(pos);
  }
};
