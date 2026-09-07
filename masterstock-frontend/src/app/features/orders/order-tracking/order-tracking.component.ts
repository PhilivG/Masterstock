import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Order } from '../../../core/models/models';
import {
  CUSTOMER_RESOLUTION_INFO,
  trackerSteps as trackerStepsUtil,
  currentStepLabel as currentStepLabelUtil
} from '../../../core/utils/order-display';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, NavbarComponent, FooterComponent],
  templateUrl: './order-tracking.component.html'
})
export class OrderTrackingComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  errorMsg = signal('');
  reordering = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'No se pudo cargar el pedido');
        this.loading.set(false);
      }
    });
  }

  resolutionInfo(resolution: string) {
    return CUSTOMER_RESOLUTION_INFO[resolution];
  }

  trackerSteps = trackerStepsUtil;
  currentStepLabel = currentStepLabelUtil;

  // "Comprar de nuevo": trae el precio y stock actuales de cada producto (no el
  // historico del pedido) y los agrega al carrito, como hace Amazon.
  reorder() {
    const order = this.order();
    if (!order) return;

    this.reordering.set(true);
    const requests = order.items.map((item) =>
      this.productService.getById(
        typeof item.product === 'string' ? item.product : item.product._id
      )
    );

    forkJoin(requests).subscribe({
      next: (products) => {
        products.forEach((product, i) => this.cart.add(product, order.items[i].quantity));
        this.reordering.set(false);
        this.router.navigate(['/carrito']);
      },
      error: () => this.reordering.set(false)
    });
  }
}
