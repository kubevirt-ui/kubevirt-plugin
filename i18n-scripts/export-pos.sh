#!/bin/sh

set -exuo pipefail

source ./i18n-scripts/languages.sh

for f in locales/en/* ; do
  for i in "${LANGUAGES[@]}"
  do
  npm run i18n-to-po -f "$(basename "$f" .json)" -l "$i"

  case $i in
    es) pattern='plural=(n != 1)' ;;
    fr) pattern='plural=(n >= 2)' ;;
    *)  pattern='plural=0' ;;
  esac

  file="./po-files/$i/plugin__kubevirt-plugin.po"
  sed -i -r "s|${pattern}|${pattern};|g" "$file"
  sed -i -r 's|;;|;|g' "$file"

  done
done
