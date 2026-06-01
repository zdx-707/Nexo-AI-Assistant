window.ExplosionTarget = class ExplosionTarget {
  constructor(scene, interactiveTarget) {
    this.id = interactiveTarget.id;
    this.scene = scene;
    this.target = interactiveTarget;
    this.pos = interactiveTarget.pos;
    this.armed = true;
    this.blinkTimer = 0;

    const indicatorGeo = new THREE.OctahedronGeometry(0.2);
    const indicatorMat = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      emissive: new THREE.Color(0xff0000),
    });
    this.indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
    this.indicator.position.set(this.pos.x, this.pos.y + 1.5, this.pos.z);
    scene.add(this.indicator);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z),
      new THREE.Vector3(this.pos.x, this.pos.y + 1.5, this.pos.z),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.line = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(this.line);
  }

  update(dt) {
    this.blinkTimer += dt * 4;
    this.indicator.visible = Math.sin(this.blinkTimer) > 0;
    this.indicator.rotation.y += dt * 2;
  }

  detonate() {
    this.scene.remove(this.indicator);
    this.scene.remove(this.line);
    this.target.destroy();
    this.armed = false;
  }

  cancel() {
    this.scene.remove(this.indicator);
    this.scene.remove(this.line);
    this.armed = false;
  }
};
