// OKLAB color math — used to pre-compute theme CSS variables so that
// html-to-image gets concrete hex/rgba values instead of unresolvable
// color-mix() tokens (getComputedStyle never resolves CSS custom properties).

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

function toOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = linearize(r), lg = linearize(g), lb = linearize(b)
  const lx = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const mx = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const sx = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * lx + 0.7936177850 * mx - 0.0040720468 * sx,
    1.9779984951 * lx - 2.4285922050 * mx + 0.4505937099 * sx,
    0.0259040371 * lx + 0.7827717662 * mx - 0.8086757660 * sx,
  ]
}

function fromOklab(L: number, a: number, b: number): [number, number, number] {
  const lx = L + 0.3963377774 * a + 0.2158037573 * b
  const mx = L - 0.1055613458 * a - 0.0638541728 * b
  const sx = L - 0.0894841775 * a - 1.2914855480 * b
  const l = lx ** 3, m = mx ** 3, s = sx ** 3
  return [
    delinearize(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    delinearize(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    delinearize(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]
}

function toHex(r: number, g: number, b: number): string {
  const ch = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')
  return '#' + ch(r) + ch(g) + ch(b)
}

// Blend two opaque hex colors in OKLAB space. p1 = percentage of c1 (0–100).
function mixOklab(c1: string, p1: number, c2: string): string {
  const [r1, g1, b1] = parseHex(c1)
  const [r2, g2, b2] = parseHex(c2)
  const lab1 = toOklab(r1, g1, b1)
  const lab2 = toOklab(r2, g2, b2)
  const t = p1 / 100, u = 1 - t
  const [rf, gf, bf] = fromOklab(
    lab1[0] * t + lab2[0] * u,
    lab1[1] * t + lab2[1] * u,
    lab1[2] * t + lab2[2] * u,
  )
  return toHex(rf, gf, bf)
}

// color-mix(in oklab, hex p%, transparent) — with premultiplied alpha the
// result is the same sRGB values as the original color at alpha = p/100.
function toRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex)
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`
}

// Returns all derived CSS custom-property values computed from a single accent
// hex. Inject these as inline styles on the .cv-invite (and .cv-wa) roots so
// that html-to-image captures concrete values instead of unresolved tokens.
export function computeThemeVars(accent: string): Record<string, string> {
  const ink   = '#261b30'
  const white = '#ffffff'

  const accentDeep = mixOklab(accent, 64, ink)
  const accentRich = mixOklab(accent, 86, ink)
  const accentMid  = mixOklab(accent, 64, white)
  const accentSoft = mixOklab(accent, 26, white)
  const accentWash = mixOklab(accent, 13, white)

  return {
    '--accent':      accent,
    '--accent-deep': accentDeep,
    '--accent-rich': accentRich,
    '--accent-mid':  accentMid,
    '--accent-soft': accentSoft,
    '--accent-wash': accentWash,
    '--paper':       mixOklab(accent, 6,  '#fcf9f4'),
    '--paper-2':     mixOklab(accent, 12, '#f7f1e9'),
    '--gold':        mixOklab(accent, 30, '#b79356'),
    '--line':        toRgba(accent, 0.34),
    '--line-soft':   toRgba(accent, 0.18),
    // inline-style replacements for color-mix() calls in JSX / CSS rules
    '--cv-ph-stripe':       toRgba(accent, 0.22),
    '--cv-ph-bg-start':     mixOklab(accent, 24, '#efe7da'),
    '--cv-ph-bg-end':       mixOklab(accent, 40, '#d9ccba'),
    '--cv-ph-tag-color':    mixOklab(accentDeep, 70, '#ffffff'),
    '--cv-badge-shadow':    toRgba(accent, 0.40),
    '--cv-overlay-top':     toRgba(mixOklab(accent, 35, ink), 0.58),
    '--cv-overlay-bottom':  toRgba(accentDeep, 0.78),
    '--cv-arch-shadow':     toRgba(accent, 0.24),
    '--cv-qr-glow':         toRgba(accent, 0.18),
  }
}
