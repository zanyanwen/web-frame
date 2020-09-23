/**
 * https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * @param h {Number} 0 ~ 1
 * @param s {Number} 0 ~ 1
 * @param l {Number} 0 ~ 1
 */
export function hslToRGB(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * @param r {Number|{r:Number, g:Number,b:Number}} 1 ~ 255
 * @param g {Number} 1 ~ 255
 * @param b {Number} 1 ~ 255
 * @return {{s: number, h: number, l: number}}
 * @constructor
 */
export function RGBToHsl(r, g, b) {
  if (typeof r === 'object') {
    b = r.b;
    g = r.g;
    r = r.r;
  }
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: h,
    s: s,
    l: l,
  };
}

/**
 * @param r {Number|String} 0 ~ 255
 * @param g {Number|String} 0 ~ 255
 * @param b {Number|String} 0 ~ 255
 * @returns {string}
 */
export function RGBToHex(r, g, b) {
  if (typeof r === 'object') {
    b = r.b;
    g = r.g;
    r = r.r;
  }
  r = Number(r).toString(16);
  g = Number(g).toString(16);
  b = Number(b).toString(16);

  if (r.length === 1) r = '0' + r;
  if (g.length === 1) g = '0' + g;
  if (b.length === 1) b = '0' + b;

  return '#' + r + g + b;
}

/**
 * @param h {String} #39f, #3399ff
 * @returns {{r: number, b: number, g: number}}
 */
export function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;

  // 3 digits
  if (h.length === 4) {
    r = parseInt(h[1] + h[1], 16);
    g = parseInt(h[2] + h[2], 16);
    b = parseInt(h[3] + h[3], 16);

    // 6 digits
  } else if (h.length === 7) {
    r = parseInt(h[1] + h[2], 16);
    g = parseInt(h[3] + h[4], 16);
    b = parseInt(h[5] + h[6], 16);
  }

  return { r: r, g: g, b: b };
}

export function isHexColor(string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(string);
}

const ColorUtils = {
  hslToRGB,
  RGBToHsl,
  RGBToHex,
  hexToRGB,
  isHexColor,
};

export default ColorUtils;
