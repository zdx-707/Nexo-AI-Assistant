window.StealthSystem = class StealthSystem {
  constructor(events) {
    this.events = events;
    this.noiseLevel = 0;
    this.lightLevel = 0.5;
    this.detectionScore = 0;
  }

  update(dt, player, guards, location) {
    let targetNoise = 0;
    const speed = Math.sqrt(
      player.vel ? (player.vel.x * player.vel.x + player.vel.z * player.vel.z) : 0
    );
    const isMoving =
      player.pos &&
      this._lastPos &&
      (Math.abs(player.pos.x - this._lastPos.x) > 0.001 ||
        Math.abs(player.pos.z - this._lastPos.z) > 0.001);

    if (player.crouching) {
      targetNoise = isMoving ? 10 : 0;
    } else if (speed > 6 || (player.speed && player.speed * 1.7 > 6 && isMoving && player._sprinting)) {
      targetNoise = 70;
    } else if (isMoving) {
      targetNoise = 30;
    } else {
      targetNoise = 0;
    }

    if (!isMoving && !player.crouching) {
      targetNoise = 0;
    }

    this._lastPos = player.pos ? { x: player.pos.x, z: player.pos.z } : this._lastPos;

    const prevNoise = this.noiseLevel;
    this.noiseLevel = Utils.lerp(this.noiseLevel, targetNoise, Math.min(1, dt * 5));

    if (Math.abs(this.noiseLevel - prevNoise) > 10) {
      this.events.emit('noiseChanged', this.noiseLevel);
    }

    for (const guard of guards) {
      const hearRange = CONFIG.GUARD_HEAR_RANGE * (this.noiseLevel / 100);
      if (guard.distanceTo(player.pos) < hearRange) {
        guard.setAlert(Math.min(1, guard.alertLevel + 0.3));
      }
    }

    if (player.disguise && typeof player.disguise.update === 'function') {
      player.disguise.update(dt, guards);
    }

    for (const guard of guards) {
      this.detectionScore += guard.alertLevel * dt;
    }
  }

  getNoiseLevel() {
    return this.noiseLevel;
  }

  getDetectionScore() {
    return this.detectionScore;
  }

  reset() {
    this.noiseLevel = 0;
    this.lightLevel = 0.5;
    this.detectionScore = 0;
    this._lastPos = null;
  }
};
