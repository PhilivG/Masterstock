import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-top border-secondary bg-dark pt-5 pb-4 mt-5">
      <div class="container">
        <div class="row g-4 mb-4">
          <div class="col-md-4">
            <span class="fw-bold font-display text-gradient fs-4 d-block mb-2">MasterStock</span>
            <p class="text-muted small mb-0">Componentes e insumos para armar, actualizar y mantener tu equipo gamer.</p>
          </div>
          <div class="col-6 col-md-2">
            <div class="eyebrow mb-2">Tienda</div>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><a routerLink="/catalogo" class="text-secondary small">Catalogo</a></li>
              <li><a routerLink="/carrito" class="text-secondary small">Carrito</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-2">
            <div class="eyebrow mb-2">Cuenta</div>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><a routerLink="/pedidos" class="text-secondary small">Mis pedidos</a></li>
              <li><a routerLink="/perfil" class="text-secondary small">Mi perfil</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-2">
            <div class="eyebrow mb-2">Empresa</div>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><a routerLink="/sobre-nosotros" class="text-secondary small">Sobre nosotros</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-2">
            <div class="eyebrow mb-2">Contacto</div>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0 small text-secondary">
              <li><i class="bi bi-envelope me-1"></i> contacto&#64;masterstock.com</li>
              <li><i class="bi bi-geo-alt me-1"></i> Bogota, Colombia</li>
            </ul>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 border-top border-secondary">
          <span class="text-muted small">© 2026 MasterStock — Proyecto final MEAN Stack — BIT</span>
          <div class="d-flex gap-3">
            <a href="#" class="text-secondary" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-secondary" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-secondary" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
