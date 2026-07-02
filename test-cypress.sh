#!/usr/bin/env bash

set -eExuo pipefail

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
