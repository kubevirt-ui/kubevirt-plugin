# Custom GitHub Actions runner image for kubevirt-plugin-ci CI.
# Extends the official runner image with cli tools used in the CI pipeline (such as jq, curl,
# envsubst, Node.js, kubectl, oc, and virtctl) and support for running Cypress tests.

#
# https://github.com/actions/runner/blob/main/images/Dockerfile: the base image
# The base image includes the docker CLI; with ARC containerMode.type=dind, jobs use the
# docker:dind sidecar (DOCKER_HOST=unix:///var/run/docker.sock) for docker/container actions.
#
ARG RUNNER_BASE=ghcr.io/actions/actions-runner:latest
FROM ${RUNNER_BASE}

USER root

# Versions (override with build-args to match cluster)
ARG NODE_VERSION=22
# OpenShift client version to match cluster (e.g. 4.20)
ARG OC_VERSION=4.20
# KubeVirt CLI version to match HCO install (e.g. v1.4.0)
ARG VIRTCTL_VERSION=v1.4.0
# Go-based yq (mikefarah/yq) — matches the version on GitHub-hosted ubuntu-latest runners.
# NOTE: apt's `yq` package is the Python-based yq (kislyuk), which has incompatible syntax.
ARG YQ_VERSION=v4.52.5
# Direct binary download URLs resolved from ConsoleCLIDownload by setup-runner-image.sh.
# When set, these take precedence over the static mirror/GitHub URLs above and guarantee
# the binaries match the live cluster. Left empty to use the static fallback URLs.
ARG OC_URL=""
ARG KUBECTL_URL=""
ARG VIRTCTL_URL=""

# Tools used: jq, curl, envsubst (gettext-base)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates jq curl gettext-base \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# yq (Go/mikefarah) — install from GitHub releases to get the same yq as GitHub-hosted runners
RUN curl -fsSL "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64" \
    -o /usr/local/bin/yq \
    && chmod +x /usr/local/bin/yq

# Cypress 14+ headless (bundled Electron) — Linux deps for Ubuntu 24.04+ (noble).
# Official runner image is noble (see actions/runner images/Dockerfile: mcr.microsoft.com/dotnet/runtime-deps:8.0-noble).
# Matches Cypress docs: https://docs.cypress.io/guides/getting-started/installing-cypress#Linux — Ubuntu >=24.04 list.
# GitHub-hosted ubuntu-latest (runner-images Ubuntu2404) also includes xvfb, Chrome/Firefox, and extra fonts; for ARC we
# install the minimum Electron stack plus common fonts so screenshots/video match hosted runners more closely.
# unzip is already present in the upstream actions-runner image (needed for fast Cypress binary unpack).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        fontconfig \
        fonts-liberation \
        libasound2t64 \
        libgbm-dev \
        libgtk-3-0t64 \
        libnss3 \
        libnotify-dev \
        libxss1 \
        libxtst6 \
        xauth \
        xvfb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Node.js (LTS)
RUN apt-get update \
    && curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# kubectl — use console download URL if resolved by setup-runner-image.sh, else dl.k8s.io stable
RUN if [ -n "${KUBECTL_URL}" ]; then \
      curl -fsSL "${KUBECTL_URL}" -o /usr/local/bin/kubectl; \
    else \
      curl -fsSL "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
           -o /usr/local/bin/kubectl; \
    fi \
    && chmod +x /usr/local/bin/kubectl

# OpenShift client (oc) — use console download URL if resolved, else mirror.openshift.com stable-4.x.
# The console route serves a plain .tar (not gzip); download to a temp file so GNU tar can
# auto-detect the format (-xf, no -z) rather than piping stdin where detection is unavailable.
RUN if [ -n "${OC_URL}" ]; then \
      curl -fsSL "${OC_URL}" -o /tmp/oc-archive \
      && tar -xf /tmp/oc-archive -C /usr/local/bin oc \
      && rm /tmp/oc-archive; \
    else \
      curl -fsSL "https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable-${OC_VERSION}/openshift-client-linux.tar.gz" \
           | tar -xzf - -C /usr/local/bin; \
    fi

# virtctl (KubeVirt CLI) — use console download URL if resolved, else GitHub releases direct binary.
# The console route serves a .tar.gz archive; download to a temp file so GNU tar can
# auto-detect the format (-xf, no -z) for consistency with the oc block above.
RUN if [ -n "${VIRTCTL_URL}" ]; then \
      curl -fsSL "${VIRTCTL_URL}" -o /tmp/virtctl-archive \
      && tar -xf /tmp/virtctl-archive -C /usr/local/bin virtctl \
      && rm /tmp/virtctl-archive; \
    else \
      curl -fsSL "https://github.com/kubevirt/kubevirt/releases/download/${VIRTCTL_VERSION}/virtctl-${VIRTCTL_VERSION}-linux-amd64" \
           -o /usr/local/bin/virtctl; \
    fi \
    && chmod +x /usr/local/bin/virtctl

USER runner

# Default npm and tmp to HOME so npm ci works in restricted containers without workflow overrides
ENV KUBEVIRT_UI_PLUGIN_RUNNER=true \
    HOME=/home/runner \
    TMPDIR=/home/runner/.tmp

# Keep the same entrypoint/CMD as the base image so ARC works unchanged.
