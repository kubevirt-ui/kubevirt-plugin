# CI Environment Controller image.
# Lightweight UBI9 image with only the CLI tools needed by ci-env-controller.sh:
#   oc, helm, jq, yq, curl
#
# Using UBI9 avoids FIPS/OpenSSL DSO issues on hardened OpenShift clusters
# (the Ubuntu-based ARC runner image fails OpenSSL loads on FIPS nodes).
#
# The Helm chart is staged into the build context by setup-controller-image.sh
# and COPY'd into the image, avoiding the ConfigMap flat-key limitation that
# drops subdirectories (templates/).

FROM registry.access.redhat.com/ubi9/ubi:latest

ARG OC_VERSION=4.20
ARG OC_URL=""
ARG HELM_VERSION=3.17.3
ARG HELM_URL=""
ARG YQ_VERSION=v4.52.5

RUN dnf install -y --nodocs \
      jq \
    && dnf clean all

# oc (OpenShift CLI) -- prefer cluster-resolved URL if provided.
# Cluster URLs may serve plain .tar with only "oc" (no kubectl), so extract
# what's available and symlink kubectl to oc.
RUN set -e; \
    if [ -n "${OC_URL}" ]; then \
      curl -sL "${OC_URL}" | tar -xf - -C /usr/local/bin; \
    else \
      curl -sL "https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable-${OC_VERSION}/openshift-client-linux.tar.gz" \
        | tar -xzf - -C /usr/local/bin oc kubectl; \
    fi \
    && chmod +x /usr/local/bin/oc \
    && [ -f /usr/local/bin/kubectl ] || ln -s oc /usr/local/bin/kubectl

# helm -- prefer cluster-resolved URL if provided.
# Cluster URLs may serve plain .tar, so use tar -xf (auto-detect).
RUN set -e; \
    if [ -n "${HELM_URL}" ]; then \
      curl -sL "${HELM_URL}" | tar -xf - -C /usr/local/bin --strip-components=1 linux-amd64/helm; \
    else \
      curl -sL "https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz" \
        | tar -xzf - -C /usr/local/bin --strip-components=1 linux-amd64/helm; \
    fi \
    && chmod +x /usr/local/bin/helm

# yq (Go/mikefarah)
RUN curl -sL -o /usr/local/bin/yq \
      "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64" \
    && chmod +x /usr/local/bin/yq

# Embed the Helm chart into the image. The chart is staged into the build
# context by setup-controller-image.sh via a symlink dereferenced by tar -ch.
COPY helm/ci-test-stack/ /opt/ci-env/helm/ci-test-stack/

RUN useradd -r -u 1001 -g 0 -d /home/controller -s /sbin/nologin controller \
    && mkdir -p /home/controller \
    && chown -R 1001:0 /home/controller /opt/ci-env

USER 1001
WORKDIR /home/controller

ENTRYPOINT ["/bin/bash"]
