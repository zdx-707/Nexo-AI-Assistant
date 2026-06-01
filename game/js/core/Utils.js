window.Utils = {
  rand(min, max) {
    return Math.random() * (max - min) + min;
  },

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },

  rad2deg(rad) {
    return rad * (180 / Math.PI);
  },

  dist3(a, b) {
    return a.distanceTo(b);
  },

  dist2(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  },

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  },

  pointInBox(point, box) {
    const halfW = box.w / 2;
    const halfH = box.h / 2;
    return (
      point.x >= box.x - halfW &&
      point.x <= box.x + halfW &&
      point.z >= box.z - halfH &&
      point.z <= box.z + halfH
    );
  },

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  mapRange(val, inMin, inMax, outMin, outMax) {
    return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  },

  smoothstep(edge0, edge1, x) {
    const t = window.Utils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },

  yawToDir(yaw) {
    return {
      x: Math.sin(yaw),
      z: Math.cos(yaw),
    };
  },
};
