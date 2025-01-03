#!/usr/bin/env bash

# export BRIDGE_KUBEADMIN_PASSWORD and BRIDGE_BASE_ADDRESS before the test
set -eExuo pipefail

# Install dependencies.
yarn install --ignore-engines
yarn playwright install
# Add mochawesome-report-generator
yarn add global mochawesome-report-generator --ignore-engines

yarn run test-playwright-headless
