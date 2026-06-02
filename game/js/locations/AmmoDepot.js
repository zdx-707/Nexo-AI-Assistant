window.AmmoDepot = class AmmoDepot extends window.Location {
  constructor(scene) {
    super(scene, 'ammo_depot');
    this.width = 65;
    this.depth = 65;
    this.wallHeight = 8;
    this.wallColor = 0x2a2010;
    this.floorColor = 0x1a1810;
  }

  buildInterior() {
    // Ammo crates stacked high along all walls
    this.addStorageCrates(-26, -25, 4, 5);
    this.addStorageCrates(-26, -12, 3, 5);
    this.addStorageCrates(-26, 5, 3, 5);
    this.addStorageCrates(20, -25, 4, 5);
    this.addStorageCrates(20, -12, 3, 4);
    this.addStorageCrates(20, 5, 3, 4);

    // Explosive barrel clusters
    this.addBarrels(-22, -5, 5, 0.7);
    this.addBarrels(-22, 2, 5, 0.7);
    this.addBarrels(16, -5, 5, 0.7);
    this.addBarrels(16, 2, 5, 0.7);

    // Conveyors (ammo handling)
    this.addConveyor(-5, -10, 16, 0);
    this.addConveyor(5, -10, 16, 0);

    // Wall pipes (sprinkler/safety)
    this.addWallPipes(-31, 0, 65, 0x885522);
    this.addWallPipes(31, 0, 65, 0x885522);

    // Control panels
    this.addControlPanel(0, -28, 0);
    this.addControlPanel(-28, 0, Math.PI / 2);
    this.addControlPanel(26, 0, -Math.PI / 2);

    // Inventory office
    this.addPartition(-10, 5, 16, true);
    this.addPartition(-10, 5, 10, false);
    [[-16,8,0],[-16,2,0],[-22,8,Math.PI]].forEach(([x,z,r]) => this.addDesk(x,z,r));
    [[-15,8],[-15,2],[-21,8]].forEach(([x,z]) => this.addEmployee(x,z,Math.PI));
    this.addFilingCabinets(-28, 5, 3, 0);

    // Checkpoint desk at entrance
    const cd = this.loader.createDesk(0x4a3010);
    cd.position.set(0, 0, 26); this.scene.add(cd); this.meshes.push(cd);
    const cm = this.loader.createMonitor();
    cm.position.set(0, 0.78, 25.7); cm.rotation.y = Math.PI;
    this.scene.add(cm); this.meshes.push(cm);
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
          mesh.material.color.setHex(0x3a2000);
        }
      }
    });

    var targetDefs = [
      {
        id: 'explosive_storage',
        type: 'explosive_storage',
        pos: [-20, 0, -20],
        label: 'مخزن المتفجرات',
        criticalLevel: 5,
      },
      {
        id: 'loading_bay',
        type: 'loading_bay',
        pos: [20, 0, -15],
        label: 'منطقة التحميل',
        criticalLevel: 4,
      },
      {
        id: 'cooling_system',
        type: 'cooling_system',
        pos: [0, 0, 20],
        label: 'نظام التبريد',
        criticalLevel: 3,
      },
      {
        id: 'detonator_rack',
        type: 'detonator_rack',
        pos: [-15, 0, 15],
        label: 'رفوف المفجرات',
        criticalLevel: 5,
      },
      {
        id: 'fuel_line',
        type: 'fuel_line',
        pos: [15, 0, 10],
        label: 'خط الوقود',
        criticalLevel: 4,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-20, 0, -20], cx: -20, cz: -20 },
      { pos: [20, 0, -15],  cx: 20,  cz: -15 },
      { pos: [0, 0, 20],    cx: 0,   cz: 20  },
      { pos: [-15, 0, 15],  cx: -15, cz: 15  },
      { pos: [15, 0, 10],   cx: 15,  cz: 10  },
      { pos: [0, 0, -5],    cx: 0,   cz: -5  },
      { pos: [-8, 0, 0],    cx: -8,  cz: 0   },
      { pos: [8, 0, -8],    cx: 8,   cz: -8  },
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

    var crateMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

    var crateClusterDefs = [
      { x: -25, z: -25, count: 3 },
      { x: 22,  z: -22, count: 3 },
      { x: -22, z: 22,  count: 2 },
      { x: 25,  z: 18,  count: 3 },
      { x: 0,   z: -28, count: 2 },
      { x: 10,  z: 25,  count: 2 },
    ];

    for (var ci = 0; ci < crateClusterDefs.length; ci++) {
      var cc = crateClusterDefs[ci];
      for (var cj = 0; cj < cc.count; cj++) {
        var crateW = 1.2 + Math.random() * 0.4;
        var crateH = 1.0 + Math.random() * 0.6;
        var crateGeo = new THREE.BoxGeometry(crateW, crateH, crateW);
        var crate = new THREE.Mesh(crateGeo, crateMat);
        crate.castShadow = true;
        crate.receiveShadow = true;
        var stackX = cc.x + (cj % 2 === 0 ? 0 : 1.4);
        var stackY = crateH / 2 + (cj >= 2 ? 1.2 : 0);
        var stackZ = cc.z + (cj >= 2 ? 0 : 0);
        crate.position.set(stackX, stackY, stackZ);
        this.scene.add(crate);
        this.meshes.push(crate);
      }
    }

    var warnMat = new THREE.MeshPhongMaterial({
      color: 0xcc0000,
      emissive: new THREE.Color(0x880000),
      emissiveIntensity: 0.8,
    });

    var warnPositions = [
      { x: -28, y: 2, z: 0   },
      { x:  28, y: 2, z: 0   },
      { x:  0,  y: 2, z: -30 },
      { x:  0,  y: 2, z:  30 },
      { x: -20, y: 2, z: -28 },
      { x:  20, y: 2, z:  28 },
    ];

    for (var wi = 0; wi < warnPositions.length; wi++) {
      var wp = warnPositions[wi];
      var warnGeo = new THREE.BoxGeometry(0.8, 0.8, 0.1);
      var warn = new THREE.Mesh(warnGeo, warnMat);
      warn.position.set(wp.x, wp.y, wp.z);
      this.scene.add(warn);
      this.meshes.push(warn);
    }

    var redLightPositions = [
      { x: -15, y: 5, z: -15 },
      { x:  15, y: 5, z: -15 },
      { x: -15, y: 5, z:  15 },
      { x:  15, y: 5, z:  15 },
      { x:   0, y: 5, z:   0 },
    ];

    for (var rl = 0; rl < redLightPositions.length; rl++) {
      var rp = redLightPositions[rl];
      var redLight = new THREE.PointLight(0xff2200, 0.5, 25);
      redLight.position.set(rp.x, rp.y, rp.z);
      this.scene.add(redLight);
      this.meshes.push(redLight);

      var bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
      var bulbMat = new THREE.MeshPhongMaterial({
        color: 0xff2200,
        emissive: new THREE.Color(0xff2200),
        emissiveIntensity: 1.0,
      });
      var bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(rp.x, rp.y, rp.z);
      this.scene.add(bulb);
      this.meshes.push(bulb);
    }

    var tapeYellowMat = new THREE.MeshPhongMaterial({ color: 0xffdd00 });
    var tapeBlackMat  = new THREE.MeshPhongMaterial({ color: 0x111111 });

    var tapeDefs = [
      { x: -10, z: -5  },
      { x:   5, z: -18 },
      { x:  18, z:  5  },
      { x:  -5, z:  18 },
    ];

    for (var tpi = 0; tpi < tapeDefs.length; tpi++) {
      var td = tapeDefs[tpi];
      for (var ts = 0; ts < 4; ts++) {
        var isYellow = ts % 2 === 0;
        var tapeMat = isYellow ? tapeYellowMat : tapeBlackMat;
        var tapeGeo = new THREE.BoxGeometry(0.5, 0.05, 3.0);
        var tape = new THREE.Mesh(tapeGeo, tapeMat);
        tape.position.set(td.x + ts * 0.55, 0.025, td.z);
        this.scene.add(tape);
        this.meshes.push(tape);
      }
    }

    var noWeaponBaseMat  = new THREE.MeshPhongMaterial({ color: 0x222222 });
    var noWeaponStripMat = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: new THREE.Color(0x662200),
      emissiveIntensity: 0.6,
    });

    var noWeaponPositions = [
      { x: -27, y: 3, z: -10 },
      { x:  27, y: 3, z:  10 },
      { x: -10, y: 3, z:  29 },
      { x:  10, y: 3, z: -29 },
    ];

    for (var nw = 0; nw < noWeaponPositions.length; nw++) {
      var np = noWeaponPositions[nw];
      var baseGeo = new THREE.BoxGeometry(1.2, 0.7, 0.1);
      var base = new THREE.Mesh(baseGeo, noWeaponBaseMat);
      base.position.set(np.x, np.y, np.z);
      this.scene.add(base);
      this.meshes.push(base);

      var stripeGeo = new THREE.BoxGeometry(1.2, 0.12, 0.12);
      var stripe = new THREE.Mesh(stripeGeo, noWeaponStripMat);
      stripe.position.set(np.x, np.y, np.z + 0.05);
      this.scene.add(stripe);
      this.meshes.push(stripe);
    }

    this.addPickup([0, 0, -5],  'sticker_pack');
    this.addPickup([5, 0, 5],   'drone_kit');
    this.addPickup([-5, 0, 0],  'disguise_boost');
  }
};
