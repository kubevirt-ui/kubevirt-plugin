#!/usr/bin/env bash
set -euo pipefail

# Reduce root package.json to Playwright E2E deps only (console webpack/Jest stack excluded).
jq '
  .dependencies = {
    "js-yaml": .dependencies["js-yaml"],
    "undici": .dependencies["undici"]
  } |
  .devDependencies = {
    "@playwright/test": .devDependencies["@playwright/test"],
    "playwright": .devDependencies["playwright"],
    "allure-js-commons": .devDependencies["allure-js-commons"],
    "allure-playwright": .devDependencies["allure-playwright"],
    "dotenv": .devDependencies["dotenv"],
    "typescript": .devDependencies["typescript"],
    "ts-node": .devDependencies["ts-node"],
    "@types/node": .devDependencies["@types/node"],
    "@types/js-yaml": .devDependencies["@types/js-yaml"]
  } |
  del(.scripts.postinstall)
' package.json > package.ci.json

mv package.ci.json package.json
NPM_CONFIG_CACHE=/tmp/npm-cache npm install --ignore-scripts --no-package-lock
rm -rf /tmp/npm-cache
