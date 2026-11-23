# Stack et format des données

Type: grilling
Status: resolved

## Question

Avec quoi construire le site (HTML/CSS pur généré par un petit script, générateur statique type Astro, SvelteKit en `adapter-static` comme Hestia…) et dans quel format décrire les éléments (JSON, YAML, fichier TypeScript typé, un fichier Markdown par élément) pour qu'ajouter un élément soit une modification triviale, validée au build ?

## Answer

### Stack

- Astro, sortie 100 % statique, sans JS client.
- pnpm, Node LTS épinglé (`.nvmrc` + `engines`).
- Build : `astro check` puis `astro build` ; Prettier pour formater YAML et `.astro`.
- Édition en local dans l'éditeur, rendu vérifié au dev server.
- Site en français uniquement.

### Format des données

- Un seul fichier `src/data/wishlist.yaml`, chargé par le `file()` loader d'une Content Collection et validé par un schéma Zod.
- Map clée par slug (`casque-sony: { … }`) : unicité garantie par YAML, le slug sert d'ancre.
- Clés en anglais :
  - `title` : requis, non vide.
  - `url` : requis, un seul lien http(s).
  - `price` (nombre, euros) et/ou `range: { min, max }` : l'un des deux requis ; `price` l'emporte si les deux sont remplis ; `min > max` refusé.
  - `image` : optionnelle, voir [Gestion des images](04-gestion-des-images.md).
  - `note` : optionnelle, texte brut échappé à l'affichage.
  - `priority` : optionnelle ; absente = normale, `high` = badge « très envie ».
  - `category` : requise, enum fermé `books, games, tech, home, clothing, misc` ; libellés français dans le code ; l'ordre de l'enum fixe l'ordre d'affichage.
- Une seule liste vivante, sans notion d'année : un élément reçu est retiré du fichier.

### Affichage

- Groupes par catégorie dans l'ordre de l'enum.
- Dans un groupe : `high` d'abord, puis prix croissant (prix effectif = `price`, sinon `range.min`), puis ordre du fichier à égalité.
