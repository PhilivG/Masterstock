import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { fieldError } from '../../core/utils/form-errors';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, DatePipe, NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  successMsg = signal('');
  loading = signal(false);
  orderCount = signal<number | null>(null);
  totalSpent = signal<number | null>(null);
  form: FormGroup;

  initials = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  });

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private userService: UserService,
    private orderService: OrderService
  ) {
    const user = this.auth.currentUser();
    this.form = this.fb.group({
      firstName: [user?.firstName, Validators.required],
      lastName: [user?.lastName, Validators.required],
      phone: [user?.phone || '']
    });

    if (!this.auth.isAdmin()) {
      // Limite alto porque aca queremos el conteo/gasto total del comprador,
      // no una pagina - el historial personal de un comprador es acotado.
      this.orderService.getAll(1, 100).subscribe({
        next: (res) => {
          this.orderCount.set(res.total);
          this.totalSpent.set(
            res.data.filter((o) => o.status !== 'cancelado').reduce((sum, o) => sum + o.total, 0)
          );
        },
        error: () => this.orderCount.set(null)
      });
    }
  }

  fieldError = fieldError;

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.userService.updateMyProfile(this.form.value).subscribe({
      next: (user) => {
        this.auth.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        this.successMsg.set('Perfil actualizado');
        this.loading.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => this.loading.set(false)
    });
  }
}
