# An Evening to Remember

A single-page photography microsite for [Ape's Console](https://www.apesconsole.com).
97 frames across three categories, an animated banner, and a per-image colour
analysis derived from the actual pixels.

No framework. No bundler. No build step. Three hand-written files, two
generators, and a folder of photographs.

```
index.html   193 lines    styles.css   654 lines    app.js   650 lines
```

---

## Run it

Nothing to install. The page works opened straight from disk (`file://`) and
over HTTP:

```bash
python -m http.server 8000
# → http://127.0.0.1:8000
```

Requirements are only for the generators: **Node ≥ 18** for `gen-gallery.js`,
**Python 3 + Pillow** for `gen-analysis.py`.

---

## Layout

```
index.html          markup — header, banner, gallery, lightbox, footer
styles.css          all styling; design tokens in :root
app.js              all behaviour + a GENERATED data block
analysis.js         GENERATED — colour metadata, 97 entries, 112 KB
gen-gallery.js      Node — rescans images/, rewrites GALLERY in app.js
gen-analysis.py     Python — reads pixels, writes analysis.js
PROMPT.md           the full brief; rebuilds this site from scratch
CNAME               www.mb.apesconsole.com
images/
  portraits/        58 frames · 44 MB
  motion/           17 frames · 11 MB
  dark/             22 frames · 19 MB   (black & white)
```

`analysis.js` and the `GALLERY` block in `app.js` are generated **but
committed** — the page loads them at runtime. Don't gitignore them.

---

## Adding or changing photographs

One folder per category under `images/`. The folder name *is* the category;
adding a fourth folder produces a fourth tab with no code change.

```bash
# 1. drop files in, e.g. images/portraits/
# 2. reindex + re-analyse
node gen-gallery.js      # → app.js GALLERY: filenames + intrinsic sizes
python gen-analysis.py   # → analysis.js: colour reading per frame
```

Never hand-edit either output. Resize source images to ~1000px on the long
edge first — the originals here were 4592px and several MB each, which made
"still loading" and "broken" look identical.

Tab order, display names and alt-text subjects live in `ORDER` / `LABELS` at
the top of `gen-gallery.js`. A folder with no entry falls back to its
capitalised name.

---

## How it works

### Banner

Six panels (4 below 900px, 3 below 560px), each holding the same photo twice —
a greyscale "ink" layer under an unfiltered colour layer. The colour layer is
revealed by an animated CSS mask:

```css
mask-image: linear-gradient(100deg, #000 var(--a,0%), transparent var(--b,8%));
```

`--a` / `--b` are driven from `requestAnimationFrame` on a 6.3s loop — 2500ms
sweep on, 1500ms hold, 1800ms sweep off, 500ms trough — with a 0.14 feather so
adjacent panels overlap instead of switching in steps. A soft-light sheen
tracks the sweep edge; each layer runs a 16s Ken Burns staggered per panel;
one panel swaps to a new photo during every hold.

On load, 18 black vertical strips fling sideways at random directions and
speeds to expose it.

Source folders are a named list, so a set can be excluded:

```js
const BANNER_DIRS = ["portraits", "motion"];   // dark/ is B&W, too heavy here
```

### Gallery

CSS-column masonry (3 / 2 / 1), lazy images, `IntersectionObserver` reveal with
a 40ms stagger capped at the 12th tile.

Every `<img>` carries its true intrinsic `width`/`height`, read from the JPEG
`SOF` marker by the generator. Without it the grid collapses to a single column
and jumps as files arrive — very visible with mixed portrait/landscape sets on
a tab switch.

### Lightbox

Two panes: photograph left (82vh cap), colour reading right (320px). The panel
is a flex column — scrolling body, pinned foot holding the download button.
Keyboard `Esc` / `←` / `→`, 48px swipe threshold, and a same-origin
`<a download>` named `An-Evening-to-Remember-<Category>-<NN>.jpg`.

Below 1020px the panes stack and the `‹ ›` arrows move to a centred pair along
the bottom edge.

### Colour analysis

`gen-analysis.py` measures, it does not invent. Per frame, at 200px:

| Field | Method |
| --- | --- |
| Palette | median-cut to 8, merge pairs under RGB distance 30, top 5 by share |
| Names | 12-step neutral ramp with warm/cool prefix, else 16-bucket hue + tone/grade |
| Scheme | pairwise circular hue distance — ≤22° mono, ≤55° analogous, 150–180° pair complementary, two 100–140° pairs triadic, … |
| Temperature | warm (<75° or ≥330°) vs cool (150–270°) share of chromatic pixels |
| Saturation | mean HLS saturation |
| Contrast | 95th − 5th percentile luma (`.2126R + .7152G + .0722B`) |
| Tonal key | median luma |

Output is keyed `"<folder>/<filename>"` and deterministic — same input, same
output.

It's honest about what it finds: every frame in `dark/` measures 0–1%
saturation and is reported as **Achromatic**, with the greyscale ramp and tonal
metrics carrying the reading instead.

`analysis.js` is a `.js` file assigning `window.IMAGE_ANALYSIS`, not JSON,
because `fetch()` on a JSON file fails under `file://` and would silently kill
the panel when the page is opened from disk. If the file is missing, the
reading blanks and the rest of the panel still works.

---

## Deploying

GitHub Pages from `main`, root folder. `CNAME` points at
`www.mb.apesconsole.com`; DNS needs a `CNAME` record for that host →
`apesconsole.github.io`.

> Pages is **not enabled** on the repo yet — the `CNAME` file alone won't serve
> anything until it is.

---

## Gotchas worth keeping

Each of these cost real time here:

- **A centred flex column that overflows hides its first rows.** The stacked
  lightbox put the top of the image at `-182px`, unreachable by scrolling.
  `justify-content: flex-start` on any scrollable flex column.
- **Equal-specificity CSS is decided by source order.** Mobile `.lb-nav`
  overrides written *before* the base rules silently lost. Responsive overrides
  go after what they override.
- **`visibility` doesn't transition the way you'd expect.** Switch it on a
  delay (`visibility 0s linear .28s` closed, `0s linear 0s` open) instead of
  interpolating it. Keeping it in play — rather than fading opacity alone — is
  what takes a closed menu out of the tab order.
- **Measure the DOM, don't eyeball screenshots.** Both layout bugs above were
  invisible in a screenshot and obvious in `getBoundingClientRect()`.
- **Headless Chrome lies about viewport width.** `--window-size=390` laid out
  at 489px. Render inside a fixed-width iframe to test responsive behaviour.
- **Never kill browsers by image name.** `taskkill /IM chrome.exe` takes the
  user's own windows with it. Kill by captured PID.

---

## Rebuilding from scratch

[`PROMPT.md`](PROMPT.md) is a complete specification — design tokens, every
animation timing, both generator algorithms, and a 9-point acceptance
checklist. It assumes images are added later, and is downloadable from the
site's own footer under **Developer**.

---

Photographs © Soumitra Nath / Ape's Console. Built with
[Claude](https://claude.com/claude-code).
