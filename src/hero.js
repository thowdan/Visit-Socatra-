import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Texture,
  Vector2,
  SRGBColorSpace,
  LinearFilter,
} from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uForeground;   // still photo (revealed inside the lens)
  uniform sampler2D uFrames;       // living video frame (main full-screen layer)
  uniform vec2 uRes;
  uniform vec2 uFgSize;
  uniform vec2 uFrameSize;
  uniform vec2 uMouse;             // lerped pointer, uv space (y up)
  uniform vec2 uTrail;             // slower trailing point -> blob stretch
  uniform float uRadius;
  uniform float uTime;
  uniform float uIntro;            // 0..1 lens grows in
  uniform vec2 uParallax;

  // object-fit: cover
  vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
    float rs = res.x / res.y;
    float ri = img.x / img.y;
    vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
    return (uv - 0.5) * s + 0.5;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    vec2 t = vec2(uTrail.x * aspect, uTrail.y);

    // metaball of pointer + trail (smooth-min of distances)
    float d1 = length(p - m);
    float d2 = length(p - t);
    float k = 0.14;
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    float dist = mix(d2, d1, h) - k * h * (1.0 - h);

    // organic, slowly breathing edge
    float ang = atan(p.y - m.y, p.x - m.x);
    float wob = (noise(vec2(ang * 1.6 + 3.0, uTime * 0.55)) - 0.5) * 0.045
              + (noise(p * 5.0 + uTime * 0.25) - 0.5) * 0.02;

    float radius = uRadius * uIntro;
    float strength = smoothstep(radius, radius + 0.04, dist + wob); // 0 inside, 1 outside

    // main layer: the living video, with a gentle pointer parallax
    vec2 frUv = coverUv(vUv, uRes, uFrameSize);
    frUv = (frUv - 0.5) * 0.97 + 0.5 + uParallax * 0.01;

    // revealed photo: slight magnification centred on the lens + slow drift
    vec2 fgUv = coverUv(vUv, uRes, uFgSize);
    vec2 fgM = coverUv(uMouse, uRes, uFgSize);
    fgUv = (fgUv - fgM) * (0.92 - 0.01 * sin(uTime * 0.12)) + fgM;

    vec3 fg = texture2D(uForeground, fgUv).rgb;
    vec3 fr = texture2D(uFrames, frUv).rgb;

    // inside the lens -> photo, outside -> video
    vec3 col = mix(fg, fr, strength);

    // thin warm rim on the lens edge
    float rim = smoothstep(radius - 0.012, radius + 0.02, dist + wob) - smoothstep(radius + 0.02, radius + 0.06, dist + wob);
    col += vec3(0.95, 0.42, 0.55) * rim * 0.16 * uIntro;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lando-style cursor lens: the looping frame sequence fills the screen and a
 * spring-damped organic blob reveals the still photo underneath.
 */
export async function createHero({ canvas, foregroundSrc, frameUrls, fps = 24, onProgress = () => {} }) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return null; // no WebGL -> CSS fallback poster stays visible
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const fgTex = new Texture();
  const frTex = new Texture();
  for (const tex of [fgTex, frTex]) {
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearFilter;
    tex.generateMipmaps = false;
  }

  const uniforms = {
    uForeground: { value: fgTex },
    uFrames: { value: frTex },
    uRes: { value: new Vector2(1, 1) },
    uFgSize: { value: new Vector2(1, 1) },
    uFrameSize: { value: new Vector2(16, 9) },
    uMouse: { value: new Vector2(0.62, 0.5) },
    uTrail: { value: new Vector2(0.62, 0.5) },
    uRadius: { value: 0.16 },
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uParallax: { value: new Vector2(0, 0) },
  };

  const mesh = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ vertexShader, fragmentShader, uniforms }));
  scene.add(mesh);

  // --- assets: foreground + first frame first, the rest streamed in order
  const [fg, first] = await Promise.all([loadImage(foregroundSrc), loadImage(frameUrls[0])]);
  fgTex.image = fg;
  fgTex.needsUpdate = true;
  uniforms.uFgSize.value.set(fg.naturalWidth, fg.naturalHeight);
  frTex.image = first;
  frTex.needsUpdate = true;
  uniforms.uFrameSize.value.set(first.naturalWidth, first.naturalHeight);

  const frames = new Array(frameUrls.length);
  frames[0] = first;
  let loaded = 1;
  onProgress(loaded / frameUrls.length);
  const allFrames = Promise.all(
    frameUrls.slice(1).map((u, i) =>
      loadImage(u)
        .then((img) => {
          frames[i + 1] = img;
        })
        .catch(() => {})
        .finally(() => onProgress(++loaded / frameUrls.length)),
    ),
  );

  // --- pointer with lerp damping (spec: 0.12) + slower trail
  const target = new Vector2(0.62, 0.5);
  const mouse = uniforms.uMouse.value;
  const trail = uniforms.uTrail.value;
  let interacted = false;
  let radius = 0.16;

  function setFromClient(x, y) {
    const r = canvas.getBoundingClientRect();
    target.set((x - r.left) / r.width, 1 - (y - r.top) / r.height);
    interacted = true;
  }
  const onMouse = (e) => setFromClient(e.clientX, e.clientY);
  const onTouch = (e) => {
    const tch = e.touches[0];
    if (tch) setFromClient(tch.clientX, tch.clientY);
  };
  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // --- loop
  let running = true;
  let raf = 0;
  let last = performance.now();
  let frameClock = 0;
  const count = frameUrls.length;
  const cycle = count * 2 - 2; // ping-pong so a short clip loops without a jump

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    uniforms.uTime.value += dt;

    // idle wander until the visitor interacts (useful on touch devices)
    if (!interacted) {
      const tt = uniforms.uTime.value;
      target.set(0.5 + Math.sin(tt * 0.45) * 0.18, 0.48 + Math.sin(tt * 0.7) * 0.12);
    }

    const prevX = mouse.x;
    const prevY = mouse.y;
    mouse.lerp(target, 0.12);
    trail.lerp(mouse, 0.06);
    const speed = Math.hypot(mouse.x - prevX, mouse.y - prevY) / Math.max(dt, 1e-3);
    const want = 0.16 + Math.min(speed * 0.02, 0.05);
    radius += (want - radius) * 0.08;
    uniforms.uRadius.value = radius;
    uniforms.uParallax.value.set((mouse.x - 0.5) * -1, (mouse.y - 0.5) * -1);

    // frame sequence
    frameClock += dt * fps;
    const step = Math.floor(frameClock) % cycle;
    const idx = step < count ? step : cycle - step;
    const img = frames[idx];
    if (img && frTex.image !== img) {
      frTex.image = img;
      frTex.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function play() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }
  raf = requestAnimationFrame(tick);

  return {
    allFrames,
    uniforms,
    play,
    pause,
    resize,
    setIntro(v) {
      uniforms.uIntro.value = v;
    },
    destroy() {
      pause();
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      renderer.dispose();
    },
  };
}
