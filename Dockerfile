FROM registry.access.redhat.com/ubi8/nodejs-18 AS builder
USER root
RUN command -v yarn || npm i -g yarn

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV YARN_NETWORK_TIMEOUT 1200000
RUN yarn install --frozen-lockfile && yarn build

FROM registry.access.redhat.com/ubi8/nginx-120

COPY --from=builder /opt/app-root/src/dist /usr/share/nginx/html
USER 1001
CMD /usr/libexec/s2i/run