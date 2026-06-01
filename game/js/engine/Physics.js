window.Physics = class Physics {
  constructor() {
    this.bodies = [];
    this.gravity = CONFIG.GRAVITY;
  }

  addBody(body) {
    this.bodies.push(body);
  }

  removeBody(id) {
    const idx = this.bodies.findIndex(b => b.id === id);
    if (idx !== -1) this.bodies.splice(idx, 1);
  }

  getBody(id) {
    return this.bodies.find(b => b.id === id) || null;
  }

  update(dt) {
    const statics = this.bodies.filter(b => b.static);
    const dynamics = this.bodies.filter(b => !b.static);

    for (const body of dynamics) {
      body.vel.y += this.gravity * dt;

      body.pos.x += body.vel.x * dt;
      body.pos.y += body.vel.y * dt;
      body.pos.z += body.vel.z * dt;

      const halfH = body.size.h / 2;
      if (body.pos.y - halfH < 0) {
        body.pos.y = halfH;
        body.vel.y = 0;
        body.onGround = true;
      } else {
        body.onGround = false;
      }

      for (const stat of statics) {
        if (!this.checkAABB(body, stat)) continue;

        const overlapX = (body.size.w / 2 + stat.size.w / 2) - Math.abs(body.pos.x - stat.pos.x);
        const overlapY = (body.size.h / 2 + stat.size.h / 2) - Math.abs(body.pos.y - stat.pos.y);
        const overlapZ = (body.size.d / 2 + stat.size.d / 2) - Math.abs(body.pos.z - stat.pos.z);

        if (overlapX <= overlapY && overlapX <= overlapZ) {
          const sign = body.pos.x >= stat.pos.x ? 1 : -1;
          body.pos.x += overlapX * sign;
          body.vel.x = 0;
        } else if (overlapY <= overlapX && overlapY <= overlapZ) {
          const sign = body.pos.y >= stat.pos.y ? 1 : -1;
          body.pos.y += overlapY * sign;
          body.vel.y = 0;
          if (sign > 0) body.onGround = true;
        } else {
          const sign = body.pos.z >= stat.pos.z ? 1 : -1;
          body.pos.z += overlapZ * sign;
          body.vel.z = 0;
        }
      }
    }
  }

  checkAABB(a, b) {
    const ax1 = a.pos.x - a.size.w / 2, ax2 = a.pos.x + a.size.w / 2;
    const ay1 = a.pos.y - a.size.h / 2, ay2 = a.pos.y + a.size.h / 2;
    const az1 = a.pos.z - a.size.d / 2, az2 = a.pos.z + a.size.d / 2;

    const bx1 = b.pos.x - b.size.w / 2, bx2 = b.pos.x + b.size.w / 2;
    const by1 = b.pos.y - b.size.h / 2, by2 = b.pos.y + b.size.h / 2;
    const bz1 = b.pos.z - b.size.d / 2, bz2 = b.pos.z + b.size.d / 2;

    return ax1 < bx2 && ax2 > bx1 &&
           ay1 < by2 && ay2 > by1 &&
           az1 < bz2 && az2 > bz1;
  }

  raycast(origin, dir, maxDist, excludeId) {
    let closest = null;
    let closestDist = maxDist;

    const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    const nd = { x: dir.x / len, y: dir.y / len, z: dir.z / len };

    for (const body of this.bodies) {
      if (body.id === excludeId) continue;

      const minX = body.pos.x - body.size.w / 2;
      const maxX = body.pos.x + body.size.w / 2;
      const minY = body.pos.y - body.size.h / 2;
      const maxY = body.pos.y + body.size.h / 2;
      const minZ = body.pos.z - body.size.d / 2;
      const maxZ = body.pos.z + body.size.d / 2;

      let tmin = -Infinity, tmax = Infinity;

      if (Math.abs(nd.x) < 1e-8) {
        if (origin.x < minX || origin.x > maxX) continue;
      } else {
        const tx1 = (minX - origin.x) / nd.x;
        const tx2 = (maxX - origin.x) / nd.x;
        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
      }

      if (Math.abs(nd.y) < 1e-8) {
        if (origin.y < minY || origin.y > maxY) continue;
      } else {
        const ty1 = (minY - origin.y) / nd.y;
        const ty2 = (maxY - origin.y) / nd.y;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
      }

      if (Math.abs(nd.z) < 1e-8) {
        if (origin.z < minZ || origin.z > maxZ) continue;
      } else {
        const tz1 = (minZ - origin.z) / nd.z;
        const tz2 = (maxZ - origin.z) / nd.z;
        tmin = Math.max(tmin, Math.min(tz1, tz2));
        tmax = Math.min(tmax, Math.max(tz1, tz2));
      }

      if (tmax < 0 || tmin > tmax) continue;

      const t = tmin >= 0 ? tmin : tmax;
      if (t < 0 || t > closestDist) continue;

      closestDist = t;
      closest = body;
    }

    if (!closest) {
      return { hit: false, body: null, distance: 0, point: null };
    }

    return {
      hit: true,
      body: closest,
      distance: closestDist,
      point: {
        x: origin.x + nd.x * closestDist,
        y: origin.y + nd.y * closestDist,
        z: origin.z + nd.z * closestDist
      }
    };
  }

  setVelocity(id, vel) {
    const body = this.getBody(id);
    if (body) {
      body.vel.x = vel.x;
      body.vel.y = vel.y;
      body.vel.z = vel.z;
    }
  }

  addForce(id, force) {
    const body = this.getBody(id);
    if (body) {
      body.vel.x += force.x;
      body.vel.y += force.y;
      body.vel.z += force.z;
    }
  }
};
