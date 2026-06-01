window.CentralBank = class CentralBank extends window.Location {
  constructor(scene) {
    super(scene, 'central_bank');
    this.width = 55;
    this.depth = 55;
    this.wallHeight = 9;
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
        mesh.material.color.setHex(0xd4c9a8);
      }
    });

    this.meshes.forEach(function(mesh) {
      if (
        mesh.material &&
        mesh.material.color &&
        mesh.geometry &&
        mesh.geometry.type === 'PlaneGeometry'
      ) {
        mesh.material.color.setHex(0xe8e0d0);
      }
    });

    var targetDefs = [
      {
        id: 'vault_server',
        type: CONFIG.TARGET_TYPES.central_bank[0],
        pos: [-10, 0, -15],
        label: 'سيرفر الخزينة',
        criticalLevel: 5,
      },
      {
        id: 'currency_reserve',
        type: CONFIG.TARGET_TYPES.central_bank[1],
        pos: [15, 0, -10],
        label: 'احتياطي العملة',
        criticalLevel: 4,
      },
      {
        id: 'security_system',
        type: CONFIG.TARGET_TYPES.central_bank[2],
        pos: [0, 0, 20],
        label: 'نظام الأمان',
        criticalLevel: 3,
      },
    ];

    for (var ti = 0; ti < targetDefs.length; ti++) {
      this.addTarget(targetDefs[ti]);
    }

    var patrol = window.PatrolSystem ? new window.PatrolSystem() : null;

    var guardDefs = [
      { pos: [-10, 0, -15], cx: -10, cz: -15 },
      { pos: [15, 0, -10],  cx: 15,  cz: -10 },
      { pos: [0, 0, 20],    cx: 0,   cz: 20  },
      { pos: [-5, 0, 5],    cx: -5,  cz: 5   },
      { pos: [10, 0, 5],    cx: 10,  cz: 5   },
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

    var halfW = this.width / 2;
    var halfD = this.depth / 2;
    var columnPositions = [
      [-halfW + 3, 0, -halfD + 3],
      [ halfW - 3, 0, -halfD + 3],
      [-halfW + 3, 0,  halfD - 3],
      [ halfW - 3, 0,  halfD - 3],
    ];

    for (var ci = 0; ci < columnPositions.length; ci++) {
      var cp = columnPositions[ci];
      var colGeo = new THREE.BoxGeometry(1.2, this.wallHeight, 1.2);
      var colMat = new THREE.MeshPhongMaterial({ color: 0xffd700 });
      var col = new THREE.Mesh(colGeo, colMat);
      col.castShadow = true;
      col.receiveShadow = true;
      col.position.set(cp[0], this.wallHeight / 2, cp[2]);
      this.scene.add(col);
      this.meshes.push(col);
    }

    var camPositions = [
      [-halfW + 1, 6, 0],
      [ halfW - 1, 6, 0],
    ];

    for (var ki = 0; ki < camPositions.length; ki++) {
      var kp = camPositions[ki];
      var camGeo = new THREE.BoxGeometry(0.4, 0.3, 0.6);
      var camMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
      var cam = new THREE.Mesh(camGeo, camMat);
      cam.castShadow = true;
      cam.position.set(kp[0], kp[1], kp[2]);
      this.scene.add(cam);
      this.meshes.push(cam);
    }

    var lightPositions = [
      [-10, 4, -15],
      [ 15, 4, -10],
      [  0, 4,  20],
      [  0, 4,   0],
    ];

    for (var li = 0; li < lightPositions.length; li++) {
      var lp = lightPositions[li];
      var warmLight = new THREE.PointLight(0xfff0aa, 1.2, 20);
      warmLight.position.set(lp[0], lp[1], lp[2]);
      this.scene.add(warmLight);
      this.meshes.push(warmLight);
    }

    this.addPickup([5, 0, 0], 'sticker_pack');
  }
};
