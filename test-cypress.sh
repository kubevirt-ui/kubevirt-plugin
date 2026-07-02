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
  npm_script="test-cypress"
else
  npm_script="test-cypress-headless"
fi

if [ -n "${spec-}" ]; then
  npm_script_args="--spec '$spec'"
fi

npm run $npm_script -- $npm_script_args

# Generate Cypress report.
npm run cypress-postreport
