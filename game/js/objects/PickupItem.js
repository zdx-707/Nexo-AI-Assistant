window.PickupItem = class PickupItem {
  constructor(scene, pos, type) {
    this.id = Utils.uuid();
    this.scene = scene;
    this.type = type;
    this.pos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    this.collected = false;
    this.bobTimer = 0;
    this.baseY = pos[1];

    let geo, mat, color;

    if (type === 'sticker_pack') {
      geo = new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24);
      color = 0x00ffff;
      mat = new THREE.MeshLambertMaterial({
        color: color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.7,
      });
    } else if (type === 'drone_kit') {
      geo = new THREE.BoxGeometry(0.4, 0.2, 0.4);
      color = 0x333355;
      mat = new THREE.MeshLambertMaterial({
        color: color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.3,
      });
    } else {
      geo = new THREE.SphereGeometry(0.25, 16, 16);
      color = 0x00ff44;
      mat = new THREE.MeshLambertMaterial({
        color: color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.7,
      });
    }

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.pos);
    this.mesh.userData.gameObject = this;
    scene.add(this.mesh);

    this.light = new THREE.PointLight(color, 1.2, 4);
    this.light.position.set(this.pos.x, this.pos.y + 1, this.pos.z);
    scene.add(this.light);
  }

  update(dt) {
    this.bobTimer += dt * 2;
    this.mesh.position.y = this.baseY + 0.3 * Math.sin(this.bobTimer);
    this.mesh.rotation.y += dt * 1.5;
    this.light.position.y = this.mesh.position.y + 1;
  }

  collect(player) {
    const inv = player.inventory;
    if (this.type === 'sticker_pack') {
      inv.addStickers(5);
    } else if (this.type === 'drone_kit') {
      inv.addDrone();
    } else {
      if (player.disguise && typeof player.disguise.restore === 'function') {
        player.disguise.restore();
      } else if (typeof player.suspicion === 'number') {
        player.suspicion = Math.max(0, player.suspicion - 50);
      }
    }

    this.scene.remove(this.mesh);
    this.scene.remove(this.light);
    this.collected = true;

    if (window.GAME && window.GAME.events) {
      window.GAME.events.emit('itemCollected', { id: this.id, type: this.type });
    }

    if (window.GAME && window.GAME.audio) {
      window.GAME.audio.play('pickup');
    }
  }

  checkPickup(playerPos) {
    if (!this.collected && this.pos.distanceTo(playerPos) < 1.5) {
      this.collect(window.GAME.player);
      return true;
    }
    return false;
  }
};
