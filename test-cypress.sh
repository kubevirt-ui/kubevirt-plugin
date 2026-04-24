#!/usr/bin/env bash

set -x
set +e

# Export namespace for downstream
export DOWNSTREAM=true
export CYPRESS_CNV_NS='openshift-cnv'
export CYPRESS_OS_IMAGES_NS='openshift-virtualization-os-images'
export CYPRESS_TEST_NS='auto-test-ns'
export CYPRESS_TEST_SECRET_NAME='auto-test-secret'

# Setup cluster
bash test-cleanup.sh
bash test-setup.sh
bash test-setup-downstream.sh

# Install dependencies.
npm ci

while getopts g:s: flag
do
  case "${flag}" in
    g) gui=${OPTARG};;
    s) spec=${OPTARG};;
  esac
done

# Run tests.
if [ -n "${gui-}" ]; then
  npm run test-cypress
elif [ -n "${spec-}" ]; then
  npm run test-cypress-headless -- --spec $spec
else
  npm run test-cypress-headless
fi

# Generate Cypress report.
npm run cypress-postreport

# Clean up
bash test-cleanup.sh
