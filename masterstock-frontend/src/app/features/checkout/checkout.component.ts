import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CartService, FREE_SHIPPING_THRESHOLD } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { COLOMBIA_DEPARTMENTS } from '../../core/data/colombia-departments';
import { fieldError } from '../../core/utils/form-errors';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, NavbarComponent, FooterComponent],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  loading = signal(false);
  errorMsg = signal('');
  departments = COLOMBIA_DEPARTMENTS;
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public cart: CartService,
    private orderService: OrderService,
    public auth: AuthService,
    private router: Router
  ) {
    const user = this.auth.currentUser();
    this.form = this.fb.group({
      department: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      phone: [user?.phone || '', Validators.required],
      notes: ['']
    });
  }

  fieldError = fieldError;

  ngOnInit() {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMsg.set('');
    this.loading.set(true);

    const items = this.cart.items().map((item) => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    this.orderService.create(items, this.form.value).subscribe({
      next: (order) => {
        this.cart.clear();
        this.loading.set(false);
        this.router.navigate(['/pedidos'], { queryParams: { creado: order._id } });
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'No se pudo confirmar el pedido');
        this.loading.set(false);
      }
    });
  }
}
