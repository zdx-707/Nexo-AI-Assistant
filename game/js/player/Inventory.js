window.Inventory = class Inventory {
  constructor() {
    this.stickers = CONFIG.MAX_STICKERS;
    this.drones = 3;
    this.tools = [];
  }

  hasStickers() {
    return this.stickers > 0;
  }

  useSticker() {
    if (this.stickers <= 0) return false;
    this.stickers--;
    return true;
  }

  addStickers(n) {
    this.stickers = Math.min(this.stickers + n, CONFIG.MAX_STICKERS);
  }

  hasDrones() {
    return this.drones > 0;
  }

  deployDrone() {
    if (this.drones <= 0) return false;
    this.drones--;
    return true;
  }

  addDrone() {
    this.drones++;
  }

  pickupItem(item) {
    if (item.type === 'sticker') {
      this.addStickers(item.amount);
      return true;
    }
    if (item.type === 'drone') {
      for (let i = 0; i < item.amount; i++) {
        this.addDrone();
      }
      return true;
    }
    if (item.type === 'tool') {
      this.tools.push(item);
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      stickers: this.stickers,
      drones: this.drones,
      tools: [...this.tools]
    };
  }

  reset() {
    this.stickers = CONFIG.MAX_STICKERS;
    this.drones = 3;
    this.tools = [];
  }
};
