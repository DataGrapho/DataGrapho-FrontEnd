# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Argumento para URL da API (pode ser sobrescrito no build)
ARG VITE_API_BASE_URL=https://pendengas.com.br/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Servidor Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]