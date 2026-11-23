# Workflow CI manuel

Type: grilling
Status: resolved
Blocked by: 02, 03

## Question

Que fait le workflow GitHub `workflow_dispatch` de bout en bout : étapes de vérification et de build, artefact livré (dossier statique, image Docker sur GHCR…), transfert vers le VPS (rsync/scp en SSH, réutilisation de l'utilisateur `deploy` et d'une clé dédiée), secrets nécessaires, et comment on vérifie que la mise en ligne a réussi ?

## Answer

Le site est publié sur GitHub Pages ([ticket 02](02-choisir-integration-serveur.md)). Il n'y a donc ni VPS, ni SSH, ni image Docker : le transfert se résume à l'artefact Pages.

### Déclenchement

- `.github/workflows/deploy.yml`, déclenché uniquement par `workflow_dispatch`, sans input.
- Seul `main` est déployable : c'est la règle de branche de l'environnement `github-pages`.
- `concurrency: { group: pages, cancel-in-progress: false }` : un déploiement en cours n'est jamais interrompu.
- Permissions : `contents: read`, `pages: write`, `id-token: write`.

### Job `build`

1. `actions/checkout`.
2. `pnpm/action-setup`, puis `actions/setup-node` avec la version lue dans `.nvmrc` et le cache pnpm.
3. `pnpm install --frozen-lockfile`.
4. `prettier --check` : un fichier mal formaté (YAML, `.astro`…) bloque.
5. `astro check` : types et schéma Zod.
6. `astro build` : une image référencée manquante ou une donnée invalide bloque.
7. `actions/upload-pages-artifact` sur `dist/`.

Ces étapes sont écrites explicitement, sans `withastro/action`.

### Job `deploy`

- `needs: build` ; environnement `github-pages` avec `url: ${{ steps.deployment.outputs.page_url }}`.
- `actions/deploy-pages`.

### Secrets

Aucun. L'authentification passe par le token OIDC (`id-token: write`).

### Vérification

- Le statut de `deploy-pages` fait foi, sans smoke test supplémentaire. L'URL publiée s'affiche dans le run.
- Pas de rollback automatique : en cas de problème, on relance le workflow depuis un commit sain de `main`.

### Réglage unique

Dans le dépôt, Settings → Pages → Source = « GitHub Actions ».
