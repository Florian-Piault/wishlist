// Liens internes construits depuis le `base` du site (« /wishlist »). Astro
// rend `BASE_URL` avec ou sans barre finale selon `trailingSlash` : on la
// normalise pour qu'un lien ne casse jamais en production.

/** Lien vers une ancre de la page d'accueil : (« /wishlist », « books ») → « /wishlist/#books ». */
export function anchorHref(base: string, id: string): string {
  return `${base.replace(/\/?$/, "/")}#${encodeURIComponent(id)}`;
}
