# MasterStock — Backend

API REST para un sistema de inventario y pedidos de una tienda de componentes de PC gamer. Maneja productos, stock, pedidos y usuarios con dos roles: **admin** y **comprador**.

Hecho con **Node.js + Express + MongoDB** como parte del proyecto final del módulo MEAN Stack.

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Scripts disponibles](#scripts-disponibles)
- [Crear un usuario administrador](#crear-un-usuario-administrador)
- [Endpoints de la API](#endpoints-de-la-api)
- [Seguridad](#seguridad)
- [Decisiones y alcance del proyecto](#decisiones-y-alcance-del-proyecto)

## Tecnologías

| Tecnología | Para qué se usa |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime de JavaScript en el servidor |
| [Express](https://expressjs.com/) | Framework web para los endpoints de la API |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Base de datos y modelado de datos |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | Autenticación basada en JWT |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Hash de contraseñas |
| [helmet](https://www.npmjs.com/package/helmet) | Cabeceras HTTP de seguridad |
| [cors](https://www.npmjs.com/package/cors) | Control de qué origen puede llamar a la API |
| [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) | Límite de intentos en login/registro |

## Funcionalidades

- **Autenticación con JWT** — registro e inicio de sesión, con dos roles (`admin` y `comprador`) que determinan qué puede hacer cada usuario.
- **CRUD de productos** — crear, editar, eliminar y consultar productos del catálogo (solo admin puede crear/editar/eliminar).
- **Control de inventario** — cada entrada o salida de stock queda registrada en un historial de movimientos, con quién la hizo y por qué.
- **Gestión de pedidos** — un comprador arma un pedido, el sistema valida y descuenta el stock automáticamente, y el admin puede avanzar el estado del envío (`confirmado → enviado → entregado`) o cancelarlo.
- **Incidentes post-venta** — el admin puede marcar un pedido con reembolso o reemplazo, con una nota explicando el motivo.
- **Perfil de usuario** — cada usuario puede actualizar sus propios datos.

## Estructura del proyecto

```
masterstock-backend/
├── server.js                  # punto de entrada: levanta el servidor HTTP
├── src/
│   ├── app.js                 # configuración de Express (middlewares y rutas)
│   ├── config/
│   │   └── db.js              # conexión a MongoDB
│   ├── models/                # esquemas de Mongoose (User, Product, Order, InventoryMovement)
│   ├── controllers/           # la lógica de cada endpoint
│   ├── routes/                # qué URL llama a qué controlador
│   ├── middleware/             # protect (JWT), authorize (roles), optionalAuth
│   └── utils/
│       └── errorResponse.js   # traduce errores de Mongoose a mensajes claros
├── seed/
│   ├── products.json          # datos de ejemplo para poblar el catálogo
│   └── seedProducts.js        # script que carga products.json a la base de datos
└── .env.example                # plantilla de variables de entorno
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- Una base de datos MongoDB — puede ser local o gratis en [MongoDB Atlas](https://www.mongodb.com/atlas)
- [pnpm](https://pnpm.io/) (o `npm`, cambiando los comandos)

## Instalación

```bash
# 1. Entrar a la carpeta del backend
cd masterstock-backend

# 2. Instalar dependencias
pnpm install

# 3. Crear el archivo de variables de entorno a partir de la plantilla
cp .env.example .env
```

Después de copiar `.env.example`, abrí el archivo `.env` y completá los valores (ver la siguiente sección).

## Variables de entorno

El archivo `.env` necesita estas variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto donde corre el servidor | `3000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb+srv://usuario:clave@cluster.mongodb.net/masterstock` |
| `JWT_SECRET` | Clave secreta para firmar los tokens (cualquier texto largo y difícil de adivinar) | `un-secreto-bien-largo-y-random` |
| `JWT_EXPIRES_IN` | Cuánto dura la sesión antes de que el token expire | `7d` |
| `FRONTEND_URL` | URL del frontend, para configurar CORS | `http://localhost:4200` |

> ⚠️ El archivo `.env` nunca se sube al repositorio (está en `.gitignore`). Cada persona que corre el proyecto debe crear el suyo.

## Cómo correr el proyecto

```bash
pnpm dev
```

Si todo salió bien vas a ver en la consola:

```
MongoDB conectado
Servidor corriendo en http://localhost:3000
```

Para probar que está vivo, se puede visitar `http://localhost:3000/api/health` y debería responder `{ "status": "ok" }`.

### (Opcional) Cargar productos de ejemplo

Si la base de datos está vacía, se puede correr:

```bash
pnpm seed
```

Esto borra los productos existentes y carga el catálogo de ejemplo desde `seed/products.json`.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `pnpm start` | Corre el servidor en modo normal (para producción) |
| `pnpm dev` | Corre el servidor con recarga automática al guardar cambios |
| `pnpm seed` | Carga el catálogo de productos de ejemplo en la base de datos |

## Crear un usuario administrador

Por seguridad, el endpoint público de registro (`POST /api/auth/register`) **siempre** crea usuarios con rol `comprador`. Nadie puede autoasignarse como admin desde el formulario.

Para tener una cuenta admin:

1. Registrate normalmente desde el frontend (o con `POST /api/auth/register`).
2. Entrá a la base de datos con [MongoDB Compass](https://www.mongodb.com/products/compass) o `mongosh`.
3. Buscá tu usuario en la colección `users` y cambiá el campo `role` de `"comprador"` a `"admin"`.
4. Volvé a iniciar sesión para que el nuevo rol quede reflejado en el token.

## Endpoints de la API

Todas las rutas que dicen "requiere token" necesitan el header:

```
Authorization: Bearer <tu_token>
```

### Autenticación (`/api/auth`)

| Método | Ruta | Acceso | Body / descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | `{ firstName, lastName, email, password, phone? }` |
| POST | `/api/auth/login` | Público | `{ email, password }` |
| GET | `/api/auth/me` | Requiere token | Devuelve el usuario autenticado |

### Productos (`/api/products`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products` | Público | Lista el catálogo (filtro opcional `?category=`) |
| GET | `/api/products/:id` | Público | Detalle de un producto |
| POST | `/api/products` | Admin | Crea un producto |
| PUT | `/api/products/:id` | Admin | Edita un producto |
| DELETE | `/api/products/:id` | Admin | Elimina un producto |
| PATCH | `/api/products/:id/stock` | Admin | Registra una entrada o salida de stock |
| GET | `/api/products/movements` | Admin | Historial de movimientos de inventario (paginado) |

### Pedidos (`/api/orders`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/orders` | Comprador | Crea un pedido: `{ items: [{ productId, quantity }], shippingAddress }` |
| GET | `/api/orders` | Requiere token | Admin ve todos, comprador ve solo los suyos (paginado) |
| GET | `/api/orders/:id` | Requiere token | Detalle de un pedido (dueño o admin) |
| PATCH | `/api/orders/:id/status` | Admin | Cambia el estado: `confirmado / enviado / entregado / cancelado` |
| PATCH | `/api/orders/:id/resolution` | Admin | Registra reembolso o reemplazo con una nota |

### Usuarios (`/api/users`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| PUT | `/api/users/me` | Requiere token | Actualiza los datos del propio usuario |
| GET | `/api/users` | Admin | Lista todos los usuarios |

## Seguridad

- Las contraseñas se guardan siempre con **bcrypt**, nunca en texto plano.
- **Rate limiting** en login y registro (máximo 10 intentos cada 15 minutos) para dificultar ataques de fuerza bruta.
- **Helmet** agrega cabeceras HTTP recomendadas de seguridad.
- **CORS** restringido a la URL del frontend configurada en `FRONTEND_URL`.
- El **stock y los precios se calculan siempre en el servidor** — nunca se confía en lo que manda el cliente en el body de la petición.
- Los mensajes de error de la base de datos se traducen a mensajes genéricos antes de devolverlos, para no filtrar detalles internos.

## Decisiones y alcance del proyecto

Estas son simplificaciones a propósito, para mantener el proyecto enfocado en lo que pide la entrega:

- Categoría y marca son campos de texto simples en el producto, no colecciones separadas.
- El carrito de compras vive solo en el frontend (`localStorage`) — no hay un modelo de carrito en el backend.
- Los envíos son solo dentro de Colombia, con una tarifa fija (gratis a partir de cierto monto).
- El pedido se confirma automáticamente si hay stock disponible; no hay un paso de revisión manual antes de despachar.
- Los incidentes post-venta (reembolso/reemplazo) son solo un estado más una nota — no hay integración real con un sistema de logística inversa.
