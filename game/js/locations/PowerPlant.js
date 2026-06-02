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
    // Large coolant/pressure tanks
    this.addIndustrialTank(-28, -25, 1.2, 5.0, 0x445577);
    this.addIndustrialTank(-20, -25, 1.0, 4.2, 0x334466);
    this.addIndustrialTank(22, -25, 1.2, 5.0, 0x445577);
    this.addIndustrialTank(14, -25, 0.9, 3.5, 0x334466);

    // Pipe networks at mid-height
    this.addWallPipes(-31, 0, 65, 0x5566aa);
    this.addWallPipes(31, 0, 65, 0x5566aa);
    this.addPipeRun(0, 3.5, -20, 50, true, 0x8899bb);
    this.addPipeRun(0, 2.8, -20, 50, true, 0x6677aa);

    // Conveyors (maintenance catwalks simulated)
    this.addConveyor(-10, 10, 10, 0);
    this.addConveyor(10, 10, 10, 0);

    // Barrels of oil/chemicals
    this.addBarrels(-25, 15, 6, 0.7);
    this.addBarrels(18, 15, 5, 0.7);

    // Control panels
    this.addControlPanel(0, -28, 0);
    this.addControlPanel(-28, 10, Math.PI / 2);
    this.addControlPanel(26, 10, -Math.PI / 2);

    // Control room (small admin area)
    this.addPartition(-5, 8, 16, true);
    this.addPartition(-14, 8, 10, false);
    [[-10,10,0],[-10,4,0],[-20,10,Math.PI]].forEach(([x,z,r]) => this.addDesk(x,z,r));
    [[-9,10],[-9,4],[-19,10]].forEach(([x,z]) => this.addEmployee(x,z,Math.PI));
    this.addFilingCabinets(-28, 6, 3, 0);

    // Safety desk at entrance
    const sd = this.loader.createDesk(0x444455);
    sd.position.set(0, 0, 28); this.scene.add(sd); this.meshes.push(sd);
    const sm = this.loader.createMonitor();
    sm.position.set(0, 0.78, 27.7); sm.rotation.y = Math.PI;
    this.scene.add(sm); this.meshes.push(sm);
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
