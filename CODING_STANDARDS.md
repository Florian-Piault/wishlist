# Règles de code

- **TypeScript strict** : `tsconfig.json` étend `astro/tsconfigs/strict`. Les types se déduisent du schéma de la collection plutôt que d'être réécrits.
- **Logique de données dans `src/lib/`**, en fonctions pures : entrée en paramètre, résultat en retour, sans accès au système de fichiers ni à `astro:content`. La page charge la collection et passe les éléments à ces fonctions.
- **Composants `.astro` sans calcul métier** : ils affichent ce que `src/lib/` leur donne (groupes triés, prix formatés, synthèse).
- **Jetons CSS** : les couleurs viennent des propriétés personnalisées définies dans `src/styles/global.css`, redéfinies en mode sombre ; un composant utilise `var(--…)`, jamais une couleur en dur.
- **Formatage par Prettier uniquement** (`pnpm format`), y compris pour le YAML et le Markdown. Aucun réglage d'éditeur ne s'y substitue. Seule exception : `.plan/`, exclu par `.prettierignore` pour garder le plan tel qu'il a été rédigé.
