import { ig, TRACK, TRACK_WIDTH_VH, SPLIT, WONDERS, PLAN, SOCIALS, FOOTER_FIGURE } from './data.js';

/* ---------- small inline SVGs ---------- */
export const ICON = {
  tree: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 21c4.5-8.5 12-13 19-13s14.5 4.5 19 13c-6-2.4-12.4-3.4-19-3.4S11 18.6 5 21z" fill="currentColor"/><path d="M24 18v24M24 25l-7-6.5M24 25l7-6.5M24 31l-5-5M24 31l5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  arrow: `<svg class="i-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  laurel: `<svg viewBox="0 0 64 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M22 36C10 30 6 18 10 6"/><path d="M42 36c12-6 16-18 12-30"/><path d="M10 12c4 0 6 3 6 6M8 20c4 0 7 2 8 6M11 28c4-1 7 1 9 4M10 12c-3-1-5-4-4-7M8 20c-3-1-5-3-5-6M11 28c-3 0-6-2-7-5"/><path d="M54 12c-4 0-6 3-6 6M56 20c-4 0-7 2-8 6M53 28c-4-1-7 1-9 4M54 12c3-1 5-4 4-7M56 20c3-1 5-3 5-6M53 28c3 0 6-2 7-5"/></g><path d="M23 22c3-8 15-8 18 0-6-1.4-12-1.4-18 0z" fill="currentColor"/><path d="M32 21v12" stroke="currentColor" stroke-width="2"/></svg>`,
  sign: `<svg class="sign" viewBox="0 0 160 48" aria-hidden="true"><path class="draw" d="M6 34c8-16 16-24 21-20s-6 22-1 21 12-24 19-22-4 20 3 18 12-16 19-14-1 12 6 11 10-10 16-9-2 9 5 8c8-1 16-8 26-10 9-2 18-1 26 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  scribble: `<svg class="scribble" viewBox="0 0 520 180" aria-hidden="true"><path class="draw" d="M14 150C60 60 110 18 160 30s30 90-20 110-60-40 10-80 140-60 190-20 10 110-40 100 10-120 110-110 80 70 96 40" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  menu: `<span class="menu-lines" aria-hidden="true"><i></i><i></i></span>`,
};

const igBtn = `<a class="ig-btn" href="https://www.instagram.com/hobopeeba/" target="_blank" rel="noopener" aria-label="Instagram @hobopeeba"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/></svg><span>Instagram</span></a>`;

const arrowBtn = (label, href, cls = '') =>
  `<a class="btn ${cls}" href="${href}"><span class="btn-fill" aria-hidden="true"></span><span class="btn-label">${label}</span>${ICON.arrow}</a>`;

/** Split a sentence into word spans, keeping <em>/<b> words as accent words. */
// Accent words are single words, so splitting on whitespace keeps any
// punctuation glued to its word ("<em>isolation</em>," stays one token).
function words(html) {
  return html
    .trim()
    .split(/\s+/)
    .map((tok) => `<span class="w">${tok.replace(/<em>/g, '<span class="is-accent">').replace(/<\/em>/g, '</span>')}</span>`)
    .join(' ');
}

const marqueeRow = (text, cls) => {
  const unit = `<span class="mq-item">${text}</span><span class="mq-dot" aria-hidden="true">✦</span>`;
  return `<div class="mq-row ${cls}" aria-hidden="true"><div class="mq-inner">${unit.repeat(4)}</div><div class="mq-inner">${unit.repeat(4)}</div></div>`;
};

/* ---------- sections ---------- */

const nav = (t) => `
<header class="nav" data-nav>
  <a class="nav-word" href="#top" aria-label="${t.nav.wordTop} ${t.nav.wordBottom}">
    <span class="nav-word-top">${t.nav.wordTop}</span>
    <span class="nav-word-bottom">${t.nav.wordBottom}</span>
  </a>
  <a class="nav-mark" href="#top" aria-hidden="true" tabindex="-1">${ICON.tree}</a>
  <div class="nav-actions">
    <button class="nav-lang" type="button" data-lang-toggle aria-label="${t.nav.langLabel}">${t.nav.langSwitch}</button>
    <a class="nav-cta" href="#plan">${ICON.tree}<span>${t.nav.cta}</span></a>
    <button class="nav-menu" type="button" data-menu-open aria-label="${t.nav.menu}" aria-expanded="false" aria-controls="menu">${ICON.menu}</button>
  </div>
</header>

<div class="menu" id="menu" data-menu hidden>
  <div class="menu-bg contours is-dark" aria-hidden="true"></div>
  <button class="menu-close" type="button" data-menu-close aria-label="${t.nav.close}"><span aria-hidden="true">✕</span></button>
  <nav class="menu-links" aria-label="${t.nav.pagesLabel}">
    ${t.nav.links.map(([l, h], i) => `<a href="${h}" data-menu-link><span class="menu-num">0${i + 1}</span><span class="menu-txt">${l}</span></a>`).join('')}
  </nav>
  <p class="menu-foot legal-photos">${t.footer.credit} ${igBtn}</p>
</div>`;

const intro = (t) => `
<section class="intro" id="top" data-nav-theme="light">
  <div class="intro-pin">
    <div class="intro-bg contours" aria-hidden="true"></div>
    <div class="intro-bg-dark contours is-dark" aria-hidden="true"></div>

    <div class="mq" aria-hidden="true">
      ${marqueeRow(t.marquee.rowA, 'is-serif')}
      ${marqueeRow(t.marquee.rowB, 'is-sans is-reverse')}
    </div>

    <div class="mq-label" aria-hidden="true">${ICON.tree}<span>${t.marquee.label}</span></div>

    <div class="hero-stage" data-hero-stage>
      <canvas class="hero-canvas" data-hero-canvas role="img" aria-label="${t.hero.alt}"></canvas>
      <div class="hero-fallback" aria-hidden="true"></div>
      <div class="hero-shade" aria-hidden="true"></div>
    </div>

    <div class="hero-copy" data-hero-copy>
      <p class="hero-eyebrow"><span>${t.hero.eyebrow}</span></p>
      <h1 class="hero-title"><span class="line"><span>${t.hero.title}</span></span></h1>
      <p class="hero-sub"><span>${t.hero.sub}</span></p>
    </div>

    <div class="hero-hint" data-hero-hint aria-hidden="true">
      <span class="hint-dot"></span>
      <span class="hint-mouse">${t.hero.hint}</span><span class="hint-touch">${t.hero.hintTouch}</span>
    </div>

    <aside class="hero-card" data-hero-card>
      <p class="hc-label">${t.hero.card.label}</p>
      <div class="hc-box">
        ${ICON.tree}
        <p class="hc-value">${t.hero.card.value}</p>
        <span class="hc-rule"></span>
        ${ICON.laurel}
        <p class="hc-foot">${t.hero.card.foot}</p>
      </div>
    </aside>
  </div>
</section>`;

const statement = (t) => `
<section class="statement" id="island" data-nav-theme="dark">
  <div class="contours is-dark" aria-hidden="true"></div>
  <div class="statement-scribble" aria-hidden="true">${ICON.scribble}</div>
  <div class="statement-inner">
    <div class="statement-badge">${ICON.laurel}<span>${t.statement.label}</span></div>
    <p class="statement-text" data-words>${words(t.statement.html)}</p>
  </div>
</section>`;

const track = (t) => `
<section class="track" data-nav-theme="dark" style="--track-w:${TRACK_WIDTH_VH}vh">
  <div class="track-pin">
    <div class="contours track-lines" aria-hidden="true"></div>
    <div class="track-strip" data-track-strip>
      ${TRACK.map((it) => {
        const pos = `--x:${it.x}vh;--y:${it.y}vh;`;
        if (it.kind === 'quote')
          return `<blockquote class="tr-quote" style="${pos}--w:${it.w}vh">
            <p>${t.track.quotes[it.q]}</p>${ICON.sign}</blockquote>`;
        return `<figure class="tr-item" style="${pos}--h:${it.h}vh" data-speed="${it.speed || 0}">
          <figcaption>${t.track.captions[it.cap]}</figcaption>
          <div class="tr-img"><img src="${ig(it.n)}" alt="${t.track.captions[it.cap]}" loading="lazy" decoding="async"></div>
        </figure>`;
      }).join('')}
    </div>
    <div class="track-progress" aria-hidden="true">
      <span class="tp-count" data-track-count>01</span>
      <span class="tp-bar"><i data-track-bar></i></span>
      <span class="tp-total">${String(TRACK.filter((i) => i.kind === 'img').length).padStart(2, '0')}</span>
    </div>
  </div>
</section>`;

const split = (t) => `
<section class="split" data-nav-theme="light">
  <div class="contours" aria-hidden="true"></div>
  <div class="split-img split-img--l" data-split-l><img src="${ig(SPLIT.left)}" alt="" loading="lazy"></div>
  <div class="split-img split-img--r" data-split-r><img src="${ig(SPLIT.right)}" alt="" loading="lazy"></div>
  <div class="split-center">
    <div class="split-col">
      <h2 class="split-title"><span class="serif">${t.split.left.a}</span><span class="sans">${t.split.left.b}</span></h2>
      <p>${t.split.left.desc}</p>
      <a class="sq-btn" href="#wonders" aria-label="${t.split.left.a} ${t.split.left.b}">${ICON.arrow}</a>
    </div>
    <div class="split-col">
      <h2 class="split-title"><span class="serif">${t.split.right.a}</span><span class="sans">${t.split.right.b}</span></h2>
      <p>${t.split.right.desc}</p>
      <a class="sq-btn" href="#wonders" aria-label="${t.split.right.a} ${t.split.right.b}">${ICON.arrow}</a>
    </div>
    <span class="split-scribble" aria-hidden="true" data-split-scribble>${t.split.scribble}</span>
  </div>
</section>

<section class="fullbleed" data-nav-theme="dark">
  <div class="fb-frame" data-fb-frame><img src="${ig(SPLIT.full)}" alt="" loading="lazy" data-fb-img></div>
  <div class="fb-head">
    <h2 class="big-title"><span class="sans">${t.wonders.t1}</span><span class="serif accent">${t.wonders.t2}</span></h2>
    <p>${t.wonders.desc}</p>
  </div>
</section>`;

const wonders = (t) => {
  const cols = [[], [], [], []];
  WONDERS.forEach((n, i) => cols[i % 4].push({ n, name: t.wonders.items[i][0], tag: t.wonders.items[i][1] }));
  return `
<section class="wonders" id="wonders" data-nav-theme="dark">
  <div class="wonders-grid">
    ${cols.map((col, c) => `<div class="w-col" data-col="${c}">
      ${col.map((it) => `<article class="w-card" tabindex="0">
        <div class="w-card-in">
          <div class="w-img"><img src="${ig(it.n)}" alt="${it.name}" loading="lazy" decoding="async"></div>
          <p class="w-label"><span>${it.name}</span><em>${it.tag}</em></p>
        </div>
      </article>`).join('')}
    </div>`).join('')}
  </div>
  <div class="wonders-more">
    <p class="serif-line">${t.wonders.more}</p>
    ${arrowBtn(t.wonders.cta, '#plan')}
  </div>
</section>`;
};

const plan = (t) => `
<section class="plan" id="plan" data-nav-theme="light">
  <div class="contours" aria-hidden="true"></div>
  <div class="plan-copy">
    <p class="kicker">${ICON.tree}<span>${t.plan.label}</span></p>
    <h2 class="plan-title">
      <span class="line"><span class="sans">${t.plan.l1}</span></span>
      <span class="line"><span class="sans">${t.plan.l2}</span></span>
      <span class="line"><span class="serif accent">${t.plan.l3}</span></span>
    </h2>
    <p class="plan-desc">${t.plan.desc}</p>
    <ul class="plan-tips">${t.plan.tips.map((x) => `<li>${x}</li>`).join('')}</ul>
    ${arrowBtn(t.plan.cta, 'https://whc.unesco.org/en/list/1263')}
  </div>
  <div class="plan-collage" aria-hidden="true">
    <div class="pc pc-main" data-speed="-0.08"><img src="${ig(PLAN.main)}" alt="" loading="lazy"></div>
    <div class="pc pc-side" data-speed="0.12"><img src="${ig(PLAN.side)}" alt="" loading="lazy"></div>
    <div class="pc pc-s1" data-speed="0.2"><img src="${ig(PLAN.small1)}" alt="" loading="lazy"></div>
    <div class="pc pc-s2" data-speed="-0.16"><img src="${ig(PLAN.small2)}" alt="" loading="lazy"></div>
  </div>
</section>`;

const badges = (t) => `
<section class="badges" data-nav-theme="light">
  <div class="badges-head">
    <h2 class="big-title dark"><span class="sans">${t.badges.t1}</span><span class="serif">${t.badges.t2}</span></h2>
    <p>${t.badges.desc}</p>
  </div>
  <div class="badges-script" aria-hidden="true">
    <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet"><text x="50%" y="62%" text-anchor="middle" class="script-text" data-script>${t.badges.script}</text></svg>
  </div>
  <div class="badges-mq">
    <div class="bmq-inner">${[...t.badges.items, ...t.badges.items].map((b) => `<span class="badge">${ICON.laurel}<span>${b}</span></span>`).join('')}</div>
    <div class="bmq-inner" aria-hidden="true">${[...t.badges.items, ...t.badges.items].map((b) => `<span class="badge">${ICON.laurel}<span>${b}</span></span>`).join('')}</div>
  </div>
</section>`;

const socials = (t) => `
<section class="socials" data-nav-theme="light">
  <div class="socials-head">
    <span class="socials-icon">${ICON.laurel}</span>
    <h2 class="big-title dark center"><span class="sans">${t.socials.t1}</span><span class="serif">${t.socials.t2}</span></h2>
  </div>
  <div class="fan" data-fan>
    ${SOCIALS.map((n, i) => `<a class="fan-card" href="${t.socials.links[0][1]}" target="_blank" rel="noopener" style="--i:${i - 3}" aria-label="${t.socials.sub}"><img src="${ig(n)}" alt="" loading="lazy"></a>`).join('')}
  </div>
  <p class="socials-sub serif-line">${t.socials.sub}</p>
  <ul class="socials-links">${t.socials.links.map(([l, h]) => `<li><a href="${h}" target="_blank" rel="noopener">${l}</a></li>`).join('')}</ul>
</section>`;

const footer = (t) => `
<footer class="footer" id="footer" data-nav-theme="dark">
  <div class="footer-panel">
    <div class="contours is-dark" aria-hidden="true"></div>
    <div class="footer-sign">${ICON.sign}</div>
    <h2 class="footer-title">
      <span class="line"><span class="sans">${t.footer.a1}</span> <span class="serif accent">${t.footer.a2}</span></span>
      <span class="line"><span class="sans">${t.footer.b1}</span> <span class="serif accent">${t.footer.b2}</span></span>
    </h2>
    <div class="footer-figure" aria-hidden="true"><img src="${ig(FOOTER_FIGURE)}" alt="" loading="lazy"></div>
    <nav class="footer-col footer-col--a" aria-label="${t.footer.pagesLabel}">
      <p class="fc-label">${t.footer.pagesLabel}</p>
      ${t.nav.links.slice(0, 4).map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}
      <a class="fc-accent" href="#plan">${t.footer.cta}</a>
    </nav>
    <nav class="footer-col footer-col--b" aria-label="${t.footer.followLabel}">
      <p class="fc-label">${t.footer.followLabel}</p>
      ${t.socials.links.map(([l, h]) => `<a href="${h}" target="_blank" rel="noopener">${l}</a>`).join('')}
      <a href="https://whc.unesco.org/en/list/1263" target="_blank" rel="noopener">UNESCO</a>
    </nav>
    <div class="footer-mq" aria-hidden="true">
      <div class="bmq-inner">${[...t.badges.items, ...t.badges.items].map((b) => `<span class="fbadge">${b}</span>`).join('')}</div>
      <div class="bmq-inner">${[...t.badges.items, ...t.badges.items].map((b) => `<span class="fbadge">${b}</span>`).join('')}</div>
    </div>
    <a class="footer-cta" href="#top">${t.footer.top}${ICON.arrow}</a>
  </div>
  <div class="footer-legal">
    <span>${t.footer.copyright}</span>
    <span class="legal-photos">${t.footer.credit} ${igBtn}</span>
    <span dir="ltr">${t.footer.poweredBy} <a href="https://tb3technologies.tech" target="_blank" rel="noopener">tb3technologies.tech</a></span>
  </div>
</footer>`;

export function render(t) {
  return `
  ${nav(t)}
  <main id="main">
    ${intro(t)}
    ${statement(t)}
    ${track(t)}
    ${split(t)}
    ${wonders(t)}
    ${plan(t)}
    ${badges(t)}
    ${socials(t)}
  </main>
  ${footer(t)}`;
}
