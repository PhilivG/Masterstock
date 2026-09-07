import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryMovement, Paginated, Product } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(category?: string): Observable<Product[]> {
    const url = category ? `${this.baseUrl}?category=${category}` : this.baseUrl;
    return this.http.get<Product[]>(url);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  adjustStock(
    id: string,
    data: { type: 'entrada' | 'salida'; quantity: number; reason: string }
  ): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/stock`, data);
  }

  getMovements(page = 1, limit = 20): Observable<Paginated<InventoryMovement>> {
    return this.http.get<Paginated<InventoryMovement>>(`${this.baseUrl}/movements`, {
      params: { page, limit }
    });
  }
}
