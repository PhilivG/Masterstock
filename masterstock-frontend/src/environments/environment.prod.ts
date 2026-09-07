// Ruta relativa: nginx sirve el frontend y hace proxy de /api hacia el backend
// en el mismo origen (mismo host:puerto), asi no depende de un dominio fijo.
export const environment = {
  production: true,
  apiUrl: '/api'
};
