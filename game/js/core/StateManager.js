window.StateManager = class StateManager {
  constructor(events) {
    this._events = events;
    this._current = 'menu';
    this._transitions = {
      menu: ['briefing'],
      briefing: ['playing'],
      playing: ['drone', 'paused', 'gameover', 'win'],
      drone: ['playing', 'gameover'],
      paused: ['playing', 'menu'],
      gameover: ['menu', 'briefing'],
      win: ['menu']
    };
  }

  get current() {
    return this._current;
  }

  transition(newState) {
    const allowed = this._transitions[this._current];
    if (!allowed || !allowed.includes(newState)) {
      throw new Error('Invalid transition: ' + this._current + ' -> ' + newState);
    }
    const from = this._current;
    this._current = newState;
    this._events.emit('stateChange', { from, to: newState });
  }

  is(state) {
    return this._current === state;
  }

  isAnyOf(...states) {
    return states.includes(this._current);
  }
};
