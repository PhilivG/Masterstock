import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])

import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import mongoose from 'mongoose'
import Product from '../src/models/Product.js'

async function seed () {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 })
  console.log('MongoDB conectado')

  const raw = await readFile(new URL('./products.json', import.meta.url), 'utf-8')
  const products = JSON.parse(raw)

  // Borra los productos existentes antes de insertar, para no duplicar si corres el script varias veces
  await Product.deleteMany({})
  await Product.insertMany(products)

  console.log(`${products.length} productos insertados`)
  await mongoose.disconnect()
}

seed().catch((error) => {
  console.error('Error al insertar productos:', error.message)
  process.exit(1)
})
