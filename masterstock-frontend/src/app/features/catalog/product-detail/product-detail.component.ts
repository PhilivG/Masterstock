import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, KeyValuePipe, NavbarComponent, FooterComponent, ProductCardComponent],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  quantity = signal(1);
  addedMsg = signal(false);
  loading = signal(true);
  activeIndex = signal(0);
  relatedProducts = signal<Product[]>([]);

  activeImage = computed(() => this.product()?.images?.[this.activeIndex()] ?? '');
  subtotal = computed(() => (this.product()?.price ?? 0) * this.quantity());

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public cart: CartService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
        this.loadRelated(p);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadRelated(product: Product) {
    this.productService.getAll(product.category).subscribe({
      next: (products) => {
        this.relatedProducts.set(products.filter((p) => p._id !== product._id).slice(0, 4));
      }
    });
  }

  changeQuantity(delta: number) {
    const next = this.quantity() + delta;
    if (next >= 1) this.quantity.set(next);
  }

  addToCart() {
    const p = this.product();
    if (!p) return;

    this.cart.add(p, this.quantity());
    this.addedMsg.set(true);
    this.quantity.set(1);
    setTimeout(() => this.addedMsg.set(false), 3000);
  }

  addRelatedToCart(product: Product) {
    this.cart.add(product, 1);
  }
}
