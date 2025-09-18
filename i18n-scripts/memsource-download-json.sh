#!/usr/bin/env bash

set -exuo pipefail

source ./i18n-scripts/languages.sh

while getopts p: flag
do
  case "${flag}" in
      p) PROJECT_ID=${OPTARG};;
      *) echo "usage: $0 [-p]" >&2
      exit 1;;
  esac
done


echo "Downloading PO files from Project ID \"$PROJECT_ID\""

# Use the locales folder as the download path
DOWNLOAD_PATH="locales"

# Memsource job listing is limited to 50 jobs per page
# We need to pull all the files down by page and stop when we reach a page with no data

# Get the list of jobs and process each one
echo "Fetching job list from Memsource..."

memsource job list --project-id "$PROJECT_ID" -f json | jq -r '.[] | "\(.uid)|\(.target_lang)"' | while IFS='|' read -r uid target_lang; do
  if [ -n "$uid" ] && [ -n "$target_lang" ]; then
    echo "Downloading job $uid for language $target_lang"

    echo "$DOWNLOAD_PATH/$target_lang"
    memsource job download --project-id "$PROJECT_ID" --output-dir "$DOWNLOAD_PATH/$target_lang" --job-id "${uid}" -f json
    
    # Transform &lt; to < in all downloaded files
    echo "Transforming &lt; to < in downloaded files..."
    find "$DOWNLOAD_PATH/$target_lang" -type f -name "*.json" -exec sed -i '' 's/&lt;/</g' {} \;
  fi
done
