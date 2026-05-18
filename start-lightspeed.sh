#!/bin/sh
# Helper script to set up and start the Lightspeed backend service (OLS) for local development.
# Sourced by start-console.sh when lightspeed-console-plugin is requested.
#
# Prerequisites: ollama must be installed (https://ollama.com/)
#
# Environment variables (set by caller):
#   OLS_PORT  - Port for lightspeed-service (default: 8080)
#   BASE_DIR  - Caller's working directory (required)
#
# Provides:
#   start_lightspeed_service  - Clone, configure, and start the OLS backend
#   configure_lightspeed_proxy - Add OLS proxy entry to BRIDGE_PLUGIN_PROXY
#   launch_chrome_insecure     - Open Chrome with --disable-web-security
OLS_PORT=${OLS_PORT:-8080}
LIGHTSPEED_SERVICE_DIR="../lightspeed-service"

: "${BASE_DIR:?BASE_DIR must be set by the caller}"

start_lightspeed_service() {
    # ── Clone lightspeed-service if needed ──────────────────────────
    if [ ! -d "$LIGHTSPEED_SERVICE_DIR" ]; then
        echo "Cloning lightspeed-service..."
        git clone https://github.com/openshift/lightspeed-service.git "$LIGHTSPEED_SERVICE_DIR"
    fi

    # ── Ollama: start server + pull model ──────────────────────────
    if command -v ollama >/dev/null; then
        if ! pgrep -x "ollama" >/dev/null 2>&1; then
            echo "Starting ollama server..."
            ollama serve &
            sleep 2
        else
            echo "ollama is already running."
        fi

        if ! ollama list 2>/dev/null | grep -q "llama3.1:latest"; then
            echo "Pulling llama3.1:latest model (this may take a while on first run)..."
            ollama pull llama3.1:latest
        fi
    else
        echo "================================================================"
        echo "ERROR: ollama is not installed."
        echo "  Install it from https://ollama.com/ then run:"
        echo "    ollama pull llama3.1:latest"
        echo "================================================================"
        echo "The lightspeed service will start but will not work without an LLM backend."
    fi

    # ── Generate default config if missing ─────────────────────────
    if [ ! -f "$LIGHTSPEED_SERVICE_DIR/olsconfig.yaml" ]; then
        echo "Creating default olsconfig.yaml for local ollama..."
        cat > "$LIGHTSPEED_SERVICE_DIR/olsconfig.yaml" << 'OLSCFG'
llm_providers:
  - name: ollama
    type: openai
    url: "http://localhost:11434/v1/"
    models:
      - name: 'llama3.1:latest'
ols_config:
  reference_content:
  conversation_cache:
    type: memory
    memory:
      max_entries: 1000
  logging_config:
    app_log_level: info
    lib_log_level: warning
    uvicorn_log_level: info
  default_provider: ollama
  default_model: 'llama3.1:latest'
  user_data_collection:
    feedback_disabled: false
    feedback_storage: "/tmp/data/feedback"
    transcripts_disabled: false
    transcripts_storage: "/tmp/data/transcripts"
dev_config:
  enable_dev_ui: true
  disable_auth: true
  disable_tls: true
OLSCFG
    fi

    # ── Create Python venv if needed ───────────────────────────────
    if [ ! -d "$LIGHTSPEED_SERVICE_DIR/.venv" ]; then
        echo "Creating Python virtual environment for lightspeed-service..."
        python3 -m venv "$LIGHTSPEED_SERVICE_DIR/.venv"
    fi

    # ── Start lightspeed-service in a subshell ─────────────────────
    echo "Starting lightspeed-service on port $OLS_PORT..."
    (
        cd "$LIGHTSPEED_SERVICE_DIR"
        # shellcheck disable=SC1091
        . .venv/bin/activate
        OPENAI_API_KEY="${OPENAI_API_KEY:-IGNORED}" make install-deps && \
        OPENAI_API_KEY="${OPENAI_API_KEY:-IGNORED}" make run
    ) &

    # ── Wait for readiness ─────────────────────────────────────────
    echo "Waiting for lightspeed-service to be ready..."
    for i in $(seq 1 60); do
        if curl -s "http://127.0.0.1:$OLS_PORT/readiness" >/dev/null 2>&1; then
            echo "lightspeed-service is ready."
            break
        fi
        if [ "$i" = "60" ]; then
            echo "Warning: lightspeed-service may not be ready yet. Continuing anyway."
        fi
        sleep 2
    done
}

configure_lightspeed_proxy() {
    ols_endpoint_linux="http://localhost:${OLS_PORT}"
    ols_endpoint_container="http://host.containers.internal:${OLS_PORT}"
    ols_endpoint_docker="http://host.docker.internal:${OLS_PORT}"

    if command -v podman >/dev/null; then
        if [ "$(uname -s)" = "Linux" ]; then
            ols_endpoint="$ols_endpoint_linux"
        else
            ols_endpoint="$ols_endpoint_container"
        fi
    else
        ols_endpoint="$ols_endpoint_docker"
    fi

    BRIDGE_PLUGIN_PROXY=${BRIDGE_PLUGIN_PROXY:-'{"services":[]}'}
    BRIDGE_PLUGIN_PROXY=$(echo "$BRIDGE_PLUGIN_PROXY" | jq -c \
        --arg endpoint "$ols_endpoint" \
        '.services += [{"consoleAPIPath":"/api/proxy/plugin/lightspeed-console-plugin/ols/","endpoint":$endpoint,"authorize":true}]')
    export BRIDGE_PLUGIN_PROXY
    echo "OLS PROXY: $(echo "${BRIDGE_PLUGIN_PROXY}" | jq .)"
}

launch_chrome_insecure() {
    CHROME_DATA_DIR="${HOME}/chrome-dev-data-dir"
    CHROME_URL="http://localhost:${CONSOLE_PORT}"
    echo "Launching Chrome with disabled web security..."

    if [ "$(uname -s)" = "Darwin" ]; then
        open -a "Google Chrome" --args --disable-web-security --user-data-dir="$CHROME_DATA_DIR" "$CHROME_URL" &
    elif command -v google-chrome >/dev/null; then
        google-chrome --disable-web-security --user-data-dir="$CHROME_DATA_DIR" "$CHROME_URL" &
    elif command -v google-chrome-stable >/dev/null; then
        google-chrome-stable --disable-web-security --user-data-dir="$CHROME_DATA_DIR" "$CHROME_URL" &
    elif command -v chromium-browser >/dev/null; then
        chromium-browser --disable-web-security --user-data-dir="$CHROME_DATA_DIR" "$CHROME_URL" &
    else
        echo "Warning: Could not find Chrome. Please open Chrome manually with:"
        echo "  google-chrome --disable-web-security --user-data-dir=\"$CHROME_DATA_DIR\" $CHROME_URL"
    fi
}
