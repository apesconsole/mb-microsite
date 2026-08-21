/* ============================================================
   An Evening to Remember — microsite (Apes Console)
   Vanilla JS: category tabs, gallery grid, lightbox, nav,
   banner animations.
   Images are served straight out of ./images/<category>/ — no CDN.
   ============================================================ */

/* Enforce landing at the very top on every (re)load */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("load", function () { window.scrollTo(0, 0); });
window.addEventListener("pageshow", function (e) { if (e.persisted) window.scrollTo(0, 0); });

const ASSET = "images";
const SET_NAME = "An Evening to Remember";   // shown in captions / alt text
const SET_SLUG = "An-Evening-to-Remember";   // used to name downloaded files

/* One entry per folder under ./images/ — label is what the tab shows,
   dir is the folder on disk, files are its frames in display order. */
const GALLERY = [
  {
    label: "Portraits",
    dir: "portraits",
    alt: "Portrait",
    /* [ filename, intrinsic width, intrinsic height ] — the size is
       stamped on the <img> so the grid reserves space before load */
    files: [
      ["P1400661.jpg", 1000, 1332],
      ["P1400662.jpg", 1000, 1332],
      ["P1400664.jpg", 1000, 751],
      ["P1400667.jpg", 1000, 1332],
      ["P1400669.jpg", 1000, 1332],
      ["P1400670.jpg", 1000, 1332],
      ["P1400673.jpg", 1000, 1332],
      ["P1400674.jpg", 1000, 1332],
      ["P1400676.jpg", 1000, 1332],
      ["P1400677.jpg", 1000, 1332],
      ["P1400678.jpg", 1000, 1332],
      ["P1400681.jpg", 1000, 1332],
      ["P1400683.jpg", 1000, 1332],
      ["P1400684.jpg", 1000, 1332],
      ["P1400685.jpg", 1000, 1332],
      ["P1400688.jpg", 1000, 751],
      ["P1400691.jpg", 1000, 751],
      ["P1400692.jpg", 1000, 1332],
      ["P1400696.jpg", 1000, 1332],
      ["P1400698.jpg", 1000, 1332],
      ["P1400699.jpg", 1000, 1332],
      ["P1400700.jpg", 1000, 1332],
      ["P1400702.jpg", 1000, 1332],
      ["P1400706.jpg", 1000, 1332],
      ["P1400708.jpg", 1000, 1332],
      ["P1400709.jpg", 1000, 751],
      ["P1400712.jpg", 1000, 1332],
      ["P1400713.jpg", 1000, 751],
      ["P1400714.jpg", 1000, 751],
      ["P1400716.jpg", 1000, 1332],
      ["P1400720.jpg", 1000, 1332],
      ["P1400721.jpg", 1000, 751],
      ["P1400722.jpg", 1000, 751],
      ["P1400724.jpg", 1000, 751],
      ["P1400725.jpg", 1000, 751],
      ["P1400728.jpg", 1000, 751],
      ["P1400735.jpg", 1000, 751],
      ["P1400737.jpg", 1000, 1332],
      ["P1400739.jpg", 1000, 751],
      ["P1400742.jpg", 1000, 1332],
      ["P1400743.jpg", 1000, 1332],
      ["P1400746.jpg", 1000, 751],
      ["P1400748.jpg", 1000, 751],
      ["P1400750.jpg", 1000, 1332],
      ["P1400902.jpg", 1000, 751],
      ["P1400903.jpg", 1000, 1332],
      ["P1400904.jpg", 1000, 1332],
      ["P1400905.jpg", 1000, 1332],
      ["P1400907.jpg", 1000, 751],
      ["P1400909.jpg", 1000, 1332],
      ["P1400913.jpg", 1000, 1332],
      ["P1400916.jpg", 1000, 1332],
      ["P1400917.jpg", 1000, 751],
      ["P1400918.jpg", 1000, 1332],
      ["P1400921.jpg", 1000, 1332],
      ["P1400926.jpg", 1000, 1332],
      ["P1400929.jpg", 1000, 1332],
      ["P1400933.jpg", 1000, 1332],
    ],
  },
  {
    label: "Motion",
    dir: "motion",
    alt: "Motion frame",
    /* [ filename, intrinsic width, intrinsic height ] — the size is
       stamped on the <img> so the grid reserves space before load */
    files: [
      ["P1400770.jpg", 1000, 751],
      ["P1400773.jpg", 1000, 751],
      ["P1400776.jpg", 1000, 751],
      ["P1400786.jpg", 1000, 751],
      ["P1400788.jpg", 1000, 751],
      ["P1400794.jpg", 1000, 751],
      ["P1400795.jpg", 1000, 751],
      ["P1400807.jpg", 1000, 1332],
      ["P1400808.jpg", 1000, 751],
      ["P1400816.jpg", 1000, 751],
      ["P1400819.jpg", 1000, 751],
      ["P1400834.jpg", 1000, 1332],
      ["P1400842.jpg", 1000, 751],
      ["P1400855.jpg", 1000, 1332],
      ["P1400872.jpg", 1000, 751],
      ["P1400898.jpg", 1000, 1332],
      ["P1400901.jpg", 1000, 1332],
    ],
  },
  {
    label: "Dark",
    dir: "dark",
    alt: "Low-light frame",
    /* [ filename, intrinsic width, intrinsic height ] — the size is
       stamped on the <img> so the grid reserves space before load */
    files: [
      ["P1400663.jpg", 1000, 1332],
      ["P1400665.jpg", 1000, 1357],
      ["P1400669.jpg", 1000, 1332],
      ["P1400672.jpg", 1000, 1332],
      ["P1400679.jpg", 1000, 1332],
      ["P1400682.jpg", 1000, 1332],
      ["P1400684.jpg", 1000, 1332],
      ["P1400686.jpg", 1000, 751],
      ["P1400690.jpg", 1000, 1355],
      ["P1400710.jpg", 1000, 751],
      ["P1400723.jpg", 1000, 751],
      ["P1400724.jpg", 1000, 751],
      ["P1400725.jpg", 1000, 751],
      ["P1400727.jpg", 1000, 751],
      ["P1400729.jpg", 1000, 1332],
      ["P1400736.jpg", 1000, 1332],
      ["P1400741.jpg", 1000, 1332],
      ["P1400744.jpg", 1000, 1332],
      ["P1400747.jpg", 1000, 751],
      ["P1400911.jpg", 1000, 1332],
      ["P1400924.jpg", 1000, 1332],
      ["P1400929.jpg", 1000, 1332],
    ],
  },
];

/* resolved once: { src, w, h, key } per frame.
   key matches how analysis.js is indexed: "<folder>/<filename>" */
GALLERY.forEach(function (cat) {
  cat.items = cat.files.map(function (f) {
    return {
      src: ASSET + "/" + cat.dir + "/" + f[0],
      w: f[1], h: f[2],
      key: cat.dir + "/" + f[0],
    };
  });
});

let currentCat = GALLERY[0];
let currentIndex = 0;

function altFor(cat, idx) {
  return cat.alt + " — " + cat.label + " " + (idx + 1) +
    " · " + SET_NAME + ", photographed by Soumitra Nath, Apes Console";
}

/* ---------- Elements ---------- */
const filtersEl  = document.getElementById("filters");
const masonryEl  = document.getElementById("masonry");
const showingCat = document.getElementById("showingCat");
const showingCnt = document.getElementById("showingCount");

/* ---------- Reveal observer ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

/* ---------- Category tabs ---------- */
function renderFilters() {
  filtersEl.innerHTML = "";
  GALLERY.forEach((cat) => {
    const btn = document.createElement("button");
    const on = cat === currentCat;
    btn.className = "filter-pill" + (on ? " active" : "");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", on ? "true" : "false");
    btn.textContent = cat.label;

    const count = document.createElement("span");
    count.className = "filter-count";
    count.textContent = String(cat.items.length).padStart(2, "0");
    btn.appendChild(count);

    btn.addEventListener("click", () => setCategory(cat));
    filtersEl.appendChild(btn);
  });
}

/* ---------- Gallery grid ---------- */
function renderGallery() {
  const frames = currentCat.items;
  masonryEl.innerHTML = "";
  showingCat.textContent = currentCat.label;
  showingCnt.textContent = "· " + String(frames.length).padStart(2, "0") + " frames";

  frames.forEach((frame, idx) => {
    const fig = document.createElement("figure");
    fig.className = "tile";
    fig.style.transitionDelay = Math.min(idx, 12) * 40 + "ms";

    const img = document.createElement("img");
    img.src = frame.src;
    img.width = frame.w;          // reserves the right box before the
    img.height = frame.h;         // file lands, so the grid never jumps
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = altFor(currentCat, idx);

    const num = document.createElement("span");
    num.className = "tile-num";
    num.textContent = String(idx + 1).padStart(2, "0") + " / " + currentCat.label;

    fig.appendChild(img);
    fig.appendChild(num);
    fig.addEventListener("click", () => openLightbox(idx));
    masonryEl.appendChild(fig);
    revealObserver.observe(fig);
  });
}

function setCategory(cat) {
  if (cat === currentCat) return;
  currentCat = cat;
  renderFilters();
  renderGallery();
}

/* ---------- Lightbox ---------- */
const lightbox   = document.getElementById("lightbox");
const lbImg      = document.getElementById("lbImg");
const lbCaption  = document.getElementById("lbCaption");
const lbDownload = document.getElementById("lbDownload");
const lbPanel    = document.getElementById("lbPanel");

function openLightbox(idx) {
  currentIndex = idx;
  updateLightbox();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
/* Filename the visitor gets when they save a frame,
   e.g. An-Evening-to-Remember-Portraits-07.jpg */
function downloadNameFor(cat, idx) {
  const src = cat.items[idx].src;
  const ext = (src.split(".").pop() || "jpg").toLowerCase();
  return SET_SLUG + "-" + cat.label + "-" +
    String(idx + 1).padStart(2, "0") + "." + ext;
}

/* ---------- Colour reading panel ----------
   Content comes from analysis.js, generated by gen-analysis.py from the
   actual pixels of each frame. If that file is absent the panel simply
   hides and the lightbox falls back to the photograph alone. */
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

function metricRow(label, value, pct) {
  return '<div class="lbp-row">' +
    '<div class="lbp-rowhead"><span class="lbp-key">' + esc(label) + '</span>' +
    '<span class="lbp-val">' + esc(value) + '</span></div>' +
    '<div class="lbp-bar"><div class="lbp-fill" style="width:' + pct + '%"></div></div>' +
    "</div>";
}

function renderAnalysis() {
  const data = window.IMAGE_ANALYSIS || {};
  const a = data[currentCat.items[currentIndex].key];

  if (!a) { lbPanel.hidden = true; lbPanel.innerHTML = ""; return; }
  lbPanel.hidden = false;

  const swatches = a.palette.map(function (p) {
    return '<div class="lbp-sw">' +
      '<span class="lbp-chip" style="background:' + esc(p.hex) + '"></span>' +
      '<span class="lbp-swmeta">' +
        '<span class="lbp-hex">' + esc(p.hex) + "</span>" +
        '<span class="lbp-name">' + esc(p.name) + "</span>" +
      "</span>" +
      '<span class="lbp-share">' + p.share + "%</span>" +
    "</div>";
  }).join("");

  /* temperature is a balance, not a magnitude — show it as a split bar.
     An achromatic frame has neither side, so it gets a flat neutral bar
     rather than an empty gap. */
  const warm = a.temperature.warm, cool = a.temperature.cool;
  const bar = (warm + cool) === 0
    ? '<div class="lbp-bar"><div class="lbp-fill lbp-neutral" style="width:100%"></div></div>'
    : '<div class="lbp-split">' +
        '<span class="lbp-warm" style="width:' + warm + '%"></span>' +
        '<span class="lbp-cool" style="width:' + cool + '%"></span>' +
        '<span style="width:' + Math.max(0, 100 - warm - cool) + '%"></span>' +
      "</div>";
  const tempRow = '<div class="lbp-row">' +
    '<div class="lbp-rowhead"><span class="lbp-key">Temperature</span>' +
    '<span class="lbp-val">' + esc(a.temperature.label) + "</span></div>" +
    bar + "</div>";

  lbPanel.innerHTML =
    '<p class="lbp-eyebrow">Colour reading</p>' +
    '<h3 class="lbp-title">' + esc(a.scheme.label) + "</h3>" +
    '<p class="lbp-detail">' + esc(a.scheme.detail) + "</p>" +
    '<div class="lbp-palette">' + swatches + "</div>" +
    '<div class="lbp-metrics">' +
      tempRow +
      metricRow("Saturation", a.saturation.label, a.saturation.value) +
      metricRow("Contrast", a.contrast.label, a.contrast.value) +
      metricRow("Tonal key", a.key.label, a.key.value) +
    "</div>" +
    '<p class="lbp-note">' + esc(a.note) + "</p>";

  lbPanel.scrollTop = 0;
}

function updateLightbox() {
  lbImg.src = currentCat.items[currentIndex].src;
  lbImg.alt = altFor(currentCat, currentIndex);
  lbCaption.textContent =
    currentCat.label + " — " + (currentIndex + 1) + " / " + currentCat.items.length;
  lbDownload.href = currentCat.items[currentIndex].src;
  lbDownload.setAttribute("download", downloadNameFor(currentCat, currentIndex));
  lbDownload.classList.remove("saved");
  renderAnalysis();
}
function step(dir) {
  const len = currentCat.items.length;
  currentIndex = (currentIndex + dir + len) % len;
  updateLightbox();
}

/* the browser handles the save itself — we only keep the click from
   reaching the backdrop (which would close the lightbox) and flash
   the button so the visitor sees that something happened */
lbDownload.addEventListener("click", (e) => {
  e.stopPropagation();
  lbDownload.classList.add("saved");
  setTimeout(() => lbDownload.classList.remove("saved"), 1200);
});

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
document.getElementById("lbNext").addEventListener("click", (e) => { e.stopPropagation(); step(1); });
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "ArrowRight") step(1);
});

/* swipe between frames on touch devices */
(function () {
  let x0 = null;
  lightbox.addEventListener("touchstart", (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
})();

/* ---------- Header scroll + progress ---------- */
const header = document.getElementById("siteHeader");
const progress = document.getElementById("scrollProgress");
function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 30);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const navMobile = document.getElementById("navMobile");
menuBtn.addEventListener("click", () => {
  const open = navMobile.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
});
navMobile.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navMobile.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Init ---------- */
renderFilters();
renderGallery();
onScroll();

/* ============================================================
   Banner animation — "Inked -> Painted"
   Grayscale frame strip that paints itself to life, loops
   seamlessly, and slowly cycles through the whole set.
   ============================================================ */
(function () {
  const strip = document.getElementById("heroStrip");
  const sheen = document.getElementById("heroSheen");
  if (!strip) return;

  /* Which folders feed the banner. The dark set is deliberately left out —
     it sits behind the title and reads too heavy. Add or remove a folder
     name here to change what the banner draws from. */
  const BANNER_DIRS = ["portraits", "motion"];

  /* those frames, shuffled — so the banner opens differently each visit */
  let POOL = GALLERY.reduce(function (all, cat) {
    if (BANNER_DIRS.indexOf(cat.dir) === -1) return all;
    return all.concat(cat.items.map(function (f) { return f.src; }));
  }, []);
  /* if those folders ever go missing, fall back to everything rather
     than leaving the banner blank */
  if (!POOL.length) {
    POOL = GALLERY.reduce(function (all, cat) {
      return all.concat(cat.items.map(function (f) { return f.src; }));
    }, []);
  }
  for (let i = POOL.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = POOL[i]; POOL[i] = POOL[j]; POOL[j] = t;
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const countFor = () => (window.innerWidth < 560 ? 3 : window.innerWidth < 900 ? 4 : 6);

  let N = countFor(), ptr = 0, panels = [], nextRotate = 0;
  const nextSrc = () => POOL[ptr++ % POOL.length];

  function build() {
    strip.innerHTML = ""; panels = []; ptr = 0;
    strip.classList.toggle("kb", !reduce);
    for (let i = 0; i < N; i++) {
      const fig = document.createElement("figure");
      fig.className = "hero-panel"; fig.style.setProperty("--i", i);
      const src = nextSrc();
      const ink = new Image(); ink.className = "layer ink"; ink.alt = ""; ink.src = src;
      const col = new Image(); col.className = "layer colour"; col.alt = ""; col.src = src;
      fig.append(ink, col); strip.appendChild(fig);
      panels.push({ fig, ink, col });
    }
  }

  const FEATHER = 0.14;
  function applyProgress(p) {
    for (let i = 0; i < panels.length; i++) {
      let r = (p * (1 + FEATHER) - i / N) / (1 / N);
      r = r < 0 ? 0 : r > 1 ? 1 : r;
      const c = panels[i].col;
      if (r <= 0.001) { c.style.opacity = "0"; }
      else if (r >= 0.999) { c.style.opacity = "1"; c.style.setProperty("--a", "110%"); c.style.setProperty("--b", "120%"); }
      else { c.style.opacity = "1"; const s = r * 100; c.style.setProperty("--a", (s - 5) + "%"); c.style.setProperty("--b", (s + 11) + "%"); }
    }
  }

  function rotatePanel(idx) {
    const P = panels[idx], src = nextSrc();
    const swap = new Image(); swap.className = "swap"; swap.alt = ""; swap.src = src;
    const commit = () => {
      P.fig.appendChild(swap);
      requestAnimationFrame(() => { swap.style.opacity = "1"; });
      setTimeout(() => { P.ink.src = src; P.col.src = src; swap.remove(); }, 850);
    };
    if (swap.decode) swap.decode().then(commit).catch(commit); else swap.onload = commit;
  }

  const ON = 2500, HOLD = 1500, OFF = 1800, TROUGH = 500, CYCLE = ON + HOLD + OFF + TROUGH;
  let t0 = null, raf = null, rotated = false, base = 0;

  function frame(now) {
    if (t0 === null) t0 = now;
    const local = now - t0 - base;
    let p, sweeping = false, edge = 0;
    if (local < ON) { p = local / ON; sweeping = true; edge = p; }
    else if (local < ON + HOLD) { p = 1; if (!rotated) { rotatePanel(nextRotate++ % N); rotated = true; } }
    else if (local < ON + HOLD + OFF) { p = 1 - (local - ON - HOLD) / OFF; sweeping = true; edge = p; }
    else if (local < CYCLE) { p = 0; }
    else { base += CYCLE; rotated = false; p = 0; }
    applyProgress(p);
    if (sweeping) { const w = strip.clientWidth; sheen.style.opacity = "1"; sheen.style.transform = "translateX(" + (edge * (w + 80) - 40) + "px)"; }
    else { sheen.style.opacity = "0"; }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf); t0 = null; base = 0; rotated = false;
    if (reduce) { applyProgress(1); return; }
    raf = requestAnimationFrame(frame);
  }

  build(); start();

  /* ---- Controls ---- */
  const shuffleBtn = document.getElementById("heroShuffle");
  const motionBtn = document.getElementById("heroMotion");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      panels.forEach((_, i) => setTimeout(() => rotatePanel(i), i * 90));
    });
  }
  if (motionBtn) {
    const setMotion = (on) => {
      motionBtn.classList.toggle("is-on", on);
      motionBtn.textContent = (on ? "◐ Motion: on" : "◐ Motion: off");
    };
    setMotion(!reduce && strip.classList.contains("kb"));
    motionBtn.addEventListener("click", () => setMotion(strip.classList.toggle("kb")));
  }

  let rz;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => { const n = countFor(); if (n !== N) { N = n; build(); start(); } }, 200);
  });
})();

/* ============================================================
   Banner reveal — black vertical strips fling away + fade,
   exposing the animated banner underneath.
   ============================================================ */
(function () {
  const host = document.getElementById("heroReveal");
  if (!host) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { host.remove(); return; }

  const M = window.innerWidth < 560 ? 9 : window.innerWidth < 900 ? 13 : 18; // strip count
  const strips = [];
  for (let i = 0; i < M; i++) {
    const s = document.createElement("div");
    s.className = "reveal-strip";
    s.style.left = (i * 100 / M) + "%";
    s.style.width = (100 / M + 0.7) + "%";   // slight overlap hides seams
    host.appendChild(s);
    strips.push(s);
  }
  host.style.background = "transparent";       // strips now provide the black cover

  // ease-IN curve: each strip starts slow, then accelerates as it flies off + fades
  const ACCEL = "cubic-bezier(.45, 0, .85, .12)";

  // two rAFs guarantee the strips paint before we transition them away
  requestAnimationFrame(() => requestAnimationFrame(() => {
    let maxEnd = 0;
    strips.forEach((s) => {
      const dir  = Math.random() < 0.5 ? -1 : 1;          // left or right
      const dist = 90 + Math.random() * 70;               // 90–160vw, fully clears
      const dur  = 650 + Math.random() * 520;             // longer, so the slow->fast ramp reads
      const delay = Math.random() * 300;                  // random stagger
      maxEnd = Math.max(maxEnd, dur + delay);
      s.style.transition =
        "transform " + dur + "ms " + ACCEL + " " + delay + "ms, " +
        "opacity "   + dur + "ms " + ACCEL + " " + delay + "ms";
      s.style.transform = "translateX(" + (dir * dist) + "vw)";
      s.style.opacity = "0";
    });
    setTimeout(() => host.remove(), maxEnd + 120);
  }));
})();

/* ============================================================
   Title split — as you scroll down from the banner, the title
   breaks into segments that drift vertically (random up/down),
   slowly, tracking scroll.
   ============================================================ */
(function () {
  const title = document.getElementById("heroTitle");
  if (!title) return;
  const segs = Array.prototype.slice.call(title.querySelectorAll(".hero-seg"));
  if (!segs.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // random vertical drift factor per segment (a slow fraction of scroll distance),
  // random up/down direction — assigned once on load.
  const factors = segs.map(function () {
    const mag = 0.5 + Math.random() * 0.6;            // 0.5–1.1 × scroll → clearly visible drift
    return (Math.random() < 0.5 ? -1 : 1) * mag;
  });
  // make sure they do not all go the same way, so the title visibly breaks apart
  if (factors.every((f) => f > 0) || factors.every((f) => f < 0)) factors[0] = -factors[0];

  let ticking = false;
  function update() {
    const y = window.scrollY || window.pageYOffset || 0;
    for (let i = 0; i < segs.length; i++) {
      segs[i].style.transform = "translateY(" + (y * factors[i]).toFixed(2) + "px)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
