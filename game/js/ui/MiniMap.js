window.MiniMap = class MiniMap {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'minimap';
    this.canvas.width = 180;
    this.canvas.height = 180;
    this.canvas.className = 'minimap-canvas';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.scale = 2.5;
    this.visible = true;
  }

  update(player, guards, targets, locationSize) {
    if (!this.visible) return;

    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const lw = locationSize.width;
    const ld = locationSize.depth;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    const outline = this.worldToMap(-lw / 2, -ld / 2, lw, ld);
    const outlineEnd = this.worldToMap(lw / 2, ld / 2, lw, ld);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      outline.x,
      outline.y,
      outlineEnd.x - outline.x,
      outlineEnd.y - outline.y
    );

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const tp = this.worldToMap(t.pos.x, t.pos.z, lw, ld);
      if (t.destroyed) {
        ctx.fillStyle = '#444';
      } else if (t.hasSticker) {
        ctx.fillStyle = '#00ffff';
      } else {
        ctx.fillStyle = '#ff8800';
      }
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < guards.length; i++) {
      const g = guards[i];
      const gp = this.worldToMap(g.pos.x, g.pos.z, lw, ld);
      const isAlert = g.state === 'alert' || g.state === 'chase';
      ctx.fillStyle = isAlert ? '#ff2222' : '#882222';
      ctx.save();
      ctx.translate(gp.x, gp.y);
      ctx.rotate(g.yaw || 0);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(4, 4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const pp = this.worldToMap(player.pos.x, player.pos.z, lw, ld);
    ctx.fillStyle = '#00ff44';
    ctx.save();
    ctx.translate(pp.x, pp.y);
    ctx.rotate(player.yaw || 0);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#aaa';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('N', W / 2, 3);
    ctx.textBaseline = 'bottom';
    ctx.fillText('S', W / 2, H - 3);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', 3, H / 2);
    ctx.textAlign = 'right';
    ctx.fillText('E', W - 3, H / 2);
  }

  worldToMap(worldX, worldZ, locationW, locationD) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    return {
      x: cx + worldX * this.scale,
      y: cy + worldZ * this.scale
    };
  }

  show() {
    this.visible = true;
    this.canvas.style.display = 'block';
  }

  hide() {
    this.visible = false;
    this.canvas.style.display = 'none';
  }
};
