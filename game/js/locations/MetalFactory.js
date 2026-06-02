window.MetalFactory = class MetalFactory extends window.Location {
  constructor(scene) {
    super(scene, 'metal_factory');
    this.width = 60;
    this.depth = 60;
    this.wallHeight = 9;
    this.wallColor = 0x404040;
    this.floorColor = 0x252525;
  }

  buildInterior() {
    // Admin corridor left
    this.addPartition(-8, -5, 20, false);
    this.addPartition(-8, -5, 14, true);

    // Admin desks
    [[-14, -8, 0],[-14, -14, 0],[-20, -8, Math.PI],[-20, -14, Math.PI]].forEach(([x,z,rot]) => {
      this.addDesk(x, z, rot);
    });
    [[-13,-8],[-13,-14],[-19,-8],[-19,-14]].forEach(([x,z]) => this.addEmployee(x, z, Math.PI));
    this.addFilingCabinets(-25, -8, 3, 0);

    // Quality control station
    this.addDesk(18, 20, Math.PI);
    this.addEmployee(17, 20, Math.PI);
    const qMon = this.loader.createMonitor();
    qMon.position.set(18, 0.78, 19.7);
    qMon.rotation.y = Math.PI;
    this.scene.add(qMon);
    this.meshes.push(qMon);
  }

  build() {
    super.build();

    var self = this;
    this.meshes.forEach(function(mesh) {
      if (
        mesh.material &&
        mesh.material.color &&
        mesh.geometry &&
        mesh.geometry.type === 'BoxGeometry' &&
        mesh.position.y > 0 &&
        mesh.position.y < self.wallHeight
      ) {
        mesh.material.color.setHex(0x444444);
      }
    });

    var targetDefs = [
      {
        id: 'smelter',
        type: 'smelter',
        pos: [-15, 0, -15],
        label: 'فرن الصهر',
        criticalLevel: 4,
      },
      {
        id: 'casting_machine',
        type: 'casting_machine',
        pos: [15, 0, -10],
        label: 'آلة الصب',
        criticalLevel: 3,
      },
      {
        id: 'gas_system',
        type: 'gas_system',
        pos: [0, 0, 20],
        label: 'منظومة الغاز',
        criticalLevel: 4,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-15, 0, -15], cx: -15, cz: -15 },
      { pos: [15, 0, -10],  cx: 15,  cz: -10 },
      { pos: [0, 0, 20],    cx: 0,   cz: 20  },
      { pos: [5, 0, -5],    cx: 5,   cz: -5  },
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

    var smelterGeo = new THREE.BoxGeometry(4, 5, 4);
    var smelterMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    var smelterBox = new THREE.Mesh(smelterGeo, smelterMat);
    smelterBox.castShadow = true;
    smelterBox.receiveShadow = true;
    smelterBox.position.set(-15, 2.5, -15);
    this.scene.add(smelterBox);
    this.meshes.push(smelterBox);

    var smelterGlow = new THREE.PointLight(0xff6600, 2.5, 18);
    smelterGlow.position.set(-15, 3, -15);
    this.scene.add(smelterGlow);
    this.meshes.push(smelterGlow);

    var moldPositions = [
      [12, 0, -8],
      [15, 0, -8],
      [18, 0, -8],
      [12, 0, -12],
      [15, 0, -12],
    ];

    for (var mi = 0; mi < moldPositions.length; mi++) {
      var mp = moldPositions[mi];
      var moldGeo = new THREE.BoxGeometry(2, 0.3, 1.2);
      var moldMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
      var mold = new THREE.Mesh(moldGeo, moldMat);
      mold.castShadow = true;
      mold.receiveShadow = true;
      mold.position.set(mp[0], 0.15, mp[2]);
      this.scene.add(mold);
      this.meshes.push(mold);
    }

    var conveyorSegments = [
      [-5, 0, 0],
      [0,  0, 0],
      [5,  0, 0],
      [10, 0, 0],
    ];

    for (var ci = 0; ci < conveyorSegments.length; ci++) {
      var cs = conveyorSegments[ci];
      var convGeo = new THREE.BoxGeometry(5, 0.4, 1.5);
      var convMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
      var conv = new THREE.Mesh(convGeo, convMat);
      conv.castShadow = true;
      conv.receiveShadow = true;
      conv.position.set(cs[0], 0.2, cs[2]);
      this.scene.add(conv);
      this.meshes.push(conv);
    }

    var sparkPositions = [
      [-13, 5, -15],
      [-15, 4.5, -13],
      [-17, 5.5, -15],
      [-15, 6, -17],
      [-14, 4, -16],
    ];

    for (var si = 0; si < sparkPositions.length; si++) {
      var sp = sparkPositions[si];
      var sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
      var sparkMat = new THREE.MeshPhongMaterial({
        color: 0xffee00,
        emissive: new THREE.Color(0xffcc00),
        emissiveIntensity: 1.0,
      });
      var spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.position.set(sp[0], sp[1], sp[2]);
      this.scene.add(spark);
      this.meshes.push(spark);
    }

    var industrialLightPositions = [
      [-15, 5, -15],
      [15,  5, -10],
      [0,   5,  20],
      [0,   5,   0],
    ];

    for (var li = 0; li < industrialLightPositions.length; li++) {
      var lp = industrialLightPositions[li];
      var indLight = new THREE.PointLight(0xff4400, 1.2, 22);
      indLight.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(indLight);
      this.meshes.push(indLight);
    }

    this.addPickup([5, 0, 5], 'sticker_pack');
  }
};
