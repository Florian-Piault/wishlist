// @ts-check
import { defineConfig } from "astro/config";

// Seul endroit où vit le nom d'utilisateur GitHub. `user` est un placeholder
// (Astro refuse `<user>`, qui n'est pas une URL valide) : remplacer par le vrai
// nom avant la première publication. Aucune intégration (pas de sitemap : le
// site n'est pas indexé).
export default defineConfig({
  site: "https://florian-piault.github.io",
  base: "/wishlist",
  output: "static",
});
