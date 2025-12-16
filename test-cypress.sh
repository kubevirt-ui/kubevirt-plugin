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

# Add mochawesome-report-generator
npm install -g mochawesome-report-generator --force

while getopts g:s: flag
do
  case "${flag}" in
    g) gui=${OPTARG};;
    s) spec=${OPTARG};;
  esac
done

# Run tests.
npm_script="test-cypress-headless"

if [ -n "${gui-}" ]; then
  npm_script="test-cypress"
fi

if [ -n "${spec-}" ]; then
  npm_script="$npm_script --spec '$spec'"
fi

npm run $npm_script

# Generate Cypress report.
npm run cypress-postreport

# Clean up
bash test-cleanup.sh
