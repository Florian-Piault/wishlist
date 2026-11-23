# Choisir l'intégration au serveur

Type: grilling
Status: resolved
Blocked by: 01

## Question

Parmi les options relevées par [Servir un second site sur le VPS de Hestia](01-servir-un-second-site-sur-le-vps.md), laquelle retenir pour servir la wishlist, sur quel sous-domaine exact, et quelles modifications acceptes-tu dans le dépôt Hestia ?

## Answer

Aucune des options VPS n'est retenue : la wishlist est hébergée sur **GitHub Pages**. Le dépôt Hestia ne change pas, et le VPS ne sert pas.

### Adresse

- `https://<user>.github.io/wishlist`, sans domaine personnalisé ni DNS.
- Dépôt GitHub public nommé `wishlist` : Pages est gratuit, et le site publié serait de toute façon public.
- Dans `astro.config` : `site: 'https://<user>.github.io'` et `base: '/wishlist'`. Les liens internes (ancres de catégorie, polices auto-hébergées, images) doivent passer par ce `base` (`import.meta.env.BASE_URL` ou les helpers d'Astro).

### Non-indexation

- Le layout porte `<meta name="robots" content="noindex, nofollow">`, sans sitemap.
- Un `robots.txt` placé sous `/wishlist/` ne servirait à rien : les moteurs ne lisent que celui à la racine de `<user>.github.io`.

### Déploiement

Voir [Workflow CI manuel](06-workflow-ci-manuel.md).
