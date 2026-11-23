# Prototype : style visuel

Répond au ticket [Style visuel sobre de Noël](../../issues/05-style-visuel.md).

## Question

À quoi ressemble « sobre aux couleurs de Noël » : palette, typographie, mise en page des éléments, mobile d'abord, mode sombre ou non ?

## Lancer

Ouvrir `index.html` dans un navigateur (double-clic). La barre flottante (ou les touches ← →) fait défiler les variantes, le bouton de droite fait tourner le thème (Auto, Clair, Sombre). On peut aussi passer `?variant=A|B|C&theme=auto|light|dark`.

Données factices conformes au schéma du ticket 03 (11 éléments, 6 catégories, tri catégorie → priorité → prix). Les images « produit » sont des dessins SVG de ratios variés pour tester `object-fit: contain`. Sans image, on voit le repli par icône Lucide.

## Variantes

- **A · Carte de vœux** : fond crème, titres serif (Fraunces), vert sapin, rouge pour le badge, filets dorés. Grille de cartes papier, 2 colonnes sur mobile. Toute la carte est un lien.
- **B · Catalogue** : éditorial et dense. Grand titre serif (Instrument Serif), nav de catégories collante, une ligne par élément (vignette, titre, note, prix aligné à droite). Le rouge sert seulement d'accent.
- **C · Nuit d'hiver** : pensée sombre d'abord, vert nuit, flocons discrets, or et rouge, sans-serif (Outfit). Grandes cartes, une par ligne sur mobile, bordure dorée et ruban pour « très envie », bouton explicite « Voir chez le marchand ».

Chaque variante a un thème clair et un thème sombre.

## Verdict

**B · Catalogue** retenue (23/11/2026) : liste dense, une ligne par élément, plutôt que des cartes. Les variantes A et C restent ici pour mémoire. Le détail (palette, typo, structure) est reporté dans la réponse du ticket 05.
