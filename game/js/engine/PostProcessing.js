window.PostProcessing = class PostProcessing {
  constructor(renderer, scene, camera) {
    this.composer = new THREE.EffectComposer(renderer);

    const renderPass = new THREE.RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(CONFIG.WIDTH, CONFIG.HEIGHT),
      1.2,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);

    this.glitchPass = new THREE.GlitchPass();
    this.glitchPass.goWild = false;
    this.glitchPass.enabled = false;
    this.composer.addPass(this.glitchPass);

    this.enabled = true;
  }

  render() {
    if (this.enabled) {
      this.composer.render();
    }
  }

  triggerGlitch(duration = 600) {
    this.glitchPass.enabled = true;
    this.glitchPass.goWild = true;
    setTimeout(() => {
      this.glitchPass.goWild = false;
      this.glitchPass.enabled = false;
    }, duration);
  }

  setBloomStrength(strength) {
    this.bloomPass.strength = strength;
  }

  setBloomThreshold(threshold) {
    this.bloomPass.threshold = threshold;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  resize(w, h) {
    this.composer.setSize(w, h);
  }
};
