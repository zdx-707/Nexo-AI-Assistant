window.PowerPlant = class PowerPlant extends window.Location {
  constructor(scene) {
    super(scene, 'power_plant');
    this.width = 65;
    this.depth = 65;
    this.wallHeight = 12;
    this.wallColor = 0x555566;
    this.floorColor = 0x202025;
  }

  buildInterior() {
    // Control room partition
    this.addPartition(-5, 5, 20, true);
    this.addPartition(-16, 5, 14, false);

    // Engineer workstations
    [[-10, 8, 0],[-10, 2, 0],[-10, -4, 0],[-22, 8, Math.PI],[-22, 2, Math.PI]].forEach(([x,z,rot]) => {
      this.addDesk(x, z, rot);
    });
    [[-9, 8],[-9, 2],[-9,-4],[-21, 8],[-21, 2]].forEach(([x,z]) => this.addEmployee(x, z, Math.PI));
    this.addFilingCabinets(-28, 5, 4, 0);

    // Safety monitoring desk near entrance
    const smDesk = this.loader.createDesk(0x444455);
    smDesk.position.set(0, 0, 28);
    this.scene.add(smDesk);
    this.meshes.push(smDesk);
    const smMon = this.loader.createMonitor();
    smMon.position.set(0, 0.78, 27.7);
    smMon.rotation.y = Math.PI;
    this.scene.add(smMon);
    this.meshes.push(smMon);
  }

  build() {
    super.build();

    for (var wi = 0; wi < this.meshes.length; wi++) {
      var m = this.meshes[wi];
      if (
        m.material &&
        m.material.color &&
        m.geometry &&
        m.geometry.type === 'BoxGeometry' &&
        m.position.y > 0 &&
        m.position.y < this.wallHeight
      ) {
        m.material.color.setHex(0x555566);
      }
    }

    var targetDefs = [
      {
        id: 'turbine',
        type: CONFIG.TARGET_TYPES.power_plant[0],
        pos: [-20, 0, -20],
        label: 'التوربين الرئيسي',
        criticalLevel: 5,
      },
      {
        id: 'cooling_system',
        type: CONFIG.TARGET_TYPES.power_plant[1],
        pos: [20, 0, -15],
        label: 'نظام التبريد',
        criticalLevel: 4,
      },
      {
        id: 'control_room',
        type: CONFIG.TARGET_TYPES.power_plant[2],
        pos: [0, 0, 25],
        label: 'غرفة التحكم',
        criticalLevel: 4,
      },
      {
        id: 'transformer',
        type: CONFIG.TARGET_TYPES.power_plant[3],
        pos: [-15, 0, 20],
        label: 'المحول الكهربائي',
        criticalLevel: 3,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-20, 0, -20], cx: -20, cz: -20 },
      { pos: [20, 0, -15],  cx: 20,  cz: -15 },
      { pos: [0, 0, 25],    cx: 0,   cz: 25  },
      { pos: [-15, 0, 20],  cx: -15, cz: 20  },
    ];

    for (var gi = 0; gi < guardDefs.length; gi++) {
      var gd = guardDefs[gi];
      var route;
      if (patrol) {
        route = patrol.generateDefaultRoute(gd.cx, gd.cz, 8, 4);
      } else {
        route = [
          [gd.cx + 8, 0, gd.cz],
          [gd.cx,     0, gd.cz + 8],
          [gd.cx - 8, 0, gd.cz],
          [gd.cx,     0, gd.cz - 8],
        ];
      }
      this.addGuard(gd.pos, route);
    }

    var turbinePositions = [
      [-20, 0, -20],
      [20, 0, -15],
    ];

    for (var ci = 0; ci < turbinePositions.length; ci++) {
      var tp = turbinePositions[ci];
      var turbine = this.loader.createCylinder(1.8, 2.0, 7.0, 16, 0x888899);
      turbine.position.set(tp[0], 3.5, tp[2]);
      this.scene.add(turbine);
      this.meshes.push(turbine);
    }

    var lightPositions = [
      [-10, 4, -10],
      [10, 4, -10],
      [-10, 4, 10],
      [10, 4, 10],
      [0, 4, 0],
    ];

    for (var li = 0; li < lightPositions.length; li++) {
      var lp = lightPositions[li];
      var elecLight = new THREE.PointLight(0x4488ff, 1.2, 18);
      elecLight.position.set(lp[0], lp[1], lp[2]);
      elecLight._flickerPhase = Math.random() * Math.PI * 2;
      this.scene.add(elecLight);
      this.meshes.push(elecLight);

      var bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
      var bulbMat = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        emissive: new THREE.Color(0x4488ff),
        emissiveIntensity: 0.9,
      });
      var bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(bulb);
      this.meshes.push(bulb);
    }

    var stripePositions = [
      [5, 0, 5],
      [-5, 0, 5],
      [5, 0, -5],
      [-5, 0, -5],
      [15, 0, 10],
      [-15, 0, 10],
    ];

    for (var si = 0; si < stripePositions.length; si++) {
      var sp = stripePositions[si];
      var stripeBox = this.loader.createBox(2.0, 0.05, 2.0, 0xffcc00);
      stripeBox.position.set(sp[0], 0.03, sp[2]);
      this.scene.add(stripeBox);
      this.meshes.push(stripeBox);

      var stripeInner = this.loader.createBox(1.0, 0.06, 2.0, 0x111111);
      stripeInner.position.set(sp[0], 0.04, sp[2]);
      this.scene.add(stripeInner);
      this.meshes.push(stripeInner);
    }

    var cableBoxPositions = [
      [-30, 1, -15],
      [-30, 1, 0],
      [-30, 1, 15],
      [30, 1, -15],
      [30, 1, 0],
      [30, 1, 15],
    ];

    for (var kb = 0; kb < cableBoxPositions.length; kb++) {
      var kp = cableBoxPositions[kb];
      var cableBox = this.loader.createBox(1.0, 1.5, 0.5, 0x333344);
      cableBox.position.set(kp[0], kp[1], kp[2]);
      this.scene.add(cableBox);
      this.meshes.push(cableBox);

      var cableIndicator = this.loader.createBox(0.2, 0.2, 0.06, 0x4488ff);
      cableIndicator.position.set(kp[0], kp[1] + 0.4, kp[2] + 0.28);
      this.scene.add(cableIndicator);
      this.meshes.push(cableIndicator);
    }

    this.addPickup([0, 0, 0], 'drone_kit');
    this.addPickup([10, 0, -5], 'sticker_pack');
  }
};
