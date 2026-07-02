#!/usr/bin/env bash

set -eExuo pipefail

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
npm_script="test-cypress-headless"

if [ -n "${gui-}" ]; then
  npm_script="test-cypress"
fi

if [ -n "${spec-}" ]; then
  npm run "$npm_script" -- --spec "$spec"
else
  npm run "$npm_script"
fi

# Generate Cypress report.
npm run cypress-postreport
