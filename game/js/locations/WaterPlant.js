window.WaterPlant = class WaterPlant extends window.Location {
  constructor(scene) {
    super(scene, 'water_plant');
    this.width = 50;
    this.depth = 50;
    this.wallHeight = 7;
    this.wallColor = 0x2a4050;
    this.floorColor = 0x151e25;
  }

  buildInterior() {
    // Water storage tanks
    this.addIndustrialTank(-18, -18, 1.1, 4.0, 0x3366aa);
    this.addIndustrialTank(-10, -18, 0.9, 3.2, 0x2255aa);
    this.addIndustrialTank(12, -18, 1.1, 4.0, 0x3366aa);

    // Pump pipe networks
    this.addWallPipes(-23, 0, 50, 0x2255aa);
    this.addWallPipes(23, 0, 50, 0x2255aa);
    this.addPipeRun(0, 2.5, -10, 40, true, 0x3366bb);

    // Chemical barrels (treatment)
    this.addBarrels(-18, 8, 4, 0.65);
    this.addBarrels(12, 8, 4, 0.65);

    // Control panels
    this.addControlPanel(-20, -5, Math.PI / 2);
    this.addControlPanel(18, -5, -Math.PI / 2);
    this.addControlPanel(0, -21, 0);

    // Monitoring room
    this.addPartition(-5, 0, 14, false);
    this.addPartition(-5, 0, 8, true);
    [[-10,2,0],[-10,-4,0],[-16,2,Math.PI]].forEach(([x,z,r]) => this.addDesk(x,z,r));
    [[-9,2],[-9,-4],[-15,2]].forEach(([x,z]) => this.addEmployee(x,z,Math.PI));
    this.addFilingCabinets(-20, -4, 3, 0);

    // Security desk
    const ed = this.loader.createDesk(0x2a4050);
    ed.position.set(0, 0, 20); this.scene.add(ed); this.meshes.push(ed);
    const em = this.loader.createMonitor();
    em.position.set(0, 0.78, 19.7); em.rotation.y = Math.PI;
    this.scene.add(em); this.meshes.push(em);
  }

  build() {
    super.build();

    var self = this;
    this.meshes.forEach(function(mesh) {
      if (mesh.material && mesh.material.color) {
        var isWall =
          mesh.geometry &&
          mesh.geometry.type === 'BoxGeometry' &&
          mesh.position.y > 0 &&
          mesh.position.y < self.wallHeight;
        if (isWall) {
          mesh.material.color.setHex(0x336655);
        }
      }
    });

    this.meshes.forEach(function(mesh) {
      if (
        mesh.material &&
        mesh.material.color &&
        mesh.geometry &&
        mesh.geometry.type === 'PlaneGeometry'
      ) {
        mesh.material.color.setHex(0x2a2a35);
      }
    });

    var targetDefs = [
      {
        id: 'main_pump',
        type: 'main_pump',
        pos: [-10, 0, -10],
        label: 'المضخة الرئيسية',
        criticalLevel: 4,
      },
      {
        id: 'purification',
        type: 'purification',
        pos: [10, 0, -5],
        label: 'نظام التنقية',
        criticalLevel: 3,
      },
      {
        id: 'reservoir_valve',
        type: 'reservoir_valve',
        pos: [0, 0, 15],
        label: 'صمام الخزان',
        criticalLevel: 3,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-10, 0, -10], cx: -10, cz: -10 },
      { pos: [10, 0, -5],   cx: 10,  cz: -5  },
      { pos: [0, 0, 15],    cx: 0,   cz: 15  },
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

    var tankPositions = [
      { x: -15, z: -15 },
      { x:  15, z: -15 },
    ];

    for (var tki = 0; tki < tankPositions.length; tki++) {
      var tp = tankPositions[tki];
      var tankGeo = new THREE.CylinderGeometry(3, 3, 6, 16);
      var tankMat = new THREE.MeshPhongMaterial({ color: 0x336688 });
      var tank = new THREE.Mesh(tankGeo, tankMat);
      tank.castShadow = true;
      tank.receiveShadow = true;
      tank.position.set(tp.x, 3, tp.z);
      this.scene.add(tank);
      this.meshes.push(tank);
    }

    var pipeSegments = [
      { x: -10, z: 0, len: 14, axis: 'z' },
      { x:  10, z: 0, len: 14, axis: 'z' },
      { x:   0, z: 5, len: 20, axis: 'x' },
    ];

    for (var pi = 0; pi < pipeSegments.length; pi++) {
      var ps = pipeSegments[pi];
      var pipeGeo = new THREE.CylinderGeometry(0.18, 0.18, ps.len, 8);
      var pipeMat = new THREE.MeshPhongMaterial({ color: 0x2255aa });
      var pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.castShadow = true;
      pipe.receiveShadow = true;
      if (ps.axis === 'x') {
        pipe.rotation.z = Math.PI / 2;
      } else {
        pipe.rotation.x = Math.PI / 2;
      }
      pipe.position.set(ps.x, 0.18, ps.z);
      this.scene.add(pipe);
      this.meshes.push(pipe);
    }

    var lightDefs = [
      { x: -10, z: -10, color: 0xaaddff, intensity: 0.9, dist: 20 },
      { x:  10, z: -5,  color: 0xaaddff, intensity: 0.9, dist: 20 },
      { x:   0, z:  15, color: 0xaaddff, intensity: 0.9, dist: 20 },
      { x:   0, z:   0, color: 0xcceeff, intensity: 0.7, dist: 30 },
    ];

    for (var li = 0; li < lightDefs.length; li++) {
      var ld = lightDefs[li];
      var ptLight = new THREE.PointLight(ld.color, ld.intensity, ld.dist);
      ptLight.position.set(ld.x, 4, ld.z);
      this.scene.add(ptLight);
      this.meshes.push(ptLight);
    }

    this.addPickup([0, 0, 0], 'sticker_pack');
  }
};
