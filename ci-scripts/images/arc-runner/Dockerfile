# Custom GitHub Actions runner image for kubevirt-plugin-ci CI.
# Extends the official runner image with cli tools used in the CI pipeline (such as jq, curl,
# envsubst, Node.js, oc, and virtctl) and support for running Cypress tests.

#
# https://github.com/actions/runner/blob/main/images/Dockerfile: the base image
# The base image includes the docker CLI; with ARC containerMode.type=dind, jobs use the
# docker:dind sidecar (DOCKER_HOST=unix:///var/run/docker.sock) for docker/container actions.
#
ARG RUNNER_BASE=ghcr.io/actions/actions-runner:latest
FROM ${RUNNER_BASE}

USER root

# Go-based yq (mikefarah/yq) — matches the version on GitHub-hosted ubuntu-latest runners.
# NOTE: apt's `yq` package is the Python-based yq (kislyuk), which has incompatible syntax.
ARG YQ_VERSION=v4.52.5
# Versions (override with build-args to match cluster)
ARG NODE_VERSION=22
# OpenShift client version to match cluster (e.g. 4.20)
ARG OC_VERSION=4.20
# KubeVirt CLI version to match HCO install (e.g. v1.4.0)
ARG VIRTCTL_VERSION=v1.4.0
# Helm version (e.g. 3.19.0)
ARG HELM_VERSION=3.19.0

# Direct binary download URLs resolved from ConsoleCLIDownload by setup-runner-image.sh.
# When set, these take precedence over the static mirror/GitHub URLs above and guarantee
# the binaries match the live cluster. Left empty to use the static fallback URLs.
ARG OC_URL=""
ARG VIRTCTL_URL=""
ARG HELM_URL=""

# curl and wget2 are both installed:
#   curl  — kept for CI workflow scripts at runtime
#   wget2 — used for all build-time HTTPS downloads
# On Ubuntu, apt and wget2 use GnuTLS; curl and wget (1.x) use OpenSSL. On OpenShift build pods
# where the FIPS provider .so can't load (DSO error), all OpenSSL-based HTTPS fails. wget2/GnuTLS
# is unaffected, so every build-time binary download goes through wget2 instead.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates jq curl wget2 gettext-base \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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

# yq (Go/mikefarah) — wget2/GnuTLS avoids the OpenSSL FIPS DSO loading failure on hardened clusters
RUN wget2 -O /usr/local/bin/yq \
    "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64" \
    && chmod +x /usr/local/bin/yq

# Node.js — the nodesource setup script internally calls curl (OpenSSL), which fails on FIPS clusters.
# Fetch the version list from nodejs.org with wget2 (GnuTLS), pick the latest v${NODE_VERSION}.x,
# then download and extract the pre-built binary tarball directly.
RUN NVER=$(wget2 -qO- "https://nodejs.org/dist/index.json" \
        | jq -r --argjson maj "${NODE_VERSION}" \
            '[.[] | select(.version | test("^v" + ($maj|tostring) + "\\."))] | .[0].version') \
    && wget2 -qO /tmp/node.tar.gz \
        "https://nodejs.org/dist/${NVER}/node-${NVER}-linux-x64.tar.gz" \
    && tar -xzf /tmp/node.tar.gz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.gz

# OpenShift client (oc) — use console download URL if resolved, else mirror.openshift.com stable-4.x.
# Console route serves a plain .tar; download to a temp file so GNU tar auto-detects the format.
# Fallback uses wget2 (GnuTLS) for the external HTTPS download.
RUN if [ -n "${OC_URL}" ]; then \
      wget2 -qO /tmp/oc-archive "${OC_URL}" \
      && tar -xf /tmp/oc-archive -C /usr/local/bin oc \
      && rm /tmp/oc-archive; \
    else \
      wget2 -qO- "https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable-${OC_VERSION}/openshift-client-linux.tar.gz" \
           | tar -xzf - -C /usr/local/bin; \
    fi

# virtctl (KubeVirt CLI) — use console download URL if resolved, else GitHub releases.
# Console route serves a .tar.gz; fallback uses wget2 (GnuTLS) for the external HTTPS download.
RUN if [ -n "${VIRTCTL_URL}" ]; then \
      wget2 -qO /tmp/virtctl-archive "${VIRTCTL_URL}" \
      && tar -xf /tmp/virtctl-archive -C /usr/local/bin virtctl \
      && rm /tmp/virtctl-archive; \
    else \
      wget2 -qO /usr/local/bin/virtctl \
           "https://github.com/kubevirt/kubevirt/releases/download/${VIRTCTL_VERSION}/virtctl-${VIRTCTL_VERSION}-linux-amd64"; \
    fi \
    && chmod +x /usr/local/bin/virtctl

# Helm — use console download URL if resolved, else get.helm.sh.
# Console route serves a .tar.gz; fallback uses wget2 (GnuTLS) for the external HTTPS download.
RUN if [ -n "${HELM_URL}" ]; then \
      wget2 -qO /tmp/helm-archive "${HELM_URL}" \
      && tar -xf /tmp/helm-archive -C /usr/local/bin --strip-components=1 linux-amd64/helm \
      && rm /tmp/helm-archive; \
    else \
      wget2 -qO- "https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz" \
           | tar -xzf - -C /usr/local/bin --strip-components=1 linux-amd64/helm; \
    fi \
    && chmod +x /usr/local/bin/helm

USER runner

# Default npm and tmp to HOME so npm ci works in restricted containers without workflow overrides
ENV KUBEVIRT_UI_PLUGIN_RUNNER=true \
    HOME=/home/runner \
    TMPDIR=/home/runner/.tmp

# Keep the same entrypoint/CMD as the base image so ARC works unchanged.
