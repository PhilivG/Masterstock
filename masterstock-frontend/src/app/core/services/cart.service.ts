import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem, Product } from '../models/models';
import { AuthService } from './auth.service';

// Debe coincidir con la logica del backend (orderController.js) que es quien
// realmente calcula y cobra el envio - esto es solo para mostrarlo antes de pagar.
export const FREE_SHIPPING_THRESHOLD = 300000;
export const FLAT_SHIPPING_COST = 15000;

// Carrito 100% en el navegador (localStorage): no existe un modelo Cart en el
// backend. Al confirmar el pedido se manda todo el carrito de una vez a
// POST /api/orders, que ya acepta una lista de items.
//
// La clave de localStorage incluye el id del usuario (o "guest" sin sesion),
// asi cada cuenta tiene su propio carrito en el mismo navegador en vez de
// compartir uno solo entre todos los que inician sesion en ese equipo.
@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(AuthService);
  private currentKey = this.storageKey();

  items = signal<CartItem[]>(this.loadFromStorage(this.currentKey));

  count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  shippingCost = computed(() => {
    const total = this.total();
    return total === 0 || total >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  });

  grandTotal = computed(() => this.total() + this.shippingCost());

  constructor() {
    effect(() => {
      const key = this.storageKey();
      if (key !== this.currentKey) {
        this.currentKey = key;
        this.items.set(this.loadFromStorage(key));
      }
    });
  }

  private storageKey(): string {
    const user = this.auth.currentUser();
    return user ? `cart:${user._id}` : 'cart:guest';
  }

  private loadFromStorage(key: string): CartItem[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(this.currentKey, JSON.stringify(this.items()));
  }

  add(product: Product, quantity = 1) {
    this.items.update((list) => {
      const existing = list.find((item) => item.product._id === product._id);
      if (existing) {
        return list.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...list, { product, quantity }];
    });
    this.persist();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      this.remove(productId);
      return;
    }
    this.items.update((list) =>
      list.map((item) => (item.product._id === productId ? { ...item, quantity } : item))
    );
    this.persist();
  }

  remove(productId: string) {
    this.items.update((list) => list.filter((item) => item.product._id !== productId));
    this.persist();
  }

  clear() {
    this.items.set([]);
    this.persist();
  }
}
