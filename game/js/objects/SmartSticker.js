window.SmartSticker = class SmartSticker {
  constructor(scene, position, normal, targetObject) {
    this.id = Utils.uuid();
    this.scene = scene;
    this.pos = position.clone();
    this.normal = normal.clone();
    this.targetObject = targetObject;
    this.active = true;
    this.triggered = false;
    this.pulseTimer = 0;

    const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
    const mat = new THREE.MeshLambertMaterial({
      color: CONFIG.COLORS.STICKER_ACTIVE,
      emissive: new THREE.Color(CONFIG.COLORS.STICKER_ACTIVE),
      emissiveIntensity: 0.4,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.pos);
    this.mesh.lookAt(this.pos.clone().add(this.normal));
    scene.add(this.mesh);
  }

  update(dt) {
    this.pulseTimer += dt * 3;
    this.mesh.material.emissiveIntensity = 0.4 + 0.6 * Math.abs(Math.sin(this.pulseTimer));
  }

  trigger() {
    this.triggered = true;
    this.mesh.material.color.setHex(CONFIG.COLORS.STICKER_TRIGGERED);
    this.mesh.material.emissive.setHex(CONFIG.COLORS.STICKER_TRIGGERED);
    if (window.GAME && window.GAME.events) {
      window.GAME.events.emit('stickerTriggered', { id: this.id });
    }
  }

  remove() {
    this.scene.remove(this.mesh);
    this.active = false;
  }

  getData() {
    return {
      id: this.id,
      pos: { x: this.pos.x, y: this.pos.y, z: this.pos.z },
      triggered: this.triggered,
      targetId: this.targetObject ? this.targetObject.id : null,
    };
  }
};
