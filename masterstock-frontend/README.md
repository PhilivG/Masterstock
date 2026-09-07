# MasterStock — Frontend

Interfaz web de MasterStock, una tienda de componentes de PC gamer. Hecha con **Angular 18** (standalone components + signals) y **Bootstrap 5**, con un tema visual propio (morado/rosa) en vez del Bootstrap por defecto.

Este frontend consume la API del [backend](../masterstock-backend) — para que la app funcione completa, el backend debe estar corriendo.

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Scripts disponibles](#scripts-disponibles)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Diseño](#diseño)
- [Notas y decisiones](#notas-y-decisiones)

## Tecnologías

| Tecnología | Para qué se usa |
|---|---|
| [Angular 18](https://angular.dev/) | Framework principal (standalone components, signals, control flow `@if`/`@for`) |
| [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/) | Estilos base y componentes de UI |
| [RxJS](https://rxjs.dev/) | Manejo de peticiones HTTP asíncronas |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático sobre JavaScript |

No se usa ningún gestor de estado externo (NgRx, etc.) — con **signals** de Angular y algunos servicios inyectables alcanza para el tamaño de este proyecto.

## Funcionalidades

- **Catálogo de productos** con filtros por categoría, marca, disponibilidad y búsqueda, más orden por precio o nombre.
- **Carrito de compras** guardado en `localStorage` (uno distinto por usuario).
- **Checkout** con dirección de envío (solo Colombia) y envío gratis a partir de cierto monto.
- **Login y registro** de usuarios, con sesión persistida vía JWT.
- **Seguimiento de pedidos** con una barra de progreso (`confirmado → enviado → entregado`).
- **Panel de administrador**: CRUD de productos, ajuste de stock, gestión de pedidos y su estado, historial de movimientos de inventario.
- **Perfil de usuario** con estadísticas básicas (cantidad de pedidos, total gastado).
- Rutas protegidas con **guards** según si el usuario inició sesión y/o es admin.

## Estructura del proyecto

```
src/app/
├── core/
│   ├── services/       # llamadas a la API (auth, product, order, cart, user)
│   ├── guards/          # authGuard y adminGuard, protegen rutas según sesión/rol
│   ├── interceptors/    # agrega el token JWT a cada petición y maneja errores
│   ├── models/          # interfaces de TypeScript (Product, Order, User, etc.)
│   └── utils/           # funciones auxiliares (errores de formularios, formato de pedidos)
├── shared/
│   └── components/      # navbar, footer, product-card — se usan en varias pantallas
└── features/            # una carpeta por pantalla
    ├── home/
    ├── auth/            # login, registro
    ├── catalog/          # listado y detalle de producto
    ├── cart/
    ├── checkout/
    ├── orders/           # historial y seguimiento de pedidos
    ├── profile/
    ├── about/
    └── admin/            # panel de productos, pedidos e inventario (solo admin)
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- El [backend](../masterstock-backend) corriendo en `http://localhost:3000` (o la URL que se configure)

## Instalación

```bash
# 1. Entrar a la carpeta del frontend
cd masterstock-frontend

# 2. Instalar dependencias
pnpm install
```

## Configuración

La URL de la API se configura en los archivos de entorno de Angular, no en un `.env`:

| Archivo | Se usa cuando... | Valor por defecto |
|---|---|---|
| `src/environments/environment.ts` | Corrés en desarrollo (`ng serve`) | `http://localhost:3000/api` |
| `src/environments/environment.prod.ts` | Hacés un build de producción (`ng build`) | hay que reemplazarlo por la URL real del backend desplegado |

Si el backend corre en otro puerto o dominio, hay que actualizar el valor de `apiUrl` en el archivo correspondiente.

## Cómo correr el proyecto

```bash
ng serve
```

Abrí `http://localhost:4200` en el navegador. Angular recarga la página automáticamente cada vez que se guarda un cambio.

> Si el backend no está corriendo, la app carga igual pero el catálogo, login y demás pantallas que necesitan datos van a mostrar errores de conexión.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `ng serve` / `npm start` | Levanta el servidor de desarrollo con recarga automática |
| `ng build` | Genera el build de producción en `dist/` |
| `ng build --watch --configuration development` | Genera un build de desarrollo y lo reconstruye al guardar cambios |
| `ng test` | Corre las pruebas unitarias con Karma/Jasmine |

## Rutas de la aplicación

| Ruta | Pantalla | Protección |
|---|---|---|
| `/` | Home | Pública |
| `/login`, `/registro` | Autenticación | Pública |
| `/catalogo`, `/catalogo/:id` | Catálogo y detalle de producto | Pública |
| `/carrito` | Carrito | Pública |
| `/checkout` | Confirmar pedido | Requiere sesión |
| `/pedidos`, `/pedidos/:id/rastreo` | Historial y seguimiento | Requiere sesión |
| `/perfil` | Perfil de usuario | Requiere sesión |
| `/sobre-nosotros` | Sobre nosotros | Pública |
| `/admin/productos`, `/admin/productos/:id` | Panel de productos | Requiere sesión + rol admin |
| `/admin/pedidos` | Gestión de pedidos | Requiere sesión + rol admin |
| `/admin/inventario` | Historial de inventario | Requiere sesión + rol admin |

## Diseño

En vez de usar los colores por defecto de Bootstrap, el proyecto define su propia paleta (degradado morado → rosa) sobrescribiendo las variables de Bootstrap en `src/styles.css`. También se agregaron detalles propios como las tarjetas con esquina cortada (`corner-notch`), badges de stock, y una navbar en dos filas (buscador grande + navegación) inspirada en sitios de e-commerce.

## Notas y decisiones

- No hay pasarela de pago: el pedido se confirma y el pago se coordina aparte con el comprador.
- Las fotos de productos no son necesariamente las fotos oficiales de cada modelo exacto — se usaron como referencia visual del catálogo.
- El buscador y los filtros del catálogo funcionan combinados (por ejemplo, se puede buscar un término dentro de una categoría específica al mismo tiempo).
