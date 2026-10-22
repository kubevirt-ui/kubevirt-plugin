#!/bin/bash
# Build the kubevirt-plugin Playwright image, smoke-test it, and push to Quay.
# Default tag matches this branch (release-4.14 → :release-4.14 only).
#
# Usage:
#   ./test-quay-build.sh                      # push :release-4.14
#   ./test-quay-build.sh release-4.14         # same as default
#   ./test-quay-build.sh latest               # push :latest only
#   ./test-quay-build.sh latest release-4.14  # push multiple tags from one build
#   SMOKE_TEST=0 ./test-quay-build.sh         # skip container smoke checks before push
#
# Required env vars (set in repo-root .env or export before running):
#   QUAY_REGISTRY   - e.g. quay.io
#   QUAY_USERNAME   - e.g. org+robot_name
#   QUAY_PASSWORD   - robot token
#   QUAY_REPOSITORY - e.g. org/kubevirt-plugin-playwright

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$PROJECT_ROOT/.env"
    set +a
fi

for var in QUAY_REGISTRY QUAY_USERNAME QUAY_PASSWORD QUAY_REPOSITORY; do
    if [ -z "${!var:-}" ]; then
        echo "ERROR: $var is not set. Export it or add it to .env before running."
        exit 1
    fi
done

if [ $# -eq 0 ]; then
    TAGS=("release-4.14")
else
    TAGS=("$@")
fi

SMOKE_TEST="${SMOKE_TEST:-1}"

if command -v podman &> /dev/null; then
    RUNTIME="podman"
elif command -v docker &> /dev/null; then
    RUNTIME="docker"
else
    echo "ERROR: Neither podman nor docker found. Install one first."
    exit 1
fi

PRIMARY_IMAGE="$QUAY_REGISTRY/$QUAY_REPOSITORY:${TAGS[0]}"

echo "=== kubevirt-plugin Playwright image — build, test, push ==="
echo "Registry:   $QUAY_REGISTRY"
echo "Repository: $QUAY_REPOSITORY"
echo "Tags:       ${TAGS[*]}"
echo "Runtime:    $RUNTIME"
echo "Smoke test: $SMOKE_TEST"
echo ""

echo "Step 1: Login to $QUAY_REGISTRY..."
echo "$QUAY_PASSWORD" | $RUNTIME login -u "$QUAY_USERNAME" --password-stdin "$QUAY_REGISTRY"
echo "✓ Login OK"
echo ""

echo "Step 2: Build image (tagged as ${TAGS[0]})..."
$RUNTIME build \
    -t "$PRIMARY_IMAGE" \
    -f "$SCRIPT_DIR/Containerfile" \
    --ignorefile "$SCRIPT_DIR/.dockerignore" \
    .
echo "✓ Build OK"
echo ""

if [ "$SMOKE_TEST" = "1" ]; then
    echo "Step 3: Smoke test image..."
    $RUNTIME run --rm "$PRIMARY_IMAGE" /bin/bash -c '
        set -e
        npx playwright --version
        oc version --client
        kubectl version --client
        allure --version
        test -f /app/playwright.config.ts
        node -e "require(\"allure-playwright\"); require(\"@playwright/test\"); console.log(\"npm deps OK\")"
    '
    echo "✓ Smoke test OK"
    echo ""
fi

echo "Step 4: Push tags..."
for TAG in "${TAGS[@]}"; do
    IMAGE="$QUAY_REGISTRY/$QUAY_REPOSITORY:$TAG"
    if [ "$IMAGE" != "$PRIMARY_IMAGE" ]; then
        echo "  Tagging $PRIMARY_IMAGE → $IMAGE"
        $RUNTIME tag "$PRIMARY_IMAGE" "$IMAGE"
    fi
    echo "  Pushing $IMAGE..."
    $RUNTIME push "$IMAGE"
    echo "  ✓ Pushed $IMAGE"
done
echo ""

echo "Step 5: Logout..."
$RUNTIME logout "$QUAY_REGISTRY"
echo "✓ Done"
echo ""

echo "Images available:"
for TAG in "${TAGS[@]}"; do
    echo "  $QUAY_REGISTRY/$QUAY_REPOSITORY:$TAG"
done
echo ""
echo "Pull and run (example):"
echo "  export IMAGE_TAG=${TAGS[0]}"
echo "  podman pull $QUAY_REGISTRY/$QUAY_REPOSITORY:\$IMAGE_TAG"
echo "  playwright/containers/run-tests-container.sh build   # or set IMAGE_NAME to the Quay image"
