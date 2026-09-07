import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';
import { fieldError } from '../../../core/utils/form-errors';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productId = signal<string | null>(null);
  loading = signal(false);
  errorMsg = signal('');
  stockMsg = signal('');
  currentStock = signal<number | null>(null);

  form: FormGroup;
  stockForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      brand: [''],
      images: ['']
    });

    this.stockForm = this.fb.group({
      type: ['entrada', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.productId.set(id);
      this.productService.getById(id).subscribe((product) => this.fillForm(product));
    }
  }

  fillForm(product: Product) {
    this.form.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      images: product.images?.[0] || ''
    });
    this.currentStock.set(product.stock ?? null);
  }

  fieldError = fieldError;

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.value;
    const payload: Partial<Product> = {
      ...value,
      images: value.images ? [value.images] : []
    };

    const request = this.productId()
      ? this.productService.update(this.productId()!, payload)
      : this.productService.create(payload);

    request.subscribe({
      next: () => this.router.navigate(['/admin/productos']),
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al guardar el producto');
        this.loading.set(false);
      }
    });
  }

  adjustStock() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }
    if (!this.productId()) return;

    this.productService.adjustStock(this.productId()!, this.stockForm.value).subscribe({
      next: (product) => {
        this.currentStock.set(product.stock ?? null);
        this.stockMsg.set('Stock actualizado');
        this.stockForm.reset({ type: 'entrada', quantity: 1, reason: '' });
        setTimeout(() => this.stockMsg.set(''), 3000);
      },
      error: (err) => this.stockMsg.set(err.error?.message || 'Error al ajustar el stock')
    });
  }
}
