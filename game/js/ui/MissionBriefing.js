window.MissionBriefing = class MissionBriefing {
  constructor(container) {
    this.container = container;
    this.el = null;

    const div = document.createElement('div');
    div.id = 'mission-briefing';
    div.className = 'ui-overlay hidden';

    div.innerHTML =
      '<div class="briefing-header">' +
        '<div id="briefing-icon">🎯</div>' +
        '<div id="briefing-title">مهمة جديدة</div>' +
        '<div id="briefing-location"></div>' +
      '</div>' +
      '<div class="briefing-body">' +
        '<div id="briefing-story"></div>' +
        '<div id="briefing-targets">' +
          '<div class="targets-title">الأهداف:</div>' +
          '<ul id="briefing-target-list"></ul>' +
        '</div>' +
        '<div id="briefing-guards">' +
          '<span>الحراس: </span><span id="briefing-guard-count"></span>' +
        '</div>' +
        '<div id="briefing-difficulty">' +
          'الصعوبة: <span id="briefing-diff-stars"></span>' +
        '</div>' +
      '</div>' +
      '<div class="briefing-footer">' +
        '<button id="btn-start-mission" class="menu-btn primary">ابدأ التسلل</button>' +
        '<button id="btn-back-map" class="menu-btn">العودة للخريطة</button>' +
      '</div>';

    this.container.appendChild(div);
    this.el = div;
  }

  show(locationId, onStart, onBack) {
    this.el.querySelector('#briefing-location').textContent =
      CONFIG.LOCATION_NAMES[locationId] || locationId;

    this.el.querySelector('#briefing-story').textContent =
      this._getStoryText(locationId);

    const list = this.el.querySelector('#briefing-target-list');
    list.innerHTML = '';
    const targets = CONFIG.TARGET_TYPES[locationId] || [];
    for (let i = 0; i < targets.length; i++) {
      const li = document.createElement('li');
      li.textContent = targets[i];
      list.appendChild(li);
    }

    this.el.querySelector('#briefing-guard-count').textContent =
      CONFIG.GUARDS_PER_LOCATION[locationId] || 0;

    const level = CONFIG.LOCATION_DIFFICULTY[locationId] || 1;
    this.el.querySelector('#briefing-diff-stars').textContent =
      this._getDifficultyStars(level);

    const btnStart = this.el.querySelector('#btn-start-mission');
    const btnBack = this.el.querySelector('#btn-back-map');

    btnStart.onclick = function () { if (onStart) onStart(); };
    btnBack.onclick = function () { if (onBack) onBack(); };

    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  _getDifficultyStars(level) {
    const max = 4;
    const filled = Math.min(Math.max(level, 0), max);
    let result = '';
    for (let i = 0; i < max; i++) {
      result += i < filled ? '★' : '☆';
    }
    return result;
  }

  _getStoryText(locationId) {
    const stories = {
      weapons_factory:  'مصنع أسلحة الغزاة يعمل ليلاً ونهاراً، أوقفه قبل أن ينتهي كل شيء.',
      central_bank:     'خزائن المحتل تمول حربهم، جفّفها وأفقرهم.',
      power_plant:      'بلا كهرباء لا توجد آلات، ولا آلات لا توجد حرب.',
      comm_center:      'مركز اتصالاتهم هو عيونهم، أعمها واتركهم في صمت.',
      oil_refinery:     'نفطهم يغذي آلتهم، أشعل المصفاة واستعد للرحيل.',
      command_center:   'رأس الأفعى في هذا المبنى، اقطعه ويتشتت شملهم.',
      military_airport: 'مطارهم بوابة تدعيماتهم، أغلقها للأبد.',
      water_plant:      'الماء حياة، وهم يسيطرون على كل قطرة، خذها منهم.',
      metal_factory:    'آلاتهم تصنع من معادن أرضك، حوّل المصنع إلى رماد.',
      ammo_depot:       'مخزنهم مليء بالذخائر، فجّره ودعهم بلا رصاص.',
    };
    return stories[locationId] || 'اخترق الموقع ودمّر أهدافه بصمت.';
  }
};
