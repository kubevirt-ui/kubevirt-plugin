#!/usr/bin/env bash
#
# Ensure an htpasswd identity provider exists on the cluster, upsert a user +
# password into it, grant that user cluster-admin, and extract the cluster CA
# bundle for OIDC verification. Used by the manual-console deploy path
# (CNV-92150) so a fresh, dedicated login can be generated on every deploy --
# no CLUSTER_ADMIN_PASSWORD secret or kubeadmin dependency required.
#
# Invoked by ci-env-controller.sh (in-cluster, cluster-admin ServiceAccount)
# only when a ConfigMap's auth-mode=openshift; never touched by the default
# E2E provisioning path.
#
# Usage: echo <password> | ensure-manual-console-user.sh <username>
#
# The password is read from stdin, not argv -- CLI arguments persist for the
# process's whole lifetime and are visible to any co-located process via
# `ps`/`/proc/<pid>/cmdline`, unlike a pipe.
#
# Idempotent: safe to re-run on every deploy. Re-running with the same
# username replaces that user's password hash; other users already present
# in the htpasswd secret (e.g. cluster setup's "admin") are preserved.
#
# Output (stdout): CA_CERT_FILE=<path to a temp file with the PEM CA bundle>
#   Caller is responsible for deleting this file after use.
#
# Requires: oc logged in with cluster-admin (or equivalent) permissions to
# manage openshift-config secrets, the cluster OAuth config, and
# cluster-admin ClusterRoleBindings. Also requires the `htpasswd` CLI
# (httpd-tools / apache2-utils).
set -euo pipefail

USERNAME="${1:?Usage: ensure-manual-console-user.sh <username> (password via stdin)}"

PASSWORD="$(cat)"
if [[ -z "${PASSWORD}" ]]; then
  echo "ERROR: password not provided on stdin. Usage: ensure-manual-console-user.sh <username> (password via stdin)" >&2
  exit 1
fi

if ! command -v htpasswd &>/dev/null; then
  echo "ERROR: htpasswd (httpd-tools / apache2-utils) is required" >&2
  exit 1
fi

echo "Ensuring htpasswd user '${USERNAME}'..."

EXISTING_HTPASSWD=""
if oc get secret htpass-secret -n openshift-config &>/dev/null; then
  EXISTING_HTPASSWD="$(oc get secret htpass-secret -n openshift-config \
    -o jsonpath='{.data.htpasswd}' | base64 -d)"
fi

# -i (stdin) instead of -b (argv): htpasswd's own argv is visible to any
# co-located process for its whole (brief) lifetime, same reasoning as the
# stdin handoff above.
NEW_HASH="$(printf '%s' "${PASSWORD}" | htpasswd -niB "${USERNAME}")"

# Drop any existing line for this user, then append the fresh hash. Uses awk
# with a literal field comparison (not grep -v "^${USERNAME}:") so usernames
# containing regex metacharacters (., *, [, etc.) can't misfire.
UPDATED_HTPASSWD="$(printf '%s\n' "${EXISTING_HTPASSWD}" \
  | awk -F: -v u="${USERNAME}" '$1 != u && NF' )"
UPDATED_HTPASSWD="$(printf '%s\n%s' "${UPDATED_HTPASSWD}" "${NEW_HASH}" | sed '/^$/d')"

oc create secret generic htpass-secret \
  --from-literal=htpasswd="${UPDATED_HTPASSWD}" \
  -n openshift-config --dry-run=client -o yaml | oc apply -f -

HAS_HTPASSWD_IDP="$(oc get oauth cluster \
  -o jsonpath='{.spec.identityProviders[?(@.type=="HTPasswd")].name}' 2>/dev/null || true)"

if [[ -z "${HAS_HTPASSWD_IDP}" ]]; then
  echo "Adding htpasswd identity provider to cluster OAuth config (preserving existing identity providers)..."

  # Read-merge-patch, not a full-manifest apply: identityProviders is a plain
  # array with no merge key, so a JSON merge patch replaces it wholesale with
  # whatever we send. Fetching the current list and appending to it (instead
  # of sending a single-entry list) is what actually preserves any other
  # identity provider (LDAP, GitHub, ...) already configured on this cluster.
  EXISTING_IDPS="$(oc get oauth cluster -o jsonpath='{.spec.identityProviders}' 2>/dev/null || true)"
  [[ -z "${EXISTING_IDPS}" ]] && EXISTING_IDPS='[]'

  PATCH_JSON="$(jq -nc --argjson existing "${EXISTING_IDPS}" '{
    spec: {
      identityProviders: ($existing + [{
        name: "htpasswd",
        mappingMethod: "claim",
        type: "HTPasswd",
        htpasswd: {fileData: {name: "htpass-secret"}}
      }])
    }
  }')"

  oc patch oauth cluster --type=merge -p "${PATCH_JSON}"

  echo "Waiting for OAuth pods to roll out..."
  oc rollout status deployment/oauth-openshift -n openshift-authentication --timeout=120s 2>&1 \
    || echo "WARN: OAuth rollout did not complete within 120s" >&2
else
  echo "htpasswd identity provider '${HAS_HTPASSWD_IDP}' already present; secret updated in place."
fi

echo "Granting cluster-admin to ${USERNAME}..."
oc adm policy add-cluster-role-to-user cluster-admin "${USERNAME}" 2>&1 || true

# Extract the cluster CA bundle so the console pod can verify the OAuth
# server when running in off-cluster mode. Kubernetes 1.24+ no longer
# auto-provisions a `type: kubernetes.io/service-account-token` Secret per
# ServiceAccount, so indexing `.items[0]` on that list can silently hit an
# empty array on newer clusters and produce a garbage CA file (jq returns
# null for an out-of-range index rather than erroring, and `base64 -d` then
# "decodes" that into junk bytes instead of failing loudly). kube-root-ca.crt
# is a ConfigMap Kubernetes auto-creates in every namespace since 1.20
# specifically to publish this CA bundle, independent of that SA-secret
# auto-provisioning behavior -- and ConfigMap data is plain text, so no
# base64 decoding step is needed either.
CA_CERT_FILE="$(mktemp)"
oc get configmap kube-root-ca.crt -n default -o jsonpath='{.data.ca\.crt}' > "${CA_CERT_FILE}"
if [[ ! -s "${CA_CERT_FILE}" ]]; then
  echo "ERROR: could not read CA bundle from configmap/kube-root-ca.crt in the default namespace" >&2
  rm -f "${CA_CERT_FILE}"
  exit 1
fi

echo "User '${USERNAME}' ready with cluster-admin access."
echo "CA_CERT_FILE=${CA_CERT_FILE}"
