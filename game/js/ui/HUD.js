window.HUD = class HUD {
  constructor(container) {
    this.container = container;
    this.el = null;
    this._alertTimer = null;
    this._droneMode = false;

    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.className = 'ui-overlay hud';

    hud.innerHTML =
      '<div id="hud-inventory">' +
        '<span id="hud-stickers">🏷 ' + CONFIG.MAX_STICKERS + '</span>' +
        '<span id="hud-drones">🚁 3</span>' +
      '</div>' +
      '<div id="hud-mission">' +
        '<div id="hud-location-name"></div>' +
        '<div id="hud-progress-bar"><div id="hud-progress-fill"></div></div>' +
      '</div>' +
      '<div id="hud-suspicion">' +
        '<div id="suspicion-label">الشك</div>' +
        '<div id="suspicion-bar"><div id="suspicion-fill"></div></div>' +
      '</div>' +
      '<div id="crosshair">+</div>' +
      '<div id="interact-hint" class="hidden">[E] للتفاعل</div>' +
      '<div id="drone-status" class="hidden">' +
        '🔋 <span id="drone-battery">100%</span>' +
      '</div>' +
      '<div id="alert-banner" class="hidden"></div>';

    container.appendChild(hud);
    this.el = hud;
  }

  update(player, drone, location, alertSystem) {
    if (!this.el) return;

    if (player && player.inventory) {
      const inv = player.inventory;
      this.el.querySelector('#hud-stickers').textContent = '🏷 ' + inv.stickers;
      this.el.querySelector('#hud-drones').textContent = '🚁 ' + inv.drones;
    } else if (player) {
      if (typeof player.stickers !== 'undefined') {
        this.el.querySelector('#hud-stickers').textContent = '🏷 ' + player.stickers;
      }
      if (typeof player.drones !== 'undefined') {
        this.el.querySelector('#hud-drones').textContent = '🚁 ' + player.drones;
      }
    }

    if (player) {
      const rawSuspicion = typeof player.suspicion !== 'undefined'
        ? player.suspicion
        : (alertSystem ? alertSystem.alertLevel * (CONFIG.MAX_SUSPICION / 3) : 0);
      const suspicionPct = Math.min(100, Math.max(0, (rawSuspicion / CONFIG.MAX_SUSPICION) * 100));
      const fill = this.el.querySelector('#suspicion-fill');
      fill.style.width = suspicionPct + '%';
      if (suspicionPct >= 66) {
        fill.style.backgroundColor = '#ff2222';
      } else if (suspicionPct >= 33) {
        fill.style.backgroundColor = '#ffaa00';
      } else {
        fill.style.backgroundColor = '#00ff88';
      }
    }

    if (location) {
      const nameEl = this.el.querySelector('#hud-location-name');
      if (typeof location.name !== 'undefined') {
        nameEl.textContent = location.name;
      } else if (typeof location === 'string') {
        nameEl.textContent = CONFIG.LOCATION_NAMES[location] || location;
      }

      const targets = location.targets;
      if (targets && targets.length > 0) {
        const total = targets.length;
        const remaining = targets.filter(function(t) { return !t.destroyed; }).length;
        const done = total - remaining;
        const pct = (done / total) * 100;
        this.el.querySelector('#hud-progress-fill').style.width = pct + '%';
      }
    }

    if (this._droneMode && drone && drone.battery !== undefined) {
      const batteryPct = Math.max(0, Math.min(100, Math.round((drone.battery / CONFIG.DRONE_BATTERY) * 100)));
      this.el.querySelector('#drone-battery').textContent = batteryPct + '%';
    }
  }

  showInteractHint(text) {
    const hint = this.el.querySelector('#interact-hint');
    hint.textContent = text || '[E] للتفاعل';
    hint.classList.remove('hidden');
  }

  hideInteractHint() {
    this.el.querySelector('#interact-hint').classList.add('hidden');
  }

  showAlert(text, duration) {
    const banner = this.el.querySelector('#alert-banner');
    banner.textContent = text;
    banner.classList.remove('hidden');
    if (this._alertTimer) {
      clearTimeout(this._alertTimer);
    }
    this._alertTimer = setTimeout(function() {
      banner.classList.add('hidden');
      this._alertTimer = null;
    }.bind(this), duration || 3000);
  }

  setDroneMode(on) {
    this._droneMode = !!on;
    const status = this.el.querySelector('#drone-status');
    const crosshair = this.el.querySelector('#crosshair');
    if (on) {
      status.classList.remove('hidden');
      crosshair.classList.add('hidden');
    } else {
      status.classList.add('hidden');
      crosshair.classList.remove('hidden');
    }
  }

  showCrosshair(on) {
    const crosshair = this.el.querySelector('#crosshair');
    if (on) {
      crosshair.classList.remove('hidden');
    } else {
      crosshair.classList.add('hidden');
    }
  }

  show() {
    if (this.el) this.el.style.display = '';
  }

  hide() {
    if (this.el) this.el.style.display = 'none';
  }
};
