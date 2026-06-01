window.EventEmitter = class EventEmitter {
    constructor() {
        this._listeners = {};
    }

    on(event, fn) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(fn);
    }

    off(event, fn) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(listener => listener !== fn);
    }

    emit(event, ...args) {
        if (!this._listeners[event]) return;
        this._listeners[event].slice().forEach(fn => fn(...args));
    }

    once(event, fn) {
        const wrapper = (...args) => {
            fn(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    clear(event) {
        delete this._listeners[event];
    }

    clearAll() {
        this._listeners = {};
    }
};
