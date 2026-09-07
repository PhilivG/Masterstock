import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { toErrorResponse } from '../src/utils/errorResponse.js'

describe('toErrorResponse', () => {
  test('traduce un error de clave duplicada (codigo 11000) a 400', () => {
    const error = { code: 11000 }
    const result = toErrorResponse(error)
    assert.equal(result.status, 400)
    assert.match(result.message, /ya existe/i)
  })

  test('traduce un ValidationError de Mongoose a 400 con el primer mensaje', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        price: { message: 'El precio es obligatorio' },
        stock: { message: 'El stock es obligatorio' }
      }
    }
    const result = toErrorResponse(error)
    assert.equal(result.status, 400)
    assert.equal(result.message, 'El precio es obligatorio')
  })

  test('usa un mensaje generico si el ValidationError no trae detalle', () => {
    const error = { name: 'ValidationError', errors: {} }
    const result = toErrorResponse(error)
    assert.equal(result.status, 400)
    assert.equal(result.message, 'Datos inválidos')
  })

  test('cualquier otro error cae en 500 sin exponer el mensaje original', () => {
    const error = new Error('detalle interno sensible de la base de datos')
    const result = toErrorResponse(error)
    assert.equal(result.status, 500)
    assert.equal(result.message, 'Error interno del servidor')
  })
})
