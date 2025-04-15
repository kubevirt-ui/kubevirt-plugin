#!/usr/bin/env bash

set -eExuo pipefail

# Install dependencies.
yarn install --ignore-engines

# Add mochawesome-report-generator
yarn add global mochawesome-report-generator --ignore-engines

while getopts g:s: flag
do
  case "${flag}" in
    g) gui=${OPTARG};;
    s) spec=${OPTARG};;
  esac
done

# Run tests.
yarn_script="test-cypress-headless"

if [ -n "${gui-}" ]; then
  yarn_script="test-cypress"
fi

if [ -n "${spec-}" ]; then
  yarn_script="$yarn_script --spec '$spec'"
fi

yarn run $yarn_script


# Generate Cypress report.
yarn run cypress-postreport
