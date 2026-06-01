window.GuardAI = {
  update(guard, dt) {
    const player = window.GAME?.player;
    const playerPos = player?.pos;

    switch (guard.state) {
      case 'patrol': {
        const target = guard.patrolPoints[guard.patrolIndex];
        const targetVec = new THREE.Vector3(target[0], guard.pos.y, target[2]);
        const dir = new THREE.Vector3().subVectors(targetVec, guard.pos);
        const dist = dir.length();

        if (dist < 0.5) {
          guard.patrolIndex = (guard.patrolIndex + 1) % guard.patrolPoints.length;
        } else {
          dir.normalize();
          guard.pos.x += dir.x * guard.speed * dt;
          guard.pos.z += dir.z * guard.speed * dt;
          guard.yaw = Math.atan2(dir.x, dir.z);
        }

        if (playerPos && this.canSeePlayer(guard, playerPos)) {
          guard.state = 'suspicious';
          guard.alertLevel = 0.3;
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
          } else {
            guard.lostTimer = (guard.lostTimer || 0) + dt;
            if (guard.lostTimer >= 5) {
              guard.state = 'search';
              guard.searchTimer = 0;
              break;
            }
          }

          const dir = new THREE.Vector3().subVectors(playerPos, guard.pos);
          const dist = dir.length();

          if (dist < 1.5) {
            player.takeDamage();
          } else {
            dir.normalize();
            guard.pos.x += dir.x * guard.speed * 1.5 * dt;
            guard.pos.z += dir.z * guard.speed * 1.5 * dt;
            guard.yaw = Math.atan2(dir.x, dir.z);
          }
        } else {
          guard.lostTimer = (guard.lostTimer || 0) + dt;
          if (guard.lostTimer >= 5) {
            guard.state = 'search';
            guard.searchTimer = 0;
          }
        }
        break;
      }

      case 'search': {
        const dest = guard.lastKnownPlayerPos;
        if (dest) {
          const dir = new THREE.Vector3().subVectors(dest, guard.pos);
          const dist = dir.length();

          if (dist > 0.5) {
            dir.normalize();
            guard.pos.x += dir.x * guard.speed * dt;
            guard.pos.z += dir.z * guard.speed * dt;
            guard.yaw = Math.atan2(dir.x, dir.z);
          } else {
            guard.searchTimer = (guard.searchTimer || 0) + dt;
            if (guard.searchTimer >= 4) {
              guard.state = 'patrol';
              guard.searchTimer = 0;
              guard.lostTimer = 0;
            }
          }
        } else {
          guard.searchTimer = (guard.searchTimer || 0) + dt;
          if (guard.searchTimer >= 4) {
            guard.state = 'patrol';
            guard.searchTimer = 0;
            guard.lostTimer = 0;
          }
        }
        break;
      }
    }
  },

  canSeePlayer(guard, playerPos) {
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
