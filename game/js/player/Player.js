window.Player = class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.pos = new THREE.Vector3(0, CONFIG.PLAYER_HEIGHT, 0);
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.speed = CONFIG.PLAYER_SPEED;
    this.crouching = false;
    this.height = CONFIG.PLAYER_HEIGHT;
    this.onGround = true;
    this.suspicion = 0;
    this.alive = true;

    this.mesh = (new AssetLoader()).createPlayerMesh();
    this.mesh.visible = false;
    this.scene.add(this.mesh);

    this.camera.position.copy(this.pos);
    this.camera.rotation.order = 'YXZ';
  }

  update(dt, keys, mouse) {
    if (!this.alive) return;

    this.yaw -= mouse.dx * mouse.sensitivity;
    this.pitch -= mouse.dy * mouse.sensitivity;

    const pitchLimit = Utils.deg2rad(80);
    this.pitch = Utils.clamp(this.pitch, -pitchLimit, pitchLimit);

    if (keys.wasPressed(keys.KEYS.C)) {
      this.crouching = !this.crouching;
      this.height = this.crouching ? CONFIG.PLAYER_CROUCH_HEIGHT : CONFIG.PLAYER_HEIGHT;
    }

    const sprint = keys.isDown(keys.KEYS.SHIFT) && !this.crouching;
    const currentSpeed = sprint ? this.speed * 1.7 : this.speed;

    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = new THREE.Vector3();
    if (keys.isDown(keys.KEYS.W)) moveDir.add(forward);
    if (keys.isDown(keys.KEYS.S)) moveDir.sub(forward);
    if (keys.isDown(keys.KEYS.D)) moveDir.add(right);
    if (keys.isDown(keys.KEYS.A)) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.pos.x += moveDir.x * currentSpeed * dt;
      this.pos.z += moveDir.z * currentSpeed * dt;
    }

    if (!this.onGround) {
      this.vel.y += CONFIG.GRAVITY * dt;
      this.pos.y += this.vel.y * dt;
      if (this.pos.y <= this.height) {
        this.pos.y = this.height;
        this.vel.y = 0;
        this.onGround = true;
      }
    }

    this.camera.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');

    this.mesh.position.set(this.pos.x, this.pos.y - this.height, this.pos.z);
    this.mesh.rotation.y = this.yaw;
  }

  setPosition(x, y, z) {
    this.pos.set(x, y, z);
    this.camera.position.copy(this.pos);
    this.mesh.position.set(x, y - this.height, z);
  }

  getForward() {
    const dir = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    dir.normalize();
    return dir;
  }

  canInteract(targetPos) {
    return Utils.dist3(this.pos, targetPos) < CONFIG.INTERACT_RANGE;
  }

  takeDamage() {
    this.alive = false;
  }

  reset(spawnPos) {
    this.alive = true;
    this.suspicion = 0;
    this.vel.set(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.crouching = false;
    this.height = CONFIG.PLAYER_HEIGHT;
    this.onGround = true;
    if (spawnPos instanceof THREE.Vector3) {
      this.pos.copy(spawnPos);
    } else {
      this.pos.set(
        spawnPos.x || 0,
        spawnPos.y !== undefined ? spawnPos.y : CONFIG.PLAYER_HEIGHT,
        spawnPos.z || 0
      );
    }
    this.camera.position.copy(this.pos);
    this.camera.rotation.set(0, 0, 0, 'YXZ');
    this.mesh.position.set(this.pos.x, this.pos.y - this.height, this.pos.z);
    this.mesh.rotation.y = 0;
  }
};
