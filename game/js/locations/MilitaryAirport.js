window.MilitaryAirport = class MilitaryAirport extends window.Location {
  constructor(scene) {
    super(scene, 'military_airport');
    this.width = 100;
    this.depth = 80;
    this.wallHeight = 8;
    this.wallColor = 0x3a3a2a;
    this.floorColor = 0x282820;
  }

  buildInterior() {
    // Control tower office
    this.addPartition(30, -10, 20, false);
    this.addPartition(30, -10, 16, true);

    // ATC workstations
    [[35, -14, 0],[35, -20, 0],[42, -14, Math.PI],[42, -20, Math.PI]].forEach(([x,z,rot]) => {
      this.addDesk(x, z, rot);
    });
    [[36,-14],[36,-20],[43,-14],[43,-20]].forEach(([x,z]) => this.addEmployee(x, z, Math.PI));
    this.addFilingCabinets(46, -10, 3, 0);

    // Security checkpoint near entrance
    const sDesk = this.loader.createDesk(0x3a3a2a);
    sDesk.position.set(0, 0, 32);
    this.scene.add(sDesk);
    this.meshes.push(sDesk);
    const sMon = this.loader.createMonitor();
    sMon.position.set(0, 0.78, 31.7);
    sMon.rotation.y = Math.PI;
    this.scene.add(sMon);
    this.meshes.push(sMon);
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
        mesh.material.color.setHex(0x334433);
      }
    });

    var targetDefs = [
      {
        id: 'fuel_tanks',
        type: 'fuel_tanks',
        pos: [-35, 0, -25],
        label: 'خزانات الوقود',
        criticalLevel: 5,
      },
      {
        id: 'control_tower',
        type: 'control_tower',
        pos: [0, 0, -30],
        label: 'برج المراقبة',
        criticalLevel: 4,
      },
      {
        id: 'hangar',
        type: 'hangar',
        pos: [30, 0, 0],
        label: 'الهنجار العسكري',
        criticalLevel: 4,
      },
      {
        id: 'runway_lights',
        type: 'runway_lights',
        pos: [0, 0, 25],
        label: 'أضواء المدرج',
        criticalLevel: 2,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-35, 0, -25], cx: -35, cz: -25 },
      { pos: [0,   0, -30], cx: 0,   cz: -30 },
      { pos: [30,  0,   0], cx: 30,  cz: 0   },
      { pos: [0,   0,  25], cx: 0,   cz: 25  },
      { pos: [-15, 0,   0], cx: -15, cz: 0   },
      { pos: [15,  0, -10], cx: 15,  cz: -10 },
      { pos: [0,   0,   0], cx: 0,   cz: 0   },
    ];

    for (var gi = 0; gi < guardDefs.length; gi++) {
      var gd = guardDefs[gi];
      var route;
      if (patrol) {
        route = patrol.generateDefaultRoute(gd.cx, gd.cz, 10, 4);
      } else {
        route = [
          [gd.cx + 10, 0, gd.cz],
          [gd.cx,      0, gd.cz + 10],
          [gd.cx - 10, 0, gd.cz],
          [gd.cx,      0, gd.cz - 10],
        ];
      }
      this.addGuard(gd.pos, route);
    }

    var runwayGeo = new THREE.BoxGeometry(80, 0.05, 16);
    var runwayMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    var runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.receiveShadow = true;
    runway.position.set(0, 0.03, 0);
    this.scene.add(runway);
    this.meshes.push(runway);

    var centerLineGeo = new THREE.BoxGeometry(70, 0.06, 0.5);
    var centerLineMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    var centerLine = new THREE.Mesh(centerLineGeo, centerLineMat);
    centerLine.position.set(0, 0.04, 0);
    this.scene.add(centerLine);
    this.meshes.push(centerLine);

    var hangarGeo = new THREE.BoxGeometry(22, 5, 18);
    var hangarMat = new THREE.MeshPhongMaterial({ color: 0x556655 });
    var hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.castShadow = true;
    hangar.receiveShadow = true;
    hangar.position.set(30, 2.5, 0);
    this.scene.add(hangar);
    this.meshes.push(hangar);

    var aircraftBodyGeo = new THREE.BoxGeometry(14, 1.2, 3);
    var aircraftMat = new THREE.MeshPhongMaterial({ color: 0x778877 });
    var aircraftBody = new THREE.Mesh(aircraftBodyGeo, aircraftMat);
    aircraftBody.castShadow = true;
    aircraftBody.position.set(-10, 0.7, 5);
    this.scene.add(aircraftBody);
    this.meshes.push(aircraftBody);

    var noseGeo = new THREE.ConeGeometry(1.5, 4, 4);
    var noseMat = new THREE.MeshPhongMaterial({ color: 0x667766 });
    var nose = new THREE.Mesh(noseGeo, noseMat);
    nose.castShadow = true;
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(-3, 0.7, 5);
    this.scene.add(nose);
    this.meshes.push(nose);

    var wingGeo = new THREE.BoxGeometry(3, 0.3, 16);
    var wingMat = new THREE.MeshPhongMaterial({ color: 0x778877 });
    var wing = new THREE.Mesh(wingGeo, wingMat);
    wing.castShadow = true;
    wing.position.set(-10, 0.7, 5);
    this.scene.add(wing);
    this.meshes.push(wing);

    var runwayLightPositionsLeft = [
      [-38, 0, -7],
      [-22, 0, -7],
      [-6,  0, -7],
      [10,  0, -7],
      [26,  0, -7],
    ];

    var runwayLightPositionsRight = [
      [-38, 0, 7],
      [-22, 0, 7],
      [-6,  0, 7],
      [10,  0, 7],
      [26,  0, 7],
    ];

    var allLightPositions = runwayLightPositionsLeft.concat(runwayLightPositionsRight);

    for (var rli = 0; rli < allLightPositions.length; rli++) {
      var rlp = allLightPositions[rli];
      var sphereGeo = new THREE.SphereGeometry(0.2, 8, 8);
      var sphereMat = new THREE.MeshPhongMaterial({
        color: 0x00ff44,
        emissive: new THREE.Color(0x00ff44),
        emissiveIntensity: 1.0,
      });
      var sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(rlp[0], rlp[1] + 0.2, rlp[2]);
      this.scene.add(sphere);
      this.meshes.push(sphere);

      var glow = new THREE.PointLight(0x00ff44, 0.6, 5);
      glow.position.set(rlp[0], rlp[1] + 0.5, rlp[2]);
      this.scene.add(glow);
      this.meshes.push(glow);
    }

    var towerBaseGeo = new THREE.BoxGeometry(3, 10, 3);
    var towerMat = new THREE.MeshPhongMaterial({ color: 0x445544 });
    var towerBase = new THREE.Mesh(towerBaseGeo, towerMat);
    towerBase.castShadow = true;
    towerBase.position.set(0, 5, -30);
    this.scene.add(towerBase);
    this.meshes.push(towerBase);

    var towerCabinGeo = new THREE.BoxGeometry(5, 3, 5);
    var towerCabinMat = new THREE.MeshPhongMaterial({ color: 0x667766 });
    var towerCabin = new THREE.Mesh(towerCabinGeo, towerCabinMat);
    towerCabin.castShadow = true;
    towerCabin.position.set(0, 11.5, -30);
    this.scene.add(towerCabin);
    this.meshes.push(towerCabin);

    var fuelTankDefs = [
      [-35, 0, -25],
      [-28, 0, -25],
    ];

    for (var fti = 0; fti < fuelTankDefs.length; fti++) {
      var ftp = fuelTankDefs[fti];
      var tankGeo = new THREE.CylinderGeometry(2, 2, 5, 12);
      var tankMat = new THREE.MeshPhongMaterial({ color: 0x3a4a3a });
      var tank = new THREE.Mesh(tankGeo, tankMat);
      tank.castShadow = true;
      tank.position.set(ftp[0], 2.5, ftp[2]);
      this.scene.add(tank);
      this.meshes.push(tank);
    }

    this.addPickup([10, 0, 10], 'sticker_pack');
    this.addPickup([-10, 0, -10], 'drone_kit');
  }
};
