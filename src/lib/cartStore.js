import { writable } from 'svelte/store';

const initialCart = typeof window !== 'undefined' 
  ? JSON.parse(localStorage.getItem('cart') || '[]') 
  : [];

export const cart = writable(initialCart);

if (typeof window !== 'undefined') {
  cart.subscribe(value => {
    localStorage.setItem('cart', JSON.stringify(value));
  });
}

export function addToCart(product) {
  cart.update(items => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      return items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    }
    return [...items, { ...product, quantity: 1 }];
  });
}

export function updateQuantity(id, amount) {
  cart.update(items => {
    return items.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + amount;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    });
  });
}

export function removeFromCart(id) {
  cart.update(items => items.filter(i => i.id !== id));
}

export function clearCart() {
  cart.set([]);
}