window.InteractiveTarget = class InteractiveTarget {
  constructor(scene, config) {
    this.scene = scene;
    this.id = config.id || Utils.uuid();
    this.type = config.type;
    this.label = config.label || config.type;
    this.criticalLevel = config.criticalLevel || 1;
    this.pos = new THREE.Vector3(...config.pos);
    this.hasSticker = false;
    this.destroyed = false;
    this.interactive = true;
    this.highlighted = false;
    this.operTimer = 0;

    this.mesh = this._buildMesh(config.type);
    this.mesh.position.copy(this.pos);
    this.mesh.userData.gameObject = this;
    scene.add(this.mesh);
  }

  _buildMesh(type) {
    switch (type) {
      case 'gas_valve':
      case 'water_valve':
      case 'pipeline': {
        const group = new THREE.Group();
        const bodyColor = (type === 'gas_valve') ? 0xff6600 : 0x2255cc;
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.0, 12);
        const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);
        const capGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12);
        const capMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const capTop = new THREE.Mesh(capGeo, capMat);
        capTop.position.y = 0.55;
        const capBot = new THREE.Mesh(capGeo, capMat);
        capBot.position.y = -0.55;
        group.add(capTop);
        group.add(capBot);
        return group;
      }

      case 'turbine':
      case 'cooling_system':
      case 'pump': {
        const group = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.1, 16);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        group.add(base);
        const discGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 20);
        const discMat = new THREE.MeshLambertMaterial({ color: 0x555566 });
        this._spinDisc = new THREE.Mesh(discGeo, discMat);
        this._spinDisc.position.y = 0.62;
        group.add(this._spinDisc);
        return group;
      }

      case 'server_rack':
      case 'command_terminal': {
        const group = new THREE.Group();
        const rackGeo = new THREE.BoxGeometry(0.7, 1.8, 0.5);
        const rackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const rack = new THREE.Mesh(rackGeo, rackMat);
        group.add(rack);
        const lightColors = [0x00ff00, 0xff8800, 0x00aaff, 0xff0000];
        this._lights = [];
        for (let i = 0; i < 6; i++) {
          const lGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
          const lMat = new THREE.MeshLambertMaterial({
            color: lightColors[i % lightColors.length],
            emissive: new THREE.Color(lightColors[i % lightColors.length]),
            emissiveIntensity: 0.8,
          });
          const light = new THREE.Mesh(lGeo, lMat);
          light.position.set(
            Utils.rand(-0.25, 0.25),
            Utils.rand(-0.7, 0.7),
            0.26
          );
          this._lights.push(light);
          group.add(light);
        }
        return group;
      }

      case 'vault_server':
      case 'currency_reserve': {
        const group = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(1.0, 1.2, 0.9);
        const boxMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.BANK_GOLD });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);
        const rimGeo = new THREE.BoxGeometry(1.05, 0.08, 0.95);
        const rimMat = new THREE.MeshLambertMaterial({ color: 0xaa8800 });
        for (let i = -1; i <= 1; i += 2) {
          const rim = new THREE.Mesh(rimGeo, rimMat);
          rim.position.y = i * 0.56;
          group.add(rim);
        }
        return group;
      }

      case 'satellite_dish':
      case 'radar_array': {
        const group = new THREE.Group();
        const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8);
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        group.add(pole);
        const dishGeo = new THREE.ConeGeometry(0.55, 0.35, 16, 1, true);
        const dishMat = new THREE.MeshLambertMaterial({
          color: 0xcccccc,
          side: THREE.DoubleSide,
        });
        this._dish = new THREE.Mesh(dishGeo, dishMat);
        this._dish.position.y = 0.9;
        this._dish.rotation.x = Math.PI * 0.35;
        group.add(this._dish);
        return group;
      }

      case 'fuel_tank':
      case 'storage_tank': {
        const group = new THREE.Group();
        const tankColor = (type === 'fuel_tank') ? 0x333322 : 0x446655;
        const tankGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.0, 16);
        const tankMat = new THREE.MeshLambertMaterial({ color: tankColor });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        group.add(tank);
        const lidGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.08, 16);
        const lidMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const lidTop = new THREE.Mesh(lidGeo, lidMat);
        lidTop.position.y = 1.04;
        const lidBot = new THREE.Mesh(lidGeo, lidMat);
        lidBot.position.y = -1.04;
        group.add(lidTop);
        group.add(lidBot);
        return group;
      }

      case 'explosive_storage':
      case 'ammo_rack': {
        const group = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(1.1, 0.9, 0.8);
        const boxMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);
        const stripeGeo = new THREE.BoxGeometry(1.12, 0.12, 0.82);
        const stripeMat = new THREE.MeshLambertMaterial({ color: 0xff2200 });
        for (let i = -1; i <= 1; i++) {
          const stripe = new THREE.Mesh(stripeGeo, stripeMat);
          stripe.position.y = i * 0.3;
          group.add(stripe);
        }
        return group;
      }

      default: {
        const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const mat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        return new THREE.Mesh(geo, mat);
      }
    }
  }

  interact(player) {
    if (player.inventory.hasStickers()) {
      const sticker = new SmartSticker(this.scene, this.pos, new THREE.Vector3(0, 1, 0), this);
      if (window.GAME && window.GAME.stickers) {
        window.GAME.stickers.push(sticker);
      }
      player.inventory.useSticker();
      this.hasSticker = true;
      if (window.GAME && window.GAME.audio) {
        window.GAME.audio.play('sticker_place');
      }
      return true;
    }
    return false;
  }

  destroy() {
    if (this.destroyed) return;
    this._flashRed(this.mesh);
    setTimeout(() => {
      this.scene.remove(this.mesh);
      this.destroyed = true;
      if (window.GAME && window.GAME.events) {
        window.GAME.events.emit('targetDestroyed', {
          id: this.id,
          type: this.type,
          pos: this.pos,
          criticalLevel: this.criticalLevel,
        });
      }
    }, 600);
  }

  _flashRed(obj) {
    if (!obj) return;
    if (obj.material) {
      obj.material.color.setHex(CONFIG.COLORS.EXPLOSION);
    }
    if (obj.children) {
      obj.children.forEach(child => this._flashRed(child));
    }
  }

  highlight(on) {
    this.highlighted = on;
    this._setEmissive(this.mesh, on);
  }

  _setEmissive(obj, on) {
    if (!obj) return;
    if (obj.material) {
      if (!obj.material._baseEmissive) {
        obj.material._baseEmissive = obj.material.emissive
          ? obj.material.emissive.clone()
          : new THREE.Color(0x000000);
      }
      if (on) {
        obj.material.emissive = new THREE.Color(0x00ffcc);
        obj.material.emissiveIntensity = 0.5;
      } else {
        obj.material.emissive.copy(obj.material._baseEmissive);
        obj.material.emissiveIntensity = 0;
      }
    }
    if (obj.children) {
      obj.children.forEach(child => this._setEmissive(child, on));
    }
  }

  update(dt) {
    if (this.destroyed) return;
    this.operTimer += dt;

    switch (this.type) {
      case 'turbine':
      case 'cooling_system':
      case 'pump':
        if (this._spinDisc) {
          this._spinDisc.rotation.y += dt * 3.5;
        }
        break;

      case 'server_rack':
      case 'command_terminal':
        if (this._lights && this._lights.length > 0) {
          const idx = Math.floor(this.operTimer * 4) % this._lights.length;
          this._lights.forEach((l, i) => {
            l.material.emissiveIntensity = (i === idx)
              ? 0.1 + Math.random() * 0.3
              : 0.8;
          });
        }
        break;

      case 'satellite_dish':
      case 'radar_array':
        if (this._dish) {
          this._dish.parent.rotation.y += dt * 0.4;
        }
        break;

      default:
        break;
    }
  }
};
