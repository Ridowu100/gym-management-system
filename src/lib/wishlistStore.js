import { writable } from 'svelte/store';

export const wishlist = writable([]);

export function addToWishlist(product) {
  wishlist.update(items => {
    if (!items.some(item => item.id === product.id)) {
      return [...items, product];
    }
    return items;
  });
}

export function removeFromWishlist(productId) {
  wishlist.update(items => items.filter(item => item.id !== productId));
}