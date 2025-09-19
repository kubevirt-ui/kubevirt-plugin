#!/bin/bash

# Define the path to your environment file
ENV_FILE="local.env"

# Read JSON file using 'jq'
API_URL=$(jq -r '.API_URL' "$ENV_FILE")
USER_NAME=$(jq -r '.USER_NAME' "$ENV_FILE")
PASSWORD=$(jq -r '.PASSWORD' "$ENV_FILE")
CONSOLE_URL=$(jq -r '.CONSOLE_URL' "$ENV_FILE")

# Check if required variables are present
if [ -z "$API_URL" ] || [ -z "$USER_NAME" ] || [ -z "$PASSWORD" ]; then
  echo "Error: Missing required variables in $ENV_FILE (API_URL, USER_NAME, or PASSWORD)."
  exit 1
fi

# Run the 'oc login' command
echo "Attempting to log in to OpenShift at $API_URL..."
oc login "$API_URL" -u "$USER_NAME" -p "$PASSWORD"

# Check if 'oc login' was successful
if [ $? -ne 0 ]; then
  echo "Error: 'oc login' failed. Please check your credentials and API URL."
  exit 1
fi

# Process command-line arguments
if [[ "$1" == "--start-console" ]]; then
  echo "Starting the console..."
  # Read brand and image from local.env
  BRIDGE_BRANDING=$(jq -r '.BRIDGE_BRANDING' "$ENV_FILE")
  CONSOLE_IMAGE=$(jq -r '.CONSOLE_IMAGE' "$ENV_FILE")

  # Shift past the --start-console flag
  shift

  # Get the remaining arguments as plugins (optional)
  PLUGINS="$@"
  
  # Run the yarn command with plugins and env vars
  BRIDGE_BRANDING="$BRIDGE_BRANDING" CONSOLE_IMAGE="$CONSOLE_IMAGE" yarn start-console "$PLUGINS" &

  # Open the console URL in the browser
  echo "Login successful. Opening console URL: $CONSOLE_URL"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$CONSOLE_URL"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$CONSOLE_URL"
  else
    echo "Warning: Could not automatically open the browser. Please manually navigate to: $CONSOLE_URL"
  fi
else
  # Default behavior: simply log in and exit
  echo "Login successful. No browser will be opened."
fi