window.OilRefinery = class OilRefinery extends window.Location {
  constructor(scene) {
    super(scene, 'oil_refinery');
    this.width = 75;
    this.depth = 75;
    this.wallHeight = 14;
    this.wallColor = 0x4a3010;
    this.floorColor = 0x1e1810;
  }

  buildInterior() {
    // Massive storage tanks (oil/gas)
    this.addIndustrialTank(-30, -30, 1.4, 6.0, 0x553300);
    this.addIndustrialTank(-20, -30, 1.2, 5.0, 0x664400);
    this.addIndustrialTank(22, -30, 1.4, 6.0, 0x553300);
    this.addIndustrialTank(12, -30, 1.0, 4.0, 0x664400);
    this.addIndustrialTank(-30, 15, 1.0, 4.0, 0x774411);
    this.addIndustrialTank(28, 15, 1.0, 4.0, 0x774411);

    // Pipeline networks
    this.addWallPipes(-36, 0, 75, 0x886633);
    this.addWallPipes(36, 0, 75, 0x886633);
    this.addPipeRun(0, 4.0, -15, 60, true, 0xaa8844);
    this.addPipeRun(0, 2.5, -15, 60, true, 0x886633);

    // Barrel clusters (chemical by-products)
    this.addBarrels(-25, 5, 6, 0.7);
    this.addBarrels(-25, 10, 5, 0.7);
    this.addBarrels(20, 5, 6, 0.7);

    // Processing conveyors
    this.addConveyor(0, 5, 16, 0);
    this.addConveyor(0, -5, 16, 0);

    // Control panels
    this.addControlPanel(0, -32, 0);
    this.addControlPanel(-32, 0, Math.PI / 2);
    this.addControlPanel(30, 0, -Math.PI / 2);

    // Small process control room
    this.addPartition(-5, -5, 20, true);
    this.addPartition(-15, -5, 10, false);
    [[-10,-8,0],[-10,-14,0],[-20,-8,Math.PI]].forEach(([x,z,r]) => this.addDesk(x,z,r));
    [[-9,-8],[-9,-14],[-19,-8]].forEach(([x,z]) => this.addEmployee(x,z,Math.PI));
    this.addFilingCabinets(-28, -8, 3, 0);

    // Safety desk
    this.addDesk(20, 20, Math.PI);
    this.addEmployee(19, 20, Math.PI);
  }

  build() {
    super.build();

    this.meshes.forEach(function(mesh) {
      if (mesh.material && mesh.material.color) {
        var isWall =
          mesh.geometry &&
          mesh.geometry.type === 'BoxGeometry' &&
          mesh.position.y > 0 &&
          mesh.position.y < 14;
        if (isWall) {
          mesh.material.color.setHex(CONFIG.COLORS.OIL_DARK || 0x222200);
        }
      }
    });

    var targetDefs = [
      {
        id: 'distillation_col',
        type: 'distillation_col',
        pos: [-25, 0, -25],
        label: 'برج التقطير',
        criticalLevel: 5,
      },
      {
        id: 'storage_tank',
        type: 'storage_tank',
        pos: [25, 0, -20],
        label: 'خزان النفط الخام',
        criticalLevel: 5,
      },
      {
        id: 'pump',
        type: 'pump',
        pos: [-10, 0, 20],
        label: 'مضخة النفط',
        criticalLevel: 3,
      },
      {
        id: 'pipeline',
        type: 'pipeline',
        pos: [10, 0, 10],
        label: 'خط الأنابيب',
        criticalLevel: 4,
      },
      {
        id: 'gas_valve',
        type: 'gas_valve',
        pos: [0, 0, -10],
        label: 'صمام الغاز',
        criticalLevel: 4,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-25, 0, -25], cx: -25, cz: -25 },
      { pos: [25, 0, -20],  cx: 25,  cz: -20 },
      { pos: [-10, 0, 20],  cx: -10, cz: 20  },
      { pos: [10, 0, 10],   cx: 10,  cz: 10  },
      { pos: [0, 0, -10],   cx: 0,   cz: -10 },
    ];

    for (var gi = 0; gi < guardDefs.length; gi++) {
      var gd = guardDefs[gi];
      var route;
      if (patrol) {
        route = patrol.generateDefaultRoute(gd.cx, gd.cz, 9, 4);
      } else {
        route = [
          [gd.cx + 9, 0, gd.cz],
          [gd.cx,     0, gd.cz + 9],
          [gd.cx - 9, 0, gd.cz],
          [gd.cx,     0, gd.cz - 9],
        ];
      }
      this.addGuard(gd.pos, route);
    }

    var tankPositions = [
      [-20, 0, 15],
      [20, 0, 15],
      [0, 0, -30],
    ];

    for (var si = 0; si < tankPositions.length; si++) {
      var sp = tankPositions[si];
      var tankGeo = new THREE.CylinderGeometry(3, 3, 12, 16);
      var tankMat = new THREE.MeshPhongMaterial({ color: 0x1a1a00 });
      var tank = new THREE.Mesh(tankGeo, tankMat);
      tank.castShadow = true;
      tank.receiveShadow = true;
      tank.position.set(sp[0], 6, sp[2]);
      this.scene.add(tank);
      this.meshes.push(tank);

      var capGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.4, 16);
      var capMat = new THREE.MeshPhongMaterial({ color: 0x111100 });
      var cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(sp[0], 12.2, sp[2]);
      this.scene.add(cap);
      this.meshes.push(cap);
    }

    var orangeLightPositions = [
      [-30, 5, 0],
      [30, 5, 0],
      [0, 5, 30],
      [0, 5, -30],
    ];

    for (var li = 0; li < orangeLightPositions.length; li++) {
      var lp = orangeLightPositions[li];
      var hazardLight = new THREE.PointLight(0xff6600, 1.8, 20);
      hazardLight.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(hazardLight);
      this.meshes.push(hazardLight);

      var bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
      var bulbMat = new THREE.MeshPhongMaterial({
        color: 0xff6600,
        emissive: new THREE.Color(0xff6600),
        emissiveIntensity: 1.0,
      });
      var bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(bulb);
      this.meshes.push(bulb);
    }

    var pipeSegments = [
      { pos: [-15, 0.3, 0],  len: 20, axis: 'x' },
      { pos: [0, 0.3, -5],   len: 18, axis: 'z' },
      { pos: [5, 0.3, 10],   len: 14, axis: 'x' },
      { pos: [-5, 0.3, -15], len: 16, axis: 'z' },
    ];

    for (var pi = 0; pi < pipeSegments.length; pi++) {
      var ps = pipeSegments[pi];
      var pipeGeo;
      if (ps.axis === 'x') {
        pipeGeo = new THREE.BoxGeometry(ps.len, 0.4, 0.4);
      } else {
        pipeGeo = new THREE.BoxGeometry(0.4, 0.4, ps.len);
      }
      var pipeMat = new THREE.MeshPhongMaterial({ color: 0x333300 });
      var pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(ps.pos[0], ps.pos[1], ps.pos[2]);
      this.scene.add(pipe);
      this.meshes.push(pipe);
    }

    var signPositions = [
      [-30, 3, -10],
      [30, 3, 10],
      [5, 3, 35],
      [-5, 3, -35],
    ];

    for (var wi = 0; wi < signPositions.length; wi++) {
      var wp = signPositions[wi];
      var signGeo = new THREE.BoxGeometry(1.2, 1.2, 0.1);
      var signMat = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
      var sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(wp[0], wp[1], wp[2]);
      this.scene.add(sign);
      this.meshes.push(sign);
    }

    this.addPickup([5, 0, 5], 'sticker_pack');
    this.addPickup([-5, 0, -5], 'drone_kit');
  }
};
