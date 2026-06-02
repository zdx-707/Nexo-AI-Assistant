window.Location = class Location {
  constructor(scene, locationType) {
    this.scene = scene;
    this.type = locationType;
    this.name = CONFIG.LOCATION_NAMES[locationType];
    this.difficulty = CONFIG.LOCATION_DIFFICULTY[locationType];
    this.guards = [];
    this.targets = [];
    this.pickups = [];
    this.meshes = [];
    this.loaded = false;
    this.completed = false;
    this.width = 60;
    this.depth = 60;
    this.wallHeight = 8;
    this.loader = new AssetLoader();
  }

  build() {
    const w = this.width;
    const d = this.depth;
    const h = this.wallHeight;
    const DW = 3.5;
    const DH = 2.8;

    // Floor
    const floor = this.loader.createFloor(w, d, this.floorColor || CONFIG.COLORS.FLOOR);
    floor.position.set(0, 0, 0);
    this.scene.add(floor);
    this.meshes.push(floor);

    // Walls — south wall (z=+d/2) split for door opening
    const walls = [
      { s: [w, h, 0.5], p: [0, h / 2, -d / 2] },
      { s: [(w - DW) / 2, h, 0.5], p: [-(w + DW) / 4, h / 2, d / 2] },
      { s: [(w - DW) / 2, h, 0.5], p: [(w + DW) / 4, h / 2, d / 2] },
      { s: [DW, h - DH, 0.5], p: [0, DH + (h - DH) / 2, d / 2] },
      { s: [0.5, h, d], p: [-w / 2, h / 2, 0] },
      { s: [0.5, h, d], p: [w / 2, h / 2, 0] },
    ];
    walls.forEach(({ s, p }) => {
      const wall = this.loader.createBox(s[0], s[1], s[2], this.wallColor || CONFIG.COLORS.WALL);
      wall.position.set(p[0], p[1], p[2]);
      this.scene.add(wall);
      this.meshes.push(wall);
    });

    const ceiling = this.loader.createBox(w, 0.5, d, CONFIG.COLORS.CEILING);
    ceiling.position.set(0, h, 0);
    this.scene.add(ceiling);
    this.meshes.push(ceiling);

    // Ceiling lights grid
    this.addCeilingLights();

    // Interior divider walls
    this.buildInterior();

    this.loaded = true;
  }

  buildInterior() {
    // Subclasses override for custom rooms; base adds a simple corridor divider
  }

  addCeilingLights() {
    const w = this.width;
    const d = this.depth;
    const h = this.wallHeight;
    const cols = Math.floor(w / 14);
    const rows = Math.floor(d / 14);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -w / 2 + 7 + c * 14;
        const z = -d / 2 + 7 + r * 14;
        const light = this.loader.createCeilingLight();
        light.position.set(x, h - 0.1, z);
        this.scene.add(light);
        this.meshes.push(light);
        const pl = new THREE.PointLight(0xddeeff, 0.6, 14);
        pl.position.set(x, h - 0.3, z);
        this.scene.add(pl);
        this.meshes.push(pl);
      }
    }
  }

  addDesk(x, z, yaw = 0) {
    const desk = this.loader.createDesk();
    desk.position.set(x, 0, z);
    desk.rotation.y = yaw;
    this.scene.add(desk);
    this.meshes.push(desk);

    const chair = this.loader.createChair();
    chair.position.set(
      x + Math.sin(yaw) * 0.7,
      0,
      z + Math.cos(yaw) * 0.7
    );
    chair.rotation.y = yaw + Math.PI;
    this.scene.add(chair);
    this.meshes.push(chair);

    const mon = this.loader.createMonitor();
    mon.position.set(
      x - Math.sin(yaw) * 0.3,
      0.78,
      z - Math.cos(yaw) * 0.3
    );
    mon.rotation.y = yaw + Math.PI;
    this.scene.add(mon);
    this.meshes.push(mon);

    const kb = this.loader.createKeyboard();
    kb.position.set(
      x + Math.sin(yaw) * 0.1,
      0.78,
      z + Math.cos(yaw) * 0.1
    );
    kb.rotation.y = yaw;
    this.scene.add(kb);
    this.meshes.push(kb);
  }

  addPartition(x, z, length, horizontal = true) {
    const wall = this.loader.createBox(
      horizontal ? length : 0.12,
      1.6,
      horizontal ? 0.12 : length,
      0x556677
    );
    wall.position.set(x, 0.8, z);
    this.scene.add(wall);
    this.meshes.push(wall);
  }

  addFilingCabinets(x, z, count = 3, yaw = 0) {
    for (let i = 0; i < count; i++) {
      const cab = this.loader.createFilingCabinet();
      cab.position.set(
        x + Math.cos(yaw) * i * 0.6,
        0,
        z + Math.sin(yaw) * i * 0.6
      );
      this.scene.add(cab);
      this.meshes.push(cab);
    }
  }

  addEmployee(x, z, yaw = 0) {
    const mesh = this.loader.createEmployeeMesh();
    mesh.position.set(x, 0, z);
    mesh.rotation.y = yaw;
    this.scene.add(mesh);
    this.meshes.push(mesh);
    // Simple idle bob stored on mesh
    mesh._idlePhase = Math.random() * Math.PI * 2;
    mesh._baseY = 0;
    this._employees = this._employees || [];
    this._employees.push(mesh);
  }

  addTarget(config) {
    const target = new InteractiveTarget(this.scene, config);
    this.targets.push(target);
    return target;
  }

  addGuard(pos, patrolPoints) {
    const guard = new AlienGuard(this.scene, pos, patrolPoints);
    this.guards.push(guard);
    return guard;
  }

  addPickup(pos, type) {
    const pickup = new PickupItem(this.scene, pos, type);
    this.pickups.push(pickup);
  }

  // ── Industrial prop helpers ───────────────────────────────
  addIndustrialTank(x, z, r = 0.9, h = 3.0, color = 0x557799) {
    const t = this.loader.createIndustrialTank(r, h, color);
    t.position.set(x, 0, z);
    this.scene.add(t);
    this.meshes.push(t);
  }

  addStorageCrates(x, z, rows = 2, cols = 2) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const crate = this.loader.createStorageCrate();
        crate.position.set(x + c * 1.0, r * 0.82, z);
        this.scene.add(crate);
        this.meshes.push(crate);
      }
    }
  }

  addBarrels(x, z, count = 4, spacing = 0.65) {
    for (let i = 0; i < count; i++) {
      const barrel = this.loader.createIndustrialBarrel(i % 2 === 0 ? 0x443322 : 0x223344);
      barrel.position.set(x + i * spacing, 0, z);
      this.scene.add(barrel);
      this.meshes.push(barrel);
    }
  }

  addConveyor(x, z, length, yaw = 0) {
    const belt = this.loader.createConveyorBelt(length);
    belt.position.set(x, 0, z);
    belt.rotation.y = yaw;
    this.scene.add(belt);
    this.meshes.push(belt);
  }

  addControlPanel(x, z, yaw = 0) {
    const p = this.loader.createControlPanel();
    p.position.set(x, 0, z);
    p.rotation.y = yaw;
    this.scene.add(p);
    this.meshes.push(p);
  }

  addPipeRun(x, y, z, length, horizontal = true, color = 0x888888) {
    const pipe = this.loader.createPipeRun(length, 0.12, color);
    pipe.position.set(x, y, z);
    if (!horizontal) pipe.rotation.y = Math.PI / 2;
    this.scene.add(pipe);
    this.meshes.push(pipe);
  }

  addWallPipes(wx, wz, wallLen, color = 0x666677) {
    for (let i = 0; i < 3; i++) {
      const segLen = wallLen * 0.85;
      const pipe = this.loader.createPipeRun(segLen, 0.08 + i * 0.03, color);
      pipe.position.set(wx, 1.2 + i * 0.35, wz);
      if (Math.abs(wx) > Math.abs(wz)) pipe.rotation.y = Math.PI / 2;
      this.scene.add(pipe);
      this.meshes.push(pipe);
    }
  }

  update(dt) {
    // Idle employee animation
    if (this._employees) {
      for (let i = 0; i < this._employees.length; i++) {
        const e = this._employees[i];
        e._idlePhase += dt * 0.9;
        e.position.y = e._baseY + Math.sin(e._idlePhase) * 0.012;
      }
    }
    for (let i = 0; i < this.guards.length; i++) {
      this.guards[i].update(dt);
    }
    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].update(dt);
    }
    for (let i = 0; i < this.pickups.length; i++) {
      this.pickups[i].update(dt);
    }
    if (!this.completed && this.isCompleted()) {
      this.completed = true;
    }
  }

  cleanup() {
    for (let i = 0; i < this.meshes.length; i++) {
      this.scene.remove(this.meshes[i]);
    }
    this.meshes = [];

    for (let i = 0; i < this.guards.length; i++) {
      const guard = this.guards[i];
      if (guard.mesh) {
        this.scene.remove(guard.mesh);
      }
    }
    this.guards = [];

    for (let i = 0; i < this.targets.length; i++) {
      const target = this.targets[i];
      if (target.mesh) {
        this.scene.remove(target.mesh);
      }
    }
    this.targets = [];

    for (let i = 0; i < this.pickups.length; i++) {
      const pickup = this.pickups[i];
      if (pickup.mesh) {
        this.scene.remove(pickup.mesh);
      }
      if (pickup.light) {
        this.scene.remove(pickup.light);
      }
    }
    this.pickups = [];
  }

  isCompleted() {
    return this.targets.every(function(t) { return t.destroyed; });
  }

  getProgress() {
    const destroyed = this.targets.filter(function(t) { return t.destroyed; }).length;
    return { destroyed: destroyed, total: this.targets.length };
  }
};
