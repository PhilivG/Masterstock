import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  constructor(public auth: AuthService, public cart: CartService, private router: Router) {}

  onSearch(term: string) {
    const trimmed = term.trim();
    this.router.navigate(['/catalogo'], trimmed ? { queryParams: { search: trimmed } } : {});
  }
}
