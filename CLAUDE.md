# Wishlist de Noël

Site statique Astro, publié sur GitHub Pages sous `/wishlist/`. Spec et lots : `.plan/christmas-wishlist/`. Règles de code : [CODING_STANDARDS.md](CODING_STANDARDS.md).

## Vérification

`pnpm check` est la seule porte : `prettier --check`, `astro check`, `astro build`, dans l'ordre de la CI. Une tâche est terminée quand il passe. `pnpm format` corrige le formatage.

Le dépôt n'a pas de tests automatisés, par choix de la spec. Une règle de données se prouve en cassant volontairement `src/data/wishlist.yaml` (champ retiré, URL `ftp://`, `min > max`, catégorie inconnue, image absente), en constatant que `pnpm check` échoue avec un message qui nomme le champ, puis en rétablissant le fichier. Le rendu se vérifie au dev server (`pnpm dev`, `http://localhost:4321/wishlist/`), en clair et en sombre, en largeur mobile et bureau. Lancé hors d'un terminal interactif, `astro dev` se détache en démon : `pnpm exec astro dev stop` l'arrête et libère le port.

## Publier

Seul le workflow `.github/workflows/deploy.yml` publie, lancé à la main (`workflow_dispatch`) ; rien ne se déploie depuis la machine locale. Il rejoue `pnpm check` étape par étape, puis publie `dist/` sur GitHub Pages. Aucun secret : l'authentification passe par OIDC.

Réglages côté GitHub, faits une fois par le propriétaire :

- Settings → Pages → Source = « GitHub Actions ». GitHub crée alors en général l'environnement `github-pages`.
- Settings → Environments → `github-pages` : vérifier que la règle de branche est limitée à `main`. Un run lancé depuis une autre branche construit, mais son job `deploy` est refusé.

Le statut de `deploy-pages` fait foi, et le run affiche l'URL publiée. Pas de rollback automatique : un mauvais déploiement se répare en relançant le workflow sur un commit sain de `main`, soit « Re-run all jobs » sur le run de ce commit (possible pendant 30 jours seulement), soit un revert sur `main` suivi d'un nouveau run (seule voie au-delà).

## Structure

- `src/data/wishlist.yaml` (créé en L1) : la liste, seule source de données.
- `src/content.config.ts` (créé en L1) : schéma Zod de la collection.
- `src/lib/` (créé en L1) : règles de catégories, tri, prix et synthèse.
- `src/layouts/`, `src/components/`, `src/pages/` : rendu.
- `astro.config.mjs` : seul endroit qui porte le nom d'utilisateur GitHub (`site`).

## Conventions

- Tout lien interne (ancre, police, image, favicon) se construit depuis `import.meta.env.BASE_URL` : le site vit sous `/wishlist/`, et un chemin absolu `/…` casse en production seulement.
- Clés de données en anglais (`title`, `price`, `category: books`) ; libellés affichés en français, définis dans le code (`src/lib/categories.ts`).
- Sortie 100 % HTML et CSS : zéro `<script>`, zéro îlot ni directive `client:*`. La nav collante et le mode sombre passent par le CSS.
- Texte du YAML rendu par `{…}`, jamais `set:html`.
