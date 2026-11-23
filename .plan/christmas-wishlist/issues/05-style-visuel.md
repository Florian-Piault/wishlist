# Style visuel sobre de Noël

Type: prototype
Status: resolved

## Question

À quoi ressemble « sobre aux couleurs de Noël » : palette (rouge, vert sapin, crème, or ?), typographie, mise en page des cartes d'éléments (titre, prix, image, lien), mobile d'abord, mode sombre ou non ? Un prototype HTML statique avec quelques éléments factices sert de base de réaction.

## Answer

Variante **B · Catalogue** du [prototype](../prototypes/style-visuel/README.md) (`index.html?variant=B`), retenue parmi trois (cartes papier, catalogue, nuit d'hiver).

### Mise en page

- Mobile d'abord, colonne unique centrée, largeur max ~760 px.
- En-tête : grand titre serif « Liste de *Noël* » (« Noël » en italique rouge), puis une ligne de synthèse « N idées, de X à Y € · Prix indicatifs », calculée au build.
- Nav de catégories collante en haut : pastilles défilant horizontalement, libellé + nombre d'éléments, liens vers les ancres de section.
- Sections par catégorie : numéro `01`, `02`… en petites capitales rouges, puis libellé en serif.
- Une ligne par élément, séparée par un filet. La ligne entière est le lien marchand (nouvel onglet) :
  - vignette carrée à gauche (64 px sur mobile, 88 px dès 600 px), image en `contain` sur fond blanc ;
  - au centre : mention « ★ Très envie » en petites capitales rouges si `priority: high`, titre, note en gris ;
  - à droite : prix en chiffres tabulaires vert sapin, flèche ↗ dessous.
- Pied de page discret « Joyeux Noël. ».

### Palette (jetons CSS)

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

Le rouge reste un accent (titre, numéros, « très envie ») : le vert est réservé aux prix.

### Typographie

- Titres : Instrument Serif (Google Fonts, à auto-héberger au build).
- Texte : Inter.

### Mode sombre

Oui, automatique via `prefers-color-scheme`, sans bouton de bascule (pas de JS client, cf. ticket 03).

### Repli sans image

Icône Lucide de la catégorie (ticket 04), couleur « secondaire », sur le fond de repli ci-dessus, sans bordure.
