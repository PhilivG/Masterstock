import { AbstractControl } from '@angular/forms';

// Mensaje de error a mostrar bajo un campo, solo si ya fue tocado (evita
// mostrar errores en un formulario recien cargado antes de que el usuario interactue).
export function fieldError(control: AbstractControl | null | undefined): string | null {
  if (!control || !control.invalid || !control.touched) return null;

  if (control.hasError('required')) return 'Este campo es obligatorio.';
  if (control.hasError('email')) return 'Ingresa un email valido.';

  if (control.hasError('minlength')) {
    const { requiredLength } = control.getError('minlength');
    return `Debe tener al menos ${requiredLength} caracteres.`;
  }

  if (control.hasError('min')) {
    const { min } = control.getError('min');
    return `El valor minimo es ${min}.`;
  }

  return 'Valor invalido.';
}
