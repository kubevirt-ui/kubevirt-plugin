# RHEL 10 enables post-quantum algorithms in the DEFAULT policy; copy them into nginx.
FROM registry.access.redhat.com/ubi10/ubi:latest AS policy
# NOTE: Since the `:latest` tag can have npm version changes, we are using
#       a specific version tag. Container build errors have come up when
#       the `:latest` is updated.
#
# Image info: https://catalog.redhat.com/en/software/containers/ubi10/nodejs-22/677d3d3e5fdd0fab2f7ad136
FROM registry.access.redhat.com/ubi10/nodejs-22:10.2-1788329676 AS builder
USER root

COPY . /opt/app-root/src
WORKDIR /opt/app-root/src
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV HUSKY=0
RUN npm config set fetch-timeout 1200000 && \
    npm ci --ignore-scripts --no-audit && \
    npm run build

# Image info: https://catalog.redhat.com/en/software/containers/ubi10/nginx-126/677d3735607921b4d7503cf3
FROM registry.access.redhat.com/ubi10/nginx-126:1788396147

COPY --from=policy /etc/crypto-policies /etc/crypto-policies
COPY --from=builder /opt/app-root/src/dist /usr/share/nginx/html
COPY default.conf /opt/app-root/etc/nginx.d/default.conf
USER 1001
CMD /usr/libexec/s2i/run
