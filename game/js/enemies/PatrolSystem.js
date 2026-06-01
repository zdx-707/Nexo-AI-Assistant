window.PatrolSystem = class PatrolSystem {
  constructor() {
    this.routes = {};
  }

  addRoutes(locationId, routes) {
    this.routes[locationId] = routes;
  }

  getRoute(locationId, guardIndex) {
    if (this.routes[locationId] && this.routes[locationId].length > 0) {
      return this.routes[locationId][guardIndex % this.routes[locationId].length];
    }
    return this.generateDefaultRoute(0, 0, 10, 8);
  }

  generateDefaultRoute(centerX, centerZ, radius, points) {
    const route = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const z = centerZ + Math.sin(angle) * radius;
      route.push([x, 0, z]);
    }
    return route;
  }

  generatePerimeterRoute(minX, maxX, minZ, maxZ) {
    return [
      [minX, 0, minZ],
      [maxX, 0, minZ],
      [maxX, 0, maxZ],
      [minX, 0, maxZ]
    ];
  }

  assignRoutes(guards, locationId) {
    guards.forEach((guard, index) => {
      guard.patrolPoints = this.getRoute(locationId, index);
    });
  }
};
