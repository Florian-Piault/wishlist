# Wishlist de Noël

## Problem Statement

Chaque année, mes proches me demandent quoi m'offrir à Noël. Je réponds au coup par coup, par messages, avec des liens éparpillés, des prix approximatifs et des idées oubliées d'une conversation à l'autre. Il n'existe aucun endroit unique, toujours à jour, où l'on puisse voir d'un coup d'œil ce qui me ferait plaisir, à quel prix et où l'acheter. Les services de listes existants imposent un compte, de la publicité ou des fonctions dont je n'ai pas besoin (réservation, listes multiples).

## Solution

Un petit site statique en lecture seule, sobre et aux couleurs de Noël, qui présente ma liste d'envies. Je le partage à mes proches par un simple lien, sans compte ni authentification, et il n'est pas indexé par les moteurs de recherche.

- Le site regroupe les idées par catégorie. Pour chacune, il affiche un titre, une image (ou une icône de repli), un prix indicatif (exact ou fourchette), une éventuelle note et un lien vers le marchand.
- J'ajoute ou retire une idée en modifiant un seul fichier de données versionné. Le build refuse toute donnée invalide.
- Je publie en lançant à la main un workflow GitHub, qui vérifie, construit et déploie le site sur GitHub Pages.

## User Stories

### Consulter la liste (proches)

1. As a proche, I want to open the wishlist from a link someone sent me, so that I can see what to offer without creating an account.
2. As a proche, I want the page to read comfortably on my phone, so that I can browse it from a messaging app.
3. As a proche, I want a summary line at the top ("N idées, de X à Y €"), so that I immediately grasp how many ideas there are and the budget range.
4. As a proche, I want to be told that prices are indicative, so that I am not surprised if the shop price differs.
5. As a proche, I want ideas grouped by category (livres, jeux, tech, maison, vêtements, divers), so that I can go straight to the kind of gift I have in mind.
6. As a proche, I want a sticky category bar with the number of ideas per category, so that I can jump to a section from anywhere on the page.
7. As a proche, I want categories numbered and always in the same order, so that the page feels stable from one visit to the next.
8. As a proche, I want the ideas the owner wants most to appear first in their category, marked "★ Très envie", so that I can prioritize.
9. As a proche, I want ideas then sorted by increasing price, so that I can find something that fits my budget.
10. As a proche, I want to see a single price or a price range ("de X à Y €"), so that I know the expected cost even when it varies by model or shop.
11. As a proche, I want to see a picture of each item, whole and undistorted, so that I recognize exactly what is meant.
12. As a proche, I want a clear category icon when an item has no picture, so that the list still looks tidy.
13. As a proche, I want to read the owner's short note on an item (size, color, edition…), so that I buy the right variant.
14. As a proche, I want to tap anywhere on an item row to open the merchant page in a new tab, so that I can buy it without losing the list.
15. As a proche, I want the page to follow my device's light or dark mode, so that it is comfortable to read at night.
16. As a proche, I want the page to load fast even on a mobile connection, so that I do not wait for large images.
17. As a proche using a screen reader, I want item images described by their title and decorative icons ignored, so that the list is understandable without seeing it.
18. As a proche, I want the page in French, so that I read it in my language.
19. As a proche, I want the shared link to show a preview in my messaging app (title "Wishlist de Florian pour Noël 2026" and a Christmas tree image), so that I know what the link is before opening it.
20. As a proche, I want a recognizable star icon in my browser tab, so that I find the list among my open tabs.

### Tenir la liste (propriétaire)

21. As the owner, I want all ideas in one YAML file keyed by slug, so that adding an item is a trivial, reviewable edit.
22. As the owner, I want each item to require a title, a merchant URL, a category and either a price or a range, so that no incomplete item gets published.
23. As the owner, I want the build to fail when a field is missing, a URL is not http(s), a range has min above max, or a category is unknown, so that mistakes never reach my relatives.
24. As the owner, I want `price` to win when I fill both `price` and `range`, so that I can refine an item without deleting the range first.
25. As the owner, I want to drop a product image into the repository and reference it from the item, so that pictures never break when a shop changes its URLs.
26. As the owner, I want the build to fail if a referenced image file is missing, so that I never publish a broken picture.
27. As the owner, I want images optimized automatically (AVIF/WebP, two widths, lazy-loaded), so that I do not have to resize them by hand.
28. As the owner, I want to mark an item `priority: high`, so that my strongest wishes stand out.
29. As the owner, I want to add an optional plain-text note, safely escaped, so that I can give details without breaking the page.
30. As the owner, I want to simply delete an item once received, so that the list stays a single living list with no notion of year.
31. As the owner, I want to preview the site locally with the dev server, so that I check the rendering before publishing.
32. As the owner, I want Prettier to format the YAML and Astro files, so that the data file stays readable.
33. As the owner, I want the pinned Node and pnpm versions to match between my machine and the CI, so that a local build predicts the CI build.

### Publier (propriétaire)

34. As the owner, I want to publish by manually triggering a GitHub workflow, so that nothing goes live without my decision.
35. As the owner, I want only `main` to be deployable, so that I never publish an unmerged state.
36. As the owner, I want the workflow to check formatting, types and schema before building, so that a broken state is never deployed.
37. As the owner, I want two runs never to deploy concurrently and a running deployment never to be cancelled, so that the site is never left half-published.
38. As the owner, I want the workflow to need no secret, so that there is nothing to configure or rotate.
39. As the owner, I want the published URL shown in the workflow run, so that I can open it right after deploying.
40. As the owner, I want to recover from a bad deployment by re-running the workflow on a healthy commit, so that rollback needs no extra tooling.
41. As the owner, I want the site kept out of search engines, so that only people with the link find my list.

## Implementation Decisions

### Stack

- Astro avec une sortie 100 % statique et aucun JS côté client. Pas de bascule de thème, la nav collante est en CSS pur.
- pnpm ; version de Node LTS épinglée par `.nvmrc` et `engines`, que la CI lit aussi.
- Qualité : Prettier (YAML, `.astro`), `astro check`, `astro build`.
- Site en français uniquement. Les clés de données sont en anglais, les libellés en français vivent dans le code.

### Données

- Un seul fichier YAML, chargé par le `file()` loader d'une Content Collection et validé par un schéma Zod.
- Le fichier est une map dont les clés sont des slugs : YAML garantit leur unicité, et le slug sert d'ancre.
- Champs :
  - `title` : chaîne non vide, requise.
  - `url` : un seul lien http(s), requis.
  - `price` (nombre, en euros) et/ou `range: { min, max }` : l'un des deux est requis ; `min > max` est refusé ; si les deux sont remplis, `price` l'emporte.
  - `image` : optionnelle, chemin relatif vers un fichier du dossier d'images des éléments, validé par le helper `image()`.
  - `note` : optionnelle, texte brut échappé à l'affichage.
  - `priority` : optionnelle ; seule valeur, `high`.
  - `category` : requise, enum fermé `books, games, tech, home, clothing, misc`. L'ordre de l'enum fixe l'ordre d'affichage, et le code associe un libellé français et une icône à chaque valeur.
- Il n'y a qu'une liste vivante, sans année : un élément reçu est supprimé du fichier.

### Tri et synthèse (calculés au build)

- Les groupes de catégories suivent l'ordre de l'enum ; une catégorie vide n'est pas affichée.
- Dans un groupe, l'ordre est : `high` d'abord, puis le prix effectif croissant (`price`, sinon `range.min`), puis l'ordre du fichier à égalité.
- Synthèse d'en-tête : « N idées, de X à Y € · Prix indicatifs ». X est le plus petit prix effectif ; Y est le plus grand prix (`price`, sinon `range.max`).

### Images

- Les images sont des fichiers versionnés dans le dépôt, jamais des URL distantes. Le poids des fichiers sources n'est pas limité.
- Elles sont rendues par le composant `<Picture>` d'Astro : AVIF et WebP avec repli, largeurs d'environ 400 et 800 px, `loading="lazy"`, dimensions explicites.
- La zone image est carrée, en `object-fit: contain` sur fond blanc, et `alt` reprend le `title` de l'élément.
- Sans image, on affiche l'icône Lucide de la catégorie, en SVG inline au build : `book`, `gamepad-2`, `monitor`, `home`, `shirt`, `gift`. Elle prend la couleur « secondaire » sur le fond de repli, sans bordure, avec `alt=""`.

### Style visuel

Variante « B · Catalogue » du [prototype](prototypes/style-visuel/README.md), détaillée au [ticket 05](issues/05-style-visuel.md).

- Mise en page :
  - mobile d'abord, une colonne centrée d'environ 760 px au plus ;
  - grand titre serif « Liste de *Noël* » (Noël en italique rouge), puis la ligne de synthèse ;
  - nav de catégories collante : pastilles défilant horizontalement, avec libellé et nombre d'éléments ;
  - sections numérotées `01`, `02`… en petites capitales rouges ;
  - pied de page « Joyeux Noël. ».
- Une ligne par élément, séparée par un filet. Toute la ligne est un lien marchand qui s'ouvre dans un nouvel onglet :
  - vignette carrée à gauche (64 px, 88 px dès 600 px de large) ;
  - au centre, la mention « ★ Très envie », le titre et la note ;
  - à droite, le prix en chiffres tabulaires vert sapin, avec une flèche ↗ dessous.
- Palette en jetons CSS ; le mode sombre est automatique via `prefers-color-scheme`.

  | Jeton | Clair | Sombre |
  |---|---|---|
  | fond | `#FBFAF7` | `#141413` |
  | texte | `#1C1B19` | `#ECEAE4` |
  | secondaire | `#76726A` | `#99958C` |
  | rouge (accent) | `#B3262E` | `#E86A6F` |
  | vert sapin (prix) | `#24563F` | `#86C3A1` |
  | filets | `#E7E3DA` | `#2A2926` |
  | fond du repli d'image | `#F0EDE6` | `#1F1E1C` |
  | pastilles de nav | `#F1EEE7` | `#22211E` |

- Le rouge reste un accent (titre, numéros, « très envie ») ; le vert est réservé aux prix.
- Typographie : Instrument Serif pour les titres, Inter pour le texte, toutes deux auto-hébergées au build et sans appel à Google Fonts au runtime.

### Partage et favicon

- Favicon : l'icône Lucide `star` en SVG, dans le rouge d'accent (`#B3262E`), référencée sous le `base`.
- Métadonnées de partage dans le layout :
  - `og:title` et `<title>` : « Wishlist de Florian pour Noël 2026 » ;
  - `og:type` `website`, `og:locale` `fr_FR` ;
  - `og:url` et `og:image` en URL absolues (`site` + `base`) ;
  - `twitter:card` `summary_large_image`.
- Image Open Graph :
  - icône Lucide `tree-pine` (sapin), préférée à `gift` qui sert déjà de repli pour la catégorie « divers » ;
  - en vert sapin, centrée sur le fond clair `#FBFAF7` ;
  - PNG 1200 × 630 versionné dans le dépôt : les messageries n'acceptent pas le SVG.
- Le titre contient l'année : c'est la seule mention d'année du site. Il faut le mettre à jour à la main d'une saison à l'autre, puisque la liste elle-même n'a pas de notion d'année.

### Hébergement

- GitHub Pages, depuis un dépôt public nommé `wishlist`, à l'adresse `https://<user>.github.io/wishlist`, sans domaine personnalisé.
- Configuration Astro : `site` = `https://<user>.github.io`, `base` = `/wishlist`. Astro refuse `<user>` (URL invalide) : `astro.config.mjs` porte le placeholder `https://user.github.io` jusqu'à ce que le vrai nom soit renseigné. Tous les liens internes (ancres, polices, images, favicon) passent par ce `base`.
- Non-indexation : le layout porte une meta `robots` `noindex, nofollow`, et le site n'a pas de sitemap. Un `robots.txt` sous `/wishlist/` serait sans effet.
- Le VPS de Hestia n'est pas utilisé.

### Workflow de déploiement

- Déclenché uniquement par `workflow_dispatch`, sans input. Seul `main` est déployable, via la règle de branche de l'environnement `github-pages`.
- `concurrency` : groupe `pages`, sans annulation du déploiement en cours.
- Permissions : `contents: read`, `pages: write`, `id-token: write`. Aucun secret.
- Job `build` :
  1. checkout ;
  2. pnpm, puis Node à la version de `.nvmrc`, avec le cache pnpm ;
  3. `install --frozen-lockfile` ;
  4. `prettier --check` ;
  5. `astro check` ;
  6. `astro build` ;
  7. upload de l'artefact Pages (`dist/`).

  Ces étapes sont écrites explicitement, sans `withastro/action`.
- Job `deploy` : dépend de `build`, publie avec `actions/deploy-pages` et expose `page_url` comme URL de l'environnement.
- Le statut de `deploy-pages` fait foi : pas de smoke test ni de rollback automatique. On récupère d'un mauvais déploiement en relançant le workflow sur un commit sain.
- Réglage manuel unique : Settings → Pages → Source = « GitHub Actions ».

## Testing Decisions

- Aucun test automatisé : c'est un choix explicite pour un site personnel de cette taille.
- Les garde-fous viennent de la chaîne de build, rejouée à l'identique en local et en CI :
  - le schéma Zod refuse les données invalides : champ requis manquant, URL non http(s), `min > max`, catégorie inconnue, prix et fourchette absents tous les deux ;
  - le helper `image()` refuse une image référencée manquante ;
  - `astro check` contrôle les types, et `prettier --check` le formatage.
- La vérification visuelle se fait au dev server avant de publier : ordre des catégories et des éléments, synthèse, badge « Très envie », repli d'icône, mode sombre, affichage mobile.
- Il n'existe pas encore de tests dans le dépôt, donc aucun antécédent à suivre.

## Out of Scope

- Réservation ou marquage d'un cadeau par un proche : le site est en lecture seule.
- Plusieurs listes ou plusieurs personnes.
- Authentification, interface d'administration, édition en ligne : les éléments s'ajoutent via le code.
- Historique par année.
- Domaine personnalisé et hébergement sur le VPS de Hestia.
- JS côté client, y compris un bouton de bascule de thème.
- Déploiement automatique sur push, smoke test et rollback automatisé après déploiement.
- Tests automatisés.

## Further Notes

- Le [ticket 01](issues/01-servir-un-second-site-sur-le-vps.md), une recherche sur l'hébergement VPS, est obsolète et reste conservé pour mémoire.
- Le prototype de style (`prototypes/style-visuel/index.html?variant=B`) sert de référence visuelle : données factices conformes au schéma, repli d'icônes, thèmes clair et sombre.
