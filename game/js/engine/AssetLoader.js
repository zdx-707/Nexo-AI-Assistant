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
    return Math.random() > 0.4 ? this.createAlienMesh() : this.createTurtleMesh();
  }

  createAlienMesh() {
    const group = new THREE.Group();
    const skin = 0x7ec8a0;
    const suit = 0x1a0a2e;

    // torso — thin
    const torso = this.createBox(0.38, 0.5, 0.18, suit);
    torso.position.set(0, 0.9, 0);
    group.add(torso);

    // neck
    const neck = this.createCylinder(0.07, 0.07, 0.18, 8, skin);
    neck.position.set(0, 1.19, 0);
    group.add(neck);

    // large oval head
    const headGeo = new THREE.SphereGeometry(0.26, 16, 12);
    const headMat = new THREE.MeshPhongMaterial({ color: skin });
    const head = new THREE.Mesh(headGeo, headMat);
    head.scale.set(1, 1.25, 0.9);
    head.position.set(0, 1.5, 0);
    head.castShadow = true;
    group.add(head);

    // big black almond eyes with iris glow
    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 8);
    const eyeMat = new THREE.MeshPhongMaterial({ color: 0x050510 });
    const irisGeo = new THREE.SphereGeometry(0.045, 8, 6);
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x220088 });
    [-0.1, 0.1].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.scale.set(1.4, 0.7, 0.4);
      eye.position.set(x, 1.53, 0.22);
      group.add(eye);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(x, 1.53, 0.245);
      group.add(iris);
    });

    // antenna
    const ant = this.createCylinder(0.02, 0.02, 0.3, 6, 0x334433);
    ant.position.set(0.06, 1.82, 0);
    group.add(ant);
    const antTip = this.createSphere(0.05, 8, 0x00ffaa);
    antTip.position.set(0.06, 1.97, 0);
    group.add(antTip);

    // thin arms
    const armL = this.createCylinder(0.06, 0.05, 0.48, 8, skin);
    armL.position.set(-0.28, 0.82, 0);
    armL.rotation.z = 0.2;
    group.add(armL);
    const armR = this.createCylinder(0.06, 0.05, 0.48, 8, skin);
    armR.position.set(0.28, 0.82, 0);
    armR.rotation.z = -0.2;
    group.add(armR);

    // legs
    const legL = this.createCylinder(0.08, 0.07, 0.52, 8, suit);
    legL.position.set(-0.12, 0.38, 0);
    group.add(legL);
    const legR = this.createCylinder(0.08, 0.07, 0.52, 8, suit);
    legR.position.set(0.12, 0.38, 0);
    group.add(legR);

    return group;
  }

  createTurtleMesh() {
    const group = new THREE.Group();
    const skin = 0x4a7c4e;
    const shell = 0x2d5a1b;

    // stubby legs
    [[- 0.18, 0, 0.12],[0.18, 0, 0.12],[-0.18, 0, -0.12],[0.18, 0, -0.12]].forEach(([x,y,z]) => {
      const leg = this.createBox(0.14, 0.28, 0.14, skin);
      leg.position.set(x, 0.22, z);
      group.add(leg);
    });

    // wide body
    const body = this.createBox(0.52, 0.36, 0.38, skin);
    body.position.set(0, 0.52, 0);
    group.add(body);

    // dome shell
    const shellGeo = new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const shellMat = new THREE.MeshPhongMaterial({ color: shell });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.scale.set(1, 0.75, 0.9);
    shellMesh.position.set(0, 0.64, 0);
    shellMesh.castShadow = true;
    group.add(shellMesh);

    // shell pattern hexagons (flat boxes)
    [[0,0],[0.15,0.1],[-0.15,0.1],[0,0.2],[0.12,-0.1],[-0.12,-0.1]].forEach(([ox,oz]) => {
      const hex = this.createBox(0.1, 0.02, 0.1, 0x1a3d0f);
      hex.position.set(ox, 0.92, oz);
      group.add(hex);
    });

    // short neck + round head
    const neck = this.createCylinder(0.09, 0.1, 0.14, 8, skin);
    neck.position.set(0, 0.77, 0.22);
    neck.rotation.x = 0.4;
    group.add(neck);

    const headGeo = new THREE.SphereGeometry(0.16, 12, 10);
    const headMat = new THREE.MeshPhongMaterial({ color: skin });
    const head = new THREE.Mesh(headGeo, headMat);
    head.scale.set(1, 0.85, 1.1);
    head.position.set(0, 0.9, 0.36);
    head.castShadow = true;
    group.add(head);

    // small dark eyes
    [-0.07, 0.07].forEach(x => {
      const eye = this.createSphere(0.04, 8, 0x0a0a0a);
      eye.position.set(x, 0.93, 0.51);
      group.add(eye);
    });

    return group;
  }

  // ── Furniture ──────────────────────────────────────────
  createDesk(color = 0x8b6914) {
    const g = new THREE.Group();
    const top = this.createBox(1.6, 0.06, 0.8, color);
    top.position.set(0, 0.75, 0);
    g.add(top);
    [[-0.72,-0.34],[-0.72,0.34],[0.72,-0.34],[0.72,0.34]].forEach(([x,z]) => {
      const leg = this.createBox(0.06, 0.74, 0.06, 0x5a4010);
      leg.position.set(x, 0.37, z);
      g.add(leg);
    });
    // drawer unit
    const drawer = this.createBox(0.45, 0.6, 0.76, 0x7a5a12);
    drawer.position.set(0.55, 0.44, 0);
    g.add(drawer);
    [0.1,-0.1].forEach(y => {
      const handle = this.createBox(0.16, 0.04, 0.04, 0xccaa44);
      handle.position.set(0.8, 0.44 + y, 0.4);
      g.add(handle);
    });
    return g;
  }

  createChair(color = 0x222244) {
    const g = new THREE.Group();
    const seat = this.createBox(0.52, 0.07, 0.5, color);
    seat.position.set(0, 0.46, 0);
    g.add(seat);
    const back = this.createBox(0.5, 0.5, 0.07, color);
    back.position.set(0, 0.73, -0.22);
    g.add(back);
    // 5-star base
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spoke = this.createBox(0.32, 0.04, 0.06, 0x333333);
      spoke.position.set(Math.cos(a) * 0.18, 0.06, Math.sin(a) * 0.18);
      spoke.rotation.y = a;
      g.add(spoke);
      const wheel = this.createCylinder(0.04, 0.04, 0.08, 8, 0x111111);
      wheel.position.set(Math.cos(a) * 0.34, 0.04, Math.sin(a) * 0.34);
      g.add(wheel);
    }
    const pole = this.createCylinder(0.04, 0.04, 0.38, 8, 0x444444);
    pole.position.set(0, 0.24, 0);
    g.add(pole);
    return g;
  }

  _makeScreenTex() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 160;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#001020';
    ctx.fillRect(0, 0, 256, 160);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#00ff88';
    const lines = ['> نظام آمن','> حالة: نشط','> وصول: مقيد','> ','> 3026-06-02'];
    lines.forEach((l, i) => ctx.fillText(l, 8, 22 + i * 18));
    ctx.fillStyle = '#0044ff';
    ctx.fillRect(0, 120, 256, 40);
    ctx.fillStyle = '#88ddff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('NEXO CORP SYS v3.1', 8, 142);
    return new THREE.CanvasTexture(c);
  }

  createMonitor() {
    const g = new THREE.Group();
    const screen = this.createBox(0.72, 0.44, 0.06, 0x111122);
    screen.position.set(0, 0.22, 0);
    const screenTex = this._makeScreenTex();
    const glowGeo = new THREE.BoxGeometry(0.66, 0.38, 0.01);
    const glowMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      emissiveMap: screenTex,
      emissive: new THREE.Color(1, 1, 1),
      emissiveIntensity: 0.9,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0.22, 0.04);
    g.add(screen);
    g.add(glow);
    const stand = this.createBox(0.08, 0.18, 0.08, 0x333344);
    stand.position.set(0, 0.02, 0);
    g.add(stand);
    const base = this.createBox(0.28, 0.04, 0.22, 0x222233);
    base.position.set(0, -0.06, 0.06);
    g.add(base);
    return g;
  }

  createKeyboard() {
    const kb = this.createBox(0.42, 0.03, 0.16, 0x1a1a2a);
    // key rows
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        const key = this.createBox(0.03, 0.02, 0.03, 0x2a2a3a);
        key.position.set(-0.185 + col * 0.04, 0.025, -0.055 + row * 0.04);
        kb.add(key);
      }
    }
    return kb;
  }

  createFilingCabinet() {
    const g = new THREE.Group();
    const body = this.createBox(0.5, 1.2, 0.55, 0x888899);
    body.position.set(0, 0.6, 0);
    g.add(body);
    [-0.35, -0.05, 0.25].forEach(y => {
      const drawer = this.createBox(0.44, 0.24, 0.02, 0x999aaa);
      drawer.position.set(0, 0.6 + y, 0.29);
      g.add(drawer);
      const handle = this.createBox(0.18, 0.04, 0.04, 0xccccdd);
      handle.position.set(0, 0.6 + y, 0.32);
      g.add(handle);
    });
    return g;
  }

  createCeilingLight() {
    const g = new THREE.Group();
    const housing = this.createBox(1.2, 0.08, 0.3, 0xaaaaaa);
    g.add(housing);
    const tube = this.createBox(1.1, 0.04, 0.22, 0xeeeeff);
    tube.position.set(0, -0.06, 0);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0xddeeff });
    tube.material = tubeMat;
    g.add(tube);
    return g;
  }

  createEmployeeMesh() {
    const g = new THREE.Group();
    const suitColors = [0x1a1a4a, 0x2a1a1a, 0x1a2a1a, 0x333355];
    const suit = suitColors[Math.floor(Math.random() * suitColors.length)];
    const skinTone = 0xd4a574;

    // legs
    const legL = this.createBox(0.14, 0.44, 0.14, suit);
    legL.position.set(-0.1, 0.34, 0);
    g.add(legL);
    const legR = this.createBox(0.14, 0.44, 0.14, suit);
    legR.position.set(0.1, 0.34, 0);
    g.add(legR);

    // torso + jacket
    const torso = this.createBox(0.42, 0.5, 0.2, suit);
    torso.position.set(0, 0.86, 0);
    g.add(torso);
    // shirt/tie strip
    const shirt = this.createBox(0.14, 0.28, 0.03, 0xffffff);
    shirt.position.set(0, 0.88, 0.1);
    g.add(shirt);
    const tie = this.createBox(0.06, 0.22, 0.03, 0xaa2222);
    tie.position.set(0, 0.85, 0.115);
    g.add(tie);

    // arms
    const armL = this.createBox(0.13, 0.42, 0.13, suit);
    armL.position.set(-0.28, 0.82, 0);
    g.add(armL);
    const armR = this.createBox(0.13, 0.42, 0.13, suit);
    armR.position.set(0.28, 0.82, 0);
    g.add(armR);

    // neck
    const neck = this.createCylinder(0.07, 0.07, 0.12, 8, skinTone);
    neck.position.set(0, 1.16, 0);
    g.add(neck);

    // head
    const head = this.createBox(0.28, 0.3, 0.24, skinTone);
    head.position.set(0, 1.36, 0);
    g.add(head);

    // hair
    const hair = this.createBox(0.3, 0.1, 0.26, Math.random() > 0.5 ? 0x1a0a00 : 0x553311);
    hair.position.set(0, 1.52, 0);
    g.add(hair);

    return g;
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

  // ── Industrial Props ─────────────────────────────────────
  createIndustrialTank(r = 0.9, h = 3.0, color = 0x557799) {
    const g = new THREE.Group();
    const body = this.createCylinder(r, r, h, 16, color);
    body.position.set(0, h / 2, 0);
    g.add(body);
    const domeGeo = new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const domeMat = new THREE.MeshPhongMaterial({ color: color });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.castShadow = true;
    dome.position.set(0, h, 0);
    g.add(dome);
    const nozzle = this.createCylinder(0.08, 0.08, 0.45, 8, 0x888888);
    nozzle.position.set(r * 0.75, h * 0.35, 0);
    nozzle.rotation.z = Math.PI / 2;
    g.add(nozzle);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const leg = this.createCylinder(0.06, 0.06, 0.65, 6, 0x555555);
      leg.position.set(Math.cos(a) * r * 0.72, 0.32, Math.sin(a) * r * 0.72);
      g.add(leg);
    }
    [h * 0.2, h * 0.5, h * 0.8].forEach(y => {
      const band = this.createCylinder(r + 0.03, r + 0.03, 0.06, 16, 0x666666);
      band.position.set(0, y, 0);
      g.add(band);
    });
    return g;
  }

  createStorageCrate(color = 0x8b6914) {
    const g = new THREE.Group();
    const body = this.createBox(0.9, 0.8, 0.9, color);
    body.position.set(0, 0.4, 0);
    g.add(body);
    const straps = [
      [0, 0.2, 0.46], [0, 0.6, 0.46], [0.46, 0.2, 0], [0.46, 0.6, 0],
    ];
    straps.forEach(([x, y, z]) => {
      const s = this.createBox(x ? 0.02 : 0.94, 0.04, z ? 0.02 : 0.94, 0x5a3e10);
      s.position.set(x, y, z);
      g.add(s);
    });
    return g;
  }

  createIndustrialBarrel(color = 0x443322) {
    const g = new THREE.Group();
    const body = this.createCylinder(0.26, 0.26, 0.88, 12, color);
    body.position.set(0, 0.44, 0);
    g.add(body);
    [0.2, 0.44, 0.68].forEach(y => {
      const ring = this.createCylinder(0.285, 0.285, 0.04, 12, 0x888888);
      ring.position.set(0, y, 0);
      g.add(ring);
    });
    const lid = this.createCylinder(0.27, 0.27, 0.03, 12, 0x666666);
    lid.position.set(0, 0.89, 0);
    g.add(lid);
    return g;
  }

  createConveyorBelt(length = 4.0) {
    const g = new THREE.Group();
    const belt = this.createBox(length, 0.08, 0.9, 0x1a1a1a);
    belt.position.set(0, 0.65, 0);
    g.add(belt);
    [-0.47, 0.47].forEach(z => {
      const rail = this.createBox(length, 0.1, 0.05, 0x555555);
      rail.position.set(0, 0.74, z);
      g.add(rail);
    });
    const cnt = Math.max(2, Math.floor(length / 0.55));
    for (let i = 0; i <= cnt; i++) {
      const roller = this.createCylinder(0.08, 0.08, 0.94, 8, 0x777788);
      roller.position.set(-length / 2 + i * (length / cnt), 0.61, 0);
      roller.rotation.z = Math.PI / 2;
      g.add(roller);
    }
    [-length / 2 + 0.4, length / 2 - 0.4].forEach(x => {
      [-0.32, 0.32].forEach(z => {
        const leg = this.createBox(0.06, 0.58, 0.06, 0x444444);
        leg.position.set(x, 0.29, z);
        g.add(leg);
      });
    });
    return g;
  }

  createControlPanel() {
    const g = new THREE.Group();
    const body = this.createBox(1.4, 1.6, 0.4, 0x222233);
    body.position.set(0, 0.8, 0);
    g.add(body);
    const screen = this.createBox(1.0, 0.56, 0.04, 0x111122);
    screen.position.set(0, 1.22, 0.22);
    g.add(screen);
    const screenTex = this._makeScreenTex();
    const glowGeo = new THREE.BoxGeometry(0.96, 0.52, 0.01);
    const glowMat = new THREE.MeshStandardMaterial({
      map: screenTex, emissiveMap: screenTex,
      emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 0.8,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 1.22, 0.245);
    g.add(glow);
    const btnColors = [0x00ff00, 0xff2200, 0xff8800, 0x0088ff, 0xffff00];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const btn = this.createBox(0.1, 0.1, 0.04, btnColors[(r * 5 + c) % 5]);
        btn.position.set(-0.28 + c * 0.14, 0.5 + r * 0.14, 0.22);
        g.add(btn);
      }
    }
    return g;
  }

  createPipeRun(length = 4.0, r = 0.12, color = 0x888888) {
    const g = new THREE.Group();
    const pipe = this.createCylinder(r, r, length, 10, color);
    pipe.rotation.z = Math.PI / 2;
    g.add(pipe);
    [-length / 2, length / 2].forEach(x => {
      const cap = this.createCylinder(r + 0.03, r + 0.03, 0.06, 10, 0x555555);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(x, 0, 0);
      g.add(cap);
    });
    return g;
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
