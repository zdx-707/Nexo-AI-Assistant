window.Disguise = class Disguise {
  constructor(player) {
    this.player = player;
    this.active = true;
    this.quality = 1.0;
    this.suspicion = 0;
    this.exposedTimer = 0;
    this.blownCooldown = 30;
  }

  update(dt, nearbyGuards) {
    let guardsNearby = false;

    for (const guard of nearbyGuards) {
      const dist = Utils.distance(this.player.pos, guard.pos);
      if (dist <= CONFIG.GUARD_SIGHT_RANGE) {
        if (guard.alertLevel > 0.5 && guard.isSuspicious(this.player.pos)) {
          guardsNearby = true;
          this.suspicion += CONFIG.DISGUISE_SUSPICION_RATE * dt * guard.alertLevel * 100;
        }
      }
    }

    if (!guardsNearby) {
      this.suspicion -= 2 * dt;
    }

    this.suspicion = Math.max(0, Math.min(100, this.suspicion));

    if (this.suspicion >= 100 && this.active) {
      this.active = false;
      if (window.GAME?.events) window.GAME.events.emit('disguiseBroken');
    }

    if (!this.active) {
      this.exposedTimer += dt;
    }
  }

  isActive() {
    return this.active;
  }

  getSuspicion() {
    return this.suspicion;
  }

  restore() {
    if (this.exposedTimer >= this.blownCooldown) {
      this.active = true;
      this.quality = 1.0;
      this.suspicion = 0;
      this.exposedTimer = 0;
    }
  }

  forceBreak() {
    this.suspicion = 100;
    this.active = false;
    this.exposedTimer = 0;
    if (window.GAME?.events) window.GAME.events.emit('disguiseBroken');
  }

  reset() {
    this.suspicion = 0;
    this.active = true;
    this.quality = 1.0;
    this.exposedTimer = 0;
  }
};
