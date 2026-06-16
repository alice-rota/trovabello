// Rend transparent le fond crème/beige d'une illustration au trait.
// Garde uniquement les pixels éloignés de la couleur de fond (le trait rouge).
import { PNG } from "pngjs";
import fs from "node:fs";

const src = process.argv[2];
const out = process.argv[3] ?? src;

const png = PNG.sync.read(fs.readFileSync(src));
const { width, height, data } = png;

// Couleur de fond = moyenne des 4 coins
function px(x, y) {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}
const corners = [px(0, 0), px(width - 1, 0), px(0, height - 1), px(width - 1, height - 1)];
const bg = [0, 1, 2].map((c) => Math.round(corners.reduce((s, k) => s + k[c], 0) / 4));

// Seuils de distance (feather pour des bords doux)
const T0 = 32; // en-dessous => transparent
const T1 = 70; // au-dessus => opaque

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const dr = data[i] - bg[0];
    const dg = data[i + 1] - bg[1];
    const db = data[i + 2] - bg[2];
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    let alpha;
    if (dist <= T0) alpha = 0;
    else if (dist >= T1) alpha = 255;
    else alpha = Math.round(((dist - T0) / (T1 - T0)) * 255);
    data[i + 3] = alpha;
  }
}

fs.writeFileSync(out, PNG.sync.write(png));
console.log(`Fond détouré (bg≈rgb(${bg.join(",")})) → ${out}`);
