// Procedural topographic contour lines (the faint map lines behind every
// landonorris.com section). Marching squares over fractal value noise,
// rendered once to a transparent PNG and shared via CSS custom properties.

function makeNoise(seed) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const size = 256;
  const grid = new Float32Array(size * size).map(rand);
  const at = (x, y) => grid[(y & (size - 1)) * size + (x & (size - 1))];
  const smooth = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
    return a + (b - a) * yf;
  };
}

function field(noise, x, y) {
  let v = 0;
  let amp = 1;
  let f = 1;
  let norm = 0;
  for (let o = 0; o < 4; o++) {
    v += noise(x * f, y * f) * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return v / norm;
}

function drawContours(width, height, color, lineWidth, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const noise = makeNoise(seed);
  const step = 6;
  const cols = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  const scale = 0.0028;
  const vals = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) vals[j * cols + i] = field(noise, i * step * scale, j * step * scale);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const levels = 14;
  for (let l = 1; l < levels; l++) {
    const iso = 0.22 + (l / levels) * 0.56;
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = vals[j * cols + i];
        const b = vals[j * cols + i + 1];
        const c = vals[(j + 1) * cols + i + 1];
        const d = vals[(j + 1) * cols + i];
        const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * step;
        const y = j * step;
        const lerp = (v1, v2) => (iso - v1) / (v2 - v1 || 1e-6);
        const top = [x + step * lerp(a, b), y];
        const right = [x + step, y + step * lerp(b, c)];
        const bottom = [x + step * lerp(d, c), y + step];
        const left = [x, y + step * lerp(a, d)];
        const seg = (p, q) => {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        };
        switch (idx) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 5: seg(left, top); seg(bottom, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(left, top); break;
          case 10: seg(left, bottom); seg(top, right); break;
        }
      }
    }
  }
  ctx.stroke();
  return canvas.toDataURL('image/png');
}

export function installContours() {
  const w = 1800;
  const h = 1100;
  const light = drawContours(w, h, 'rgba(28,26,23,0.10)', 1.1, 7);
  const dark = drawContours(w, h, 'rgba(232,89,139,0.13)', 1.1, 21);
  const root = document.documentElement.style;
  root.setProperty('--contours-light', `url(${light})`);
  root.setProperty('--contours-dark', `url(${dark})`);
}
