import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Order, OrderStatus } from '../../../core/models/models';
import { STATUS_INFO, CUSTOMER_RESOLUTION_INFO } from '../../../core/utils/order-display';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, NavbarComponent, FooterComponent],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  justCreatedId = signal<string | null>(null);
  expandedOrders = signal<Set<string>>(new Set());
  reorderingId = signal<string | null>(null);
  page = signal(1);
  totalPages = signal(1);

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private cart: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.justCreatedId.set(this.route.snapshot.queryParamMap.get('creado'));
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.orderService.getAll(page).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  prevPage() {
    if (this.page() > 1) this.load(this.page() - 1);
  }

  nextPage() {
    if (this.page() < this.totalPages()) this.load(this.page() + 1);
  }

  resolutionInfo(resolution: string) {
    return CUSTOMER_RESOLUTION_INFO[resolution];
  }

  statusInfo(status: OrderStatus) {
    return STATUS_INFO[status];
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrders().has(orderId);
  }

  toggleExpand(orderId: string) {
    this.expandedOrders.update((set) => {
      const next = new Set(set);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  }

  // "Comprar de nuevo": trae el precio y stock actuales de cada producto (no el
  // historico del pedido) y los agrega al carrito, como hace Amazon.
  reorder(order: Order) {
    this.reorderingId.set(order._id);

    const requests = order.items.map((item) =>
      this.productService.getById(
        typeof item.product === 'string' ? item.product : item.product._id
      )
    );

    forkJoin(requests).subscribe({
      next: (products) => {
        products.forEach((product, i) => this.cart.add(product, order.items[i].quantity));
        this.reorderingId.set(null);
        this.router.navigate(['/carrito']);
      },
      error: () => this.reorderingId.set(null)
    });
  }
}
