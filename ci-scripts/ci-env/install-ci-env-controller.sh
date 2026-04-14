#!/bin/bash
#
# Install the CI Environment Controller on an OpenShift cluster.
# This is a standalone script -- it does NOT depend on the ARC install.
#
# What it does:
#   1. Creates the ci-env namespace
#   2. Applies RBAC (ServiceAccount, ClusterRole, ClusterRoleBinding)
#   3. Applies the ci-console ClusterRole (needed by the Helm chart)
#   4. Builds the controller image via setup-controller-image.sh (or uses a pre-built image)
#      The image embeds the Helm chart for the CI test stack.
#   5. Creates a ConfigMap from the controller script (mounted for easy updates)
#   6. Deploys the controller
#   7. Creates a RoleBinding so the ARC runner SA can create ConfigMaps in ci-env
#
# Optional environment variables:
#   CI_ENV_NS                    Namespace for the controller (default: ci-env)
#   CI_ENV_CONTROLLER_IMAGE      Pre-built image; skips BuildConfig if set
#   ARC_RUNNERS_NS               Namespace where ARC runner pods run (default: arc-runners)
#   RUNNER_SCALE_SET_NAME        ARC scale set name (default: kubevirt-plugin-ci)
#
# Prerequisites: oc login to OpenShift with cluster-admin

set -euo pipefail

CI_ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${CI_ENV_DIR}/.." && pwd)"

CI_ENV_NS="${CI_ENV_NS:-ci-env}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
RUNNER_SA_NAME="${RUNNER_SCALE_SET_NAME}-gha-rs-no-permission"

echo "=== CI Environment Controller installation ==="
echo "  CI_ENV_NS:           ${CI_ENV_NS}"
echo "  ARC_RUNNERS_NS:      ${ARC_RUNNERS_NS}"
echo "  RUNNER_SA_NAME:      ${RUNNER_SA_NAME}"
echo ""

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: This script targets OpenShift only."
  exit 1
fi

# --- 1. Namespace ---
echo "Creating namespace ${CI_ENV_NS}..."
oc apply -f "${CI_ENV_DIR}/ci-env-namespace.yaml"

# --- 2. RBAC ---
echo "Applying controller RBAC..."
oc apply -f "${CI_ENV_DIR}/ci-env-controller-rbac.yaml"

# --- 3. ci-console ClusterRole ---
echo "Applying ci-console ClusterRole..."
oc apply -f "${CI_SCRIPTS_DIR}/arc/ci-console-clusterrole.yaml"

# --- 4. Controller image ---
if [[ -z "${CI_ENV_CONTROLLER_IMAGE:-}" ]]; then
  echo "Building controller image via setup-controller-image.sh..."
  IMAGE_OUTPUT="$(CI_ENV_NS="${CI_ENV_NS}" bash "${CI_ENV_DIR}/setup-controller-image.sh")"
  CI_ENV_CONTROLLER_IMAGE="$(echo "${IMAGE_OUTPUT}" | grep '^IMAGE_REF=' | cut -d= -f2-)"
  if [[ -z "${CI_ENV_CONTROLLER_IMAGE}" ]]; then
    echo "ERROR: setup-controller-image.sh did not output IMAGE_REF="
    exit 1
  fi
  echo "Built image: ${CI_ENV_CONTROLLER_IMAGE}"
else
  echo "Using pre-built image: ${CI_ENV_CONTROLLER_IMAGE}"
fi

# --- 5. ConfigMap for controller script (mounted for easy updates) ---
echo "Creating ConfigMap from controller script..."
oc create configmap ci-env-controller-script \
  -n "${CI_ENV_NS}" \
  --from-file=ci-env-controller.sh="${CI_ENV_DIR}/ci-env-controller.sh" \
  --dry-run=client -o yaml | oc apply -f -

# --- 6. Deploy the controller ---
echo "Deploying ci-env-controller..."
sed -e "s|CI_ENV_CONTROLLER_IMAGE_PLACEHOLDER|${CI_ENV_CONTROLLER_IMAGE}|g" \
    -e "s|RUNNER_SA_NAME_PLACEHOLDER|${RUNNER_SA_NAME}|g" \
    -e "s|RUNNER_SA_NS_PLACEHOLDER|${ARC_RUNNERS_NS}|g" \
  "${CI_ENV_DIR}/ci-env-controller-deployment.yaml" \
  | oc apply -f -

echo "Waiting for controller to be ready..."
oc rollout status deployment/ci-env-controller -n "${CI_ENV_NS}" --timeout=120s || true

# --- 7. RoleBinding for ARC runner SA ---
echo "Creating RoleBinding for runner SA (${RUNNER_SA_NAME}) in ${CI_ENV_NS}..."
oc apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ci-env-trigger
  namespace: ${CI_ENV_NS}
  labels:
    app.kubernetes.io/component: ci-env-controller
rules:
  - apiGroups: ['']
    resources: ['configmaps']
    verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ci-env-trigger-runner
  namespace: ${CI_ENV_NS}
  labels:
    app.kubernetes.io/component: ci-env-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ci-env-trigger
subjects:
  - kind: ServiceAccount
    name: ${RUNNER_SA_NAME}
    namespace: ${ARC_RUNNERS_NS}
EOF

echo ""
echo "=== CI Environment Controller installation complete ==="
echo ""
echo "  Controller image:  ${CI_ENV_CONTROLLER_IMAGE}"
echo "  Controller NS:     ${CI_ENV_NS}"
echo "  Runner SA:         ${ARC_RUNNERS_NS}/${RUNNER_SA_NAME} (can create ConfigMaps in ${CI_ENV_NS})"
echo ""
echo "  To test, create a trigger ConfigMap:"
echo "    oc create -n ${CI_ENV_NS} -f - <<CM"
echo "    apiVersion: v1"
echo "    kind: ConfigMap"
echo "    metadata:"
echo "      name: ci-env-test"
echo "      labels:"
echo "        ci.kubevirt-plugin/type: test-environment"
echo "    data:"
echo "      desired-state: present"
echo "      plugin-image: ttl.sh/kubevirt-plugin-ci-test:1h"
echo "      test-namespace: ci-env-test-ns"
echo "    CM"
echo ""
