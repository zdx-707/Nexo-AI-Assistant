window.MainMenu = class MainMenu {
  constructor(container) {
    this.container = container;
    this.el = null;
    this.visible = false;

    this._onPlay = null;
    this._onContinue = null;
    this._onScores = null;
    this._onHow = null;
  }

  build() {
    const div = document.createElement('div');
    div.id = 'main-menu';
    div.className = 'ui-overlay';

    div.innerHTML =
      '<div class="menu-title">NEXO INFILTRATOR</div>' +
      '<div class="menu-subtitle">2026 — المقاومة الأخيرة</div>' +
      '<div class="story-text">' +
        'في عام 3026، غزا الفضائيون والسلاحف كوكبك…' +
        '<br>استولوا على دولتك من بين 18 دولة.' +
        '<br>أنت مواطن عادي. لديك مصنع درونز. هذا يكفي.' +
        '<br>تنكر كفضائي. ادخل. ضع اللصقات الذكية. فجّر.' +
      '</div>' +
      '<div class="menu-buttons">' +
        '<button id="btn-play" class="menu-btn primary">ابدأ المهمة</button>' +
        '<button id="btn-continue" class="menu-btn">متابعة</button>' +
        '<button id="btn-scores" class="menu-btn">أعلى الدرجات</button>' +
        '<button id="btn-how" class="menu-btn">كيف تلعب؟</button>' +
      '</div>' +
      '<div class="menu-version">v1.0 | Nexo AI</div>';

    this.container.appendChild(div);
    this.el = div;

    div.querySelector('#btn-play').addEventListener('click', () => {
      if (this._onPlay) this._onPlay();
    });

    div.querySelector('#btn-continue').addEventListener('click', () => {
      if (this._onContinue) this._onContinue();
    });

    div.querySelector('#btn-scores').addEventListener('click', () => {
      if (this._onScores) this._onScores();
    });

    div.querySelector('#btn-how').addEventListener('click', () => {
      if (this._onHow) this._onHow();
    });
  }

  show(hasSave) {
    this.visible = true;
    this.el.style.display = '';
    const btnContinue = this.el.querySelector('#btn-continue');
    btnContinue.style.display = hasSave ? '' : 'none';
  }

  hide() {
    this.visible = false;
    this.el.style.display = 'none';
  }

  onPlay(fn) {
    this._onPlay = fn;
  }

  onContinue(fn) {
    this._onContinue = fn;
  }

  onScores(fn) {
    this._onScores = fn;
  }

  onHow(fn) {
    this._onHow = fn;
  }
};
