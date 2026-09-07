// Traduce errores de Mongoose/MongoDB a una respuesta HTTP amigable,
// sin exponer el mensaje crudo del driver al cliente.
export function toErrorResponse (error) {
  if (error.code === 11000) {
    return { status: 400, message: 'Ya existe un registro con ese valor único' }
  }

  if (error.name === 'ValidationError') {
    const firstError = Object.values(error.errors)[0]
    return { status: 400, message: firstError?.message || 'Datos inválidos' }
  }

  return { status: 500, message: 'Error interno del servidor' }
}
