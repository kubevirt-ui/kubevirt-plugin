#!/usr/bin/env bash

set -eExuo pipefail

# Install dependencies.
npm ci --ignore-scripts

while getopts g:s: flag
do
  case "${flag}" in
    g) gui=${OPTARG};;
    s) spec=${OPTARG};;
  esac
done

# Run tests.
npm_script_args=""

if [ -n "${gui-}" ]; then
  npm_script_args="test-cypress"
fi

if [ -n "${spec-}" ]; then
  npm_script_args="$npm_script_args --spec '$spec'"
fi

npm run test-cypress-headless -- $npm_script_args

# Generate Cypress report.
npm run cypress-postreport
