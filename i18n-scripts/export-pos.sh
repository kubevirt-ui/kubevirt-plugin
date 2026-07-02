#!/usr/bin/env bash

set -exuo pipefail

source ./i18n-scripts/languages.sh

for f in locales/en/* ; do
  for i in "${LANGUAGES[@]}"
  do
  npm run i18n-to-po -f "$(basename "$f" .json)" -l "$i"
  done
done
