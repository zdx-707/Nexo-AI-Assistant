window.GameDB = class GameDB {
  constructor() {
    this.db = null;
    this.DB_NAME = 'NexoInfiltrator';
    this.DB_VERSION = 1;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('saves')) {
          db.createObjectStore('saves', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('scores')) {
          db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async save(data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('saves', 'readwrite');
      const store = tx.objectStore('saves');
      const request = store.put(Object.assign({}, data, { id: 'current' }));

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async load() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('saves', 'readonly');
      const store = tx.objectStore('saves');
      const request = store.get('current');

      request.onsuccess = (event) => resolve(event.target.result || null);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async deleteSave() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('saves', 'readwrite');
      const store = tx.objectStore('saves');
      const request = store.delete('current');

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async addScore(score) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('scores', 'readwrite');
      const store = tx.objectStore('scores');
      const request = store.add({ score: score, factory: score.factory, date: new Date().toISOString() });

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getScores() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('scores', 'readonly');
      const store = tx.objectStore('scores');
      const request = store.getAll();

      request.onsuccess = (event) => {
        const scores = event.target.result || [];
        scores.sort((a, b) => b.score - a.score);
        resolve(scores);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key: key, value: value });

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = (event) => {
        const result = event.target.result;
        resolve(result ? result.value : null);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
};
