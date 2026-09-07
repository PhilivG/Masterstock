import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, ProductCardComponent],
  templateUrl: './admin-product-list.component.html'
})
export class AdminProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  pendingDelete = signal<Product | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  askDelete(product: Product) {
    this.pendingDelete.set(product);
  }

  cancelDelete() {
    this.pendingDelete.set(null);
  }

  confirmDelete() {
    const product = this.pendingDelete();
    if (!product) return;

    this.productService.delete(product._id).subscribe({
      next: () => this.products.update((list) => list.filter((p) => p._id !== product._id))
    });
    this.pendingDelete.set(null);
  }
}
