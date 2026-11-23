import { defineCollection } from "astro:content";
import { file, type Loader } from "astro/loaders";
import { z } from "astro/zod";
import { CATEGORIES } from "./lib/categories";

// Fichiers présents dans le dossier des images, clés depuis la racine du
// projet (« /src/assets/items/casque.jpg »). Glob paresseux : seules les
// clés servent, aucun fichier n'est chargé.
const ITEM_IMAGES = new Set(
  Object.keys(import.meta.glob("/src/assets/items/**/*")),
);

/**
 * Vrai si le chemin `image` du YAML (relatif à src/data/) désigne un fichier
 * du dossier des images. `pathname` encode les accents et les espaces, que
 * les clés du glob gardent en clair : on le décode. Un `?` ou un `#`
 * tronquerait le chemin : refusé.
 */
function isKnownImage(path: string): boolean {
  if (/[?#]/.test(path)) return false;
  const fromRoot = decodeURIComponent(
    new URL(path, "file:///src/data/").pathname,
  );
  return ITEM_IMAGES.has(fromRoot);
}

/**
 * Loader `file()` qui note la position de chaque élément dans le fichier
 * (`fileOrder`). Astro range les entrées par slug dans son data store :
 * `getCollection` ne rend donc pas l'ordre du fichier, dont le tri a besoin
 * à égalité de prix. Le loader parse les éléments un à un, dans l'ordre :
 * un compteur suffit ; s'il continue de croître à chaque resynchronisation
 * du dev server, l'ordre relatif reste juste.
 */
function fileWithOrder(fileName: string): Loader {
  const inner = file(fileName);
  return {
    name: "file-with-order",
    load: async (context) => {
      let position = 0;
      await inner.load({
        ...context,
        parseData: (props) =>
          context.parseData({
            ...props,
            data: { ...props.data, fileOrder: position++ },
          }),
      });
    },
  };
}

// Une seule collection : la liste, map YAML clée par slug. Chaque message
// d'erreur nomme le champ fautif, car il s'affiche tel quel quand le build
// refuse le fichier.
const wishlist = defineCollection({
  loader: fileWithOrder("src/data/wishlist.yaml"),
  schema: ({ image }) =>
    z
      .object({
        title: z
          .string({ error: "« title » est requis (texte)." })
          .trim()
          .min(1, { error: "« title » ne doit pas être vide." }),
        url: z.url({
          protocol: /^https?$/,
          error: "« url » est requis et doit être une URL http:// ou https://.",
        }),
        price: z
          .number({ error: "« price » doit être un nombre (en euros)." })
          .positive({ error: "« price » doit être strictement positif." })
          .optional(),
        range: z
          .object(
            {
              min: z
                .number({ error: "« range.min » doit être un nombre." })
                .positive({ error: "« range.min » doit être positif." }),
              max: z
                .number({ error: "« range.max » doit être un nombre." })
                .positive({ error: "« range.max » doit être positif." }),
            },
            { error: "« range » doit s'écrire { min, max }." },
          )
          .refine((range) => range.min <= range.max, {
            error: "« range.min » doit être inférieur ou égal à « range.max ».",
          })
          .optional(),
        // Chemin relatif au YAML, vers un fichier de src/assets/items/.
        // `image()` ne refuse un fichier absent qu'au build, avec un message
        // anglais qui ne nomme pas le champ : on le vérifie donc avant.
        image: z
          .preprocess((path, context) => {
            if (typeof path === "string" && !isKnownImage(path)) {
              context.addIssue({
                code: "custom",
                message: `« image » : fichier introuvable (${path}).`,
              });
            }
            return path;
          }, image())
          .optional(),
        note: z.string({ error: "« note » doit être du texte." }).optional(),
        priority: z
          .enum(["high"], {
            error: "« priority » n'accepte que la valeur « high ».",
          })
          .optional(),
        // Ajouté par le loader, jamais écrit dans le YAML.
        fileOrder: z.number().int(),
        category: z.enum(CATEGORIES, {
          error: `« category » est requis, parmi : ${CATEGORIES.join(", ")}.`,
        }),
      })
      .refine((item) => item.price !== undefined || item.range !== undefined, {
        error: "Renseigner « price » ou « range » (au moins l'un des deux).",
        path: ["price"],
      }),
});

export const collections = { wishlist };
