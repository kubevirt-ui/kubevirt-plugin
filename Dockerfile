FROM registry.access.redhat.com/ubi8/nodejs-16 AS builder
USER root
RUN command -v yarn || npm i -g yarn

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
RUN yarn install --frozen-lockfile --ignore-engines && yarn build

FROM registry.access.redhat.com/ubi8/nginx-120

COPY default.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /opt/app-root/src/dist .
USER 1001
CMD /usr/libexec/s2i/run
