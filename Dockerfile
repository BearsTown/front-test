# ---- Build stage ----
FROM node:20-alpine AS build

ARG ENV_FILE=.env.local

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# 지정된 env 파일을 .env.production으로 복사하여 빌드에 반영
COPY ${ENV_FILE} .env.production
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV BACKEND_URL=http://localhost:8000

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
