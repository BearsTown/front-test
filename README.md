# jungdo-simulation

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```



### Docker build 
# 빌드
docker build -t carbon-portal .


# 로컬 (기본값, ENV_FILE 생략 가능)
docker compose up

# 개발 서버
ENV_FILE=.env.dev docker compose up --build

# 운영
ENV_FILE=.env.production docker compose up --build

동작 원리:
ENV_FILE 변수 → Dockerfile ARG로 전달 → 빌드 시 해당 파일이 .env.production으로 복사되어 npm run build에 반영 (VITE_* 변수)
env_file → 컨테이너 런타임에 주입 (BACKEND_URL 등 nginx 변수)



# docker-compose 빌드 + 실행
docker compose up -d --build
docker compose up --build

# 중지
docker compose down

# 로그 확인
docker compose logs -f


