window.AlertSystem = class AlertSystem {
  constructor(events) {
    this.events = events;
    this.alertLevel = 0;
    this.alertTimer = 0;
    this.alarmActive = false;
    this.lockedDown = false;
    this.guards = [];

    this.events.on('guardAlert', () => this.onGuardAlert());
    this.events.on('alarmTriggered', () => this.onAlarmTriggered());
    this.events.on('disguiseBroken', () => this.onDisguiseBroken());
    this.events.on('targetDestroyed', () => this.onTargetDestroyed());
  }

  update(dt) {
    if (this.alertLevel > 0 && !this.alarmActive) {
      this.alertTimer += dt;
      if (this.alertTimer >= 20) {
        this.alertLevel--;
        this.alertTimer = 0;
      }
    }

    if (this.lockedDown) {
      for (let i = 0; i < this.guards.length; i++) {
        if (this.guards[i].setState) {
          this.guards[i].setState('chase');
        }
      }
    }
  }

  onGuardAlert() {
    this.alertLevel = Math.max(this.alertLevel, 1);
    window.GAME?.audio?.play('alert_beep');
  }

  onAlarmTriggered() {
    this.alertLevel = 2;
    this.alarmActive = true;
    window.GAME?.audio?.play('alarm');
    for (let i = 0; i < this.guards.length; i++) {
      if (this.guards[i].setState) {
        this.guards[i].setState('alert');
      }
    }
  }

  onDisguiseBroken() {
    this.alertLevel = 3;
    this.lockedDown = true;
    window.GAME?.audio?.play('alarm_loud');
  }

  onTargetDestroyed() {
    this.alertLevel = Math.max(this.alertLevel, 2);
  }

  setGuards(guardsArray) {
    this.guards = guardsArray;
  }

  reset() {
    this.alertLevel = 0;
    this.alarmActive = false;
    this.lockedDown = false;
    this.alertTimer = 0;
  }

  getLevel() {
    return this.alertLevel;
  }
};
