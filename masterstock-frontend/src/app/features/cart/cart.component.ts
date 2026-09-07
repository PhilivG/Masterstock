import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CartService, FREE_SHIPPING_THRESHOLD } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NavbarComponent, FooterComponent],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD;

  constructor(
    public cart: CartService,
    public auth: AuthService,
    private router: Router
  ) {}

  changeQuantity(productId: string, current: number, delta: number) {
    this.cart.updateQuantity(productId, current + delta);
  }

  goToCheckout() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
