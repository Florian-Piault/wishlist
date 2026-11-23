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

export type CategoryInfo = {
  /** Libellé affiché, en français. */
  label: string;
  /** Nom de l'icône Lucide de repli quand l'élément n'a pas d'image. */
  icon: string;
};

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  books: { label: "Livres", icon: "book" },
  games: { label: "Jeux", icon: "gamepad-2" },
  tech: { label: "Tech", icon: "monitor" },
  home: { label: "Maison", icon: "home" },
  clothing: { label: "Vêtements", icon: "shirt" },
  misc: { label: "Divers", icon: "gift" },
};
