import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/models';

type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent, ProductCardComponent],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  activeCategory = signal<string | null>(null);
  categories = [
    'GPU', 'CPU', 'RAM', 'Motherboard', 'PSU',
    'Almacenamiento', 'Gabinete', 'Refrigeración', 'Monitor', 'Perifericos'
  ];
  cartMsg = signal('');

  // Filtros aplicados en el cliente sobre lo que ya trajo el backend para la categoria activa
  search = signal('');
  sortBy = signal<SortOption>('relevancia');
  onlyAvailable = signal(false);
  activeBrands = signal<Set<string>>(new Set());

  brands = computed(() => {
    const set = new Set(this.products().map((p) => p.brand).filter((b): b is string => !!b));
    return [...set].sort();
  });

  filteredProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const brands = this.activeBrands();
    const onlyAvail = this.onlyAvailable();

    let list = this.products().filter((p) => {
      if (term && !p.name.toLowerCase().includes(term) && !p.sku.toLowerCase().includes(term)) {
        return false;
      }
      if (brands.size > 0 && (!p.brand || !brands.has(p.brand))) return false;
      if (onlyAvail && p.disponible === false) return false;
      return true;
    });

    switch (this.sortBy()) {
      case 'precio-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'precio-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'nombre':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  });

  constructor(
    private productService: ProductService,
    public cart: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const category = params['category'] || null;
      this.activeCategory.set(category);
      this.activeBrands.set(new Set());

      this.search.set(params['search'] ?? '');

      this.loadProducts(category);
    });
  }

  loadProducts(category: string | null) {
    this.loading.set(true);
    this.productService.getAll(category || undefined).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.loading.set(false);
      }
    });
  }

  filterByCategory(category: string | null) {
    this.router.navigate([], { queryParams: { category: category || null }, queryParamsHandling: 'merge' });
  }

  clearSearch() {
    this.router.navigate([], { queryParams: { search: null }, queryParamsHandling: 'merge' });
  }

  toggleBrand(brand: string) {
    this.activeBrands.update((set) => {
      const next = new Set(set);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  }

  clearFilters() {
    this.sortBy.set('relevancia');
    this.onlyAvailable.set(false);
    this.activeBrands.set(new Set());
    this.router.navigate([]);
  }

  addToCart(product: Product) {
    this.cart.add(product, 1);
    this.cartMsg.set(`${product.name} se agrego al carrito`);
    setTimeout(() => this.cartMsg.set(''), 2500);
  }
}
