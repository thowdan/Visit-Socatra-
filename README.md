# Visit Socotra

An interactive, scroll-driven showcase of Socotra, built on the same section structure and motion as landonorris.com, with Socotra's own palette, photography and copy in English and Arabic.

## Run

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run frames    # re-extract hero frames from "Hero section/" (needs ffmpeg + cwebp)
npm run deploy    # build + deploy to Cloudflare (needs `cf auth login` once)
```

Live at **https://socotra.tb3technologies.tech**: a static-assets Cloudflare Worker (`visit-socotra`) configured in `cloudflare.config.ts`.

## Sections (top to bottom)

1. **Hero lens.** The looping Desert Rose video fills the screen; a Three.js/GLSL cursor blob (spring-damped, organic edge) reveals the still photo underneath. Drag on touch devices.
2. **Frame + marquee.** The hero shrinks into a framed window on dark while two giant text rows scroll in opposite directions; scroll speed pushes them.
3. **Statement.** Giant uppercase paragraph that lights up word by word.
4. **Horizontal gallery.** A pinned, scroll-driven strip of captioned photos and quotes; the background fades dark → sage → cream.
5. **On land / At sea.** Images slide in from both edges, then a full-bleed image opens up.
6. **Wonders hall of fame.** 16 notched cards in a 4-column masonry with parallax columns.
7. **Plan your journey.** Heading reveal and a parallax collage.
8. **Protected & celebrated.** Hand-drawn script word plus a badge marquee.
9. **Seen through their lens.** A fanned card arc that opens on scroll.
10. **Footer.** Tabbed dark panel, centred figure, links and credits.

The nav changes colour with the section underneath. The EN/ع toggle switches language and RTL layout and remembers the choice. Reduced-motion users get a static layout.

## Structure

```
index.html              shell, fonts, preloader
src/main.js             Lenis + GSAP ScrollTrigger choreography, preloader, menu, language
src/hero.js             Three.js lens shader + frame-sequence playback (ping-pong loop)
src/render.js           page markup from locale content
src/data.js             which photo goes in which slot
src/locales/{en,ar}.js  all copy
src/contours.js         procedural topographic background lines
src/styles/main.css     tokens, sections, responsive, RTL
public/frames/          65 webp frames from the hero video
public/img/instagram/   20 photos from the @hobopeeba carousel
```

## Credits

Photos © [@hobopeeba](https://www.instagram.com/hobopeeba/) ([post](https://www.instagram.com/p/DOLjYMWDHg6/)), used with permission. Powered by [tb3technologies.tech](https://tb3technologies.tech). Layout and motion are inspired by landonorris.com; no code, images or fonts from that site are used.
