import './styles/main.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getLang, setLang, applyLang } from './i18n.js';
import { render } from './render.js';
import { createHero } from './hero.js';
import { installContours } from './contours.js';
import { FRAME_COUNT, frameUrl, asset, TRACK, TRACK_WIDTH_VH } from './data.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const lang = getLang();
const t = applyLang(lang);
const RTL = t.dir === 'rtl';
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

$('#app').innerHTML = render(t);
$('[data-pre-label]').textContent = t.preloader.label;
installContours();

/* ------------------------------------------------------------------ */
/* Smooth scroll                                                       */
/* ------------------------------------------------------------------ */
let lenis = null;
if (!REDUCE) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

function scrollToTarget(hash) {
  const el = hash === '#top' ? 0 : $(hash);
  if (el === null) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else (el === 0 ? document.documentElement : el).scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href');
  if (hash.length < 2) return;
  e.preventDefault();
  if (menuOpen) closeMenu(() => scrollToTarget(hash));
  else scrollToTarget(hash);
});

/* ------------------------------------------------------------------ */
/* Nav: colour follows the section underneath                         */
/* ------------------------------------------------------------------ */
const nav = $('[data-nav]');
function updateNavTheme() {
  const y = 34;
  const stack = document.elementsFromPoint(innerWidth / 2, y);
  const sec = stack.map((el) => el.closest('[data-nav-theme]')).find(Boolean);
  const theme = sec ? sec.dataset.navTheme : 'light';
  if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
}
ScrollTrigger.addEventListener('refresh', updateNavTheme);
gsap.ticker.add(updateNavTheme);

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */
const menu = $('[data-menu]');
const menuBtn = $('[data-menu-open]');
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  menu.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  lenis?.stop();
  const origin = RTL ? '0% 0%' : '100% 0%';
  gsap.fromTo(menu, { clipPath: `circle(0% at ${origin})` }, { clipPath: `circle(150% at ${origin})`, duration: 0.9, ease: 'expo.inOut' });
  gsap.fromTo($$('.menu-links a', menu), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, delay: 0.35, duration: 0.8, ease: 'expo.out' });
  $('.menu-links a', menu).focus({ preventScroll: true });
}
function closeMenu(after) {
  const origin = RTL ? '0% 0%' : '100% 0%';
  gsap.to(menu, {
    clipPath: `circle(0% at ${origin})`,
    duration: 0.7,
    ease: 'expo.inOut',
    onComplete: () => {
      menu.hidden = true;
      menuOpen = false;
      menuBtn.setAttribute('aria-expanded', 'false');
      lenis?.start();
      menuBtn.focus({ preventScroll: true });
      after?.();
    },
  });
}
menuBtn.addEventListener('click', openMenu);
$('[data-menu-close]').addEventListener('click', () => closeMenu());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen) closeMenu();
});

/* ------------------------------------------------------------------ */
/* Language toggle (with curtain transition)                          */
/* ------------------------------------------------------------------ */
const curtain = $('[data-curtain]');
$('[data-lang-toggle]').addEventListener('click', () => {
  const next = lang === 'ar' ? 'en' : 'ar';
  lenis?.stop();
  gsap.set(curtain, { display: 'block' });
  gsap.fromTo(
    curtain,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: REDUCE ? 0 : 0.8, ease: 'expo.inOut', onComplete: () => setLang(next) },
  );
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function prepDraw(path) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  return len;
}

// Two identical .mq-inner copies sit side by side. In LTR the copy is to the
// right (loop over 0 -> -100%), in RTL it is to the left (loop over 0 -> +100%).
function infiniteMarquee(row, reverse) {
  const inners = $$('.mq-inner', row);
  const [a, b] = RTL ? [0, 100] : [0, -100];
  const [from, to] = reverse ? [b, a] : [a, b];
  return gsap.fromTo(inners, { xPercent: from }, { xPercent: to, duration: 38, ease: 'none', repeat: -1 });
}

/* ------------------------------------------------------------------ */
/* Scroll choreography                                                 */
/* ------------------------------------------------------------------ */
function buildIntro() {
  const stage = $('[data-hero-stage]');
  const frame = () => {
    const vw = innerWidth;
    const vh = innerHeight;
    const fw = Math.min(vw * (vw < 768 ? 0.78 : 0.4), 640);
    const fh = Math.min(fw * 0.66, vh * 0.42);
    return { x: (vw - fw) / 2, y: (vh - fh) / 2 };
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.intro',
      start: 'top top',
      end: '+=140%',
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate(self) {
        $('.intro').dataset.navTheme = self.progress > 0.18 ? 'dark' : 'light';
      },
    },
  });
  tl.fromTo(
    stage,
    { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
    { clipPath: () => { const f = frame(); return `inset(${f.y}px ${f.x}px ${f.y}px ${f.x}px round 18px)`; }, duration: 1, ease: 'power2.inOut' },
    0,
  )
    .to('[data-hero-copy]', { yPercent: -40, opacity: 0, duration: 0.35 }, 0)
    .to(['[data-hero-card]', '[data-hero-hint]'], { opacity: 0, y: 30, duration: 0.25 }, 0)
    .fromTo('.intro-bg-dark', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.15)
    .fromTo('.mq', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.4)
    .fromTo('.mq-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.75)
    .to({}, { duration: 0.5 });

  const rows = $$('.mq-row');
  const tweens = rows.map((r) => infiniteMarquee(r, r.classList.contains('is-reverse')));
  // scroll velocity pushes the marquee, like the original
  if (lenis) {
    let ts = 1;
    gsap.ticker.add(() => {
      const want = 1 + Math.min(Math.abs(lenis.velocity) * 0.35, 8);
      ts += (want - ts) * 0.08;
      tweens.forEach((tw) => tw.timeScale(ts));
    });
  }
}

function buildStatement() {
  gsap.fromTo(
    '.statement .w',
    { opacity: 0.14 },
    {
      opacity: 1,
      stagger: 0.12,
      ease: 'none',
      scrollTrigger: { trigger: '.statement-text', start: 'top 82%', end: 'bottom 50%', scrub: true },
    },
  );
  const p = $('.statement-scribble .draw');
  const len = prepDraw(p);
  gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top 85%', end: 'top 15%', scrub: true } });
  void len;
}

function buildTrack(mm) {
  mm.add('(min-width: 768px)', () => {
    const strip = $('[data-track-strip]');
    const pinEl = $('.track-pin');
    const items = $$('.tr-item', strip);
    const count = $('[data-track-count]');
    const bar = $('[data-track-bar]');
    const imgs = TRACK.filter((i) => i.kind === 'img');
    const dist = () => Math.max(0, (TRACK_WIDTH_VH / 100) * innerHeight - innerWidth);
    const setters = items.map((el) => ({
      el,
      speed: parseFloat(el.dataset.speed) || 0,
      at: parseFloat(getComputedStyle(el).getPropertyValue('--x')) / TRACK_WIDTH_VH,
      set: gsap.quickSetter(el, 'y', 'px'),
    }));

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.track',
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;
          bar.style.transform = `scaleX(${p})`;
          count.textContent = String(Math.min(imgs.length, 1 + Math.floor(p * imgs.length))).padStart(2, '0');
          for (const s of setters) if (s.speed) s.set((p - s.at) * s.speed * innerHeight * 4);
          $('.track').dataset.navTheme = p > 0.4 ? 'light' : 'dark';
        },
      },
    });
    tl.to(strip, { x: () => (RTL ? 1 : -1) * dist(), duration: 1 }, 0)
      .fromTo(pinEl, { backgroundColor: '#1C1A17', color: '#F4F1E8' }, { backgroundColor: '#8C8F7C', color: '#1C1A17', duration: 0.35 }, 0.2)
      .to(pinEl, { backgroundColor: '#F4F1E8', duration: 0.3 }, 0.6);

    $$('.tr-quote .draw', strip).forEach((p) => {
      prepDraw(p);
      gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.track', start: 'top top', end: () => `+=${dist()}`, scrub: true } });
    });
  });
}

function buildSplit() {
  const st = { trigger: '.split', start: 'top bottom', end: 'center center', scrub: true };
  gsap.fromTo('[data-split-l]', { xPercent: -70, rotate: -6 }, { xPercent: 0, rotate: 0, ease: 'none', scrollTrigger: st });
  gsap.fromTo('[data-split-r]', { xPercent: 70, rotate: 6 }, { xPercent: 0, rotate: 0, ease: 'none', scrollTrigger: { ...st } });
  gsap.fromTo(
    '[data-split-scribble]',
    { clipPath: RTL ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', duration: 1.2, scrollTrigger: { trigger: '.split-center', start: 'top 70%' } },
  );
  gsap.from('.split-col', { y: 60, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.split-center', start: 'top 80%' } });

  gsap.fromTo(
    '[data-fb-frame]',
    { clipPath: 'inset(12% 16% 12% 16% round 28px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.fullbleed', start: 'top bottom', end: 'top top', scrub: true } },
  );
  gsap.fromTo('[data-fb-img]', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.fullbleed', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.fb-head > *', { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.fb-head', start: 'top 85%' } });
}

function buildWonders(mm) {
  mm.add('(min-width: 768px)', () => {
    const speeds = [-60, 80, -140, 40];
    $$('.w-col').forEach((col, i) => {
      gsap.fromTo(col, { y: 0 }, { y: speeds[i], ease: 'none', scrollTrigger: { trigger: '.wonders-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  ScrollTrigger.batch('.w-card', {
    start: 'top 92%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1, ease: 'expo.out' }),
  });
  gsap.from('.wonders-more > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.wonders-more', start: 'top 85%' } });
}

function buildPlan() {
  gsap.from('.plan-title .line > span', { yPercent: 110, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.plan-title', start: 'top 80%' } });
  gsap.from(['.plan .kicker', '.plan-desc', '.plan-tips', '.plan .btn'], { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.plan-copy', start: 'top 70%' } });
  $$('.pc').forEach((el) => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { y: -s * 300 }, { y: s * 300, ease: 'none', scrollTrigger: { trigger: '.plan', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

function buildBadges() {
  const txt = $('[data-script]');
  gsap.fromTo(
    txt,
    { strokeDashoffset: 2600, fillOpacity: 0 },
    {
      keyframes: [
        { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' },
        { fillOpacity: 1, duration: 0.6 },
      ],
      scrollTrigger: { trigger: '.badges', start: 'top 70%' },
    },
  );
  gsap.from('.badges-head > *', { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.badges', start: 'top 80%' } });
}

function buildSocials() {
  gsap.fromTo('[data-fan]', { '--fan': 0 }, { '--fan': 1, ease: 'none', scrollTrigger: { trigger: '.fan', start: 'top 95%', end: 'center 55%', scrub: true } });
  gsap.from('.socials-head > *', { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.socials', start: 'top 80%' } });
}

function buildFooter() {
  gsap.from('.footer-title .line', { yPercent: 60, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer-panel', start: 'top 75%' } });
  gsap.fromTo('.footer-figure', { yPercent: 25, scale: 0.9 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.footer-panel', start: 'top bottom', end: 'center center', scrub: true } });
  const p = $('.footer-sign .draw');
  prepDraw(p);
  gsap.to(p, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: '.footer-panel', start: 'top 70%' } });
  gsap.from(['.footer-col', '.footer-cta'], { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.footer-panel', start: 'top 55%' } });
}

function buildScroll() {
  const mm = gsap.matchMedia();
  buildIntro();
  buildStatement();
  buildTrack(mm);
  buildSplit();
  buildWonders(mm);
  buildPlan();
  buildBadges();
  buildSocials();
  buildFooter();
}

/* ------------------------------------------------------------------ */
/* Boot: preload hero, then reveal                                     */
/* ------------------------------------------------------------------ */
async function boot() {
  const pre = $('[data-preloader]');
  const countEl = $('[data-pre-count]');
  const shown = { v: 0 };
  let target = 0;
  const counter = () => {
    shown.v += (target - shown.v) * 0.12;
    countEl.textContent = String(Math.round(shown.v * 100)).padStart(2, '0');
  };
  gsap.ticker.add(counter);

  const hero = await createHero({
    canvas: $('[data-hero-canvas]'),
    foregroundSrc: asset('img/hero-foreground.webp'),
    frameUrls: Array.from({ length: FRAME_COUNT }, (_, i) => frameUrl(i)),
    fps: REDUCE ? 0 : 24,
    onProgress: (p) => (target = p),
  }).catch(() => null);

  if (!hero) document.documentElement.classList.add('no-webgl');
  else {
    // pause rendering while the hero is off-screen
    ScrollTrigger.create({
      trigger: '.intro',
      start: 'top bottom',
      end: () => `+=${innerHeight * 2.4 + innerHeight}`,
      onToggle: (self) => (self.isActive ? hero.play() : hero.pause()),
    });
  }

  await Promise.race([hero?.allFrames ?? Promise.resolve(), new Promise((r) => setTimeout(r, 6000))]);
  await document.fonts?.ready;
  target = 1;
  await new Promise((r) => setTimeout(r, REDUCE ? 0 : 450));
  gsap.ticker.remove(counter);
  countEl.textContent = '100';

  if (REDUCE) document.documentElement.classList.add('reduced');
  else buildScroll();
  ScrollTrigger.refresh();

  const tl = gsap.timeline({
    onComplete: () => {
      pre.remove();
      lenis?.start();
    },
  });
  if (REDUCE) {
    tl.set(pre, { autoAlpha: 0 });
    hero?.setIntro(1);
    return;
  }
  tl.to('.pre-inner', { y: -40, opacity: 0, duration: 0.5, ease: 'power2.in' })
    .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
    .fromTo('.hero-title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, '-=0.45')
    .from(['.hero-eyebrow span', '.hero-sub span'], { y: 24, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, '<0.1')
    .from('[data-hero-card]', { x: RTL ? 60 : -60, opacity: 0, duration: 1, ease: 'expo.out' }, '<')
    .from('[data-hero-hint]', { opacity: 0, y: 10, duration: 0.8 }, '<0.2')
    .from(nav, { yPercent: -120, duration: 1, ease: 'expo.out' }, '<');
  if (hero) gsap.to({ v: 0 }, { v: 1, duration: 1.8, delay: 0.9, ease: 'expo.out', onUpdate() { hero.setIntro(this.targets()[0].v); } });
}

boot();
