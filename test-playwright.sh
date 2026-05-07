#!/usr/bin/env bash

set -x
set +e

# Export namespaces for downstream
export DOWNSTREAM=true
export CNV_NS='openshift-cnv'
export OS_IMAGES_NS='openshift-virtualization-os-images'
export TEST_NS='auto-test-ns'
export TEST_SECRET_NAME='auto-test-secret'

# Setup cluster
bash test-cleanup.sh
bash test-setup.sh
bash test-setup-downstream.sh

# Install dependencies.
npm ci

# Install Playwright browsers
npm run playwright-install

while getopts u:s: flag
do
  case "${flag}" in
    u) ui=${OPTARG};;
    s) spec=${OPTARG};;
  esac
done

# Run tests.
if [ -n "${ui-}" ]; then
  npm run test-playwright-ui
elif [ -n "${spec-}" ]; then
  npm run test-playwright -- $spec
else
  npm run test-playwright-headless
fi

# Clean up
bash test-cleanup.sh
