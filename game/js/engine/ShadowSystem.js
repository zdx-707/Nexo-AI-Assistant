window.ShadowSystem = class ShadowSystem {
  constructor(renderer) {
    this.renderer = renderer;
    this.lights = [];
  }

  addSpotLight(pos, target, color = 0xffffff, intensity = 1, angle = Math.PI / 4, penumbra = 0.1) {
    const light = new THREE.SpotLight(color, intensity, 0, angle, penumbra);
    light.position.set(pos.x, pos.y, pos.z);
    if (target) {
      light.target.position.set(target.x, target.y, target.z);
      this.renderer.scene.add(light.target);
    }
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.renderer.scene.add(light);
    this.lights.push(light);
    return light;
  }

  addPointLight(pos, color = 0xffffff, intensity = 0.5, distance = 20, decay = 2) {
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(pos.x, pos.y, pos.z);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.renderer.scene.add(light);
    this.lights.push(light);
    return light;
  }

  removeLight(light) {
    this.renderer.scene.remove(light);
    const index = this.lights.indexOf(light);
    if (index !== -1) {
      this.lights.splice(index, 1);
    }
  }

  setQuality(quality) {
    let size;
    if (quality === 'low') {
      size = 512;
    } else if (quality === 'medium') {
      size = 1024;
    } else if (quality === 'high') {
      size = 2048;
    } else {
      return;
    }
    for (let i = 0; i < this.lights.length; i++) {
      const light = this.lights[i];
      if (light.shadow) {
        light.shadow.mapSize.width = size;
        light.shadow.mapSize.height = size;
        if (light.shadow.map) {
          light.shadow.map.dispose();
          light.shadow.map = null;
        }
      }
    }
  }

  createFactoryLighting(scene) {
    const positions = [
      { x: -10, z: -10 },
      { x:  10, z: -10 },
      { x: -10, z:  10 },
      { x:  10, z:  10 }
    ];
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const light = new THREE.PointLight(0xfff5e0, 0.6, 25, 2);
      light.position.set(p.x, 8, p.z);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      scene.add(light);
      this.lights.push(light);
    }
  }
};
