window.DroneUI = class DroneUI {
  constructor(container) {
    this.container = container;
    this.el = null;
    this.batFill = null;
    this.batPct = null;
    this.targetList = null;

    const div = document.createElement('div');
    div.id = 'drone-ui';
    div.className = 'ui-overlay hidden';

    div.innerHTML =
      '<div id="drone-scanlines"></div>' +
      '<div id="drone-mode-label">وضع الطائرة المسيّرة</div>' +
      '<div id="drone-battery-bar">' +
        '<div id="drone-battery-label">🔋 <span id="bat-pct">100%</span></div>' +
        '<div id="drone-bat-track"><div id="drone-bat-fill"></div></div>' +
      '</div>' +
      '<div id="drone-targets">' +
        '<div id="drone-targets-title">الأهداف المعلّمة:</div>' +
        '<ul id="drone-target-list"></ul>' +
      '</div>' +
      '<div id="drone-crosshair">⊕</div>' +
      '<div id="drone-controls">' +
        'WASD: تحريك | SPACE: ارتفاع | C: هبوط | F: تفجير | TAB: تبديل الكاميرا' +
      '</div>';

    container.appendChild(div);
    this.el = div;
    this.batFill = div.querySelector('#drone-bat-fill');
    this.batPct = div.querySelector('#bat-pct');
    this.targetList = div.querySelector('#drone-target-list');
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  update(drone, stickerSystem) {
    const pct = Math.max(0, Math.min(100, drone.battery !== undefined ? drone.battery : 100));
    this.batPct.textContent = Math.round(pct) + '%';
    this.batFill.style.width = pct + '%';

    const targets = stickerSystem.getArmedTargets();
    this.targetList.innerHTML = '';
    for (let i = 0; i < targets.length; i++) {
      const li = document.createElement('li');
      li.textContent = targets[i].name || ('هدف ' + (i + 1));
      this.targetList.appendChild(li);
    }
  }

  showDetonateFlash() {
    this.el.style.backgroundColor = 'rgba(255,0,0,0.35)';
    const self = this;
    setTimeout(function() {
      self.el.style.backgroundColor = '';
    }, 300);
  }
};
