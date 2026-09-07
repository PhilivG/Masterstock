# --- Etapa 1: build de Angular ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9 --activate && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build --configuration production

# --- Etapa 2: nginx sirviendo los archivos estaticos + proxy hacia el backend ---
FROM nginx:alpine

COPY --from=build /app/dist/masterstock-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
