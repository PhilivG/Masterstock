// Validaciones puras y reutilizables, sin dependencias de Express ni Mongoose,
// para poder probarlas con pruebas unitarias simples.

// typeof value === 'string' bloquea payloads tipo { email: { "$gt": "" } }
// que buscan explotar operadores de MongoDB en vez de mandar un valor real.
export function isNonEmptyString (value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isPositiveInteger (value) {
  return Number.isInteger(value) && value > 0
}
