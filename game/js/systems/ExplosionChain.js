window.ExplosionChain = class ExplosionChain {
  constructor(scene, events) {
    this.scene = scene;
    this.events = events;
    this.chainRadius = CONFIG.DRONE_EXPLOSION_RADIUS * 2;
    this.pendingChains = [];

    this._onTargetDestroyed = (data) => this.checkChain(data);
    this.events.on('targetDestroyed', this._onTargetDestroyed);
  }

  checkChain(destroyedData) {
    const location = window.GAME && window.GAME.currentLocation;
    if (!location || !location.targets) return;

    const volatileTypes = new Set([
      'explosive_storage',
      'fuel_tank',
      'ammo_rack',
      'fuel_line',
      'gas_valve',
      'storage_tank',
    ]);

    const destroyedPos = destroyedData.pos;
    const added = [];

    for (let i = 0; i < location.targets.length; i++) {
      const target = location.targets[i];
      if (!target || target.destroyed) continue;
      if (!volatileTypes.has(target.type)) continue;

      const alreadyPending = this.pendingChains.some((c) => c.target === target);
      if (alreadyPending) continue;

      if (Utils.dist3(destroyedPos, target.pos) <= this.chainRadius) {
        const entry = {
          target: target,
          delay: 1.0 + Math.random() * 1.5,
          timer: 0,
        };
        this.pendingChains.push(entry);
        added.push(entry);
      }
    }

    if (added.length > 0) {
      this.events.emit('chainReactionStart', { count: this.pendingChains.length });
    }
  }

  update(dt) {
    for (let i = this.pendingChains.length - 1; i >= 0; i--) {
      const chain = this.pendingChains[i];
      chain.timer += dt;

      if (chain.timer >= chain.delay) {
        this.pendingChains.splice(i, 1);

        const target = chain.target;
        if (target.destroyed) continue;

        const pos = target.pos.clone();

        target.destroy();

        const particles = [];
        const colors = [0xff4400, 0xff2200, 0xff8800, 0xffcc00, 0xffffff];

        for (let p = 0; p < 12; p++) {
          const color = colors[p % colors.length];
          const size = Utils.rand(0.06, 0.18);
          const geo = new THREE.SphereGeometry(size, 5, 5);
          const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.copy(pos);
          mesh.userData.velocity = new THREE.Vector3(
            Utils.rand(-1, 1),
            Utils.rand(0.1, 1),
            Utils.rand(-1, 1)
          ).normalize().multiplyScalar(Utils.rand(1.0, 3.5));
          particles.push(mesh);
          this.scene.add(mesh);
        }

        const ringGeo = new THREE.RingGeometry(0.04, 0.16, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xff8800,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = -Math.PI / 2;
        ring.userData.isRing = true;
        ring.userData.velocity = new THREE.Vector3(0, 0, 0);
        this.scene.add(ring);
        particles.push(ring);

        const light = new THREE.PointLight(0xff5500, 3, this.chainRadius * 3);
        light.position.copy(pos);
        this.scene.add(light);

        const scene = this.scene;
        const startTime = performance.now();
        const duration = 0.5;

        function step(now) {
          const elapsed = (now - startTime) / 1000;
          const t = Math.min(elapsed / duration, 1);

          for (let j = 0; j < particles.length; j++) {
            const part = particles[j];
            if (part.userData.isRing) {
              const s = 1 + t * 10;
              part.scale.set(s, s, 1);
              part.material.opacity = Utils.smoothstep(1, 0, t);
            } else {
              if (part.userData.velocity) {
                part.position.addScaledVector(part.userData.velocity, 0.016);
              }
              const s = 1 + t * 1.5;
              part.scale.set(s, s, s);
              part.material.opacity = Utils.smoothstep(1, 0, t * 1.3);
            }
          }

          light.intensity = 3 * (1 - t);

          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            for (let j = 0; j < particles.length; j++) {
              scene.remove(particles[j]);
              particles[j].geometry.dispose();
              particles[j].material.dispose();
            }
            scene.remove(light);
          }
        }

        requestAnimationFrame(step);
      }
    }
  }

  getChainCount() {
    return this.pendingChains.length;
  }

  cancel() {
    this.pendingChains = [];
  }
};
