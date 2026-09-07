# --- Imagen del backend (Node.js + Express) ---
FROM node:20-alpine

WORKDIR /app

# Instalamos dependencias primero (aprovecha la cache de Docker si el package.json no cambia)
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

# Copiamos el resto del codigo
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
