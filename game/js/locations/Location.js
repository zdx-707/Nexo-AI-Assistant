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

    const floor = this.loader.createFloor(w, d, CONFIG.COLORS.FLOOR);
    floor.position.set(0, 0, 0);
    this.scene.add(floor);
    this.meshes.push(floor);

    const wallN = this.loader.createBox(w, h, 0.5, CONFIG.COLORS.WALL);
    wallN.position.set(0, h / 2, -d / 2);
    this.scene.add(wallN);
    this.meshes.push(wallN);

    const wallS = this.loader.createBox(w, h, 0.5, CONFIG.COLORS.WALL);
    wallS.position.set(0, h / 2, d / 2);
    this.scene.add(wallS);
    this.meshes.push(wallS);

    const wallW = this.loader.createBox(0.5, h, d, CONFIG.COLORS.WALL);
    wallW.position.set(-w / 2, h / 2, 0);
    this.scene.add(wallW);
    this.meshes.push(wallW);

    const wallE = this.loader.createBox(0.5, h, d, CONFIG.COLORS.WALL);
    wallE.position.set(w / 2, h / 2, 0);
    this.scene.add(wallE);
    this.meshes.push(wallE);

    const ceiling = this.loader.createBox(w, 0.5, d, CONFIG.COLORS.CEILING);
    ceiling.position.set(0, h, 0);
    this.scene.add(ceiling);
    this.meshes.push(ceiling);

    this.loaded = true;
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

  update(dt) {
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
