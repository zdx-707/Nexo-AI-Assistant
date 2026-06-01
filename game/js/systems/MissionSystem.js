window.MissionSystem = class MissionSystem {
  constructor(events) {
    this.events = events;
    this.missions = CONFIG.LOCATIONS.map(function(loc) {
      return {
        id: loc,
        name: CONFIG.LOCATION_NAMES[loc],
        status: 'locked',
        score: 0,
        stars: 0,
      };
    });
    this.missions[0].status = 'available';
    this.activeMission = null;
    this.sessionScore = 0;
    this.events.on('targetDestroyed', (data) => this.onTargetDestroyed(data));
  }

  startMission(locationId) {
    const mission = this.getMission(locationId);
    if (!mission) return;
    mission.status = 'active';
    this.activeMission = mission;
    this.events.emit('missionStart', { locationId: locationId, name: mission.name });
  }

  completeMission(locationId, stats) {
    const mission = this.getMission(locationId);
    if (!mission) return;
    const base = (stats.targetsDestroyed / stats.totalTargets) * 1000;
    const timeBonus = Math.max(0, 500 - stats.timeSeconds * 2);
    const stealthBonus = stats.alertLevel === 0 ? 500 : stats.alertLevel < 2 ? 200 : 0;
    const total = base + timeBonus + stealthBonus;
    const stars = total >= 1500 ? 3 : total >= 1000 ? 2 : 1;
    mission.status = 'complete';
    mission.score = total;
    mission.stars = stars;
    const idx = CONFIG.LOCATIONS.indexOf(locationId);
    if (idx !== -1 && idx + 1 < this.missions.length) {
      const next = this.missions[idx + 1];
      if (next.status === 'locked') next.status = 'available';
    }
    this.sessionScore += total;
    this.activeMission = null;
    this.events.emit('missionComplete', {
      locationId: locationId,
      name: mission.name,
      targetsDestroyed: stats.targetsDestroyed,
      totalTargets: stats.totalTargets,
      timeSeconds: stats.timeSeconds,
      alertLevel: stats.alertLevel,
      score: total,
      stars: stars,
    });
  }

  failMission(locationId, reason) {
    const mission = this.getMission(locationId);
    if (mission) mission.status = 'available';
    this.activeMission = null;
    this.events.emit('missionFail', { locationId: locationId, reason: reason });
  }

  onTargetDestroyed(data) {
    if (!this.activeMission) return;
  }

  getMission(id) {
    return this.missions.find(function(m) { return m.id === id; }) || null;
  }

  getAllMissions() {
    return this.missions;
  }

  getProgress() {
    const completed = this.missions.filter(function(m) { return m.status === 'complete'; }).length;
    return { completed: completed, total: this.missions.length };
  }

  getTotalScore() {
    return this.missions.reduce(function(sum, m) { return sum + m.score; }, 0);
  }

  isAllComplete() {
    return this.missions.every(function(m) { return m.status === 'complete'; });
  }
};
