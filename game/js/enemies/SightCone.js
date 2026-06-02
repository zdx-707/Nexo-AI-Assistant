window.SightCone = class SightCone {
  constructor(scene, guard) {
    this.scene = scene;
    this.guard = guard;
    this.range = CONFIG.GUARD_SIGHT_RANGE;
    this.angle = Utils.deg2rad(CONFIG.GUARD_SIGHT_ANGLE);
    this.alertColor = 0xff0000;
    this.normalColor = 0xffff00;
    this.suspiciousColor = 0xff8800;

    const radius = this.range * Math.tan(this.angle / 2);
    const geometry = new THREE.ConeGeometry(radius, this.range, 16, 1, true);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      color: this.normalColor,
      transparent: true,
      opacity: 0.10,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.coneMesh = new THREE.Mesh(geometry, material);
    this.coneMesh.position.set(0, 0, this.range / 2);
    this.coneMesh.visible = false;

    const pivot = new THREE.Object3D();
    pivot.add(this.coneMesh);
    this.pivot = pivot;
    scene.add(this.pivot);

    this.raycaster = new THREE.Raycaster();
    this.visible = true;
  }

  update(guardPos, guardYaw, alertLevel) {
    this.pivot.position.set(guardPos.x, guardPos.y + 1, guardPos.z);
    this.pivot.rotation.y = guardYaw;

    if (alertLevel > 0.5) {
      this.coneMesh.material.color.setHex(this.alertColor);
      this.coneMesh.material.opacity = 0.25;
    } else if (alertLevel >= 0.1) {
      this.coneMesh.material.color.setHex(this.suspiciousColor);
      this.coneMesh.material.opacity = 0.15;
    } else {
      this.coneMesh.material.color.setHex(this.normalColor);
      this.coneMesh.material.opacity = 0.08;
    }
  }

  checkLoS(guardPos, playerPos, sceneObjects = []) {
    const guardEye = new THREE.Vector3(guardPos.x, guardPos.y + 1.5, guardPos.z);
    const playerHead = new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z);

    const direction = new THREE.Vector3().subVectors(playerHead, guardEye);
    const distance = direction.length();

    if (distance > this.range) {
      return false;
    }

    const guardForward = new THREE.Vector3(
      Math.sin(this.pivot.rotation.y),
      0,
      Math.cos(this.pivot.rotation.y)
    );
    const dirFlat = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    const dot = guardForward.dot(dirFlat);
    const halfAngle = this.angle / 2;

    if (dot < Math.cos(halfAngle)) {
      return false;
    }

    this.raycaster.set(guardEye, direction.clone().normalize());
    const intersections = this.raycaster.intersectObjects(sceneObjects, true);

    if (intersections.length > 0 && intersections[0].distance < distance) {
      return false;
    }

    return true;
  }

  setVisible(on) {
    this.coneMesh.visible = on;
    this.visible = on;
  }

  destroy() {
    this.scene.remove(this.pivot);
  }
};
