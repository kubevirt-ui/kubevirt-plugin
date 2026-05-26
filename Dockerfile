FROM node:22@sha256:1031993481795705055273f2eef0c24597abdcb277d6e058c82f78cbbdef92a6 AS builder
USER root

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV HUSKY=0
RUN npm config set fetch-timeout 1200000
RUN npm ci --ignore-scripts
RUN npm run build

FROM nginx:stable-alpine@sha256:5f979dcfed4ce6461873f087e8c980d6e29b084b9e8776d9704a7e989b5f4898

COPY --from=builder /opt/app-root/src/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

USER nginx

EXPOSE 8080 9443
