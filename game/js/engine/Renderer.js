window.GameRenderer = class GameRenderer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    this.renderer.setSize(CONFIG.WIDTH, CONFIG.HEIGHT);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x000005);

    this.scene = new THREE.Scene();

    const aspect = CONFIG.WIDTH / CONFIG.HEIGHT;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    this.postProcessing = null;

    window.addEventListener('resize', () => {
      this.resize(CONFIG.WIDTH, CONFIG.HEIGHT);
    });
  }

  setPostProcessing(pp) {
    this.postProcessing = pp;
  }

  render() {
    if (this.postProcessing && this.postProcessing.enabled) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setFog(color, near, far) {
    this.scene.fog = new THREE.Fog(color, near, far);
  }

  addToScene(object) {
    this.scene.add(object);
  }

  removeFromScene(object) {
    this.scene.remove(object);
  }

  clearScene() {
    const toRemove = [];
    this.scene.traverse((object) => {
      if (object !== this.scene && !(object.isLight)) {
        toRemove.push(object);
      }
    });
    toRemove.forEach((object) => {
      if (object.parent) {
        object.parent.remove(object);
      }
    });
  }

  resize(w, h) {
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.postProcessing) this.postProcessing.resize(w, h);
  }
};
