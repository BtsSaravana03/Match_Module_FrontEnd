import _ from "lodash";

export function check(value:any){
    if (value == 'Infinity')
      return '-';
    else if(value.toString() === 'NaN'){
      return '0'
    }
    else
      return value.toFixed(1);
}
export function checkSRNoDecimal(value:any) {
    if (value.toString() === 'Infinity' || value.toString() === 'NaN')
        return 0;
    else
        return Math.floor(value);
}
export function checkSR(value:any) {
    if (value.toString() === 'Infinity' || value.toString() === 'NaN')
        return 0.0;
    else
        return parseFloat(value).toFixed(1);
}
export function checkInf(value:any) {
  if (value.toString() === 'Infinity' || value.toString() === 'NaN')
      return '0';
  else
      return parseFloat(value).toFixed(1);
}
export function checkInfNum(value: any): number {
    const num = Number(value);
    if (!isFinite(num)) {
        return 0;
    }
    return parseFloat(num.toFixed(1));
}
export function checkInfNumSR(value: any): number {
    const num = Number(value);
    if (!isFinite(num)) {
        return 0;
    }
    return parseFloat(num.toFixed(0));
}
export function splitName(fullName:string) {
    const parts = _.split(fullName, ' '); // Split the name by spaces
    const firstname = _.head(parts) || ""; // Get the first word (firstname), default to empty string
    const lastname = _.join(_.tail(parts), ' ') || ""; // Join the remaining words (lastname), default to empty string
    return { firstname, lastname };
}
export function getGradientColor(baseColor: string, percentage: number): string {
    // Create a temporary element to parse the color
    const tempDiv = document.createElement("div");
    tempDiv.style.color = baseColor;
    document.body.appendChild(tempDiv);

    // Get the computed color in RGB
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Extract RGB values
    const rgbMatch = computedColor.match(/\d+/g);
    if (!rgbMatch) return baseColor;

    const [r, g, b] = rgbMatch.map(Number);

    // Convert RGB to HSL
    const hsl = rgbToHsl(r, g, b);

    // Adjust lightness based on percentage (0% → 90% light, 100% → 10% light)
    const lightness = 90 - (percentage * 0.8);

    // Convert back to RGB
    const rgb = hslToRgb(hsl.h, hsl.s, lightness);

    // Return hex color
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  // Convert HSL to RGB
  function hslToRgb(h: number, s: number, l: number) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  // Convert RGB to Hex
  function rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
  }
