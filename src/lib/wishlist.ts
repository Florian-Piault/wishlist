// Règles de la liste : prix, groupement, tri, synthèse et formatage.
// Fonctions pures : la page charge la collection et leur passe les éléments.
import type { CollectionEntry } from "astro:content";
import { CATEGORIES, CATEGORY_INFO, type Category } from "./categories";

export type WishlistEntry = CollectionEntry<"wishlist">;
export type Item = WishlistEntry["data"];

export type CategoryGroup = {
  category: Category;
  label: string;
  icon: string;
  count: number;
  /** Éléments triés : `high` d'abord, puis prix effectif croissant. */
  entries: WishlistEntry[];
};

export type Summary = {
  count: number;
  /** Plus petit prix effectif ; absent si la liste est vide. */
  min?: number;
  /** Plus grand prix haut ; absent si la liste est vide. */
  max?: number;
};

// Le schéma garantit `price` ou `range` : le `?? 0` ne sert qu'au typage.

/** Prix servant au tri et au bas de la synthèse : `price`, sinon `range.min`. */
export function effectivePrice(item: Item): number {
  return item.price ?? item.range?.min ?? 0;
}

/** Prix servant au haut de la synthèse : `price`, sinon `range.max`. */
export function highPrice(item: Item): number {
  return item.price ?? item.range?.max ?? 0;
}

function compareEntries(a: WishlistEntry, b: WishlistEntry): number {
  const priorityA = a.data.priority === "high" ? 0 : 1;
  const priorityB = b.data.priority === "high" ? 0 : 1;
  return (
    priorityA - priorityB ||
    effectivePrice(a.data) - effectivePrice(b.data) ||
    a.data.fileOrder - b.data.fileOrder
  );
}

/**
 * Groupes de catégories dans l'ordre de l'enum, catégories vides omises.
 * À égalité, l'ordre du fichier vient de `fileOrder` : `getCollection` rend
 * les entrées par slug, pas dans l'ordre du fichier.
 */
export function groupByCategory(entries: WishlistEntry[]): CategoryGroup[] {
  return CATEGORIES.flatMap((category) => {
    const inCategory = entries
      .filter((entry) => entry.data.category === category)
      .sort(compareEntries);
    if (inCategory.length === 0) return [];
    return [
      {
        category,
        ...CATEGORY_INFO[category],
        count: inCategory.length,
        entries: inCategory,
      },
    ];
  });
}

export function summarize(entries: WishlistEntry[]): Summary {
  if (entries.length === 0) return { count: 0 };
  return {
    count: entries.length,
    min: Math.min(...entries.map((entry) => effectivePrice(entry.data))),
    max: Math.max(...entries.map((entry) => highPrice(entry.data))),
  };
}

const integerFormat = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});
const decimalFormat = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Montant sans symbole : « 1 299 », « 49,90 ». L'entier se teste après
 * arrondi au centime, pour que 49,999 sorte « 50 » et non « 50,00 ».
 */
function formatAmount(amount: number): string {
  const cents = Math.round(amount * 100);
  return cents % 100 === 0
    ? integerFormat.format(cents / 100)
    : decimalFormat.format(cents / 100);
}

// Espace insécable : le symbole ne passe jamais seul à la ligne.
const EURO = " €";

export function formatEuros(amount: number): string {
  return `${formatAmount(amount)}${EURO}`;
}

export function formatRange(min: number, max: number): string {
  return `de ${formatAmount(min)} à ${formatAmount(max)}${EURO}`;
}

/** Prix affiché d'un élément : `price` s'il existe, sinon la fourchette. */
export function formatItemPrice(item: Item): string {
  if (item.price !== undefined) return formatEuros(item.price);
  if (item.range) return formatRange(item.range.min, item.range.max);
  return "";
}

/** « 7 idées, de 12 à 450 € » ; la mention « Prix indicatifs » est ajoutée par la page. */
export function formatSummary(summary: Summary): string {
  if (summary.min === undefined || summary.max === undefined) {
    return "Aucune idée pour l'instant";
  }
  const ideas = `${summary.count} idée${summary.count > 1 ? "s" : ""}`;
  return `${ideas}, ${formatRange(summary.min, summary.max)}`;
}
