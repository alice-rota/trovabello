// Génère une favicon : redimensionne + arrondit fortement les angles (coins transparents).
import { PNG } from "pngjs";
import fs from "node:fs";

const src = process.argv[2];
const out = process.argv[3];
const size = Number(process.argv[4] ?? 512);
const radiusFrac = Number(process.argv[5] ?? 0.2);

const img = PNG.sync.read(fs.readFileSync(src));
const { width: sw, height: sh, data: sd } = img;

// Redimensionnement bilinéaire
const td = Buffer.alloc(size * size * 4);
for (let y = 0; y < size; y++) {
  const sy = ((y + 0.5) * sh) / size - 0.5;
  const y0 = Math.max(0, Math.floor(sy));
  const y1 = Math.min(sh - 1, y0 + 1);
  const fy = Math.min(1, Math.max(0, sy - Math.floor(sy)));
  for (let x = 0; x < size; x++) {
    const sx = ((x + 0.5) * sw) / size - 0.5;
    const x0 = Math.max(0, Math.floor(sx));
    const x1 = Math.min(sw - 1, x0 + 1);
    const fx = Math.min(1, Math.max(0, sx - Math.floor(sx)));
    for (let c = 0; c < 4; c++) {
      const p00 = sd[(y0 * sw + x0) * 4 + c];
      const p10 = sd[(y0 * sw + x1) * 4 + c];
      const p01 = sd[(y1 * sw + x0) * 4 + c];
      const p11 = sd[(y1 * sw + x1) * 4 + c];
      const top = p00 + (p10 - p00) * fx;
      const bot = p01 + (p11 - p01) * fx;
      td[(y * size + x) * 4 + c] = Math.round(top + (bot - top) * fy);
    }
  }
}

// Masque coins arrondis
const r = Math.round(size * radiusFrac);
function coverage(x, y) {
  const cx = x < r ? r : x >= size - r ? size - 1 - r : x;
  const cy = y < r ? r : y >= size - r ? size - 1 - r : y;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist <= r - 0.5) return 1;
  if (dist >= r + 0.5) return 0;
  return r + 0.5 - dist;
}
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    td[i + 3] = Math.round(td[i + 3] * coverage(x, y));
  }
}

const result = new PNG({ width: size, height: size });
td.copy(result.data);
fs.writeFileSync(out, PNG.sync.write(result));
console.log(`favicon ${size}x${size}, rayon ${r}px → ${out}`);
