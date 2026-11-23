# Découpage de la wishlist de Noël en lots

> Référence : [spec](spec.md) et [carte](map.md) — 23/11/2026

## Principes

- Chaque lot laisse une application qui démarre (`pnpm dev`) et apporte quelque chose d'utilisable ou de vérifiable.
- **Commande de vérification** : un lot est terminé quand `pnpm check` passe en local. Ce script, posé en L0, enchaîne `prettier --check .`, `astro check` et `astro build`, exactement comme la CI. Le dossier `.plan/` est hors Prettier (`.prettierignore`).
- **Seams de test** : aucun test automatisé (choix de la spec). Les garde-fous sont dans la chaîne de build : le schéma Zod refuse une donnée invalide, le helper `image()` une image manquante, `astro check` les types, Prettier le formatage. Une règle de données se prouve donc en cassant volontairement `src/data/wishlist.yaml` et en constatant l'échec de `pnpm check`, puis en rétablissant le fichier. Le rendu se vérifie à la main au dev server, en clair et en sombre, en largeur mobile et bureau.
- **Règles avant écrans** : le schéma, les catégories (ordre, libellés, icônes), le tri, le prix effectif et la synthèse sont posés en L1, dans `src/content.config.ts` et `src/lib/`, avant la page qui les affiche. Les lots d'écran ne recalculent rien : ils lisent les fonctions de `src/lib/wishlist.ts`.
- **Fichiers disjoints** : le workflow (L2) vit dans `.github/`, le partage (L5) dans `src/components/ShareMeta.astro` et `public/`, les règles (L1) dans `src/content.config.ts`, `src/data/` et `src/lib/`. Le seul point chaud est `src/layouts/Layout.astro` : L3 y ajoute les polices et la feuille de style, L5 une ligne `<ShareMeta />`. Ces deux modifications restent courtes.
- **Isolation** : aucun lot ne déploie depuis la machine locale ; seul le workflow GitHub publie. Le build n'écrit que dans `dist/` et `.astro/` du dossier courant, si bien que deux copies (worktrees) tournent côte à côte avec `pnpm dev --port 4322` pour la seconde.
- Un lot qui s'écarte de la spec amende `spec.md` dans le même commit.
- Ids de lot uniques dans le dépôt : commits `<type>: L<n> — <Titre>`.
- Taille relative : **S** (quelques jours), **M** (environ 1 semaine), **L** (environ 2 semaines).

## Vue d'ensemble

```
L0 Socle ──┬──► L1 Données et règles ──► L3 Page catalogue ──► L4 Images produit
           ├──► L2 Workflow de déploiement
           └──► L5 Partage et favicon
```

| Lot | Contenu | Taille | Dépend de |
|---|---|---|---|
| L0 | Socle du dépôt et du projet Astro | S | — |
| L1 | Données, schéma et règles de tri | S | L0 |
| L2 | Workflow de déploiement manuel | S | L0 |
| L3 | Page catalogue | M | L1 |
| L4 | Images produit | S | L3 |
| L5 | Partage et favicon | S | L0 |

Vagues possibles : L0, puis **L1, L2 et L5 en parallèle**, puis L3, puis L4. L3 et L4 restent en série : tous deux modifient la ligne d'élément (`src/components/ItemRow.astro`), L4 y remplaçant la vignette d'icône par `<Picture>` quand l'élément a une image. L5 peut rejoindre la vague de L3 s'il a pris du retard, car leurs modifications de `Layout.astro` sont courtes et séparées.

---

## L0 — Socle du dépôt et du projet Astro (S)

**Objectif** : un dépôt versionné et un site Astro vide qui se construit avec toute la chaîne de vérification. Spec : « Stack », « Hébergement » (configuration Astro, non-indexation) ; détail dans [Stack et format des données](issues/03-stack-et-format-des-donnees.md) et [Choisir l'intégration au serveur](issues/02-choisir-integration-serveur.md).

- `git init`, branche `main`, premier commit contenant le `.plan/` existant seul.
- Projet Astro en sortie statique, TypeScript strict, aucun JS client (pas d'îlot, pas d'intégration client).
- pnpm épinglé par `packageManager` ; Node LTS épinglé par `.nvmrc` et `engines`, à la même version.
- Prettier avec `prettier-plugin-astro`, réglé pour formater `.astro`, `.ts`, `.yaml`, `.md` ; `.prettierignore` pour `dist/`, `.astro/`, `pnpm-lock.yaml`.
- `@astrojs/check` et `typescript` en dépendances de développement.
- Scripts : `dev`, `build`, `format` (`prettier --write .`), `check` (`prettier --check . && astro check && astro build`).
- `astro.config.mjs` : `site: 'https://<user>.github.io'`, `base: '/wishlist'`, aucune intégration sitemap. Le nom d'utilisateur GitHub vit à ce seul endroit.
- `src/layouts/Layout.astro` : `<html lang="fr">`, `<meta charset>`, viewport, `<title>` « Wishlist de Florian pour Noël 2026 », `<meta name="robots" content="noindex, nofollow">`, un `<slot />`.
- `src/pages/index.astro` : page provisoire « Liste de Noël » dans le layout.
- `.gitignore` (`node_modules/`, `dist/`, `.astro/`).
- `CLAUDE.md`, écrit avec le skill `writing-for-agents` : commande de vérification, structure des dossiers, règle « tout lien interne passe par `import.meta.env.BASE_URL` », données en anglais et libellés français dans le code, pas de JS client, pas de tests automatisés et comment prouver une règle en cassant le YAML.
- `CODING_STANDARDS.md` : TypeScript strict, logique de données en fonctions pures dans `src/lib/`, composants `.astro` sans calcul métier, jetons CSS plutôt que couleurs en dur, formatage par Prettier uniquement.

**Vérification à la main**
- `git log` montre le commit du `.plan/` puis celui du socle.
- `pnpm dev` sert la page provisoire sous `http://localhost:4321/wishlist/`, avec `lang="fr"` et la meta `robots` dans le HTML.
- `dist/` ne contient ni `sitemap*.xml` ni `<script>` dans `index.html`.
- Un fichier volontairement mal formaté fait échouer `pnpm check` à l'étape Prettier.
- `pnpm check` passe.

## L1 — Données, schéma et règles de tri (S)

**Objectif** : le propriétaire tient sa liste dans un seul YAML que le build refuse dès qu'il est invalide, et le tri et la synthèse sont calculés. Spec : « Données », « Tri et synthèse », user stories 21 à 26, 28 à 30 ; détail dans [Stack et format des données](issues/03-stack-et-format-des-donnees.md) et [Gestion des images](issues/04-gestion-des-images.md) (partie « Source et référence »).

- `src/content.config.ts` : collection `wishlist` chargée par `file('src/data/wishlist.yaml')`, map clée par slug. Schéma Zod :
  - `title` chaîne non vide, `url` URL au protocole `http:` ou `https:` ;
  - `price` nombre positif optionnel, `range: { min, max }` optionnel avec `min <= max` ; refus quand ni l'un ni l'autre n'est présent ;
  - `image` optionnelle via le helper `image()` (fichiers de `src/assets/items/`) ;
  - `note` chaîne optionnelle, `priority` enum `['high']` optionnelle, `category` enum fermé `books, games, tech, home, clothing, misc`.
  - Messages d'erreur en français, qui nomment le champ.
- `src/lib/categories.ts` : l'enum des catégories dans l'ordre d'affichage, et pour chacune son libellé français (Livres, Jeux, Tech, Maison, Vêtements, Divers) et le nom de son icône Lucide (`book`, `gamepad-2`, `monitor`, `home`, `shirt`, `gift`). Le schéma importe l'enum d'ici.
- `src/lib/wishlist.ts`, fonctions pures :
  - prix effectif (`price`, sinon `range.min`) et prix haut (`price`, sinon `range.max`) ; `price` l'emporte quand les deux sont remplis ;
  - groupement par catégorie dans l'ordre de l'enum, catégories vides omises, avec le nombre d'éléments par groupe ;
  - tri dans un groupe : `high` d'abord, puis prix effectif croissant, puis ordre du fichier (tri stable) ;
  - synthèse : nombre d'idées, plus petit prix effectif, plus grand prix haut ;
  - formatage en euros (`Intl.NumberFormat('fr-FR')`, sans décimales pour un montant entier) d'un prix seul ou d'une fourchette « de X à Y € ».
- `src/data/wishlist.yaml` d'exemple couvrant les cas : un `high`, une fourchette, un élément avec `price` et `range`, une note contenant `<b>` et `&`, une image dans `src/assets/items/`, une catégorie laissée vide. Le propriétaire le remplace par sa vraie liste.
- `src/pages/index.astro` affiche provisoirement la synthèse puis, par groupe, le libellé, le nombre et les éléments triés (titre et prix formaté) en HTML brut, pour vérifier les règles.

**Vérification à la main**
- Page provisoire : catégories dans l'ordre de l'enum, catégorie vide absente, `high` en tête de son groupe puis prix croissants, l'élément `price` + `range` affiché et trié à son `price`, synthèse « N idées, de X à Y € » juste.
- `pnpm check` échoue, avec un message qui nomme le champ, pour chacune de ces modifications du YAML, rétablies ensuite : `title` retiré ; `url: ftp://…` ; `range: { min: 50, max: 20 }` ; ni `price` ni `range` ; `category: sport` ; `image` vers un fichier absent.
- `pnpm check` passe.

## L2 — Workflow de déploiement manuel (S)

**Objectif** : le propriétaire publie en lançant un workflow GitHub qui vérifie, construit et déploie sur Pages. Spec : « Workflow de déploiement », user stories 33 à 40 ; détail dans [Workflow CI manuel](issues/06-workflow-ci-manuel.md).

- `.github/workflows/deploy.yml` :
  - `on: workflow_dispatch` sans input ; `concurrency: { group: pages, cancel-in-progress: false }` ; permissions `contents: read`, `pages: write`, `id-token: write` ;
  - job `build` : `actions/checkout`, `pnpm/action-setup` (version lue dans `packageManager`), `actions/setup-node` avec `node-version-file: .nvmrc` et `cache: pnpm`, `pnpm install --frozen-lockfile`, `pnpm exec prettier --check .`, `pnpm exec astro check`, `pnpm exec astro build`, `actions/upload-pages-artifact` sur `dist/` ; étapes écrites explicitement, sans `withastro/action` ;
  - job `deploy` : `needs: build`, environnement `github-pages` avec `url: ${{ steps.deployment.outputs.page_url }}`, `actions/deploy-pages` (`id: deployment`).
  - Actions épinglées à une version majeure existante.
- Aucun secret référencé.
- Section « Publier » dans `CLAUDE.md` : réglage unique Settings → Pages → Source = « GitHub Actions », règle de branche `main` de l'environnement `github-pages`, reprise d'un mauvais déploiement en relançant le workflow sur un commit sain.

**Vérification à la main**
- Le YAML du workflow est valide (`actionlint` s'il est installé, sinon relecture des clés contre la doc des actions).
- Les quatre commandes du job `build` passent en local dans cet ordre, sur une installation `pnpm install --frozen-lockfile` propre.
- Une fois le dépôt poussé sur GitHub par le propriétaire : le workflow ne se lance qu'à la main, refuse une autre branche que `main`, et le run affiche l'URL publiée.
- `pnpm check` passe.

## L3 — Page catalogue (M)

**Objectif** : les proches consultent la liste dans la variante « Catalogue », sur mobile comme sur bureau, en clair comme en sombre. Spec : « Style visuel », « Images » (repli sans image), user stories 2 à 10, 12 à 15, 17, 18 ; détail dans [Style visuel sobre de Noël](issues/05-style-visuel.md), référence visuelle dans le [prototype](prototypes/style-visuel/README.md) (`index.html?variant=B`).

- `src/styles/global.css` : jetons CSS de la palette (tableau de la spec), redéfinis sous `@media (prefers-color-scheme: dark)` ; colonne centrée d'environ 760 px ; aucun JS.
- Polices auto-hébergées au build : Instrument Serif pour les titres, Inter pour le texte (paquets Fontsource ou API Fonts d'Astro), servies sous le `base`. Ajout dans `Layout.astro` des imports de polices et de la feuille de style.
- `src/pages/index.astro` réécrit à partir des fonctions de L1 :
  - en-tête « Liste de *Noël* » (Noël en italique rouge) et synthèse « N idées, de X à Y € · Prix indicatifs » ;
  - `src/components/CategoryNav.astro` : nav collante en CSS (`position: sticky`), pastilles défilant horizontalement avec libellé et nombre, liens vers les ancres de section préfixées par `BASE_URL` ;
  - `src/components/CategorySection.astro` : numéro `01`, `02`… en petites capitales rouges, libellé en serif, ancre = valeur de catégorie ;
  - pied de page « Joyeux Noël. ».
- `src/components/ItemRow.astro` : la ligne entière est un `<a href={url} target="_blank" rel="noopener noreferrer">`, séparée par un filet ; vignette carrée (64 px, 88 px dès 600 px) ; au centre « ★ Très envie » en petites capitales rouges si `priority: high`, le titre et la note (texte échappé par Astro, jamais `set:html`) ; à droite le prix formaté en chiffres tabulaires vert sapin, avec ↗ dessous.
- `src/components/CategoryIcon.astro` : icône Lucide de la catégorie en SVG inline au build (`@lucide/astro`), couleur « secondaire » sur le fond de repli, sans bordure, `aria-hidden="true"`. Pour l'instant, toutes les vignettes affichent cette icône.

**Vérification à la main**
- Au dev server, avec le YAML d'exemple : ordre des catégories et des éléments identique à la page provisoire de L1, badge « ★ Très envie » sur l'élément `high`, nombres de la nav justes, synthèse juste.
- En largeur 375 px : pas de défilement horizontal de la page, la nav défile seule et reste collée en haut ; un clic sur une pastille amène à la bonne section.
- La note avec `<b>` et `&` s'affiche en texte littéral.
- Toute la surface de la ligne ouvre le marchand dans un nouvel onglet.
- En passant le système en sombre, la page bascule sur la palette sombre sans rechargement.
- Le HTML de `dist/` ne contient aucun `<script>` ni aucune URL `fonts.googleapis.com` ou `fonts.gstatic.com` ; les fichiers de police sont sous `dist/` et chargés depuis `/wishlist/`.
- VoiceOver lit le titre de chaque élément et ignore les icônes.
- Comparaison côte à côte avec le prototype `?variant=B` : mêmes proportions et mêmes couleurs.
- `pnpm check` passe.

## L4 — Images produit (S)

**Objectif** : chaque élément illustré montre sa photo entière, optimisée, sans ralentir la page. Spec : « Images », user stories 11, 16, 17, 25 à 27 ; détail dans [Gestion des images](issues/04-gestion-des-images.md) (partie « Rendu »).

- Dans `ItemRow.astro`, quand l'élément a une `image` : composant `<Picture>` d'Astro, formats `['avif', 'webp']` avec repli, largeurs d'environ 400 et 800 px, `sizes` calé sur la vignette (64 et 88 px en CSS, densité ×2 et plus), `loading="lazy"`, `decoding="async"`, dimensions explicites, `alt` = `title` de l'élément.
- Zone image carrée, `object-fit: contain` sur fond blanc (en clair comme en sombre), pour que le produit soit toujours entier.
- Sans image, `CategoryIcon` reste affiché, comme en L3.
- `src/assets/items/` reçoit deux images d'exemple de ratios différents (une très large, une très haute) pour vérifier le `contain`.

**Vérification à la main**
- Au dev server : les images large et haute s'affichent entières, sans déformation, centrées sur fond blanc ; les éléments sans image gardent l'icône.
- Dans `dist/_astro/` : variantes AVIF et WebP aux deux largeurs ; le HTML porte `<picture>`, `loading="lazy"`, `width` et `height`.
- Dans les outils réseau du navigateur, en connexion lente simulée : les images sous le pli ne se chargent qu'au défilement.
- VoiceOver lit le titre de l'élément sur chaque image.
- `pnpm check` passe.

## L5 — Partage et favicon (S)

**Objectif** : le lien partagé s'affiche avec un titre et un sapin dans les messageries, et l'onglet porte une étoile. Spec : « Partage et favicon », user stories 19 et 20.

- `public/favicon.svg` : icône Lucide `star` en rouge d'accent `#B3262E`.
- `public/og.png` : PNG 1200 × 630, icône Lucide `tree-pine` en vert sapin `#24563F` centrée sur `#FBFAF7`. Généré une fois par `scripts/og-image.mjs` (avec `sharp`, déjà présent via Astro) et versionné ; le script reste dans le dépôt pour le régénérer.
- `src/components/ShareMeta.astro` : `og:title` « Wishlist de Florian pour Noël 2026 », `og:type` `website`, `og:locale` `fr_FR`, `og:url` et `og:image` en URL absolues construites depuis `Astro.site` et `BASE_URL`, `twitter:card` `summary_large_image`, `<link rel="icon" type="image/svg+xml">` sous le `base`.
- Une ligne `<ShareMeta />` dans le `<head>` de `Layout.astro`.

**Vérification à la main**
- `dist/index.html` porte `og:url` = `https://<user>.github.io/wishlist/` et `og:image` = `https://<user>.github.io/wishlist/og.png`.
- `dist/og.png` mesure 1200 × 630 et montre le sapin vert centré.
- Au dev server, l'onglet affiche l'étoile rouge.
- Après la première publication : l'aperçu du lien dans une messagerie (ou un validateur Open Graph) montre le titre et le sapin.
- `pnpm check` passe.

## Risques

- **Nom d'utilisateur GitHub inconnu** (L0, L5) : la spec garde `<user>`. L0 l'isole dans `astro.config.mjs` ; tant qu'il n'est pas renseigné, `og:url` et `og:image` sont fausses. Le propriétaire le fournit avant la première publication.
- **Mise en ligne hors des lots** (L2) : créer le dépôt public `wishlist`, le pousser, régler Pages sur « GitHub Actions » et lancer le premier run sont des gestes du propriétaire sur GitHub. Le workflow n'est donc vérifié de bout en bout qu'à ce moment ; si le premier run échoue, on corrige dans un commit de suivi de L2.
- **Icône `home` de Lucide** (L1, L3) : Lucide a renommé `home` en `house` et garde `home` comme alias. Si `@lucide/astro` n'exporte plus l'alias, L3 utilise `house` et amende la spec.
- **Polices auto-hébergées sous `base`** (L3) : selon la méthode choisie, les URL de police peuvent ignorer `/wishlist/` et casser en production seulement. La vérification sur `dist/` de L3 est là pour ça ; servir `dist/` sous `/wishlist/` (`astro preview`) le confirme.
- **Pas de tests automatisés** (tous) : un tri ou une synthèse faux ne casse aucun build. Les règles sont concentrées dans `src/lib/wishlist.ts` pour qu'une relecture suffise, et le YAML d'exemple de L1 couvre chaque cas ; si une régression apparaît, ajouter Vitest sur ces fonctions pures demande d'amender la spec.
