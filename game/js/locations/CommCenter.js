window.CommCenter = class CommCenter extends window.Location {
  constructor(scene) {
    super(scene, 'comm_center');
    this.width = 50;
    this.depth = 50;
    this.wallHeight = 8;
    this.wallColor = 0x223344;
    this.floorColor = 0x111820;
  }

  buildInterior() {
    // Server stacks with pipe cooling runs overhead
    this.addWallPipes(-23, 0, 50, 0x226688);
    this.addWallPipes(23, 0, 50, 0x226688);
    this.addPipeRun(0, 4.0, -15, 40, true, 0x3388aa);

    // Equipment crates / battery banks
    this.addStorageCrates(-20, -18, 2, 3);
    this.addStorageCrates(16, -18, 2, 3);

    // Barrels (coolant)
    this.addBarrels(-20, 10, 4, 0.65);
    this.addBarrels(14, 10, 4, 0.65);

    // Control panels along back wall
    this.addControlPanel(-12, -22, 0);
    this.addControlPanel(0, -22, 0);
    this.addControlPanel(12, -22, 0);

    // Operations room (small)
    this.addPartition(-5, 0, 18, false);
    this.addPartition(-5, 0, 10, true);
    [[-12,-5,0],[-12,-12,0],[-18,-5,Math.PI]].forEach(([x,z,r]) => this.addDesk(x,z,r));
    [[-11,-5],[-11,-12],[-17,-5]].forEach(([x,z]) => this.addEmployee(x,z,Math.PI));
    this.addFilingCabinets(-22, -5, 3, 0);

    // Supervisor desk
    this.addDesk(10, 15, Math.PI);
    this.addEmployee(9, 15, Math.PI);
  }

  build() {
    super.build();

    this.meshes.forEach(function(mesh) {
      if (mesh.material && mesh.material.color) {
        var isWall =
          mesh.geometry &&
          mesh.geometry.type === 'BoxGeometry' &&
          mesh.position.y > 0 &&
          mesh.position.y < 10;
        if (isWall) {
          mesh.material.color.setHex(0x223344);
        }
      }
    });

    var targetDefs = [
      {
        id: 'satellite_dish',
        type: 'satellite_dish',
        pos: [0, 0, -20],
        label: 'الطبق الفضائي',
        criticalLevel: 5,
      },
      {
        id: 'transmitter',
        type: 'transmitter',
        pos: [-15, 0, 10],
        label: 'جهاز الإرسال',
        criticalLevel: 4,
      },
      {
        id: 'server_rack',
        type: 'server_rack',
        pos: [15, 0, 5],
        label: 'خزانة السيرفرات',
        criticalLevel: 3,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [0, 0, -20],   cx: 0,   cz: -20 },
      { pos: [-15, 0, 10],  cx: -15, cz: 10  },
      { pos: [15, 0, 5],    cx: 15,  cz: 5   },
      { pos: [0, 0, 10],    cx: 0,   cz: 10  },
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

    var rackConfigs = [
      { x: -22, z: -20 },
      { x: -22, z: -10 },
      { x: -22, z:   0 },
      { x:  22, z: -20 },
      { x:  22, z: -10 },
      { x:  22, z:   0 },
      { x: -10, z: -22 },
      { x:   0, z: -22 },
      { x:  10, z: -22 },
    ];

    var rackMat = new THREE.MeshPhongMaterial({ color: 0x111822 });

    for (var ri = 0; ri < rackConfigs.length; ri++) {
      var rc = rackConfigs[ri];
      var rackGeo = new THREE.BoxGeometry(1.0, 3.2, 0.5);
      var rack = new THREE.Mesh(rackGeo, rackMat);
      rack.castShadow = true;
      rack.receiveShadow = true;
      rack.position.set(rc.x, 1.6, rc.z);
      this.scene.add(rack);
      this.meshes.push(rack);
    }

    var ledColors = [0x00ffff, 0x00ff88, 0xff6600, 0x0088ff];
    var ledPositions = [
      { x: -22, y: 2.5, z: -20 },
      { x: -22, y: 2.5, z: -10 },
      { x: -22, y: 2.5, z:   0 },
      { x:  22, y: 2.5, z: -20 },
      { x:  22, y: 2.5, z: -10 },
      { x:  22, y: 2.5, z:   0 },
      { x: -10, y: 2.5, z: -22 },
      { x:   0, y: 2.5, z: -22 },
      { x:  10, y: 2.5, z: -22 },
    ];

    for (var li = 0; li < ledPositions.length; li++) {
      var lp = ledPositions[li];
      var ledColor = ledColors[li % ledColors.length];
      var ledGeo = new THREE.SphereGeometry(0.08, 6, 6);
      var ledMat = new THREE.MeshPhongMaterial({
        color: ledColor,
        emissive: new THREE.Color(ledColor),
        emissiveIntensity: 1.0,
      });
      var led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(lp.x, lp.y, lp.z);
      this.scene.add(led);
      this.meshes.push(led);
    }

    var ambientLight = new THREE.PointLight(0x99ccff, 0.8, 60);
    ambientLight.position.set(0, 6, 0);
    this.scene.add(ambientLight);
    this.meshes.push(ambientLight);

    var sideLight1 = new THREE.PointLight(0xaaddff, 0.6, 30);
    sideLight1.position.set(-18, 5, -15);
    this.scene.add(sideLight1);
    this.meshes.push(sideLight1);

    var sideLight2 = new THREE.PointLight(0xaaddff, 0.6, 30);
    sideLight2.position.set(18, 5, -15);
    this.scene.add(sideLight2);
    this.meshes.push(sideLight2);

    var poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 5, 8);
    var poleMat = new THREE.MeshPhongMaterial({ color: 0x334455 });
    var pole = new THREE.Mesh(poleGeo, poleMat);
    pole.castShadow = true;
    pole.position.set(0, 2.5, 0);
    this.scene.add(pole);
    this.meshes.push(pole);

    var coneGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
    var coneMat = new THREE.MeshPhongMaterial({ color: 0x445566 });
    var cone = new THREE.Mesh(coneGeo, coneMat);
    cone.castShadow = true;
    cone.position.set(0, 5.6, 0);
    this.scene.add(cone);
    this.meshes.push(cone);

    this.addPickup([0, 0, 10], 'sticker_pack');
  }
};
