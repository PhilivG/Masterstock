import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, OrderResolution } from '../../../core/models/models';
import {
  STATUS_INFO,
  ADMIN_RESOLUTION_INFO,
  trackerSteps as trackerStepsUtil,
  currentStepLabel as currentStepLabelUtil
} from '../../../core/utils/order-display';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, NavbarComponent, FooterComponent],
  templateUrl: './order-management.component.html'
})
export class OrderManagementComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  updatingId = signal<string | null>(null);
  trackingOrders = signal<Set<string>>(new Set());
  page = signal(1);
  totalPages = signal(1);

  // Formulario de incidente (reembolso/reemplazo): solo uno abierto a la vez
  reportingOrderId = signal<string | null>(null);
  resolutionChoice = signal<OrderResolution | null>(null);
  resolutionNote = signal('');
  submittingResolution = signal(false);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
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

  updateStatus(order: Order, status: OrderStatus) {
    this.updatingId.set(order._id);
    this.orderService.updateStatus(order._id, status).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o._id === updated._id ? updated : o)));
        this.updatingId.set(null);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al actualizar el pedido');
        this.updatingId.set(null);
      }
    });
  }

  resolutionInfo(resolution: string) {
    return ADMIN_RESOLUTION_INFO[resolution];
  }

  statusInfo(status: OrderStatus) {
    return STATUS_INFO[status];
  }

  isTracking(orderId: string): boolean {
    return this.trackingOrders().has(orderId);
  }

  toggleTracking(orderId: string) {
    this.trackingOrders.update((set) => {
      const next = new Set(set);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  }

  trackerSteps = trackerStepsUtil;
  currentStepLabel = currentStepLabelUtil;

  openReportForm(order: Order) {
    this.reportingOrderId.set(order._id);
    this.resolutionChoice.set(null);
    this.resolutionNote.set('');
  }

  closeReportForm() {
    this.reportingOrderId.set(null);
  }

  submitResolution(order: Order) {
    const resolution = this.resolutionChoice();
    const note = this.resolutionNote().trim();
    if (!resolution || !note) return;

    this.submittingResolution.set(true);
    this.orderService.setResolution(order._id, resolution, note).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o._id === updated._id ? updated : o)));
        this.submittingResolution.set(false);
        this.closeReportForm();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al registrar la resolución');
        this.submittingResolution.set(false);
      }
    });
  }
}
