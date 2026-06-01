window.OilRefinery = class OilRefinery extends window.Location {
  constructor(scene) {
    super(scene, 'oil_refinery');
    this.width = 75;
    this.depth = 75;
    this.wallHeight = 14;
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
