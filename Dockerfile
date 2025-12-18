# NOTE: Since the `:latest` tag can have npm version changes, we are using
#       a specific version tag. Container build errors have come up when
#       the `:latest` is updated.
#
# Image info: https://catalog.redhat.com/en/software/containers/ubi9/nodejs-22/66431d1785c5c3a31edd24f1
FROM registry.access.redhat.com/ubi9/nodejs-22:9.7-1765878606 AS builder
USER root

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV HUSKY=0
RUN npm config set fetch-timeout 1200000
RUN npm ci --ignore-scripts
RUN npm run build

# Image info: https://catalog.redhat.com/en/software/containers/ubi9/nginx-124/657b066b6c1bc124a1d7ff39
FROM registry.access.redhat.com/ubi9/nginx-124:9.7-1764620487

COPY --from=builder /opt/app-root/src/dist /usr/share/nginx/html
USER 1001
CMD /usr/libexec/s2i/run
