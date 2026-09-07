import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalog/product-list/product-list.component').then(
        (m) => m.ProductListComponent
      )
  },
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./features/catalog/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      )
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent)
  },
  {
    path: 'pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-list/order-list.component').then((m) => m.OrderListComponent)
  },
  {
    path: 'pedidos/:id/rastreo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-tracking/order-tracking.component').then(
        (m) => m.OrderTrackingComponent
      )
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'sobre-nosotros',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'admin/productos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/product-form/admin-product-list.component').then(
        (m) => m.AdminProductListComponent
      )
  },
  {
    path: 'admin/productos/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      )
  },
  {
    path: 'admin/pedidos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/order-management/order-management.component').then(
        (m) => m.OrderManagementComponent
      )
  },
  {
    path: 'admin/inventario',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/inventory-log/inventory-log.component').then(
        (m) => m.InventoryLogComponent
      )
  },
  { path: '**', redirectTo: '' }
];
