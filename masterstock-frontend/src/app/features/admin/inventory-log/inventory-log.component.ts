import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductService } from '../../../core/services/product.service';
import { InventoryMovement } from '../../../core/models/models';

@Component({
  selector: 'app-inventory-log',
  standalone: true,
  imports: [NgClass, NavbarComponent, FooterComponent],
  templateUrl: './inventory-log.component.html'
})
export class InventoryLogComponent implements OnInit {
  movements = signal<InventoryMovement[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.productService.getMovements(page).subscribe({
      next: (res) => {
        this.movements.set(res.data);
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
}
