window.AssetLoader = class AssetLoader {
  constructor() {
    this.meshes = {};
  }

  createBox(w, h, d, color, castShadow = true, receiveShadow = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    return mesh;
  }

  createCylinder(rt, rb, h, segs, color) {
    const geo = new THREE.CylinderGeometry(rt, rb, h, segs);
    const mat = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createSphere(r, segs, color) {
    const geo = new THREE.SphereGeometry(r, segs, segs);
    const mat = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createCone(r, h, segs, color) {
    const geo = new THREE.ConeGeometry(r, h, segs);
    const mat = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createFactoryWall(width, height, depth) {
    const group = new THREE.Group();
    const wall = this.createBox(width, height, depth, 0x888888);
    group.add(wall);
    return group;
  }

  createGasValve() {
    const group = new THREE.Group();

    const body = this.createCylinder(0.15, 0.15, 0.5, 12, 0xff6600);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const handle = this.createBox(0.4, 0.06, 0.06, 0xffaa00);
    handle.position.set(0, 0.3, 0);
    group.add(handle);

    return group;
  }

  createWaterValve() {
    const group = new THREE.Group();

    const body = this.createCylinder(0.15, 0.15, 0.5, 12, 0x0055cc);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wheelGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16);
    const wheelMat = new THREE.MeshPhongMaterial({ color: 0x3399ff });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.castShadow = true;
    wheel.position.set(0, 0.3, 0);
    group.add(wheel);

    return group;
  }

  createMachine() {
    const group = new THREE.Group();

    const base = this.createBox(1.2, 0.8, 0.8, 0x444455);
    base.position.set(0, 0, 0);
    group.add(base);

    const panel = this.createBox(1.0, 0.5, 0.05, 0x222233);
    panel.position.set(0, 0.1, 0.43);
    group.add(panel);

    const light1 = this.createBox(0.08, 0.08, 0.06, 0x00ff44);
    light1.position.set(-0.3, 0.2, 0.46);
    group.add(light1);

    const light2 = this.createBox(0.08, 0.08, 0.06, 0xff2200);
    light2.position.set(-0.1, 0.2, 0.46);
    group.add(light2);

    const vent = this.createBox(0.4, 0.1, 0.05, 0x333344);
    vent.position.set(0.3, -0.1, 0.46);
    group.add(vent);

    const top = this.createBox(0.5, 0.2, 0.5, 0x555566);
    top.position.set(-0.2, 0.5, 0);
    group.add(top);

    return group;
  }

  createDroneMesh() {
    const group = new THREE.Group();

    const body = this.createBox(0.5, 0.1, 0.5, 0x222222);
    group.add(body);

    const armOffsets = [
      [ 0.4,  0,  0.4],
      [-0.4,  0,  0.4],
      [ 0.4,  0, -0.4],
      [-0.4,  0, -0.4]
    ];

    armOffsets.forEach(function(offset) {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.08),
        new THREE.MeshPhongMaterial({ color: 0x333333 })
      );
      arm.castShadow = true;
      arm.position.set(offset[0], offset[1], offset[2]);
      arm.lookAt(0, 0, 0);
      group.add(arm);

      const rotor = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshPhongMaterial({ color: 0x555555 })
      );
      rotor.castShadow = true;
      rotor.position.set(offset[0], offset[1] + 0.05, offset[2]);
      group.add(rotor);
    });

    return group;
  }

  createPlayerMesh() {
    const group = new THREE.Group();

    const torso = this.createBox(0.4, 0.5, 0.2, 0x00cc44);
    torso.position.set(0, 0.85, 0);
    group.add(torso);

    const head = this.createBox(0.3, 0.3, 0.25, 0x00ff66);
    head.position.set(0, 1.3, 0);
    group.add(head);

    const eyeL = this.createBox(0.07, 0.05, 0.06, 0x00ffff);
    eyeL.position.set(-0.08, 1.35, 0.13);
    group.add(eyeL);

    const eyeR = this.createBox(0.07, 0.05, 0.06, 0x00ffff);
    eyeR.position.set(0.08, 1.35, 0.13);
    group.add(eyeR);

    const armL = this.createBox(0.12, 0.4, 0.12, 0x009933);
    armL.position.set(-0.28, 0.8, 0);
    group.add(armL);

    const armR = this.createBox(0.12, 0.4, 0.12, 0x009933);
    armR.position.set(0.28, 0.8, 0);
    group.add(armR);

    const legL = this.createBox(0.14, 0.45, 0.14, 0x007722);
    legL.position.set(-0.12, 0.37, 0);
    group.add(legL);

    const legR = this.createBox(0.14, 0.45, 0.14, 0x007722);
    legR.position.set(0.12, 0.37, 0);
    group.add(legR);

    return group;
  }

  createGuardMesh() {
    const group = new THREE.Group();

    const torso = this.createBox(0.44, 0.52, 0.22, 0x1a1a2e);
    torso.position.set(0, 0.86, 0);
    group.add(torso);

    const head = this.createBox(0.32, 0.32, 0.27, 0x2a2a1e);
    head.position.set(0, 1.32, 0);
    group.add(head);

    const visor = this.createBox(0.26, 0.1, 0.06, 0xff4400);
    visor.position.set(0, 1.35, 0.15);
    group.add(visor);

    const armL = this.createBox(0.13, 0.42, 0.13, 0x111122);
    armL.position.set(-0.3, 0.8, 0);
    group.add(armL);

    const armR = this.createBox(0.13, 0.42, 0.13, 0x111122);
    armR.position.set(0.3, 0.8, 0);
    group.add(armR);

    const legL = this.createBox(0.15, 0.46, 0.15, 0x0d0d1a);
    legL.position.set(-0.12, 0.37, 0);
    group.add(legL);

    const legR = this.createBox(0.15, 0.46, 0.15, 0x0d0d1a);
    legR.position.set(0.12, 0.37, 0);
    group.add(legR);

    return group;
  }

  createStickerMesh() {
    const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
  }

  createFloor(width, depth, color) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    return mesh;
  }
};
