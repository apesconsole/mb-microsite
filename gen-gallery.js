/* ============================================================
   gen-gallery.js — regenerates the GALLERY data block in app.js
   from whatever is currently on disk under ./images/.

       node gen-gallery.js

   Run it any time you add, remove, rename or resize images.
   It rewrites only the block between "const GALLERY = [" and its
   closing "];" — everything else in app.js is left untouched.
   ============================================================ */

const fs = require("fs");
const path = require("path");

/* Tab order. Folders listed here come first, in this order; any other
   folder under ./images/ is appended alphabetically. */
const ORDER = ["portraits", "motion", "dark"];

/* Display name + alt-text subject per folder. A folder with no entry
   here falls back to its capitalised folder name. */
const LABELS = {
  portraits: { label: "Portraits", alt: "Portrait" },
  motion:    { label: "Motion",    alt: "Motion frame" },
  dark:      { label: "Dark",      alt: "Low-light frame" },
};

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

/* Read intrinsic size out of a JPEG/PNG header, so the grid can
   reserve the right box before the file lands. */
function dimensions(file) {
  const b = fs.readFileSync(file);
  if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;   // unknown format — emitted without a size
}

const root = path.join(__dirname, "images");
const dirs = fs.readdirSync(root).filter(function (d) {
  return fs.statSync(path.join(root, d)).isDirectory();
});
dirs.sort(function (a, b) {
  const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib);
  return a.localeCompare(b);
});

let out = "const GALLERY = [\n";
const summary = [];

for (const dir of dirs) {
  const meta = LABELS[dir] || {
    label: dir.charAt(0).toUpperCase() + dir.slice(1),
    alt: dir.charAt(0).toUpperCase() + dir.slice(1) + " frame",
  };
  const files = fs.readdirSync(path.join(root, dir)).filter(function (f) {
    return IMAGE_RE.test(f);
  }).sort();

  if (!files.length) { summary.push(dir + "=0 (skipped, empty)"); continue; }

  out += "  {\n";
  out += '    label: "' + meta.label + '",\n';
  out += '    dir: "' + dir + '",\n';
  out += '    alt: "' + meta.alt + '",\n';
  out += "    /* [ filename, intrinsic width, intrinsic height ] — the size is\n";
  out += "       stamped on the <img> so the grid reserves space before load */\n";
  out += "    files: [\n";
  for (const f of files) {
    const d = dimensions(path.join(root, dir, f));
    out += '      ["' + f + '"' + (d ? ", " + d.w + ", " + d.h : "") + "],\n";
  }
  out += "    ],\n  },\n";
  summary.push(dir + "=" + files.length);
}
out += "];";

const appPath = path.join(__dirname, "app.js");
const src = fs.readFileSync(appPath, "utf8");
const start = src.indexOf("const GALLERY = [");
const end = src.indexOf("\n];", start) + 3;
if (start < 0 || end < 3) {
  console.error("Could not find the GALLERY block in app.js — aborting.");
  process.exit(1);
}
fs.writeFileSync(appPath, src.slice(0, start) + out + src.slice(end));
console.log("app.js GALLERY regenerated: " + summary.join("  "));
