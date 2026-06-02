window.WeaponsFactory = class WeaponsFactory extends window.Location {
  constructor(scene) {
    super(scene, 'weapons_factory');
    this.width = 70;
    this.depth = 70;
    this.wallHeight = 10;
    this.wallColor = 0x3a4a2a;
    this.floorColor = 0x2a2a2a;
  }

  buildInterior() {
    // Conveyor assembly lines
    this.addConveyor(-6, 5, 14, 0);
    this.addConveyor(6, 5, 14, 0);
    this.addConveyor(-6, -8, 14, 0);
    this.addConveyor(6, -8, 14, 0);

    // Storage tanks
    this.addIndustrialTank(-28, -24, 1.0, 3.5, 0x445566);
    this.addIndustrialTank(-22, -24, 0.8, 2.8, 0x334455);
    this.addIndustrialTank(24, -24, 1.0, 3.5, 0x554433);

    // Weapons crates stacked along walls
    this.addStorageCrates(-28, 10, 3, 3);
    this.addStorageCrates(-28, 18, 2, 3);
    this.addStorageCrates(22, 10, 3, 3);
    this.addStorageCrates(22, 18, 2, 2);

    // Propellant barrels
    this.addBarrels(-15, -28, 5);
    this.addBarrels(8, -28, 5);

    // Wall pipes
    this.addWallPipes(-33, 0, 60, 0x5566aa);
    this.addWallPipes(33, 0, 60, 0x5566aa);

    // Control panels
    this.addControlPanel(-24, 0, Math.PI / 2);
    this.addControlPanel(22, 0, -Math.PI / 2);
    this.addControlPanel(0, -28, 0);

    // Admin corner
    this.addPartition(-12, -10, 22, false);
    this.addPartition(-12, -10, 14, true);
    [[-20,-18,0],[-20,-12,0],[-25,-18,Math.PI]].forEach(([x,z,y]) => this.addDesk(x,z,y));
    [[-19,-18],[-19,-12],[-24,-18]].forEach(([x,z]) => this.addEmployee(x,z,Math.PI));
    this.addFilingCabinets(-30, -18, 3, 0);

    // Security desk at entrance
    const sd = this.loader.createDesk(0x444444);
    sd.position.set(0, 0, 25); this.scene.add(sd); this.meshes.push(sd);
    const sm = this.loader.createMonitor();
    sm.position.set(0, 0.78, 24.7); sm.rotation.y = Math.PI;
    this.scene.add(sm); this.meshes.push(sm);
  }

  build() {
    super.build();

    this.meshes.forEach(function(mesh) {
      if (mesh.material && mesh.material.color) {
        const isWall =
          mesh.geometry &&
          mesh.geometry.type === 'BoxGeometry' &&
          mesh.position.y > 0 &&
          mesh.position.y < 10;
        if (isWall) {
          mesh.material.color.setHex(CONFIG.COLORS.MILITARY_GREEN);
        }
      }
    });

    const targetDefs = [
      {
        id: 'missile_storage',
        type: CONFIG.TARGET_TYPES.weapons_factory[0],
        pos: [-15, 0, -20],
        label: 'مخزن الصواريخ',
        criticalLevel: 5,
      },
      {
        id: 'assembly_line',
        type: CONFIG.TARGET_TYPES.weapons_factory[1],
        pos: [10, 0, 0],
        label: 'خط التجميع',
        criticalLevel: 4,
      },
      {
        id: 'fuel_tank',
        type: CONFIG.TARGET_TYPES.weapons_factory[2],
        pos: [-10, 0, 15],
        label: 'خزان الوقود',
        criticalLevel: 4,
      },
      {
        id: 'armoury',
        type: CONFIG.TARGET_TYPES.weapons_factory[3],
        pos: [20, 0, -10],
        label: 'مخزن الذخيرة',
        criticalLevel: 3,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-15, 0, -20], cx: -15, cz: -20 },
      { pos: [10, 0, 0],    cx: 10,  cz: 0   },
      { pos: [-10, 0, 15],  cx: -10, cz: 15  },
      { pos: [20, 0, -10],  cx: 20,  cz: -10 },
      { pos: [0, 0, -5],    cx: 0,   cz: -5  },
      { pos: [-5, 0, 5],    cx: -5,  cz: 5   },
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

    var rackPositions = [
      [-30, 5, -30],
      [30,  5, -30],
      [-30, 5,  30],
      [30,  5,  30],
    ];

    for (var ri = 0; ri < rackPositions.length; ri++) {
      var rp = rackPositions[ri];
      var rackGeo = new THREE.BoxGeometry(1.2, 2.8, 0.6);
      var rackMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
      var rack = new THREE.Mesh(rackGeo, rackMat);
      rack.castShadow = true;
      rack.receiveShadow = true;
      rack.position.set(rp[0], rp[1] - 3.6, rp[2]);
      this.scene.add(rack);
      this.meshes.push(rack);
    }

    var lightPositions = [
      [-5, 2, 33],
      [5,  2, 33],
    ];

    for (var li = 0; li < lightPositions.length; li++) {
      var lp = lightPositions[li];
      var redLight = new THREE.PointLight(0xff0000, 1.5, 12);
      redLight.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(redLight);
      this.meshes.push(redLight);

      var bulbGeo = new THREE.SphereGeometry(0.15, 8, 8);
      var bulbMat = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: new THREE.Color(0xff0000),
        emissiveIntensity: 1.0,
      });
      var bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(bulb);
      this.meshes.push(bulb);
    }

    this.addPickup([0, 0, 5], 'sticker_pack');
    this.addPickup([-5, 0, -5], 'drone_kit');
  }
};
