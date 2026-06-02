window.PathGrid = class PathGrid {
  constructor(width, depth, cellSize) {
    this.cellSize = cellSize || 2;
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(depth / this.cellSize);
    this.grid = new Uint8Array(this.cols * this.rows);
    this.originX = -width / 2;
    this.originZ = -depth / 2;
  }

  markBlocked(worldX, worldZ, radius) {
    const center = this.worldToCell(worldX, worldZ);
    const cellRadius = Math.ceil(radius / this.cellSize);
    for (let r = center.row - cellRadius; r <= center.row + cellRadius; r++) {
      for (let c = center.col - cellRadius; c <= center.col + cellRadius; c++) {
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) continue;
        const wx = this.originX + c * this.cellSize + this.cellSize / 2;
        const wz = this.originZ + r * this.cellSize + this.cellSize / 2;
        const dx = wx - worldX;
        const dz = wz - worldZ;
        if (Math.sqrt(dx * dx + dz * dz) <= radius) {
          this.grid[r * this.cols + c] = 1;
        }
      }
    }
  }

  worldToCell(worldX, worldZ) {
    let col = Math.floor((worldX - this.originX) / this.cellSize);
    let row = Math.floor((worldZ - this.originZ) / this.cellSize);
    col = Math.max(0, Math.min(this.cols - 1, col));
    row = Math.max(0, Math.min(this.rows - 1, row));
    return { col, row };
  }

  cellToWorld(col, row) {
    return {
      x: this.originX + col * this.cellSize + this.cellSize / 2,
      z: this.originZ + row * this.cellSize + this.cellSize / 2
    };
  }

  findPath(fromWorld, toWorld) {
    const start = this.worldToCell(fromWorld.x, fromWorld.z);
    const end = this.worldToCell(toWorld.x, toWorld.z);

    if (start.col === end.col && start.row === end.row) {
      return [this.cellToWorld(end.col, end.row)];
    }

    const startKey = start.row * this.cols + start.col;
    const endKey = end.row * this.cols + end.col;

    const gScore = {};
    const fScore = {};
    const cameFrom = {};
    const openSet = [];
    const openSetKeys = new Set();
    const closedSet = new Set();

    gScore[startKey] = 0;
    fScore[startKey] = this._heuristic(start, end);
    openSet.push(start);
    openSetKeys.add(startKey);

    let explored = 0;

    while (openSet.length > 0 && explored < 200) {
      let lowestF = Infinity;
      let lowestIdx = 0;
      for (let i = 0; i < openSet.length; i++) {
        const k = openSet[i].row * this.cols + openSet[i].col;
        if (fScore[k] < lowestF) {
          lowestF = fScore[k];
          lowestIdx = i;
        }
      }

      const current = openSet[lowestIdx];
      const currentKey = current.row * this.cols + current.col;

      if (currentKey === endKey) {
        const path = [];
        let node = currentKey;
        while (node !== undefined) {
          const c = node % this.cols;
          const r = Math.floor(node / this.cols);
          path.unshift(this.cellToWorld(c, r));
          node = cameFrom[node];
        }
        return path;
      }

      openSet.splice(lowestIdx, 1);
      openSetKeys.delete(currentKey);
      closedSet.add(currentKey);
      explored++;

      const neighbors = this._neighbors(current.col, current.row);
      for (let i = 0; i < neighbors.length; i++) {
        const nb = neighbors[i];
        const nbKey = nb.row * this.cols + nb.col;
        if (closedSet.has(nbKey)) continue;

        const isDiagonal = nb.col !== current.col && nb.row !== current.row;
        const moveCost = isDiagonal ? 1.414 : 1;
        const tentativeG = (gScore[currentKey] || 0) + moveCost;

        if (gScore[nbKey] === undefined || tentativeG < gScore[nbKey]) {
          cameFrom[nbKey] = currentKey;
          gScore[nbKey] = tentativeG;
          fScore[nbKey] = tentativeG + this._heuristic(nb, end);
          if (!openSetKeys.has(nbKey)) {
            openSet.push(nb);
            openSetKeys.add(nbKey);
          }
        }
      }
    }

    return [];
  }

  _heuristic(a, b) {
    return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
  }

  _neighbors(col, row) {
    const result = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nc = col + dc;
        const nr = row + dr;
        if (nc < 0 || nc >= this.cols || nr < 0 || nr >= this.rows) continue;
        if (this.grid[nr * this.cols + nc] === 1) continue;
        if (dr !== 0 && dc !== 0) {
          if (this.grid[row * this.cols + nc] === 1) continue;
          if (this.grid[nr * this.cols + col] === 1) continue;
        }
        result.push({ col: nc, row: nr });
      }
    }
    return result;
  }
};
