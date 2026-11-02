#!/bin/bash
# Script to run Playwright tests in a container using Podman/Docker
# This script ensures reports are generated in the same location as local execution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory (playwright/containers/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get project root directory (two levels up)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Auto-load .env from project root if present and not already sourced.
# Variables already set in the environment take precedence (do not override).
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}Loading .env from project root...${NC}"
    set -a
    # shellcheck disable=SC1090
    source "$PROJECT_ROOT/.env"
    set +a
fi

# shellcheck source=scripts/playwright-env.sh
source "${PROJECT_ROOT}/scripts/playwright-env.sh"
playwright_bootstrap_ci_env

# Container runtime detection
if command -v podman &> /dev/null; then
    RUNTIME="podman"
    BUILD_CMD="podman build"
    RUN_CMD="podman run"
    echo -e "${GREEN}Using Podman as container runtime${NC}"
elif command -v docker &> /dev/null; then
    RUNTIME="docker"
    BUILD_CMD="docker build"
    RUN_CMD="docker run"
    echo -e "${GREEN}Using Docker as container runtime${NC}"
else
    echo -e "${RED}Error: Neither podman nor docker found${NC}"
    exit 1
fi

# Container name
CONTAINER_NAME="kubevirt-plugin-playwright"

# Image name (override with IMAGE_NAME env var)
IMAGE_NAME="${IMAGE_NAME:-localhost/kubevirt-plugin-playwright:test}"

# Function to show help
show_help() {
    echo -e "${GREEN}kubevirt-plugin Playwright E2E (4.18) - Container Runner${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} $0 [command] [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  build                    Build the container image"
    echo "  test                     Run all tests (single container)"
    echo "  test-tag TAG             Run tests matching TAG (single container)"
    echo "  test-file FILE           Run a specific test file (single container)"
    echo "  test-debug               Run tests with debug mode (single container)"
    echo "  test-ui                  Run tests with UI mode (single container)"
    echo "  test-connectivity        Check if container can reach remote URL"
    echo "  show-report              Generate and view Allure report"
    echo "  clean                    Clean test results and reports"
    echo "  clean-all                Clean test results, reports, and container image"
    echo "  help                     Show this help message"
    echo ""
    echo -e "${YELLOW}Environment Variables:${NC}"
    echo "  Required:"
    echo "    CLUSTER_NAME           Cluster name (e.g., uit-test-day-02)"
    echo "    CLUSTER_DOMAIN         Cluster domain (e.g., rhos-psi.cnv-qe.rhood.us)"
    echo "    OPENSHIFT_USERNAME     Cluster username (default: kubeadmin)"
    echo "    OPENSHIFT_PASSWORD     Cluster password (or BRIDGE_KUBEADMIN_PASSWORD)"
    echo ""
    echo "  Optional URL overrides:"
    echo "    WEB_CONSOLE_URL        Override console URL"
    echo "    CLUSTER_URL            Override cluster API URL"
    echo ""
    echo "  Other:"
    echo "    PLAYWRIGHT_PROJECT     Gating | Tier1 | Tier2 | Tier1NonPriv | Tier2NonPriv"
    echo "    NON_PRIV               Set to 1 for non-priv storage state / projects"
    echo "    IMAGE_NAME             Container image (default: kubevirt-plugin-playwright:test)"
    echo "    DEBUG                  Enable debug mode (1 for yes)"
    echo "    CI                     Set to 1 for CI mode"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 build"
    echo "  $0 test-tag @gating                              # single container"
    echo "  $0 test-tag @tier1 --workers 3"
    echo "  $0 test                                          # all tests"
    echo "  $0 test-file catalog/catalog.spec.ts"
    echo "  PLAYWRIGHT_PROJECT=Tier1 $0 test --workers=4"
    echo "  $0 show-report"
}

# Function to build container
build_container() {
    echo -e "${GREEN}Building container image...${NC}"
    echo -e "${YELLOW}Building from project root: $PROJECT_ROOT${NC}"
    echo -e "${YELLOW}Using .dockerignore from: $SCRIPT_DIR${NC}"
    # Use .dockerignore from the containers folder
    $BUILD_CMD -t $IMAGE_NAME -f "$SCRIPT_DIR/Containerfile" --ignorefile "$SCRIPT_DIR/.dockerignore" .
    echo -e "${GREEN}✓ Container image built successfully${NC}"
}

# Collect cluster env vars that should be forwarded into every container invocation.
# Prints "-e KEY=VALUE ..." pairs to stdout; caller captures with $(...).
collect_env_args() {
    local env_vars=(
        "CLUSTER_NAME"
        "CLUSTER_DOMAIN"
        "WEB_CONSOLE_URL"
        "BASE_URL"
        "BRIDGE_BASE_ADDRESS"
        "CLUSTER_URL"
        "OPENSHIFT_CLUSTER_URL"
        "OPENSHIFT_USERNAME"
        "OPENSHIFT_PASSWORD"
        "BRIDGE_KUBEADMIN_PASSWORD"
        "TEST_NS"
        "TEST_NAMESPACE"
        "CNV_NAMESPACE"
        "KUBECONFIG"
        "DEBUG"
        "DEBUG_MODE"
        "HEADED"
        "HEADLESS"
        "CI"
        "NON_PRIV"
        "TEST_USERNAME"
        "TEST_PASSWORD"
        "TEST_IDP"
        "PLAYWRIGHT_PROJECT"
        "PLAYWRIGHT_RETRIES"
        "WORKERS"
        "USE_ALLURE"
        "ARTIFACTS_DIR"
        "SKIP_GLOBAL_SETUP"
        "SKIP_GLOBAL_TEARDOWN"
        "SKIP_OC_LOGIN"
        "SKIP_CLUSTER_PREP"
        "REUSE_STORAGE_STATE"
        "IS_LOCAL"
        "STORAGE_CLASS"
    )

    local args=""
    for var in "${env_vars[@]}"; do
        if [ -n "${!var}" ]; then
            args="$args -e ${var}=${!var}"
        fi
    done
    echo "$args"
}

# Return "--network host" when any configured URL points to localhost.
network_option() {
    local env_vars=(
        "WEB_CONSOLE_URL" "BASE_URL" "BRIDGE_BASE_ADDRESS"
        "CLUSTER_URL" "OPENSHIFT_CLUSTER_URL"
    )
    for var in "${env_vars[@]}"; do
        case "${!var}" in
            *"localhost"*|*"127.0.0.1"*)
                echo "--network host"
                return
                ;;
        esac
    done
}

# Standard volume mounts shared by all run modes.
common_volumes() {
    echo \
        "-v ${PROJECT_ROOT}/playwright:/app/playwright:Z" \
        "-v ${PROJECT_ROOT}/playwright.config.ts:/app/playwright.config.ts:Z" \
        "-v ${PROJECT_ROOT}/package.json:/app/package.json:Z" \
        "-v ${PROJECT_ROOT}/package-lock.json:/app/package-lock.json:Z" \
        "-v ${PROJECT_ROOT}/allure-results:/app/allure-results:Z" \
        "-v ${PROJECT_ROOT}/junit-results:/app/junit-results:Z" \
        "-v ${PROJECT_ROOT}/test-results:/app/test-results:Z" \
        "-v ${PROJECT_ROOT}/.kubeconfigs:/app/.kubeconfigs:Z" \
        "-v ${PROJECT_ROOT}/.storage-states:/app/.storage-states:Z"
}

# Ensure host-side result directories exist before mounting them.
ensure_result_dirs() {
    mkdir -p \
        "$PROJECT_ROOT/allure-results" \
        "$PROJECT_ROOT/junit-results" \
        "$PROJECT_ROOT/test-results" \
        "$PROJECT_ROOT/.kubeconfigs" \
        "$PROJECT_ROOT/.storage-states"
}

# ---------------------------------------------------------------------------
# Function to run tests
# ---------------------------------------------------------------------------
run_tests() {
    ensure_result_dirs

    local env_args
    env_args=$(collect_env_args)
    local net
    net=$(network_option)
    local vols
    vols=$(common_volumes)

    if [ -n "$env_args" ]; then
        echo -e "${YELLOW}Forwarding env vars to container...${NC}"
    fi

    local project_args=()
    if [ -n "${PLAYWRIGHT_PROJECT:-}" ]; then
        project_args=(--project="${PLAYWRIGHT_PROJECT}")
    fi

    echo -e "${BLUE}Starting container: $IMAGE_NAME${NC}"
    # shellcheck disable=SC2086
    $RUN_CMD --rm \
        $net \
        --memory=4g \
        --shm-size=2gb \
        --security-opt seccomp=unconfined \
        $vols \
        $env_args \
        "$IMAGE_NAME" \
        npm run test-playwright-headless -- "${project_args[@]}" "$@"
}

# ---------------------------------------------------------------------------
# test-tag: single-container run filtered by tag
# ---------------------------------------------------------------------------
run_test_tag() {
    local tag="$1"
    if [ -z "$tag" ]; then
        echo -e "${RED}Error: TAG is required${NC}"
        echo "Usage: $0 test-tag TAG [extra playwright flags]"
        exit 1
    fi
    shift
    echo -e "${GREEN}Running tag '${tag}' (single container)${NC}"
    run_tests --grep "$tag" "$@"
}

# Function to run specific test file
run_test_file() {
    local test_file="$1"
    if [ -z "$test_file" ]; then
        echo -e "${RED}Error: Please specify a test file${NC}"
        exit 1
    fi
    shift
    run_tests "playwright/tests/$test_file" "$@"
}

# Function to run tests with debug
run_test_debug() {
    echo -e "${GREEN}Running tests in debug mode...${NC}"
    export DEBUG=1
    run_tests "$@"
}

# Function to run tests with UI
run_test_ui() {
    echo -e "${GREEN}Running tests with UI mode...${NC}"
    export DEBUG=1
    run_tests --ui "$@"
}


# Function to test connectivity
test_connectivity() {
    echo -e "${GREEN}Testing container connectivity to remote URL...${NC}"

    local env_args
    env_args=$(collect_env_args)
    local net
    net=$(network_option)

    local test_url=""
    if [ -n "$BASE_URL" ]; then
        test_url="$BASE_URL"
    elif [ -n "$WEB_CONSOLE_URL" ]; then
        test_url="$WEB_CONSOLE_URL"
    elif [ -n "$CLUSTER_NAME" ] && [ -n "$CLUSTER_DOMAIN" ]; then
        test_url="https://console-openshift-console.apps.${CLUSTER_NAME}.${CLUSTER_DOMAIN}/"
        echo -e "${YELLOW}Constructed URL: $test_url${NC}"
    else
        echo -e "${RED}No URL to test. Set BASE_URL, WEB_CONSOLE_URL, or CLUSTER_NAME + CLUSTER_DOMAIN${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Testing connectivity to: $test_url${NC}"
    # shellcheck disable=SC2086
    $RUN_CMD --rm \
        $net \
        --shm-size=2gb \
        $env_args \
        "$IMAGE_NAME" \
        /bin/bash -c "
            echo 'Testing connectivity (SSL verification disabled):'
            curl -k -I --connect-timeout 5 '${test_url}' 2>&1
            echo 'Status: done'
        "
}

# Function to show report
show_report() {
    echo -e "${GREEN}Generating and opening Allure report...${NC}"
    
    # Check if allure-results exists
    if [ ! -d "$PROJECT_ROOT/allure-results" ]; then
        echo -e "${RED}Error: allure-results directory not found${NC}"
        echo "Run tests first to generate results"
        exit 1
    fi
    
    # Check if node_modules exists locally
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies locally for report generation...${NC}"
        cd "$PROJECT_ROOT"
        npm ci
    fi
    
    # Generate report
    echo -e "${YELLOW}Generating Allure report...${NC}"
    cd "$PROJECT_ROOT"
    npx allure generate allure-results --clean -o allure-report
    
    # Open report
    echo -e "${YELLOW}Opening Allure report...${NC}"
    npx allure open allure-report
}

# Function to clean results
clean_results() {
    echo -e "${GREEN}Cleaning test results and reports...${NC}"
    
    cd "$PROJECT_ROOT"
    rm -rf allure-results
    rm -rf allure-report
    rm -rf junit-results
    rm -rf test-results
    rm -rf .test-config*.json
    rm -rf .kubeconfigs
    rm -rf .storage-states
    
    echo -e "${GREEN}Test results cleaned${NC}"
}

# Function to clean all
clean_all() {
    clean_results
    echo -e "${GREEN}Removing container image...${NC}"
    $RUNTIME rmi $IMAGE_NAME 2>/dev/null || true
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Main script logic
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        build)
            build_container
            ;;
        test)
            run_tests "$@"
            ;;
        test-file)
            run_test_file "$@"
            ;;
        test-debug)
            run_test_debug
            ;;
        test-ui)
            run_test_ui
            ;;
        test-tag)
            run_test_tag "$@"
            ;;
        test-connectivity)
            test_connectivity
            ;;
        show-report)
            show_report
            ;;
        clean)
            clean_results
            ;;
        clean-all)
            clean_all
            ;;
    help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

