"""Build mission artwork from OFL DM Serif Display with a bespoke italic s.

Requires fonttools. Outlines keep rendering independent of webfont loading.
This is an original adaptation, not a reproduction of Roslindale.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
font = TTFont(ROOT / 'assets/fonts/dm-serif-display-italic.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()

# Swept terminals and a fuller diagonal spine replace the base font's ball ends.
CUSTOM_S = ('M25 18 L57 159 L73 159 C70 80 110 14 180 14 '
            'C220 14 244 36 244 71 C244 108 214 132 166 165 '
            'C106 207 73 245 86 312 C101 399 173 496 291 496 '
            'C335 496 373 477 407 481 L377 350 L362 350 '
            'C365 421 335 475 279 475 C240 475 214 452 214 418 '
            'C214 383 246 354 294 322 C363 276 388 237 375 173 '
            'C357 74 273 -15 164 -15 C110 -15 70 7 25 18 Z')


def line_art(text, ink=None):
    x = 0
    paths = []
    bounds = []
    red = False
    for i, char in enumerate(text):
        if text[i:].startswith('Jesus'):
            red = True
        name = cmap[ord(char)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        box = BoundsPen(glyphs)
        glyphs[name].draw(box)
        if box.bounds:
            left, bottom, right, top = box.bounds
            if char == 's':
                left, bottom, right, top = 25, -15, 407, 496
            bounds.append((x + left, bottom, x + right, top))
            path = CUSTOM_S if char == 's' else pen.getCommands()
            color = ink or ('#d9362a' if red else '#171717')
            paths.append(f'<path transform="translate({x} 0)" fill="{color}" stroke="{color}" stroke-width="20" stroke-linejoin="round" d="{path}"/>')
        x += font['hmtx'][name][0]
    return ''.join(paths), (min(b[0] for b in bounds), min(b[1] for b in bounds), max(b[2] for b in bounds), max(b[3] for b in bounds))


def build(filename, lines, width, step, align='center', ink=None):
    rendered = [line_art(line, ink) for line in lines]
    longest = max(b[2] - b[0] for _, b in rendered)
    scale = (width - 32) / longest
    height = step * len(lines) + 16
    groups = []
    for i, (paths, (left, bottom, right, top)) in enumerate(rendered):
        x = (width - (right - left) * scale) / 2 - left * scale
        if align == 'left':
            x = 12 - left * scale
        baseline = 12 + i * step + top * scale
        groups.append(f'<g transform="translate({x:.3f} {baseline:.3f}) scale({scale:.6f} {-scale:.6f})">{paths}</g>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}"><title>{" ".join(lines)}</title><desc>Custom mission lettering adapted from DM Serif Display, SIL Open Font License. Bespoke lowercase s.</desc>{"".join(groups)}</svg>\n'
    (ROOT / 'assets/images' / filename).write_text(svg)


build('mission-lettering.svg', ['To Reach This Generation With', 'The Hope Of Jesus Christ.'], 1440, 124)
build('mission-lettering-mobile.svg', ['To Reach This', 'Generation With', 'The Hope Of', 'Jesus Christ.'], 600, 100)
build('personal-lettering.svg', ['I want college', 'students to know', 'the hope of', 'Jesus Christ.'], 600, 88, align='left')
build('hero-mission-lettering.svg', ['Reaching this generation', 'with the hope of Christ.'], 1200, 124, ink='#ffffff')
build('hero-mission-lettering-mobile.svg', ['Reaching this', 'generation with', 'the hope of Christ.'], 600, 100, ink='#ffffff')
