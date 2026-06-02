// Location constructors mapped by ID
const LOCATION_CTORS = {
  weapons_factory:  WeaponsFactory,
  central_bank:     CentralBank,
  power_plant:      PowerPlant,
  comm_center:      CommCenter,
  oil_refinery:     OilRefinery,
  command_center:   CommandCenter,
  military_airport: MilitaryAirport,
  water_plant:      WaterPlant,
  metal_factory:    MetalFactory,
  ammo_depot:       AmmoDepot,
};

const LOCATION_ICONS = {
  weapons_factory: '🏭', central_bank: '🏦', power_plant: '⚡',
  comm_center: '📡', oil_refinery: '🛢', command_center: '🎖',
  military_airport: '✈️', water_plant: '💧', metal_factory: '⚙️', ammo_depot: '💥',
};

window.GAME = {
  canvas: null, renderer: null, scene: null, camera: null,
  loop: null, events: null, db: null, state: null,
  keyboard: null, mouse: null, gamepad: null, touch: null,
  player: null, droneFleet: null, droneController: null, droneCamera: null,
  alertSystem: null, stickerSystem: null, explosionChain: null,
  missionSystem: null, stealthSystem: null, progressSystem: null,
  currentLocation: null, currentLocationId: null,
  mainMenu: null, hud: null, minimap: null, droneUI: null,
  briefing: null, pauseMenu: null, audio: null,
  postProcessing: null, pathGrid: null,
  isMobile: false,
  stickers: [],
  missionTimer: 0,
  locationMapEl: null,
};

async function boot() {
  const canvas = document.getElementById('game-canvas');
  const ui = document.getElementById('ui-root');
  GAME.canvas = canvas;

  // Core systems
  GAME.events = new EventEmitter();
  GAME.db = new GameDB();
  await GAME.db.init();
  GAME.state = new StateManager(GAME.events);

  // Renderer
  GAME.renderer = new GameRenderer(canvas);
  GAME.scene = GAME.renderer.scene;
  GAME.camera = GAME.renderer.camera;
  GAME.renderer.setFog(0x050508, 30, 80);

  // Post-processing (Bloom + Glitch on alarm)
  if (window.PostProcessing) {
    GAME.postProcessing = new PostProcessing(GAME.renderer.renderer, GAME.scene, GAME.camera);
    GAME.renderer.setPostProcessing(GAME.postProcessing);
  }

  // Game loop
  GAME.loop = new GameLoop();
  GAME.loop.addUpdate(update);
  GAME.loop.addRender(() => GAME.renderer.render());

  // Input
  GAME.keyboard = new KeyboardInput();
  GAME.mouse = new MouseInput(canvas);
  GAME.gamepad = new GamepadInput();
  GAME.isMobile = TouchInput.isMobile();
  if (GAME.isMobile) {
    GAME.touch = new TouchInput();
    // On mobile skip pointer lock, use touch look instead
    GAME.mouse.locked = true;
  }

  // Audio
  GAME.audio = new AudioManager();
  SoundEffects.register(GAME.audio);

  // Systems
  GAME.missionSystem = new MissionSystem(GAME.events);
  GAME.progressSystem = new ProgressSystem();
  GAME.progressSystem.setDB(GAME.db);
  GAME.alertSystem = new AlertSystem(GAME.events);
  GAME.stickerSystem = new StickerSystem(GAME.events);
  GAME.explosionChain = new ExplosionChain(GAME.scene, GAME.events);
  GAME.stealthSystem = new StealthSystem(GAME.events);

  // UI
  GAME.mainMenu = new MainMenu(ui);
  GAME.mainMenu.build();
  GAME.hud = new HUD(ui);
  GAME.minimap = new MiniMap(ui);
  GAME.droneUI = new DroneUI(ui);
  GAME.briefing = new MissionBriefing(ui);
  GAME.pauseMenu = new PauseMenu(ui);

  // Load existing save
  const save = await GAME.progressSystem.load();
  if (save) GAME.progressSystem.applyToMissions(save, GAME.missionSystem);

  // Wire main menu
  GAME.mainMenu.onPlay(() => showLocationMap());
  GAME.mainMenu.onContinue(() => showLocationMap());
  GAME.mainMenu.onScores(() => showHighScores());
  GAME.mainMenu.onHow(() => showHowToPlay());

  // Wire events
  GAME.events.on('missionComplete', onMissionComplete);
  GAME.events.on('missionFail', onMissionFail);
  GAME.events.on('disguiseBroken', () => {
    GAME.hud?.showAlert('⚠️ انكشف أمرك! الحراس في حالة تأهب قصوى!', 4000);
    GAME.audio.play('alarm_loud');
  });
  GAME.events.on('guardAlert', () => GAME.audio.play('alert_beep'));
  GAME.events.on('alarmTriggered', () => {
    GAME.audio.play('alarm');
    GAME.postProcessing?.triggerGlitch(800);
  });

  // Show main menu
  GAME.mainMenu.show(!!save);
  GAME.loop.start();
}

function update(dt) {
  GAME.keyboard.update();
  GAME.mouse.update();
  GAME.gamepad.update();
  if (GAME.touch) GAME.touch.apply(GAME.keyboard, GAME.mouse);

  const s = GAME.state.current;

  if (s === 'playing') {
    updatePlaying(dt);
  } else if (s === 'drone') {
    updateDrone(dt);
  }

  GAME.explosionChain.update(dt);

  // ESC key
  if (GAME.keyboard.wasPressed(GAME.keyboard.KEYS.ESC)) {
    if (s === 'playing') {
      pauseGame();
    } else if (s === 'paused') {
      resumeGame();
    } else if (s === 'drone') {
      exitDroneMode();
    }
  }
}

function updatePlaying(dt) {
  GAME.player?.update(dt, GAME.keyboard, GAME.mouse);
  GAME.currentLocation?.update(dt);
  GAME.alertSystem?.update(dt);
  GAME.stealthSystem?.update(dt, GAME.player, GAME.currentLocation?.guards || [], GAME.currentLocation);
  GAME.stickerSystem?.update(dt);
  GAME.missionTimer += dt;

  // Interact with nearby targets
  const loc = GAME.currentLocation;
  if (loc && GAME.player) {
    checkInteractions();
    checkPickups();
  }

  // F key: deploy drone
  if (GAME.keyboard.wasPressed(GAME.keyboard.KEYS.F)) {
    if (GAME.player?.inventory?.hasDrones()) {
      enterDroneMode();
    } else {
      GAME.hud?.showAlert('لا توجد درونات متاحة!', 2000);
    }
  }

  // Update HUD
  GAME.hud?.update(GAME.player, null, GAME.currentLocation, GAME.alertSystem);
  const loc2 = GAME.currentLocation;
  if (loc2) {
    GAME.minimap?.update(GAME.player, loc2.guards, loc2.targets, { width: loc2.width, depth: loc2.depth });
  }

  // Check mission complete
  if (GAME.currentLocation?.isCompleted()) {
    completeMission();
  }

  // Spatial audio listener tracking
  if (GAME.player && GAME.audio?.isReady) {
    GAME.audio.updateListener(GAME.player.pos, GAME.player.yaw || 0);
  }

  // Check game over: player dead
  if (GAME.player && !GAME.player.alive) {
    GAME.state.transition('gameover');
    showGameOver('اكتشفك الحراس!');
  }
}

function updateDrone(dt) {
  GAME.droneController?.update(dt);
  GAME.droneCamera?.update(dt, GAME.mouse.dx, GAME.mouse.dy);

  // F key in drone mode = detonate
  if (GAME.keyboard.wasPressed(GAME.keyboard.KEYS.F)) {
    detonateDrone();
  }

  // TAB = toggle camera mode
  if (GAME.keyboard.wasPressed(GAME.keyboard.KEYS.TAB)) {
    GAME.droneCamera?.toggleMode();
  }

  GAME.droneUI?.update(GAME.droneFleet?.getActive(), GAME.stickerSystem);
}

function checkInteractions() {
  const player = GAME.player;
  const targets = GAME.currentLocation?.targets || [];
  let nearest = null, nearestDist = Infinity;

  for (const t of targets) {
    if (t.destroyed) continue;
    const d = t.pos.distanceTo(player.pos);
    if (d < CONFIG.INTERACT_RANGE && d < nearestDist) {
      nearestDist = d;
      nearest = t;
    }
  }

  if (nearest) {
    if (!nearest.highlighted) {
      nearest.highlight(true);
      const label = nearest.hasSticker ? 'لصقة موضوعة ✓' : `[E] ضع لصقة ذكية — ${nearest.label}`;
      GAME.hud?.showInteractHint(label);
    }
    if (GAME.keyboard.wasPressed(GAME.keyboard.KEYS.E) && !nearest.hasSticker) {
      const placed = nearest.interact(player);
      if (placed) {
        const sticker = GAME.stickers[GAME.stickers.length - 1];
        if (sticker) GAME.stickerSystem.register(sticker);
        const expTarget = new ExplosionTarget(GAME.scene, nearest);
        GAME.scene.add(expTarget.indicator);
        GAME.currentLocation._explosionTargets = GAME.currentLocation._explosionTargets || [];
        GAME.currentLocation._explosionTargets.push(expTarget);
        GAME.audio.play('sticker_place');
        GAME.hud?.showAlert(`✓ لصقة وُضعت على ${nearest.label}`, 2000);
        GAME.hud?.showInteractHint('لصقة موضوعة ✓');
      } else {
        GAME.hud?.showAlert('لا توجد لصقات متبقية!', 2000);
      }
    }
  } else {
    const prevNearest = targets.find(t => t.highlighted);
    prevNearest?.highlight(false);
    GAME.hud?.hideInteractHint();
  }
}

function checkPickups() {
  const player = GAME.player;
  const pickups = GAME.currentLocation?.pickups || [];
  for (const p of pickups) {
    if (!p.collected) p.checkPickup(player.pos);
  }
}

function enterDroneMode() {
  const spawnPos = GAME.player.pos.clone();
  spawnPos.y += 1;

  if (!GAME.droneFleet) {
    GAME.droneFleet = new DroneFleet(GAME.scene);
  }

  const drone = GAME.droneFleet.deploy(spawnPos);
  if (!drone) return;

  GAME.droneCamera = new DroneCamera(GAME.camera, drone);
  GAME.droneController = new DroneController(drone, GAME.keyboard, GAME.gamepad);
  GAME.droneController.activate();

  GAME.hud?.setDroneMode(true);
  GAME.droneUI?.show();
  GAME.minimap?.hide();
  GAME.audio.play('drone_hum');

  GAME.state.transition('drone');
}

function exitDroneMode() {
  GAME.droneController?.deactivate();
  GAME.droneCamera?.detach();
  GAME.droneFleet?.recall();

  // Restore player camera
  if (GAME.player) {
    GAME.camera.position.copy(GAME.player.pos);
    GAME.camera.rotation.set(0, GAME.player.yaw, 0, 'YXZ');
  }

  GAME.hud?.setDroneMode(false);
  GAME.droneUI?.hide();
  GAME.minimap?.show();

  GAME.state.transition('playing');
}

function detonateDrone() {
  const drone = GAME.droneFleet?.getActive();
  if (!drone || !drone.alive) return;

  const allTargets = GAME.currentLocation?.targets || [];
  const explosionSystem = new DroneExplosion(GAME.scene);
  const hitIds = explosionSystem.detonate(
    drone,
    allTargets.map(t => ({ id: t.id, pos: t.pos, isTarget: t.hasSticker })),
    (targetId) => {
      const t = allTargets.find(x => x.id === targetId);
      if (t && t.hasSticker && !t.destroyed) {
        t.destroy();
        GAME.audio.play('explosion');
        GAME.droneUI?.showDetonateFlash();
        // Remove explosion target indicator
        const expTargets = GAME.currentLocation._explosionTargets || [];
        const et = expTargets.find(e => e.id === targetId);
        et?.detonate();
      }
    }
  );

  GAME.audio.play('explosion');

  // Return to player mode after detonation
  setTimeout(() => exitDroneMode(), 1500);
}

function pauseGame() {
  GAME.loop.pause();
  GAME.state.transition('paused');
  GAME.mouse.unlock();

  const loc = GAME.currentLocation;
  const destroyed = loc?.targets.filter(t => t.destroyed).length || 0;
  const total = loc?.targets.length || 0;
  GAME.pauseMenu.show({
    destroyed, total,
    stickers: GAME.player?.inventory?.stickers ?? 0,
    drones: GAME.player?.inventory?.drones ?? 0,
  });
  GAME.pauseMenu.onResume(() => resumeGame());
  GAME.pauseMenu.onRestart(() => restartMission());
  GAME.pauseMenu.onQuit(() => quitToMenu());
}

function resumeGame() {
  GAME.loop.resume();
  GAME.state.transition('playing');
  GAME.mouse.requestLock();
  GAME.pauseMenu.hide();
}

function restartMission() {
  GAME.pauseMenu.hide();
  const locId = GAME.currentLocationId;
  cleanupLocation();
  loadLocation(locId);
}

function quitToMenu() {
  GAME.loop.resume();
  GAME.pauseMenu.hide();
  GAME.state.transition('paused');
  cleanupLocation();
  GAME.hud?.hide();
  GAME.minimap?.hide();
  GAME.mouse.unlock();
  GAME.state.transition('menu');
  GAME.mainMenu.show(true);
  showLocationMap();
}

function completeMission() {
  if (!GAME.currentLocationId) return;
  GAME.mouse.unlock();
  GAME.audio.play('mission_complete');

  const loc = GAME.currentLocation;
  const destroyed = loc.targets.filter(t => t.destroyed).length;
  const total = loc.targets.length;
  const alertLvl = GAME.alertSystem?.getLevel() ?? 0;

  GAME.missionSystem.completeMission(GAME.currentLocationId, {
    targetsDestroyed: destroyed,
    totalTargets: total,
    timeSeconds: GAME.missionTimer,
    alertLevel: alertLvl,
  });

  GAME.progressSystem.save(GAME.missionSystem, GAME.player, GAME.player?.inventory);

  const mission = GAME.missionSystem.getMission(GAME.currentLocationId);
  const scoreText = mission?.score ?? 0;
  showMissionComplete(GAME.currentLocationId, scoreText, mission?.stars ?? 1);
}

function showMissionComplete(locId, score, stars) {
  const ui = document.getElementById('ui-root');
  const el = document.createElement('div');
  el.id = 'game-win';
  el.className = 'ui-overlay';
  el.innerHTML = `
    <div class="win-title">✓ مهمة ناجحة</div>
    <div class="win-subtitle">${CONFIG.LOCATION_NAMES[locId]}</div>
    <div style="font-size:2rem;margin:10px 0">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <div style="font-size:1.1rem;color:var(--gold)">النقاط: ${score}</div>
    <div style="margin-top:20px;display:flex;gap:12px;flex-direction:column;min-width:220px">
      <button class="menu-btn primary" id="btn-next-loc">المهمة التالية</button>
      <button class="menu-btn" id="btn-map-from-win">خريطة المواقع</button>
    </div>
  `;
  ui.appendChild(el);
  GAME.hud?.hide();
  GAME.minimap?.hide();
  cleanupLocation(false);

  document.getElementById('btn-map-from-win').onclick = () => {
    el.remove();
    GAME.state.transition('menu');
    showLocationMap();
  };

  document.getElementById('btn-next-loc').onclick = () => {
    el.remove();
    const missions = GAME.missionSystem.getAllMissions();
    const available = missions.find(m => m.status === 'available');
    if (available) {
      GAME.state.transition('menu');
      GAME.briefing.show(available.id, () => {
        GAME.briefing.hide();
        loadLocation(available.id);
      }, () => {
        GAME.briefing.hide();
        showLocationMap();
      });
    } else if (GAME.missionSystem.isAllComplete()) {
      el.remove();
      showFinalWin();
    } else {
      el.remove();
      showLocationMap();
    }
  };
}

function onMissionComplete() {}
function onMissionFail(data) {
  showGameOver(data?.reason || 'فشلت المهمة');
}

function showGameOver(reason) {
  const ui = document.getElementById('ui-root');
  const existing = document.getElementById('game-over');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'game-over';
  el.className = 'ui-overlay';
  el.innerHTML = `
    <div class="go-title">✗ فشلت</div>
    <div class="go-subtitle">${reason || ''}</div>
    <div style="margin-top:24px;display:flex;gap:12px;flex-direction:column;min-width:200px">
      <button class="menu-btn primary" id="btn-retry">إعادة المحاولة</button>
      <button class="menu-btn" id="btn-map-go">خريطة المواقع</button>
    </div>
  `;
  ui.appendChild(el);
  GAME.hud?.hide();
  GAME.minimap?.hide();
  GAME.mouse.unlock();

  document.getElementById('btn-retry').onclick = () => {
    el.remove();
    const locId = GAME.currentLocationId;
    cleanupLocation();
    loadLocation(locId);
  };
  document.getElementById('btn-map-go').onclick = () => {
    el.remove();
    cleanupLocation();
    GAME.state.transition('menu');
    showLocationMap();
  };
}

function showFinalWin() {
  const ui = document.getElementById('ui-root');
  const el = document.createElement('div');
  el.id = 'final-win';
  el.className = 'ui-overlay';
  el.innerHTML = `
    <div class="win-title" style="font-size:2.5rem">🏆 النصر المطلق!</div>
    <div class="win-subtitle" style="font-size:1.2rem;margin:12px 0">
      دمّرت كل البنية التحتية للدولة المحتلة.<br>
      الغزاة انهاروا. الشعب حرّ.
    </div>
    <div style="font-size:1.5rem;color:var(--gold)">
      المجموع الكلي: ${GAME.missionSystem.getTotalScore()} نقطة
    </div>
    <button class="menu-btn primary" style="margin-top:24px;min-width:200px" id="btn-final-menu">
      العودة للقائمة
    </button>
  `;
  ui.appendChild(el);
  document.getElementById('btn-final-menu').onclick = () => {
    el.remove();
    GAME.mainMenu.show(false);
  };
}

function showHighScores() {
  GAME.progressSystem.getHighScores().then(scores => {
    const ui = document.getElementById('ui-root');
    const el = document.createElement('div');
    el.className = 'ui-overlay';
    el.style.cssText = 'background:rgba(3,3,16,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;direction:rtl';
    const rows = scores.slice(0, 10).map((s, i) =>
      `<tr><td style="padding:4px 16px;color:var(--gold)">${i+1}</td>
       <td style="padding:4px 16px">${CONFIG.LOCATION_NAMES[s.factory] || s.factory}</td>
       <td style="padding:4px 16px;color:var(--accent)">${s.score}</td></tr>`
    ).join('');
    el.innerHTML = `
      <div style="font-size:1.5rem;color:var(--accent);margin-bottom:12px">أعلى الدرجات</div>
      <table style="font-size:0.85rem;border-collapse:collapse">${rows || '<tr><td colspan="3" style="color:var(--text-dim);padding:16px">لا توجد درجات بعد</td></tr>'}</table>
      <button class="menu-btn" style="margin-top:20px;min-width:160px" id="btn-back-hs">رجوع</button>
    `;
    ui.appendChild(el);
    document.getElementById('btn-back-hs').onclick = () => el.remove();
  });
}

function showHowToPlay() {
  const ui = document.getElementById('ui-root');
  const el = document.createElement('div');
  el.className = 'ui-overlay';
  el.style.cssText = 'background:rgba(3,3,16,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;direction:rtl;padding:40px';
  el.innerHTML = `
    <div style="font-size:1.5rem;color:var(--accent)">كيف تلعب؟</div>
    <div style="max-width:500px;font-size:0.85rem;line-height:2;color:#8899bb">
      <b style="color:var(--text)">التحرك:</b> W/A/S/D — الركض: SHIFT — القرفصة: C<br>
      <b style="color:var(--text)">التفاعل:</b> E — ضع لصقة ذكية على الهدف القريب<br>
      <b style="color:var(--text)">الدرون:</b> F — أطلق الدرون<br>
      <b style="color:var(--text)">قيادة الدرون:</b> W/A/S/D للتحرك — SPACE للصعود — C للهبوط<br>
      <b style="color:var(--text)">التفجير:</b> F أثناء قيادة الدرون — يفجّر الأهداف المعلّمة<br>
      <b style="color:var(--text)">الإيقاف المؤقت:</b> ESC<br><br>
      <b style="color:var(--warning)">⚠️ تحذير:</b> لا تضع الدرون في أي مكان عشوائي — حدّد الأهداف بلصقات ذكية أولاً!<br>
      البقاء في الزي بينما الحراس قريبون يرفع مؤشر الشك.
    </div>
    <button class="menu-btn" style="min-width:160px" id="btn-back-how">رجوع</button>
  `;
  ui.appendChild(el);
  document.getElementById('btn-back-how').onclick = () => el.remove();
}

function showLocationMap() {
  GAME.mainMenu?.hide();

  const ui = document.getElementById('ui-root');
  const existing = document.getElementById('location-map');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'location-map';
  el.className = 'ui-overlay';
  el.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;direction:rtl;background:linear-gradient(135deg,#030310,#0a0a20)';

  const missions = GAME.missionSystem.getAllMissions();
  const totalScore = GAME.missionSystem.getTotalScore();
  const completed = missions.filter(m => m.status === 'complete').length;

  const cards = CONFIG.LOCATIONS.map(locId => {
    const m = missions.find(x => x.id === locId);
    const status = m?.status || 'locked';
    const stars = m?.stars || 0;
    const icon = LOCATION_ICONS[locId] || '🏢';
    const diff = CONFIG.LOCATION_DIFFICULTY[locId] || 1;
    const starsStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    return `
      <div class="location-card ${status}" data-loc="${locId}">
        <div class="location-icon">${icon}</div>
        <div class="location-name">${CONFIG.LOCATION_NAMES[locId]}</div>
        <div class="location-stars">${starsStr}</div>
        <div class="location-diff">${'⚡'.repeat(diff)}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="map-title">🗺 خريطة المواقع</div>
    <div class="map-subtitle">اختر الموقع الذي ستتسلل إليه</div>
    <div class="location-grid">${cards}</div>
    <div class="map-score">المجموع: <span>${totalScore}</span> نقطة &nbsp;|&nbsp; أنجزت: <span>${completed}/${CONFIG.LOCATIONS.length}</span></div>
    <button class="menu-btn" id="btn-back-to-main" style="min-width:180px">القائمة الرئيسية</button>
  `;

  ui.appendChild(el);
  GAME.locationMapEl = el;

  // Card click handlers
  el.querySelectorAll('.location-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const locId = card.dataset.loc;
      el.remove();
      GAME.briefing.show(
        locId,
        () => { GAME.briefing.hide(); loadLocation(locId); },
        () => { GAME.briefing.hide(); showLocationMap(); }
      );
    });
  });

  document.getElementById('btn-back-to-main').onclick = () => {
    el.remove();
    GAME.mainMenu.show(true);
  };
}

function loadLocation(locId) {
  GAME.currentLocationId = locId;
  GAME.missionTimer = 0;
  GAME.stickers = [];

  // Clear scene
  GAME.renderer.clearScene();

  // Build location
  const Ctor = LOCATION_CTORS[locId];
  GAME.currentLocation = new Ctor(GAME.scene);
  GAME.currentLocation.build();

  // Set up lighting
  const shadowSys = new ShadowSystem(GAME.renderer);
  shadowSys.createFactoryLighting(GAME.scene);

  // Set alert system guards
  GAME.alertSystem.setGuards(GAME.currentLocation.guards);
  GAME.alertSystem.reset();

  // Patrol routes
  const patrolSys = new PatrolSystem();
  patrolSys.assignRoutes(GAME.currentLocation.guards, locId);

  // Spawn player inside (center of building)
  const spawnPos = new THREE.Vector3(0, CONFIG.PLAYER_HEIGHT, 0);
  GAME.player = new Player(GAME.scene, GAME.camera);
  GAME.player.inventory = new Inventory();
  GAME.player.disguise = new Disguise(GAME.player);
  GAME.player.animator = new PlayerAnimator(GAME.camera);
  GAME.player.reset(spawnPos);

  // Drone fleet
  GAME.droneFleet = new DroneFleet(GAME.scene);

  // Start mission tracking
  GAME.missionSystem.startMission(locId);

  // Fog based on location size
  const loc = GAME.currentLocation;

  // Path grid for guard A* navigation
  if (window.PathGrid) {
    GAME.pathGrid = new PathGrid(loc.width, loc.depth, 2);
  }
  GAME.renderer.setFog(0x050508, loc.width * 0.4, loc.width * 1.2);

  // Show HUD
  GAME.hud?.show();
  GAME.hud?.update(GAME.player, null, loc, GAME.alertSystem);
  GAME.minimap?.show();

  // Request pointer lock
  GAME.canvas.addEventListener('click', () => {
    if (GAME.state.is('playing') || GAME.state.is('drone')) {
      GAME.mouse.requestLock();
      GAME.audio.init();
    }
  }, { once: false });

  GAME.state.transition('playing');
  if (GAME.touch) GAME.touch.show();
  showLocationFade();
}

function cleanupLocation(resetState = true) {
  GAME.currentLocation?.cleanup();
  GAME.currentLocation = null;
  GAME.droneFleet?.destroyAll();
  GAME.droneFleet = null;
  GAME.player = null;
  GAME.pathGrid = null;
  GAME.stickerSystem.clear();
  GAME.stickers = [];
  GAME.alertSystem.reset();
  GAME.explosionChain.cancel();
  if (GAME.touch) GAME.touch.hide();
  if (resetState) GAME.state.transition('menu');
}

function showLocationFade() {
  let fade = document.getElementById('loc-fade');
  if (!fade) {
    fade = document.createElement('div');
    fade.id = 'loc-fade';
    fade.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9999;pointer-events:none;transition:opacity 1.8s ease';
    document.body.appendChild(fade);
  }
  fade.style.opacity = '1';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fade.style.opacity = '0';
      setTimeout(() => fade.remove(), 2000);
    });
  });
}

boot().catch(console.error);
