import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, ProductCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);
  totalProducts = signal(0);
  cartMsg = signal('');

  categories = [
    { name: 'GPU', icon: 'bi-gpu-card', image: '/products/category-gpu.webp' },
    { name: 'CPU', icon: 'bi-cpu', image: '/products/category-cpu.webp' },
    { name: 'RAM', icon: 'bi-memory', image: '/products/category-ram.webp' },
    { name: 'Motherboard', icon: 'bi-motherboard', image: '/products/category-motherboard.webp' },
    { name: 'PSU', icon: 'bi-plug', image: '/products/category-psu.webp' },
    { name: 'Almacenamiento', icon: 'bi-device-ssd', image: '/products/category-almacenamiento.webp' },
    { name: 'Gabinete', icon: 'bi-pc-display', image: '/products/category-gabinete.webp' },
    { name: 'Refrigeración', icon: 'bi-snow', image: '/products/category-refrigeracion.webp' },
    { name: 'Monitor', icon: 'bi-display', image: '/products/category-monitor.webp' },
    { name: 'Perifericos', icon: 'bi-keyboard', image: '/products/category-perifericos.webp' }
  ];

  constructor(
    private productService: ProductService,
    public cart: CartService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.totalProducts.set(products.length);
        this.featuredProducts.set(products.slice(0, 3));
      },
      error: (err) => console.error('Error al cargar productos destacados', err)
    });
  }

  addToCart(product: Product) {
    this.cart.add(product, 1);
    this.cartMsg.set(`${product.name} se agrego al carrito`);
    setTimeout(() => this.cartMsg.set(''), 2500);
  }
}
