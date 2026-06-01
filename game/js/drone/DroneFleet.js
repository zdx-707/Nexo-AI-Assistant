window.DroneFleet = class DroneFleet {
  constructor(scene) {
    this.scene = scene;
    this.drones = [];
    this.activeDrone = null;
  }

  deploy(spawnPos) {
    const inventory = window.GAME && window.GAME.player && window.GAME.player.inventory;
    if (!inventory || !inventory.deployDrone()) {
      return null;
    }
    const drone = new Drone(this.scene, spawnPos);
    this.drones.push(drone);
    this.activeDrone = drone;
    return drone;
  }

  recall() {
    if (this.activeDrone) {
      this.activeDrone.destroy();
      this.activeDrone = null;
    }
  }

  getActive() {
    return this.activeDrone || null;
  }

  update(dt) {
    for (let i = 0; i < this.drones.length; i++) {
      if (this.drones[i].alive) {
        this.drones[i].update(dt);
      }
    }
    this.drones = this.drones.filter(function(d) { return d.alive; });
    if (this.activeDrone && !this.activeDrone.alive) {
      this.activeDrone = null;
    }
  }

  destroyAll() {
    for (let i = 0; i < this.drones.length; i++) {
      this.drones[i].destroy();
    }
    this.drones = [];
    this.activeDrone = null;
  }

  count() {
    return this.drones.length;
  }

  hasActiveDrone() {
    return this.activeDrone != null && this.activeDrone.alive === true;
  }
};
