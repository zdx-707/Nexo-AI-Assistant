window.PauseMenu = class PauseMenu {
  constructor(container) {
    this.container = container;
    this.el = null;

    this._onResume = null;
    this._onRestart = null;
    this._onQuit = null;

    const div = document.createElement('div');
    div.id = 'pause-menu';
    div.className = 'ui-overlay hidden';

    div.innerHTML =
      '<div class="pause-title">مؤقت</div>' +
      '<div id="pause-mission-status">' +
        '<div>الأهداف المدمرة: <span id="pause-destroyed">0/0</span></div>' +
        '<div>اللصقات المتبقية: <span id="pause-stickers">-</span></div>' +
        '<div>الدرونات المتبقية: <span id="pause-drones">-</span></div>' +
      '</div>' +
      '<div class="pause-buttons">' +
        '<button id="btn-resume" class="menu-btn primary">متابعة اللعب</button>' +
        '<button id="btn-restart" class="menu-btn">إعادة المهمة</button>' +
        '<button id="btn-quit-main" class="menu-btn danger">الخروج للقائمة</button>' +
      '</div>' +
      '<div class="pause-controls-hint">' +
        'W/A/S/D: حركة | E: تفاعل | F: نشر الدرون | ESC: إيقاف مؤقت' +
      '</div>';

    this.container.appendChild(div);
    this.el = div;

    div.querySelector('#btn-resume').addEventListener('click', () => {
      if (this._onResume) this._onResume();
    });

    div.querySelector('#btn-restart').addEventListener('click', () => {
      if (this._onRestart) this._onRestart();
    });

    div.querySelector('#btn-quit-main').addEventListener('click', () => {
      if (this._onQuit) this._onQuit();
    });
  }

  show(stats) {
    this.el.querySelector('#pause-destroyed').textContent =
      (stats.destroyed !== undefined ? stats.destroyed : 0) + '/' +
      (stats.total !== undefined ? stats.total : 0);
    this.el.querySelector('#pause-stickers').textContent =
      stats.stickers !== undefined ? stats.stickers : '-';
    this.el.querySelector('#pause-drones').textContent =
      stats.drones !== undefined ? stats.drones : '-';
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  onResume(fn) {
    this._onResume = fn;
  }

  onRestart(fn) {
    this._onRestart = fn;
  }

  onQuit(fn) {
    this._onQuit = fn;
  }
};
