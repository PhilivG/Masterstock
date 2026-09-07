import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() adminMode = false;
  @Output() addToCart = new EventEmitter<Product>();

  // Al pasar el mouse sobre la imagen se muestra la segunda foto (si existe)
  hovered = signal(false);
}
