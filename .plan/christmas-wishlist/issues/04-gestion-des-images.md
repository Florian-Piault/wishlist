# Gestion des images

Type: grilling
Status: resolved
Blocked by: 03

## Question

Les images des éléments sont-elles des URL distantes (celles du marchand) ou des fichiers versionnés dans le dépôt ? Faut-il les optimiser au build, et que montrer quand un élément n'a pas d'image ?

## Answer

### Source et référence

- Fichiers versionnés dans `src/assets/items/`, jamais d'URL distante (expiration, hotlinking bloqué).
- Champ `image` optionnel et explicite (`image: ../assets/items/casque-sony.jpg`), validé par le helper `image()` du schéma : un fichier référencé manquant fait échouer le build.
- Aucun garde-fou sur le poids des fichiers sources.

### Rendu

- Composant `<Picture>` d'Astro : AVIF et WebP avec repli, largeurs ~400 et ~800 px, `loading="lazy"`, dimensions fixées.
- Zone image carrée, `object-fit: contain` sur fond neutre : le produit est toujours entier.
- Texte alternatif = `title` de l'élément.

### Repli sans image

- Icône Lucide par catégorie, en SVG inline au build (`@lucide/astro` ou `astro-icon`), sur fond doux : `book`, `gamepad-2`, `monitor`, `house`, `shirt`, `gift` (misc).
- `alt=""` sur ces visuels (décoratifs).
- Couleur du fond à fixer avec le [style visuel](05-style-visuel.md).
