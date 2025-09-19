#!/bin/bash

# Read the JSON file and parse it using a tool like 'jq'
# If you don't have 'jq' installed, you'll need to install it: `sudo apt-get install jq` (on Debian/Ubuntu) or `brew install jq` (on macOS)
API_URL=$(jq -r '.API_URL' local.env)
USER_NAME=$(jq -r '.USER_NAME' local.env)
PASSWORD=$(jq -r '.PASSWORD' local.env)
CONSOLE_URL=$(jq -r '.CONSOLE_URL' local.env)

# Check if required variables are present
if [ -z "$API_URL" ] || [ -z "$USER_NAME" ] || [ -z "$PASSWORD" ]; then
  echo "Error: Missing required variables in local.env (API_URL, USER_NAME, or PASSWORD)."
  exit 1
fi

# Run the 'oc login' command
echo "Attempting to log in to OpenShift at $API_URL..."
oc login "$API_URL" -u "$USER_NAME" -p "$PASSWORD"

# Check if the 'oc login' was successful
if [ $? -eq 0 ]; then
  echo "Login successful."
else
  echo "Error: 'oc login' failed. Please check your credentials and API URL."
  exit 1
fi