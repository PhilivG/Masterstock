import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus, OrderResolution, Paginated, ShippingAddress } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 20): Observable<Paginated<Order>> {
    return this.http.get<Paginated<Order>>(this.baseUrl, { params: { page, limit } });
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  create(
    items: { productId: string; quantity: number }[],
    shippingAddress: ShippingAddress
  ): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, { items, shippingAddress });
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status });
  }

  setResolution(id: string, resolution: OrderResolution, note: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/resolution`, { resolution, note });
  }
}
