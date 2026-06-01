window.SceneManager = class SceneManager {
  constructor(renderer, events) {
    this.renderer = renderer;
    this.events = events;
    this.currentScene = null;
    this.scenes = {};
  }

  register(name, sceneObj) {
    this.scenes[name] = sceneObj;
  }

  async transition(toName) {
    const from = this.currentScene ? this.currentScene._name : null;
    if (this.currentScene && typeof this.currentScene.exit === 'function') {
      await this.currentScene.exit();
    }
    const next = this.scenes[toName];
    if (!next) {
      throw new Error('SceneManager: unknown scene "' + toName + '"');
    }
    if (typeof next.enter === 'function') {
      await next.enter();
    }
    next._name = toName;
    this.currentScene = next;
    this.events.emit('sceneTransition', { from: from, to: toName });
  }

  update(dt) {
    if (this.currentScene && typeof this.currentScene.update === 'function') {
      this.currentScene.update(dt);
    }
  }

  render() {
    if (this.currentScene && typeof this.currentScene.render === 'function') {
      this.currentScene.render();
    }
  }

  get(name) {
    return this.scenes[name];
  }
};
