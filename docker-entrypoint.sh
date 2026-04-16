#!/bin/sh
set -e

# BACKEND_URL만 치환 (nginx 변수 $uri 등은 그대로 유지)
envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
