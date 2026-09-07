import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { isNonEmptyString, isPositiveInteger } from '../src/utils/validators.js'

describe('isNonEmptyString', () => {
  test('acepta un string con contenido', () => {
    assert.equal(isNonEmptyString('hola'), true)
  })

  test('rechaza un string vacio', () => {
    assert.equal(isNonEmptyString(''), false)
  })

  test('rechaza un string de solo espacios', () => {
    assert.equal(isNonEmptyString('   '), false)
  })

  test('rechaza valores que no son string (ej. operadores de MongoDB)', () => {
    assert.equal(isNonEmptyString({ $gt: '' }), false)
    assert.equal(isNonEmptyString(undefined), false)
    assert.equal(isNonEmptyString(null), false)
    assert.equal(isNonEmptyString(123), false)
  })
})

describe('isPositiveInteger', () => {
  test('acepta enteros positivos', () => {
    assert.equal(isPositiveInteger(1), true)
    assert.equal(isPositiveInteger(50), true)
  })

  test('rechaza cero y negativos', () => {
    assert.equal(isPositiveInteger(0), false)
    assert.equal(isPositiveInteger(-5), false)
  })

  test('rechaza numeros decimales', () => {
    assert.equal(isPositiveInteger(1.5), false)
  })

  test('rechaza valores que no son numero', () => {
    assert.equal(isPositiveInteger('3'), false)
    assert.equal(isPositiveInteger(null), false)
    assert.equal(isPositiveInteger(undefined), false)
  })
})
