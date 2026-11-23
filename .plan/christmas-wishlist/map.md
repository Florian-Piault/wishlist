# Wishlist de Noël

## Destination

Un spec prêt pour `/to-spec` : site de wishlist de Noël en lecture seule, style sobre aux couleurs de Noël, éléments ajoutés via code, déployé sur GitHub Pages par une CI GitHub lancée manuellement.

## Notes

- Domaine : site web statique personnel. Échanges en français.
- Hébergement : GitHub Pages (`<user>.github.io/wishlist`). Le VPS de Hestia, envisagé d'abord, est abandonné.
- Cadrage acquis lors du chartage : une seule wishlist (la mienne) ; public = proches via lien (non indexé, sans auth) ; aucune réservation ; nouveau dépôt GitHub dédié (public, `wishlist`) ; chaque élément affiche titre, lien marchand, prix indicatif et image.
- Skills : `brainstorm` pour les grillings, `prototype` pour le style visuel.

## Decisions so far

- [Servir un second site sur le VPS de Hestia](issues/01-servir-un-second-site-sur-le-vps.md): obsolète (hébergement sur GitHub Pages), conservé pour mémoire.
- [Choisir l'intégration au serveur](issues/02-choisir-integration-serveur.md): GitHub Pages, `<user>.github.io/wishlist`, dépôt public `wishlist` ; Astro `base: '/wishlist'` ; meta `noindex, nofollow`, sans sitemap.
- [Stack et format des données](issues/03-stack-et-format-des-donnees.md): Astro statique + pnpm, `astro check` ; un `wishlist.yaml` (map par slug, clés anglaises) validé par Zod ; prix `price` ou `range` requis ; `category` enum requis ; `priority: high` optionnelle ; liste unique sans année ; tri catégorie → priorité → prix.
- [Gestion des images](issues/04-gestion-des-images.md): fichiers versionnés dans `src/assets/items/`, champ `image` optionnel validé ; `<Picture>` AVIF/WebP lazy, zone carrée `contain`, alt = titre ; repli = icône Lucide par catégorie.
- [Style visuel sobre de Noël](issues/05-style-visuel.md): variante « Catalogue » du [prototype](prototypes/style-visuel/README.md) ; liste dense une ligne par élément, nav de catégories collante ; fond blanc cassé, rouge en accent, vert sapin pour les prix ; Instrument Serif + Inter ; mode sombre automatique.
- [Workflow CI manuel](issues/06-workflow-ci-manuel.md): `workflow_dispatch` sur `main` seul ; build = install figé, `prettier --check`, `astro check`, `astro build`, upload de `dist/` ; deploy = `deploy-pages` ; aucun secret ; le statut de `deploy-pages` fait foi, pas de rollback.

- Partage et favicon (tranché dans le [spec](spec.md)) : favicon Lucide `star` rouge ; titre et `og:title` « Wishlist de Florian pour Noël 2026 » ; image Open Graph PNG 1200 × 630 avec l'icône `tree-pine`.

## Not yet specified

Rien.

## Out of scope

- Réservation d'un cadeau par un proche : le site est en lecture seule.
- Plusieurs listes / plusieurs personnes.
- Authentification ou interface d'administration : les éléments s'ajoutent via le code.
