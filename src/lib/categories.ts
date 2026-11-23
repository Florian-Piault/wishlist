// Catégories de la liste. L'ordre du tableau fixe l'ordre d'affichage des
// groupes ; le schéma de la collection en tire son enum fermé.
export const CATEGORIES = [
  "books",
  "games",
  "tech",
  "home",
  "clothing",
  "misc",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Noms Lucide des icônes de repli. `house` et non `home` : Lucide a renommé
 * l'icône et ne garde `home` que comme alias, absent des imports par icône
 * de `@lucide/astro`.
 */
export type CategoryIconName =
  "book" | "gamepad-2" | "monitor" | "house" | "shirt" | "gift";

export type CategoryInfo = {
  /** Libellé affiché, en français. */
  label: string;
  /** Nom de l'icône Lucide de repli quand l'élément n'a pas d'image. */
  icon: CategoryIconName;
};

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  books: { label: "Livres", icon: "book" },
  games: { label: "Jeux", icon: "gamepad-2" },
  tech: { label: "Tech", icon: "monitor" },
  home: { label: "Maison", icon: "house" },
  clothing: { label: "Vêtements", icon: "shirt" },
  misc: { label: "Divers", icon: "gift" },
};
