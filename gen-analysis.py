# =============================================================
# gen-analysis.py — reads every image under ./images/ and writes
# analysis.js, a colour-theory reading of each frame.
#
#     python gen-analysis.py
#
# Everything it reports is measured from the actual pixels: the
# palette comes from a median-cut quantisation, and the scheme,
# temperature, saturation, contrast and key are derived from the
# hue/saturation/luma distribution. Re-run it after adding,
# removing or re-editing images.
#
# Requires Pillow.  Output is keyed "<folder>/<filename>" so it
# survives re-ordering in app.js.
# =============================================================

import colorsys
import io
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
IMAGES = os.path.join(ROOT, "images")
OUT = os.path.join(ROOT, "analysis.js")
EXTS = (".jpg", ".jpeg", ".png", ".webp")

SAMPLE = 200          # longest edge we analyse at
NEUTRAL_SAT = 0.12    # below this a swatch counts as neutral, not a hue
MERGE_DIST = 30       # RGB distance under which two swatches are merged


# ---------- helpers -------------------------------------------------

def hex_of(rgb):
    return "#%02x%02x%02x" % rgb


def luma(rgb):
    r, g, b = [c / 255.0 for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def hue_gap(a, b):
    """Shortest distance between two hues on the colour wheel, in degrees."""
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d


def colour_name(h, s, l):
    """A plain-language name for a hue/sat/light triple."""
    if s < NEUTRAL_SAT:
        if l < 0.06: base = "near-black"
        elif l < 0.13: base = "ink"
        elif l < 0.21: base = "charcoal"
        elif l < 0.29: base = "graphite"
        elif l < 0.38: base = "iron"
        elif l < 0.48: base = "ash"
        elif l < 0.58: base = "slate grey"
        elif l < 0.68: base = "pewter"
        elif l < 0.78: base = "silver"
        elif l < 0.88: base = "pearl"
        elif l < 0.95: base = "bone white"
        else: base = "white"
        # a neutral still leans one way or the other; say so, and it also
        # keeps two near-greys from landing on the same name
        if s >= 0.05:
            if h < 75 or h >= 330: return "warm " + base
            if 150 <= h < 270: return "cool " + base
        return base

    buckets = [
        (15, "red"), (32, "amber"), (48, "gold"), (66, "yellow"),
        (95, "olive"), (150, "green"), (175, "sea green"), (192, "teal"),
        (208, "cyan"), (232, "azure"), (256, "blue"), (280, "indigo"),
        (302, "violet"), (330, "magenta"), (346, "rose"), (361, "red"),
    ]
    base = next(name for edge, name in buckets if h < edge)

    if l < 0.18:   tone = "deep "
    elif l < 0.34: tone = "dark "
    elif l > 0.82: tone = "pale "
    elif l > 0.66: tone = "light "
    else:          tone = ""

    if s < 0.28:   grade = "muted "
    elif s > 0.72: grade = "vivid "
    else:          grade = ""

    return (tone + grade + base).strip()


def describe_scheme(swatches):
    """Classify the relationship between the chromatic swatches."""
    chroma = [s for s in swatches if s["s"] >= NEUTRAL_SAT and s["share"] >= 0.05]

    if len(chroma) < 2:
        if not chroma:
            return ("Achromatic",
                    "Almost no chroma survives — the frame reads in luminance alone.")
        return ("Monochromatic",
                "One hue family carries the frame; everything else is neutral.")

    hues = [c["h"] for c in chroma]
    gaps = [hue_gap(hues[i], hues[j])
            for i in range(len(hues)) for j in range(i + 1, len(hues))]
    widest = max(gaps)

    if widest <= 22:
        return ("Monochromatic",
                "Every chromatic swatch sits within %d° of the same hue." % round(widest))
    if widest <= 55:
        return ("Analogous",
                "The hues sit inside a %d° arc — neighbours on the wheel." % round(widest))

    near_180 = [g for g in gaps if 150 <= g <= 180]
    near_120 = [g for g in gaps if 100 <= g <= 140]

    if near_180 and len(chroma) >= 3 and near_120:
        return ("Split-complementary",
                "A dominant hue answered by two others either side of its opposite.")
    if near_180:
        return ("Complementary",
                "Two hue families face each other across the wheel, %d° apart."
                % round(near_180[0]))
    if len(near_120) >= 2:
        return ("Triadic",
                "Three hue families spaced roughly evenly around the wheel.")
    if widest <= 100:
        return ("Broken analogous",
                "A loose hue family spanning %d° — related, but not tight." % round(widest))
    return ("Polychromatic",
            "Several unrelated hue families share the frame, %d° at their widest."
            % round(widest))


def band(value, cuts, labels):
    for cut, label in zip(cuts, labels):
        if value < cut:
            return label
    return labels[-1]


# ---------- per-image analysis --------------------------------------

def analyse(path):
    im = Image.open(path)
    im = im.convert("RGB")
    im.thumbnail((SAMPLE, SAMPLE))
    px = list(im.getdata())
    n = float(len(px))

    # --- palette: median-cut, then merge near-duplicates ---
    q = im.quantize(colors=8, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    raw_pal = q.getpalette()[: 8 * 3]
    counts = sorted(q.getcolors() or [], reverse=True)
    total = float(sum(c for c, _ in counts)) or 1.0

    merged = []
    for count, idx in counts:
        rgb = tuple(raw_pal[idx * 3: idx * 3 + 3])
        share = count / total
        for m in merged:
            d = sum((a - b) ** 2 for a, b in zip(rgb, m["rgb"])) ** 0.5
            if d < MERGE_DIST:
                w = m["share"] + share
                m["rgb"] = tuple(
                    int(round((a * m["share"] + b * share) / w))
                    for a, b in zip(m["rgb"], rgb)
                )
                m["share"] = w
                break
        else:
            merged.append({"rgb": rgb, "share": share})

    merged.sort(key=lambda m: -m["share"])
    palette = []
    for m in merged[:5]:
        r, g, b = m["rgb"]
        h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
        palette.append({
            "hex": hex_of(m["rgb"]),
            "share": round(m["share"] * 100),
            "name": colour_name(h * 360, s, l),
            "h": h * 360, "s": s, "l": l,
        })

    # --- global statistics over every sampled pixel ---
    sats, lumas, warm, cool, chromatic = [], [], 0, 0, 0
    for r, g, b in px:
        h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
        sats.append(s)
        lumas.append(0.2126 * r / 255.0 + 0.7152 * g / 255.0 + 0.0722 * b / 255.0)
        if s >= NEUTRAL_SAT:
            chromatic += 1
            deg = h * 360
            if deg < 75 or deg >= 330:
                warm += 1
            elif 150 <= deg < 270:
                cool += 1

    lumas.sort()
    p05 = lumas[int(0.05 * (len(lumas) - 1))]
    p50 = lumas[int(0.50 * (len(lumas) - 1))]
    p95 = lumas[int(0.95 * (len(lumas) - 1))]
    spread = p95 - p05
    mean_sat = sum(sats) / n

    warm_share = (warm / float(chromatic)) if chromatic else 0.0
    cool_share = (cool / float(chromatic)) if chromatic else 0.0
    chroma_share = chromatic / n

    if chroma_share < 0.08:
        temp_label = "Neutral"
        temp_detail = "Barely any chroma to take a side — this reads as a grey-scale frame."
    elif warm_share > cool_share + 0.28:
        temp_label = "Warm"
        temp_detail = "%d%% of the coloured pixels fall in the red-to-yellow half of the wheel." % round(warm_share * 100)
    elif cool_share > warm_share + 0.28:
        temp_label = "Cool"
        temp_detail = "%d%% of the coloured pixels fall in the green-to-blue half of the wheel." % round(cool_share * 100)
    else:
        temp_label = "Split"
        temp_detail = "Warm and cool are near evenly matched (%d%% / %d%%), so the frame holds both." % (
            round(warm_share * 100), round(cool_share * 100))

    sat_label = band(mean_sat, [0.10, 0.22, 0.38, 0.55],
                     ["Desaturated", "Restrained", "Moderate", "Saturated", "Intense"])
    con_label = band(spread, [0.28, 0.45, 0.62, 0.80],
                     ["Flat", "Soft", "Moderate", "Strong", "High"])
    key_label = band(p50, [0.18, 0.34, 0.62, 0.78],
                     ["Low key", "Dark", "Mid key", "Bright", "High key"])

    scheme_name, scheme_detail = describe_scheme(palette)

    # --- prose reading, assembled only from what was measured ---
    lead = palette[0]
    second = palette[1] if len(palette) > 1 else None
    bits = []
    bits.append("%s holds %d%% of the frame" % (lead["name"].capitalize(), lead["share"]))
    if second:
        bits.append("set against %s" % second["name"])
    sentence1 = ", ".join(bits) + "."

    if scheme_name in ("Complementary", "Split-complementary", "Triadic"):
        s2 = "The %s relationship gives the image its tension — %s" % (
            scheme_name.lower(), scheme_detail[0].lower() + scheme_detail[1:])
    elif scheme_name in ("Monochromatic", "Analogous", "Broken analogous"):
        s2 = "The %s palette keeps it calm — %s" % (
            scheme_name.lower(), scheme_detail[0].lower() + scheme_detail[1:])
    else:
        s2 = scheme_detail

    s3 = "%s tonality with %s contrast, and %s colour overall." % (
        key_label, con_label.lower(), sat_label.lower())

    note = " ".join([sentence1, s2, s3])

    for p in palette:      # drop the working values before writing
        del p["h"], p["s"], p["l"]

    return {
        "palette": palette,
        "scheme": {"label": scheme_name, "detail": scheme_detail},
        "temperature": {"label": temp_label, "detail": temp_detail,
                        "warm": round(warm_share * 100), "cool": round(cool_share * 100)},
        "saturation": {"label": sat_label, "value": round(mean_sat * 100)},
        "contrast": {"label": con_label, "value": round(spread * 100)},
        "key": {"label": key_label, "value": round(p50 * 100)},
        "note": note,
    }


# ---------- walk the folders ----------------------------------------

def main():
    data = {}
    for folder in sorted(os.listdir(IMAGES)):
        fdir = os.path.join(IMAGES, folder)
        if not os.path.isdir(fdir):
            continue
        files = sorted(f for f in os.listdir(fdir) if f.lower().endswith(EXTS))
        for f in files:
            key = folder + "/" + f
            data[key] = analyse(os.path.join(fdir, f))
        print("  %-12s %d frames" % (folder, len(files)))

    body = json.dumps(data, indent=1, sort_keys=True, ensure_ascii=False)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        fh.write("/* ============================================================\n")
        fh.write("   analysis.js — GENERATED FILE, do not edit by hand.\n")
        fh.write("   Colour-theory metadata for every frame, measured from the\n")
        fh.write("   pixels by gen-analysis.py. Re-run:  python gen-analysis.py\n")
        fh.write("   Keyed \"<folder>/<filename>\".\n")
        fh.write("   ============================================================ */\n\n")
        fh.write("window.IMAGE_ANALYSIS = ")
        fh.write(body)
        fh.write(";\n")
    print("wrote analysis.js — %d frames" % len(data))


if __name__ == "__main__":
    main()
