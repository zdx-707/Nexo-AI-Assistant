window.ProgressSystem = class ProgressSystem {
  constructor() {
    this.db = null;
    this._cache = {};
  }

  setDB(gameDB) {
    this.db = gameDB;
  }

  async save(missionSystem, player, inventory) {
    const saveObj = {
      missions: missionSystem.getAllMissions(),
      totalScore: missionSystem.getTotalScore(),
      stickers: inventory.stickers,
      drones: inventory.drones,
      savedAt: Date.now(),
    };
    this._cache = saveObj;
    await this.db?.save(saveObj);
  }

  async load() {
    const saveObj = await this.db?.load() ?? null;
    if (saveObj) {
      this._cache = saveObj;
    }
    return saveObj;
  }

  async hasSave() {
    const saveObj = await this.load();
    return saveObj !== null;
  }

  applyToMissions(saveData, missionSystem) {
    if (!saveData || !saveData.missions) return;
    saveData.missions.forEach(function(saved) {
      const mission = missionSystem.getMission(saved.id);
      if (mission) {
        mission.status = saved.status;
        mission.score = saved.score;
        mission.stars = saved.stars;
      }
    });
  }

  async clearSave() {
    await this.db?.deleteSave();
    this._cache = {};
  }

  async addHighScore(locationId, score) {
    await this.db?.addScore({ score: score, factory: locationId, date: new Date().toISOString() });
  }

  async getHighScores() {
    return await this.db?.getScores() ?? [];
  }
};
