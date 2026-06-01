window.DroneExplosion = class DroneExplosion {
  constructor(scene) {
    this.scene = scene;
  }

  detonate(drone, targets, onHit) {
    const center = drone.pos.clone();
    const radius = CONFIG.DRONE_EXPLOSION_RADIUS;
    const hitIds = [];

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      if (Utils.dist3(center, t.pos) <= radius) {
        hitIds.push(t.id);
        onHit(t.id);
      }
    }

    const particles = [];
    const colors = [0xff6600, 0xff3300, 0xff9900, 0xffcc00, 0xff2200];
    for (let i = 0; i < 20; i++) {
      const color = colors[i % colors.length];
      const p = this._createParticle(center, color);
      p.userData.velocity = new THREE.Vector3(
        Utils.rand(-1, 1),
        Utils.rand(0.2, 1),
        Utils.rand(-1, 1)
      ).normalize().multiplyScalar(Utils.rand(1.5, 4.5));
      particles.push(p);
      this.scene.add(p);
    }

    const ringGeo = new THREE.RingGeometry(0.05, 0.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(center);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    particles.push(ring);
    ring.userData.isRing = true;
    ring.userData.velocity = new THREE.Vector3(0, 0, 0);

    const light = new THREE.PointLight(0xff6600, 4, radius * 4);
    light.position.copy(center);
    this.scene.add(light);

    this._animateExplosion(particles, light, 0.6);

    setTimeout(() => {
      this.scene.remove(light);
    }, 300);

    drone.destroy();

    return hitIds;
  }

  _createParticle(pos, color) {
    const size = Utils.rand(0.08, 0.25);
    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    return mesh;
  }

  _animateExplosion(particles, light, duration) {
    const startTime = performance.now();
    const scene = this.scene;

    function step(now) {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.userData.isRing) {
          const ringScale = 1 + t * 12;
          p.scale.set(ringScale, ringScale, 1);
          p.material.opacity = Utils.smoothstep(1, 0, t);
        } else {
          if (p.userData.velocity) {
            const dt = 0.016;
            p.position.addScaledVector(p.userData.velocity, dt);
          }
          const scaleVal = 1 + t * 1.8;
          p.scale.set(scaleVal, scaleVal, scaleVal);
          p.material.opacity = Utils.smoothstep(1, 0, t * 1.2);
        }
      }

      if (light) {
        light.intensity = 4 * (1 - t);
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        for (let i = 0; i < particles.length; i++) {
          scene.remove(particles[i]);
          particles[i].geometry.dispose();
          particles[i].material.dispose();
        }
      }
    }

    requestAnimationFrame(step);
  }
};
