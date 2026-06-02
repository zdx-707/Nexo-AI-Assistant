window.GuardAI = {
  update(guard, dt) {
    const player = window.GAME?.player;
    const playerPos = player?.pos;

    this.checkHearing(guard, playerPos);

    switch (guard.state) {
      case 'patrol': {
        const target = guard.patrolPoints[guard.patrolIndex];
        const targetVec = new THREE.Vector3(target[0], guard.pos.y, target[2]);
        const dir = new THREE.Vector3().subVectors(targetVec, guard.pos);
        const dist = dir.length();

        if (dist < 0.5) {
          guard.patrolIndex = (guard.patrolIndex + 1) % guard.patrolPoints.length;
          guard.path = [];
        } else {
          if (!guard.path || guard.path.length === 0) {
            this.recalcPath(guard, targetVec);
          }
          this.moveAlongPath(guard, dt, guard.speed);
        }

        if (playerPos && this.canSeePlayer(guard, playerPos)) {
          guard.state = 'suspicious';
          guard.alertLevel = Math.max(guard.alertLevel || 0, 0.3);
          guard.lostTimer = 0;
        }
        break;
      }

      case 'suspicious': {
        if (playerPos) {
          const dir = new THREE.Vector3().subVectors(playerPos, guard.pos);
          if (dir.lengthSq() > 0) {
            guard.yaw = Math.atan2(dir.x, dir.z);
          }
        }

        if (playerPos && this.canSeePlayer(guard, playerPos)) {
          guard.lostTimer = 0;
          guard.alertLevel += 1.5 * dt;
          if (guard.alertLevel >= 1) {
            guard.state = 'alert';
            if (window.GAME?.events) {
              window.GAME.events.emit('guardAlert', guard);
            }
          }
        } else {
          guard.lostTimer = (guard.lostTimer || 0) + dt;
          guard.alertLevel = Utils.clamp(guard.alertLevel - dt * 0.3, 0, 1);
          if (guard.lostTimer >= 3) {
            guard.state = 'patrol';
            guard.alertLevel = 0;
            guard.lostTimer = 0;
          }
        }
        break;
      }

      case 'alert': {
        if (playerPos) {
          guard.lastKnownPlayerPos = playerPos.clone();
        }
        guard.path = [];
        guard.state = 'chase';
        guard.lostTimer = 0;
        if (window.GAME?.events) {
          window.GAME.events.emit('alarmTriggered', guard);
        }
        break;
      }

      case 'chase': {
        if (playerPos) {
          const canSee = this.canSeePlayer(guard, playerPos);
          if (canSee) {
            guard.lastKnownPlayerPos = playerPos.clone();
            guard.lostTimer = 0;
            guard.path = [];
          } else {
            guard.lostTimer = (guard.lostTimer || 0) + dt;
            if (guard.lostTimer >= 5) {
              guard.state = 'search';
              guard.searchTimer = 0;
              guard.path = [];
              break;
            }
          }

          const dist = guard.pos.distanceTo(playerPos);

          if (dist < 1.5) {
            player.takeDamage();
          } else {
            if (canSee) {
              if (!guard.path || guard.path.length === 0) {
                this.recalcPath(guard, playerPos);
              }
            } else if (guard.lastKnownPlayerPos && (!guard.path || guard.path.length === 0)) {
              this.recalcPath(guard, guard.lastKnownPlayerPos);
            }
            this.moveAlongPath(guard, dt, guard.speed * 1.5);
          }
        } else {
          guard.lostTimer = (guard.lostTimer || 0) + dt;
          if (guard.lostTimer >= 5) {
            guard.state = 'search';
            guard.searchTimer = 0;
            guard.path = [];
          }
        }
        break;
      }

      case 'search': {
        const dest = guard.lastKnownPlayerPos;
        if (dest) {
          if (!guard.path || guard.path.length === 0) {
            this.recalcPath(guard, dest);
          }

          const distToDest = guard.pos.distanceTo(dest);
          if (distToDest > 0.5) {
            this.moveAlongPath(guard, dt, guard.speed);
          } else {
            guard.searchTimer = (guard.searchTimer || 0) + dt;
            if (guard.searchTimer >= 4) {
              guard.state = 'patrol';
              guard.searchTimer = 0;
              guard.lostTimer = 0;
              guard.path = [];
            }
          }
        } else {
          guard.searchTimer = (guard.searchTimer || 0) + dt;
          if (guard.searchTimer >= 4) {
            guard.state = 'patrol';
            guard.searchTimer = 0;
            guard.lostTimer = 0;
            guard.path = [];
          }
        }

        if (playerPos && this.canSeePlayer(guard, playerPos)) {
          guard.lastKnownPlayerPos = playerPos.clone();
          guard.state = 'chase';
          guard.lostTimer = 0;
          guard.path = [];
        }
        break;
      }
    }
  },

  checkHearing(guard, playerPos) {
    const noiseLevel = window.GAME?.stealthSystem?.noiseLevel || 0;
    if (noiseLevel <= 30 || !playerPos) return;

    const hearRange = CONFIG.GUARD_HEAR_RANGE * (noiseLevel / 100);
    const dist = guard.pos.distanceTo(playerPos);
    if (dist > hearRange) return;

    const increase = (1 - dist / hearRange) * (noiseLevel / 100) * 0.5;
    guard.alertLevel = Utils.clamp((guard.alertLevel || 0) + increase, 0, 1);

    if (guard.state === 'patrol' && guard.alertLevel >= 0.3) {
      guard.state = 'suspicious';
      guard.lostTimer = 0;
    }
  },

  recalcPath(guard, destWorldPos) {
    guard.path = window.GAME?.pathGrid?.findPath(guard.pos, destWorldPos) || [];
    guard.pathTarget = 0;
  },

  moveAlongPath(guard, dt, speed) {
    if (guard.path && guard.path.length > 0) {
      const wp = guard.path[guard.pathTarget];
      if (!wp) {
        guard.path = [];
        return;
      }

      const dx = wp.x - guard.pos.x;
      const dz = wp.z - guard.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.5) {
        guard.pathTarget++;
        if (guard.pathTarget >= guard.path.length) {
          guard.path = [];
        }
      } else {
        const inv = 1 / dist;
        guard.pos.x += dx * inv * speed * dt;
        guard.pos.z += dz * inv * speed * dt;
        guard.yaw = Math.atan2(dx, dz);
      }
    }
  },

  canSeePlayer(guard, playerPos) {
    if (guard.sightCone) {
      return guard.sightCone.checkLoS(guard.pos, playerPos, window.GAME?.scene?.children || []);
    }

    const dist = Utils.dist2(guard.pos, playerPos);
    if (dist >= CONFIG.GUARD_SIGHT_RANGE) return false;

    const dx = playerPos.x - guard.pos.x;
    const dz = playerPos.z - guard.pos.z;
    const angleToPlayer = Math.atan2(dx, dz);
    const guardForward = guard.yaw;
    let delta = angleToPlayer - guardForward;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;

    const halfFov = Utils.deg2rad(CONFIG.GUARD_SIGHT_ANGLE / 2);
    return Math.abs(delta) < halfFov;
  }
};
