window.CommandCenter = class CommandCenter extends window.Location {
  constructor(scene) {
    super(scene, 'command_center');
    this.width = 70;
    this.depth = 70;
    this.wallHeight = 10;
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
          mesh.material.color.setHex(0x1a1a2e);
        }
      }
    });

    var targetDefs = [
      {
        id: 'radar_array',
        type: 'radar_array',
        pos: [-20, 0, -20],
        label: 'منظومة الرادار',
        criticalLevel: 5,
      },
      {
        id: 'command_terminal',
        type: 'command_terminal',
        pos: [0, 0, 0],
        label: 'طرفية القيادة',
        criticalLevel: 5,
      },
      {
        id: 'fuel_depot',
        type: 'fuel_depot',
        pos: [20, 0, 15],
        label: 'مستودع الوقود',
        criticalLevel: 4,
      },
      {
        id: 'comms_hub',
        type: 'comms_hub',
        pos: [-10, 0, 20],
        label: 'مركز الاتصالات',
        criticalLevel: 4,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-20, 0, -20], cx: -20, cz: -20 },
      { pos: [0,   0, 0],   cx: 0,   cz: 0   },
      { pos: [20,  0, 15],  cx: 20,  cz: 15  },
      { pos: [-10, 0, 20],  cx: -10, cz: 20  },
      { pos: [15,  0, -15], cx: 15,  cz: -15 },
      { pos: [-15, 0, 10],  cx: -15, cz: 10  },
      { pos: [5,   0, -25], cx: 5,   cz: -25 },
      { pos: [-25, 0, 5],   cx: -25, cz: 5   },
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

    var dishPoleGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
    var dishPoleMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    var dishPole = new THREE.Mesh(dishPoleGeo, dishPoleMat);
    dishPole.position.set(0, 2, -30);
    this.scene.add(dishPole);
    this.meshes.push(dishPole);

    var dishGeo = new THREE.ConeGeometry(3, 2, 16, 1, true);
    var dishMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    var dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = Math.PI / 2;
    dish.position.set(0, 4.5, -30);
    this.scene.add(dish);
    this.meshes.push(dish);

    var consolePositions = [
      [-25, 0, -10],
      [-25, 0, 10],
      [25,  0, -10],
      [25,  0, 10],
      [0,   0, -25],
    ];

    for (var ci = 0; ci < consolePositions.length; ci++) {
      var cp = consolePositions[ci];

      var consoleGeo = new THREE.BoxGeometry(2, 1.2, 0.8);
      var consoleMat = new THREE.MeshPhongMaterial({ color: 0x111122 });
      var consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
      consoleMesh.position.set(cp[0], 0.6, cp[2]);
      this.scene.add(consoleMesh);
      this.meshes.push(consoleMesh);

      var screenGeo = new THREE.BoxGeometry(1.6, 0.9, 0.05);
      var screenMat = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: new THREE.Color(0x00ff88),
        emissiveIntensity: 0.8,
      });
      var screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(cp[0], 0.6, cp[2] - 0.43);
      this.scene.add(screenMesh);
      this.meshes.push(screenMesh);

      var screenLight = new THREE.PointLight(0x00ff88, 0.8, 6);
      screenLight.position.set(cp[0], 1.2, cp[2] - 0.5);
      this.scene.add(screenLight);
      this.meshes.push(screenLight);
    }

    var alertPositions = [
      [-30, 4, -30],
      [30,  4, -30],
      [-30, 4,  30],
      [30,  4,  30],
      [0,   4,  0],
    ];

    for (var ai = 0; ai < alertPositions.length; ai++) {
      var ap = alertPositions[ai];

      var alertLight = new THREE.PointLight(0xff0000, 1.2, 20);
      alertLight.position.set(ap[0], ap[1], ap[2]);
      this.scene.add(alertLight);
      this.meshes.push(alertLight);

      var alertBulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
      var alertBulbMat = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: new THREE.Color(0xff0000),
        emissiveIntensity: 1.0,
      });
      var alertBulb = new THREE.Mesh(alertBulbGeo, alertBulbMat);
      alertBulb.position.set(ap[0], ap[1], ap[2]);
      this.scene.add(alertBulb);
      this.meshes.push(alertBulb);
    }

    var w = this.width;
    var d = this.depth;
    var h = this.wallHeight;

    var cameraWallConfigs = [
      { x: 0,      y: h - 1, z: -(d / 2) + 0.4, ry: 0 },
      { x: 0,      y: h - 1, z:  (d / 2) - 0.4, ry: Math.PI },
      { x: -(w / 2) + 0.4, y: h - 1, z: 0,      ry: Math.PI / 2 },
      { x:  (w / 2) - 0.4, y: h - 1, z: 0,      ry: -Math.PI / 2 },
    ];

    for (var ki = 0; ki < cameraWallConfigs.length; ki++) {
      var kc = cameraWallConfigs[ki];

      var camBoxGeo = new THREE.BoxGeometry(0.5, 0.3, 0.8);
      var camBoxMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
      var camBox = new THREE.Mesh(camBoxGeo, camBoxMat);
      camBox.position.set(kc.x, kc.y, kc.z);
      camBox.rotation.y = kc.ry;
      this.scene.add(camBox);
      this.meshes.push(camBox);

      var lensGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 8);
      var lensMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
      var lens = new THREE.Mesh(lensGeo, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(kc.x, kc.y, kc.z - 0.5);
      this.scene.add(lens);
      this.meshes.push(lens);
    }

    this.addPickup([10, 0, -10], 'sticker_pack');
    this.addPickup([-10, 0, 10], 'disguise_boost');
  }
};
