// Génère public/og.png, l'image d'aperçu des liens partagés : l'icône Lucide
// `tree-pine` en vert sapin, centrée sur le fond clair. Les messageries
// n'acceptent pas le SVG, d'où ce PNG versionné. À relancer seulement pour
// changer l'image : `node scripts/og-image.mjs`.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const ICON_SIZE = 420;
const BACKGROUND = "#FBFAF7";
const PINE_GREEN = "#24563F";

const iconPath = fileURLToPath(
  import.meta.resolve("lucide-static/icons/tree-pine.svg"),
);
const outputPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const icon = (await readFile(iconPath, "utf8"))
  .replaceAll("currentColor", PINE_GREEN)
  .replace('width="24"', `width="${ICON_SIZE}"`)
  .replace('height="24"', `height="${ICON_SIZE}"`);

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: BACKGROUND,
  },
})
  .composite([{ input: Buffer.from(icon), gravity: "centre" }])
  .png()
  .toFile(outputPath);

console.log(`Écrit : ${outputPath}`);
