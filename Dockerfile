# NOTE: Since the `:latest` tag can have npm version changes, we are using
#       a specific version tag. Container build errors have come up when
#       the `:latest` is updated.
#
# Image info: https://catalog.redhat.com/software/containers/ubi9/nodejs-22/62e8e7ed22d1d3c2dfe2ca01
FROM registry.access.redhat.com/ubi9/nodejs-22:9.6-1761057796 AS builder
USER root
RUN command -v yarn || npm i -g yarn

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV YARN_NETWORK_TIMEOUT 1200000
ENV HUSKY=0
RUN yarn install --immutable && yarn build

FROM registry.access.redhat.com/ubi8/nginx-120

COPY --from=builder /opt/app-root/src/dist /usr/share/nginx/html
USER 1001
CMD /usr/libexec/s2i/run
