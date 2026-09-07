import { Order, OrderStatus } from '../models/models';

// Solo los pasos que el sistema realmente maneja hasta ahora (sin "en reparto" u
// otros pasos intermedios que Amazon si muestra pero nosotros no tenemos).
export const TRACK_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' }
];

// Estado compacto que se ve por defecto en la card (antes de darle "Rastrear")
export const STATUS_INFO: Record<OrderStatus, { text: string; icon: string; class: string }> = {
  confirmado: { text: 'Confirmado, en preparacion', icon: 'bi-check-circle', class: 'text-info' },
  enviado: { text: 'Enviado', icon: 'bi-truck', class: 'text-info' },
  entregado: { text: 'Entregado', icon: 'bi-check-circle-fill', class: 'text-success' },
  cancelado: { text: 'Cancelado', icon: 'bi-x-circle-fill', class: 'text-danger' }
};

// Texto orientado al comprador (pantallas de "mis pedidos" y rastreo)
export const CUSTOMER_RESOLUTION_INFO: Record<string, { text: string; icon: string }> = {
  reembolso: { text: 'Se te ofrecio un reembolso para este pedido', icon: 'bi-cash-coin' },
  reemplazo: { text: 'Se te ofrecio un reemplazo del producto', icon: 'bi-arrow-repeat' }
};

// Texto orientado al admin (panel de gestion de pedidos)
export const ADMIN_RESOLUTION_INFO: Record<string, { text: string; icon: string }> = {
  reembolso: { text: 'Reembolso ofrecido', icon: 'bi-cash-coin' },
  reemplazo: { text: 'Reemplazo ofrecido', icon: 'bi-arrow-repeat' }
};

export function trackerSteps(order: Order) {
  const dates: Record<string, string | null | undefined> = {
    confirmado: order.createdAt,
    enviado: order.shippedAt,
    entregado: order.deliveredAt
  };
  const currentIndex = TRACK_STEPS.findIndex((s) => s.key === order.status);
  return TRACK_STEPS.map((step, i) => ({
    ...step,
    date: dates[step.key],
    done: currentIndex >= 0 && i <= currentIndex,
    lineDone: currentIndex >= 0 && i + 1 <= currentIndex
  }));
}

export function currentStepLabel(order: Order): string {
  return TRACK_STEPS.find((s) => s.key === order.status)?.label ?? '';
}
