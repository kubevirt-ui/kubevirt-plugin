#!/bin/bash
# KubeVirt Plugin Playwright Test Runner

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo -e "${GREEN}KubeVirt Plugin — E2E Test Runner${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} $0 <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  test-gating              Run gating tests (project: Gating)"
    echo "  test-scenario            Run scenario POC tests (project: Scenario)"
    echo "  test-ci                  Alias for test-gating (backward compat)"
    echo "  test-tag <tag>           Run tests matching a tag (e.g., @gating)"
    echo "  test-ui                  Run tests with UI mode (interactive)"
    echo "  test-debug               Run tests with debug mode"
    echo "  test-file <file>         Run a specific test file"
    echo "  show-report              Open the last HTML test report"
    echo "  clean-results            Clean all test results and reports"
    echo "  help                     Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 test-gating                       # Run gating scenarios"
    echo "  $0 test-gating --workers=4           # Gating with 4 workers"
    echo "  $0 test-tag @gating                  # Run by tag"
    echo "  $0 test-file gating/scenario-create-vm-browsing.spec.ts"
}

detect_urls() {
    local dot_env_file="${SCRIPT_DIR}/.env"
    if [[ -f "$dot_env_file" ]]; then
        while IFS='=' read -r key value; do
            [[ "$key" =~ ^[[:space:]]*# ]] && continue
            [[ -z "$key" ]] && continue
            key="${key// /}"
            value="${value#\"}" ; value="${value%\"}"
            value="${value#\'}" ; value="${value%\'}"
            if [[ -z "${!key+x}" ]]; then
                export "$key=$value"
            fi
        done < "$dot_env_file"
    fi

    # CI compatibility: read password from file (Prow convention)
    if [[ -z "${OPENSHIFT_PASSWORD:-}" && -z "${BRIDGE_KUBEADMIN_PASSWORD:-}" ]]; then
        local pw_file="${KUBEADMIN_PASSWORD_FILE:-${INSTALLER_DIR:-/tmp/artifacts/installer}/auth/kubeadmin-password}"
        if [[ -f "$pw_file" ]]; then
            export BRIDGE_KUBEADMIN_PASSWORD="$(cat "$pw_file")"
            echo "BRIDGE_KUBEADMIN_PASSWORD: loaded from ${pw_file}"
        fi
    fi

    # CI compatibility: map BRIDGE_KUBEADMIN_PASSWORD → OPENSHIFT_PASSWORD if not set
    if [[ -z "${OPENSHIFT_PASSWORD:-}" && -n "${BRIDGE_KUBEADMIN_PASSWORD:-}" ]]; then
        export OPENSHIFT_PASSWORD="${BRIDGE_KUBEADMIN_PASSWORD}"
    fi

    if [[ -n "${WEB_CONSOLE_URL:-}" ]]; then
        echo "WEB_CONSOLE_URL: ${WEB_CONSOLE_URL} (from .env or env)"
    elif [[ -n "${BRIDGE_BASE_ADDRESS:-}" ]]; then
        export WEB_CONSOLE_URL="${BRIDGE_BASE_ADDRESS}"
        echo "WEB_CONSOLE_URL: ${WEB_CONSOLE_URL} (from BRIDGE_BASE_ADDRESS)"
    elif [[ -n "${CLUSTER_NAME:-}" && -n "${CLUSTER_DOMAIN:-}" ]]; then
        local discovered_console
        discovered_console=$(
            oc get consoles.config.openshift.io cluster \
                -o jsonpath='{.status.consoleURL}' 2>/dev/null || true
        )
        if [[ -n "$discovered_console" && "$discovered_console" == *"${CLUSTER_NAME}"* ]]; then
            export WEB_CONSOLE_URL="${discovered_console}"
            echo "WEB_CONSOLE_URL: ${WEB_CONSOLE_URL} (discovered via oc)"
        else
            export WEB_CONSOLE_URL="https://console-openshift-console.apps.${CLUSTER_NAME}.${CLUSTER_DOMAIN}/"
            echo "WEB_CONSOLE_URL: ${WEB_CONSOLE_URL} (constructed)"
        fi
    fi

    if [[ -n "${CLUSTER_URL:-}" ]]; then
        echo "CLUSTER_URL: ${CLUSTER_URL} (from .env or env)"
    elif [[ -n "$WEB_CONSOLE_URL" ]]; then
        local infra_domain
        infra_domain=$(echo "$WEB_CONSOLE_URL" | \
            sed -n 's|.*console-openshift-console\.apps\.\([^/]*\).*|\1|p')
        if [[ -n "$infra_domain" ]]; then
            export CLUSTER_URL="https://api.${infra_domain}:6443"
            echo "CLUSTER_URL: ${CLUSTER_URL} (derived from WEB_CONSOLE_URL)"
        fi
    fi

    # CI compatibility: map CNV_NS → TEST_CNV_NS if set by CI
    if [[ -n "${CNV_NS:-}" && -z "${TEST_CNV_NS:-}" ]]; then
        export TEST_CNV_NS="${CNV_NS}"
    fi
}

check_prerequisites() {
    echo -e "${GREEN}Checking prerequisites...${NC}"

    if [ ! -f "package.json" ]; then
        echo -e "${RED}Error: Must be run from project root directory${NC}"
        exit 1
    fi

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Warning: node_modules not found — run npm install${NC}"
        exit 1
    fi

    detect_urls
    echo -e "${GREEN}Prerequisites check passed${NC}"
}

run_pw() {
    npm run test-playwright -- "$@"
}

run_test_gating() {
    check_prerequisites
    echo -e "${GREEN}Running gating tests [Gating]${NC}"
    run_pw --project="Gating" "$@"
}

run_test_tag() {
    local tag="$1"
    shift
    if [ -z "$tag" ]; then
        echo -e "${RED}Error: Please specify a tag${NC}"
        exit 1
    fi
    check_prerequisites
    echo -e "${GREEN}Running tests with tag: $tag${NC}"
    run_pw --grep "$tag" "$@"
}

run_tests_ui() {
    check_prerequisites
    echo -e "${GREEN}Running tests in UI mode...${NC}"
    run_pw --ui "$@"
}

run_tests_debug() {
    check_prerequisites
    echo -e "${GREEN}Running tests in debug mode...${NC}"
    DEBUG=1 run_pw --debug "$@"
}

run_test_scenario() {
    check_prerequisites
    echo -e "${GREEN}Running scenario POC tests [Scenario]${NC}"
    USE_SCENARIO_INFRA=true run_pw --project="scenario" "$@"
}

run_test_file() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Please specify a test file (relative to project root)${NC}"
        exit 1
    fi
    check_prerequisites
    local test_file="$1"
    shift
    if [[ "$test_file" != playwright/tests/* && "$test_file" != /* ]]; then
        test_file="playwright/tests/$test_file"
    fi
    echo -e "${GREEN}Running test file: $test_file${NC}"
    run_pw "$test_file" "$@"
}

show_report() {
    echo -e "${GREEN}Opening last test report...${NC}"
    npx playwright show-report playwright/playwright-report
}

clean_test_results() {
    echo -e "${GREEN}Cleaning test results...${NC}"
    rm -rf playwright/test-results
    rm -rf test-results
    rm -rf .test-configs
    rm -rf .storage-states
    echo -e "${GREEN}Test results cleaned${NC}"
}

main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    local command="$1"
    shift

    case "$command" in
        test-ci|test-gating) run_test_gating "$@" ;;
        test-scenario)      run_test_scenario "$@" ;;
        test-tag)           run_test_tag "$@" ;;
        test-ui)            run_tests_ui "$@" ;;
        test-debug)         run_tests_debug "$@" ;;
        test-file)          run_test_file "$@" ;;
        show-report)        show_report ;;
        clean-results)      clean_test_results ;;
        help|--help|-h)     show_help ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
