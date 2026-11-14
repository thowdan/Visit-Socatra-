// Which photo goes where. Photo numbers refer to public/img/instagram/ig-XX.webp
// (the 20 images of the @hobopeeba carousel, in carousel order).
const BASE = import.meta.env.BASE_URL;

export const ig = (n) => `${BASE}img/instagram/ig-${String(n).padStart(2, '0')}.webp`;
export const asset = (p) => `${BASE}${p}`;

export const FRAME_COUNT = 65;
export const frameUrl = (i) => `${BASE}frames/f_${String(i + 1).padStart(3, '0')}.webp`;

// Horizontal gallery. All units are vh so the layout scales with viewport height.
// kind img: n = photo, cap = caption index, h = height (width = h * 0.75)
// kind quote: q = quote index, w = width
export const TRACK = [
  { kind: 'quote', q: 0, x: 8, y: 14, w: 36 },
  { kind: 'img', n: 3, cap: 0, x: 12, y: 46, h: 40 },
  { kind: 'img', n: 8, cap: 1, x: 52, y: 10, h: 60, speed: 0.06 },
  { kind: 'img', n: 14, cap: 2, x: 104, y: 50, h: 34, speed: -0.05 },
  { kind: 'img', n: 4, cap: 3, x: 136, y: 12, h: 42 },
  { kind: 'quote', q: 1, x: 176, y: 20, w: 38 },
  { kind: 'img', n: 6, cap: 4, x: 184, y: 50, h: 36, speed: 0.05 },
  { kind: 'img', n: 9, cap: 5, x: 226, y: 8, h: 64, speed: -0.04 },
  { kind: 'img', n: 15, cap: 6, x: 282, y: 54, h: 30 },
  { kind: 'img', n: 10, cap: 7, x: 312, y: 14, h: 40, speed: 0.06 },
  { kind: 'img', n: 17, cap: 8, x: 352, y: 42, h: 44 },
  { kind: 'img', n: 16, cap: 9, x: 398, y: 8, h: 38, speed: -0.05 },
  { kind: 'quote', q: 2, x: 400, y: 60, w: 36 },
  { kind: 'img', n: 12, cap: 10, x: 446, y: 20, h: 58, speed: 0.04 },
  { kind: 'img', n: 13, cap: 11, x: 500, y: 46, h: 36 },
];
export const TRACK_WIDTH_VH = 540;

export const SPLIT = { left: 20, right: 4, full: 11 };

// Wonders grid, same order as locale wonders.items
export const WONDERS = [18, 19, 7, 8, 20, 16, 17, 2, 11, 12, 13, 6, 14, 15, 4, 9];

export const PLAN = { main: 12, side: 9, small1: 5, small2: 2 };

export const SOCIALS = [1, 7, 3, 16, 13, 5, 19];

export const FOOTER_FIGURE = 18;
