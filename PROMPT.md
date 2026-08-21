# Build prompt — "An Evening to Remember" photo microsite

Build a single-page, dependency-free photography microsite. No framework, no
bundler, no build step: three hand-written files plus two small generator
scripts. It must run by opening `index.html` directly from disk **and** when
served over HTTP.

The developer will supply the photographs later. Write everything so that
dropping images into folders and running one command is all it takes to
populate the site.

---

## 1. Deliverables

```
index.html          the whole page
styles.css          all styling
app.js              all behaviour; contains a GENERATED data block
analysis.js         GENERATED metadata, loaded before app.js
gen-gallery.js      Node script — rewrites the data block in app.js
gen-analysis.py     Python script — writes analysis.js
favicon.ico         site icon
.gitignore
images/<category>/*.jpg
```

Two files are generated but **must be committed and shipped** — the page loads
them at runtime: `analysis.js`, and the `GALLERY` block inside `app.js`. Say so
in a comment in `.gitignore` so nobody later ignores them.

Vanilla ES2015+. No dependencies at runtime. The only external request is
Google Fonts.

---

## 2. Content model

Photographs live in `images/<category>/`. Each folder is one category and
becomes one tab. There are no images at the repo root of `images/`.

Example (the developer will add their own):

```
images/portraits/  P1400661.jpg …
images/motion/     P1400770.jpg …
images/dark/       P1400663.jpg …
```

**Never hand-maintain the file list.** `gen-gallery.js` scans the folders and
rewrites the data block. Adding a fourth folder must produce a fourth tab with
no code change.

Site-wide constants at the top of `app.js`:

```js
const ASSET     = "images";
const SET_NAME  = "An Evening to Remember";   // captions / alt text
const SET_SLUG  = "An-Evening-to-Remember";   // download filenames
```

Keep these separate — the spaced version would produce ugly filenames.

---

## 3. Design system

```css
--bg:#0a0a0b  --bg-2:#101013  --bg-3:#16161a
--line:rgba(255,255,255,.08)  --line-2:rgba(255,255,255,.14)
--text:#ece9e4  --muted:#9a978f  --faint:#6b6862
--grad:linear-gradient(120deg,#a855f7,#ec4899)
--grad-soft:linear-gradient(120deg,rgba(168,85,247,.18),rgba(236,72,153,.18))
--maxw:1280px   (1440px above 1700px viewport)
--ease:cubic-bezier(.22,1,.36,1)
```

Fonts via Google Fonts — **Archivo** (800/900, uppercase display), **Inter**
(300–600, body), **Space Mono** (400/700, labels, counts, hex values).

Dark, editorial, high-contrast. **Square corners everywhere** — `border-radius:
0` on buttons, tiles, panels and images. The purple→pink gradient is an accent
only: active tab, primary button, scroll progress, meter fills.

---

## 4. Page structure

```
scroll progress bar (fixed, 2px, gradient, width = scroll %)
header    (fixed; brand left, nav right)
hero      (full-viewport banner — section 5)
gallery   (tabs + masonry — section 6)
lightbox  (two-pane modal — section 7)
footer    ("more work" link + Developer menu — section 10)
```

Deliberately **no** About, Contact, Categories-as-pages or Videos sections.

**Header** — circular gradient badge + `APESCONSOLE` in Space Mono with
`.32em` letter-spacing. Nav: "Gallery" (anchor) and an external
`www.apesconsole.com` link with a `↗` that nudges on hover. Transparent over
the hero with a top-down scrim for legibility; on scroll past 30px it gains a
blurred dark background and a bottom border. Below 800px the nav collapses to a
hamburger toggling a stacked mobile menu.

**Always land at the top on load** — set `history.scrollRestoration = "manual"`
and scroll to 0 on `load` and on `pageshow` when persisted.

---

## 5. The banner (the centrepiece)

Full-bleed, `height:100svh; min-height:620px`. Five animations run together.

**5.1 Panel strip.** A flex row of equal panels: 6 above 900px, 4 above 560px,
3 below. Each panel holds the *same photo twice*, stacked — a greyscale "ink"
layer (`filter: grayscale(1) contrast(1.07) brightness(.98)`) and an unfiltered
colour layer on top.

**5.2 Ink → colour sweep.** The colour layer is revealed by a CSS mask:

```css
mask-image: linear-gradient(100deg, #000 var(--a,0%), transparent var(--b,8%));
```

Drive `--a`/`--b` from `requestAnimationFrame` so a soft edge travels across
the strip, panel by panel, turning grey into colour. Progress `p` maps to each
panel with a feather of `0.14` so neighbours overlap rather than switching in
steps. Loop: **2500ms** sweep on → **1500ms** hold → **1800ms** sweep off →
**500ms** trough, repeating.

**5.3 Sheen.** An 80px vertical bar (`mix-blend-mode: soft-light`, white
gradient) tracks the sweep edge, visible only while sweeping.

**5.4 Ken Burns.** Each layer runs a 16s infinite scale/translate loop
(`scale(1.05)` → `scale(1.11) translate(-1.2%,-1%)` → back), staggered by
`-2.2s × panelIndex`. The whole media block also scales `1.06 → 1` over 18s
once on load.

**5.5 Panel rotation.** During each hold, swap one panel to the next photo:
fade a new `<img>` in over 800ms, then quietly retarget the two base layers and
remove the temporary node. Cycle panels round-robin.

**5.6 Opening reveal.** The banner starts fully black under a layer of vertical
strips — 18 above 900px, 13 above 560px, 9 below. On the second animation
frame, fling each strip sideways: random direction, distance `90–160vw`,
duration `650–1170ms`, delay `0–300ms`, easing `cubic-bezier(.45,0,.85,.12)`
(slow, then accelerating away) while fading to 0. Remove the host node when the
last strip finishes.

**5.7 Which photos feed the banner.** A named list, not a hard-coded exclusion:

```js
const BANNER_DIRS = ["portraits", "motion"];   // e.g. leave a B&W set out
```

Pool = every frame from those folders, shuffled per visit. If those folders are
missing, fall back to all categories rather than rendering an empty banner.

**5.8 Title.** The site name is split into three spans, one per line, each
`display:block`. On scroll each drifts vertically by `scrollY × factor`, with a
random factor between ±0.5 and ±1.1 assigned once on load — flip one sign if
they all match, so the lines visibly pull apart. Size
`clamp(2.4rem, 8.5vw, 6.6rem)`, `line-height:.9`, uppercase, weight 900.

Below the title: a one-line subtitle, a gradient "Enter the gallery →" button,
and a `www.apesconsole.com` link. Bottom-right: two Space Mono buttons —
**Shuffle frames** (rotates every panel, staggered 90ms) and **Motion: on/off**
(toggles the Ken Burns class).

**5.9 Reduced motion.** Under `prefers-reduced-motion: reduce`, drop the reveal
strips entirely, hold the sweep at fully-coloured, and disable Ken Burns, the
zoom, the sheen and the title drift.

---

## 6. Gallery

Section head: `01 / SELECTED WORK` eyebrow, `GALLERY` title, and a right-aligned
`Showing <Category> · NN frames`.

**Tabs.** One pill per folder, built from the data. Active pill uses the
gradient; each shows its zero-padded frame count in a dimmed Space Mono
superscript. `role="tab"` + `aria-selected`. Switching re-renders the grid and
rescopes the lightbox.

**Masonry.** CSS columns — 3, then 2 below 900px, 1 below 560px; 16px gutter;
tiles use `break-inside: avoid`.

**Every `<img>` must carry its true intrinsic `width`/`height`.** The generator
reads real pixel dimensions from the file header. Without this the grid
collapses to one column and jumps as images arrive — mixed portrait/landscape
sets make this very visible when switching tabs.

Tiles: `loading="lazy"`, `decoding="async"`, descriptive alt text. Hover raises
a shadow, scales the image 1.06, lifts saturation and fades in a `NN /
Category` label plus a bottom gradient scrim. Reveal on scroll via
`IntersectionObserver` (threshold .08, rootMargin `0px 0px -40px 0px`), fading
up 18px with a 40ms stagger capped at the 12th tile.

Nothing follows the grid — the "More work at" link lives in the footer.

---

## 7. Lightbox — two panes

Opens on tile click. Backdrop `rgba(6,6,8,.92)` with an 8px blur; the figure
scales up from `.9` and 18px. Locks body scroll while open.

**Left — the photograph.** `max-height: 82vh`, natural aspect, deep shadow, and
a Space Mono caption `Category — N / total` beneath.

**Right — the colour reading.** A fixed **320px** panel (`flex: none`), faint
translucent fill, 1px border, its own scroll if it overruns 82vh, sliding in
from 18px with a 0.1s delay. Give the image
`max-width: calc(94vw - 372px)` so the pair always fits; portrait frames then
render at exactly the size they would have alone.

Panel contents, top to bottom:

1. `COLOUR READING` eyebrow
2. Scheme name as an uppercase display heading, with a one-line explanation
3. Five palette rows — 30px swatch chip, hex in mono, plain-language colour
   name, right-aligned share %
4. Four meters: **Temperature** (a warm|cool *split* bar, orange vs blue —
   fall back to a flat neutral bar when a frame has no chroma at all),
   **Saturation**, **Contrast**, **Tonal key** (gradient fill, width = value)
5. A two-or-three sentence prose reading

Split the panel into a **scrolling body** and a **pinned foot**: make the panel
a flex column, give the body `flex: 1 1 auto; min-height: 0; overflow-y: auto`
and the foot `flex: none`. The reading scrolls; the foot never does. Reset the
*body's* scrollTop on each frame — the panel itself no longer scrolls.

The foot holds, above a hairline rule:

- a full-width **Download this photo** button (see below), then
- a row of three equal icon links — **Instagram**, **Facebook**, **email** —
  driven by a single `SOCIAL` array of `{name, label, url, icon}` at the top of
  `app.js` so the URLs live in exactly one place. Each lights up in its own
  colour on hover.

  These point at the **platforms themselves** (`https://www.instagram.com`,
  `https://www.facebook.com`, and a bare `mailto:`), not at any studio profile
  — the visitor should land in their own account, or in their own mail client.
  The two web links get `target="_blank"` + `rel="noopener noreferrer"`; the
  `mailto:` must **not**, or it strands the visitor on a blank tab. Stop clicks
  in this row from reaching the backdrop.

If `analysis.js` is missing, blank the body only — the download and the social
links still belong there, so the panel itself stays.

**Controls.** Close (`×`) top right; `‹` `›` at the vertical edges. Keyboard:
`Esc`, `←`, `→`. Touch: horizontal swipe over 48px steps frames. Clicking the
backdrop closes; clicking any control must not. The download lives in the
panel foot, not floating over the photograph.

**Download.** A plain same-origin `<a download>` at the foot of the panel — let
the browser save the file natively, no blob copies. Name it `<SET_SLUG>-<Category>-<NN>.<ext>`, with
the extension taken from the real file. Update `href` and `download` on every
navigation. Stop the click from reaching the backdrop, and flash the button
with the gradient for 1.2s so the visitor gets feedback.

**Below 1020px** the panes stack, image above panel, scrolling as one:

- `flex-direction: column` **and `justify-content: flex-start`** — a centred
  flex column that overflows pushes its first rows above the scroll origin
  where they can never be reached.
- `flex: none` on both panes so neither is squeezed.
- Image drops to `max-height: 54vh`; panel goes `min(92vw, 520px)`.
- Move `‹` `›` to a centred pair along the bottom edge (they would otherwise
  cover the panel) and add bottom padding to keep that strip clear. **Place
  these rules after the base `.lb-nav` rules in the file** — equal specificity
  means source order decides, and a block written earlier silently loses.

---

## 8. `gen-gallery.js` — the frame index

`node gen-gallery.js`. Scans `images/`, then rewrites **only** the region
between `const GALLERY = [` and its closing `];` in `app.js`, leaving all other
code untouched.

Emit one object per folder:

```js
{
  label: "Portraits",     // display name
  dir: "portraits",       // folder on disk
  alt: "Portrait",        // alt-text subject
  files: [ ["P1400661.jpg", 1000, 1332], … ]   // name, width, height
}
```

- Read intrinsic size by parsing the JPEG `SOF` marker / PNG `IHDR` directly —
  no image library.
- Tab order from an `ORDER` array first, then any other folder alphabetically.
- Display names and alt subjects from a `LABELS` map; fall back to the
  capitalised folder name so an unknown folder still works.
- Skip empty folders; accept `.jpg/.jpeg/.png/.webp`.
- Print a per-folder summary.

At load, `app.js` maps these into `{ src, w, h, key }` where
`key = "<dir>/<filename>"` — the same key `analysis.js` uses.

---

## 9. `gen-analysis.py` — the colour reading

`python gen-analysis.py`, requires Pillow. Writes `analysis.js` as
`window.IMAGE_ANALYSIS = { "<folder>/<file>": {…} }` — a `.js` file, **not**
JSON, because `fetch()` on a JSON file fails under `file://` and would silently
break the panel when the page is opened from disk.

Everything reported must be **measured from the pixels**. Invent nothing.

Per image: convert to RGB, thumbnail the long edge to 200px, then:

- **Palette** — median-cut quantise to 8 colours, merge any pair closer than 30
  in RGB distance (share-weighted average), keep the top 5 by share.
- **Colour names** — from HLS. Below `s < 0.12` it is a neutral: a 12-step
  lightness ramp (near-black, ink, charcoal, graphite, iron, ash, slate grey,
  pewter, silver, pearl, bone white, white), prefixed `warm`/`cool` when
  `s ≥ 0.05` so two near-greys never collide. Otherwise a 16-bucket hue name
  (red, amber, gold, yellow, olive, green, sea green, teal, cyan, azure, blue,
  indigo, violet, magenta, rose) with `deep/dark/light/pale` from lightness and
  `muted/vivid` from saturation.
- **Scheme** — from the pairwise circular hue distances of chromatic swatches
  (`s ≥ 0.12`, share `≥ 5%`): ≤22° monochromatic; ≤55° analogous; a 150–180°
  pair plus a 100–140° pair split-complementary; a 150–180° pair
  complementary; two 100–140° pairs triadic; ≤100° broken analogous; else
  polychromatic. Fewer than two chromatic swatches means monochromatic, or
  achromatic when there are none. Report the measured angle in the explanation.
- **Temperature** — over chromatic pixels only, warm = hue <75° or ≥330°,
  cool = 150–270°. Label Warm/Cool when one leads by >28 points, Split when
  they are close, Neutral when under 8% of pixels carry any chroma.
- **Saturation** — mean HLS saturation → Desaturated / Restrained / Moderate /
  Saturated / Intense.
- **Contrast** — 95th minus 5th percentile of luma
  (`.2126R + .7152G + .0722B`) → Flat / Soft / Moderate / Strong / High.
- **Tonal key** — median luma → Low key / Dark / Mid key / Bright / High key.
- **Note** — two or three sentences assembled *only* from the above: the lead
  colour and its share, what the scheme does, then key + contrast +
  saturation.

Deterministic: same input, same output. A black-and-white set must come back
honestly as Achromatic with a grey ramp, its tonal metrics carrying the reading.

---

## 10. Footer

One slim strip, bordered along the top, holding two things:

- **Left** — a bordered card: `MORE WORK AT` in dim mono, then
  `www.apesconsole.com` and a `↗`, opening in a new tab.
- **Right** — a **Developer** button that opens a small popover *upward*
  (the footer is the last thing on the page) containing a `BUILD PROMPT`
  heading, a download link for this brief, and a one-line note.

Menu behaviour: toggle on click, close on outside click and on `Escape`
(returning focus to the button), and stop clicks inside the popover from
bubbling out and closing it before the browser takes the download. Drive
`aria-expanded` on the button and rotate its caret.

For the show/hide, transition `opacity` and `transform`, and switch
`visibility` on a **delay** — `visibility 0s linear .28s` closed, `0s linear 0s`
open. Keep `visibility` in play (rather than fading opacity alone) so the closed
menu leaves the keyboard tab order. Do not try to transition `visibility`
itself; it does not interpolate the way you would expect.

On phones the footer centres and the popover anchors to the centre instead of
the right edge.

---

## 11. Responsive & accessibility

Breakpoints: **1020px** (lightbox stacks), **900px** (2 columns, 4 banner
panels), **800px** (hamburger), **640px** (phone padding and type), **560px**
(1 column, 3 banner panels), **480px** (hide scroll cue, centre banner
controls), `max-height:620px` (shorter hero), **1700px** (wider max width).

- Semantic landmarks; `role="dialog"` + `aria-modal` on the lightbox, with
  `aria-hidden` maintained.
- Every image needs meaningful alt text naming subject, category and set.
- All controls keyboard reachable with visible focus; buttons are real
  `<button>`s, links real `<a>`s.
- Respect `prefers-reduced-motion` throughout — a final rule disabling
  animations and transitions, plus showing tiles unconditionally.
- Body must never scroll horizontally.

---

## 12. SEO

Title, description, canonical, theme-color, Open Graph and Twitter card tags,
`og:image` pointing at a real committed photograph.

---

## 13. Acceptance checks

1. Every file on disk appears exactly once in `GALLERY`, with dimensions that
   match the real file.
2. Every frame resolves to an entry in `window.IMAGE_ANALYSIS`.
3. Switching tabs updates pills, count, grid and lightbox scope; every `src`
   points at the right folder.
4. Tiles land in the correct number of columns with correct heights **before**
   any image finishes downloading.
5. The lightbox panel sits beside the image on desktop with no horizontal
   overflow, and stacks below 1020px with the top of the image reachable.
6. The download link's `href` and filename track the current frame.
7. The banner shows frames only from `BANNER_DIRS`, across both the initial
   panels and rotation.
8. Nothing breaks with `analysis.js` removed.
9. Keyboard and swipe navigation work; reduced-motion is honoured.

---

## 14. Notes for whoever builds this

- Verify layout by **measuring the DOM** (`getBoundingClientRect`, computed
  styles), not by eyeballing screenshots. Both real bugs found during the
  original build — the unreachable flex overflow and the dead CSS override —
  were invisible in a screenshot and obvious in a measurement.
- Headless screenshots can lie about viewport width; render inside a
  fixed-width iframe when checking responsive behaviour.
- Large source images make "is it broken?" and "is it still loading?" look
  identical. Resize photographs to roughly 1000px on the long edge.
