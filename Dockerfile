FROM registry.access.redhat.com/ubi8/nodejs-16 AS builder
USER root

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV HUSKY=0
RUN npm config set fetch-timeout 1200000
RUN npm ci --ignore-scripts
RUN npm run build

FROM registry.access.redhat.com/ubi8/nginx-120

COPY --from=builder /opt/app-root/src/dist /usr/share/nginx/html
USER 1001
CMD /usr/libexec/s2i/run
