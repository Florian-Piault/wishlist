# Servir un second site sur le VPS de Hestia

Type: research
Status: obsolete

> Obsolète : la wishlist est hébergée sur GitHub Pages, pas sur le VPS (voir [ticket 02](02-choisir-integration-serveur.md)). La recherche est conservée pour mémoire.

## Question

Le Caddy de Hestia (`~/labs/Hestia`) occupe les ports 80/443 du VPS. Quelles sont les façons concrètes d'y servir un second site statique sur un sous-domaine dédié, et que coûte chacune ?

Une réponse complète décrit, à partir de `compose.yml`, `Caddyfile`, `.github/workflows/deploy.yml` et `scripts/remote-deploy.sh` de Hestia :

- comment le Caddyfile et le compose sont livrés sur le VPS (le déploiement de Hestia écrase-t-il `/opt/hestia/Caddyfile` à chaque tag ?) ;
- les options pour ajouter le site (au moins : fichiers statiques montés dans le Caddy de Hestia ; conteneur de la wishlist sur le réseau Docker de Hestia ; reverse proxy extrait de Hestia et partagé), avec pour chacune les modifications à faire dans le dépôt Hestia, le couplage introduit entre les deux dépôts, et l'effet d'un redéploiement de Hestia sur la wishlist ;
- ce que l'utilisateur SSH `deploy` peut faire (droits sur `/opt`, groupe docker) ;
- les prérequis DNS / HTTPS pour un sous-domaine supplémentaire.

Cette réponse alimente le choix d'intégration ([Choisir l'intégration au serveur](02-choisir-integration-serveur.md)).

## Answer

Sources : dépôt `~/labs/Hestia` (chemins:lignes ci-dessous). Recherche en lecture seule, rien n'a été modifié.

### Comment Hestia est livré

- À chaque tag `v*`, le workflow copie par `scp` `compose.yml` et `Caddyfile` dans `/opt/hestia/` (`deploy.yml:90-94`). Ces deux fichiers sont donc **écrasés à chaque tag** : une modification faite à la main sur le VPS est perdue au tag suivant.
- `remote-deploy.sh` enchaîne les étapes suivantes :
  - réécriture complète de `.env` (l.19-29) ;
  - `docker compose pull`, puis `up -d`, sans `--remove-orphans` (l.31-34) ;
  - `caddy reload` (l.40) ; en cas d'échec, `up -d --force-recreate caddy` (l.41), ce qui coupe tous les sites servis par ce Caddy ;
  - healthcheck sur le seul service `app` (l.44-56) ;
  - en cas d'échec, rollback de l'image uniquement : le nouveau `Caddyfile` et le nouveau `compose.yml` restent en place (l.68-82).
- Le projet compose s'appelle `hestia`, son réseau `hestia_default`. Ses volumes sont `hestia_hestia-data`, `hestia_caddy-data` et `hestia_caddy-config`.

### Les options

- **(a) Fichiers statiques sur le VPS, servis par le Caddy de Hestia (`file_server`).**
  - *Dans Hestia :* ajouter un montage `- /opt/wishlist:/srv/wishlist:ro` sur le service caddy et un bloc `wishlist.fpiault.tech { root * /srv/wishlist/current; file_server }` dans le `Caddyfile`. La première activation demande un tag Hestia, avec une coupure de quelques secondes le temps que caddy soit recréé.
  - *Côté wishlist :* une simple copie (rsync ou scp), sans Docker ni reload.
  - *Un déploiement de la wishlist sur Hestia :* aucun effet.
  - *Un redéploiement de Hestia sur la wishlist :* aucun effet, sauf si le reload de Caddy échoue et que le conteneur est recréé.
  - *Piège du bind mount :* il est lié à l'inode. Il faut basculer un lien symbolique `current` dans le dossier parent monté, ou faire `rsync --delete` dans le répertoire existant, mais jamais `mv` du répertoire monté.
  - *Couplage :* le chemin et le domaine de la wishlist sont écrits en dur dans le dépôt Hestia.
- **(a') Variante hybride.**
  - *Dans Hestia :* un `import /etc/caddy/sites/*` et un montage de `/opt/wishlist/caddy`, ajoutés une seule fois.
  - *Côté wishlist :* elle fournit son propre bloc Caddy, si bien que le domaine ne vit plus dans le dépôt Hestia.
  - *Risque :* un bloc invalide casse la configuration partagée. Le comportement d'un glob sans correspondance reste à vérifier.
- **(b) Conteneur wishlist (caddy ou nginx) sur un réseau partagé, le Caddy de Hestia en reverse proxy.**
  - *Couplage :* identique à (a), avec en plus une image, un conteneur et un réseau.
  - *Réseau :* préférer un réseau externe nommé (`web`) à `hestia_default`. Avec ce dernier, il faudrait démarrer Hestia d'abord, et `compose down` échouerait tant que la wishlist y reste attachée.
  - *Bilan :* aucun gain réel pour un site 100 % statique.
- **(c) Reverse proxy sorti de Hestia, dans un stack partagé (`/opt/proxy`).**
  - *Bénéfice :* vrai découplage des deux projets.
  - *Dans Hestia :* retirer le service caddy et ses volumes, rattacher `app` au réseau `web`, retirer `Caddyfile` du `scp` et le reload Caddy (`remote-deploy.sh:35-41`).
  - *Migration :* elle coupe le service. Copier `caddy-data` pour garder les certificats, puis supprimer le conteneur orphelin.
  - *Bilan :* l'option la plus propre, mais aussi la plus coûteuse et la plus risquée pour Hestia.

### Droits de `deploy`

- `deploy` possède seulement `/opt/hestia` (`DEPLOY.md:56-61`) et appartient au groupe docker.
- Il ne peut pas créer `/opt/wishlist` : il faut lancer une fois, en root, `mkdir -p /opt/wishlist && chown deploy:deploy /opt/wishlist`.
- Il vaut mieux une clé SSH dédiée à la wishlist, ajoutée dans `authorized_keys`, plutôt que de réutiliser celle de Hestia.

### DNS et HTTPS

- DNS : créer un enregistrement A `wishlist.fpiault.tech` → `187.124.44.21`. Si la zone a des enregistrements CAA, ils doivent autoriser Let's Encrypt.
- HTTPS : rien à ajouter, un bloc Caddy sans `http://` suffit pour que Caddy obtienne le certificat seul.
- Ordre : le DNS doit être propagé avant le reload qui active le bloc.

### Synthèse

(a) est le plus simple pour un site statique : une seule modification de Hestia, puis la wishlist se déploie par une simple copie. (c) découple vraiment les deux projets, mais au prix d'une migration.
