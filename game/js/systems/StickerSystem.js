window.StickerSystem = class StickerSystem {
  constructor(events) {
    this.events = events;
    this.stickers = [];
    this.stickerData = {};

    this.events.on('stickerTriggered', (data) => this.onStickerTriggered(data));
  }

  register(sticker) {
    this.stickers.push(sticker);
    this.stickerData[sticker.id] = sticker.getData();
    const { x, y, z } = sticker.pos;
    console.log(`[Server] Sticker registered at ${x},${y},${z}`);
    this.events.emit('stickerRegistered', sticker.getData());
  }

  unregister(id) {
    this.stickers = this.stickers.filter((s) => s.id !== id);
    delete this.stickerData[id];
  }

  onStickerTriggered(data) {
    if (!this.stickerData[data.id]) return;
    this.stickerData[data.id].triggered = true;

    const sticker = this.stickers.find((s) => s.id === data.id);
    if (!sticker || !sticker.targetObject) return;
    const target = sticker.targetObject;
    if (target && typeof target.armed !== 'undefined') {
      target.armed = true;
    }
  }

  update(dt) {
    const toRemove = [];
    for (const sticker of this.stickers) {
      if (!sticker.active) {
        toRemove.push(sticker.id);
        continue;
      }
      if (sticker.targetObject && sticker.targetObject.destroyed) {
        sticker.remove();
        toRemove.push(sticker.id);
        continue;
      }
      sticker.update(dt);
    }
    for (const id of toRemove) {
      this.unregister(id);
    }
  }

  getArmedTargets() {
    const result = [];
    for (const sticker of this.stickers) {
      const data = this.stickerData[sticker.id];
      if (data && data.triggered) {
        result.push({
          stickerId: sticker.id,
          targetId: data.targetId,
          pos: data.pos,
        });
      }
    }
    return result;
  }

  getCount() {
    return this.stickers.length;
  }

  clear() {
    for (const sticker of this.stickers) {
      sticker.remove();
    }
    this.stickers = [];
    this.stickerData = {};
  }
};
