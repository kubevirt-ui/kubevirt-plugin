#!/usr/bin/env bash
#
# Prove the IBM Cloud API key can create+delete CIS DNS records for BASE_DOMAIN
# before openshift-install spends hours on IPI. Failures here are the same class
# as "Method Not Allowed" during install DNS create.
#
# Required env:
#   IC_API_KEY     IBM Cloud API key (same as GitHub secret IC_KEY)
#   BASE_DOMAIN    CIS-managed zone (e.g. cnv-ui.com)
#   CLUSTER_NAME   Used in the throwaway record name for easy identification
#
# Optional env:
#   CIS_INSTANCE   CIS instance name or CRN (default: first instance returned)

set -euo pipefail

IC_API_KEY="${IC_API_KEY:?IC_API_KEY must be set}"
BASE_DOMAIN="${BASE_DOMAIN:?BASE_DOMAIN must be set}"
CLUSTER_NAME="${CLUSTER_NAME:?CLUSTER_NAME must be set}"
CIS_INSTANCE="${CIS_INSTANCE:-}"

export IC_API_KEY

echo "=== CIS DNS write preflight (zone=${BASE_DOMAIN}, cluster=${CLUSTER_NAME}) ==="

ibmcloud plugin install cis -f 2>&1 | tail -3 || true

if [[ -z "${CIS_INSTANCE}" ]]; then
  CIS_INSTANCE=$(ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty' || true)
fi

if [[ -z "${CIS_INSTANCE}" ]]; then
  echo "::error::No IBM Cloud Internet Services (CIS) instance found. IPI public clusters require CIS with an authoritative zone for '${BASE_DOMAIN}'. See https://docs.okd.io/4.22/installing/installing_ibm_cloud/installing-ibm-cloud-account.html"
  exit 1
fi

echo "Using CIS instance: ${CIS_INSTANCE}"
ibmcloud cis instance-set "${CIS_INSTANCE}"

ZONE_ID=$(ibmcloud cis domains --output json 2>/dev/null \
  | jq -r --arg d "${BASE_DOMAIN}" '.[] | select(.name == $d) | .id // empty' | head -1 || true)

if [[ -z "${ZONE_ID}" ]]; then
  echo "::error::CIS zone '${BASE_DOMAIN}' not found on the targeted CIS instance. Confirm the domain is active and authoritative for IPI DNS."
  echo "Domains on this instance:"
  ibmcloud cis domains --output json 2>/dev/null | jq -r '.[].name // empty' || true
  exit 1
fi

echo "Found zone '${BASE_DOMAIN}' (id=${ZONE_ID})"

# Unique short-lived name so concurrent preflights do not collide.
RECORD_LABEL="preflight-${CLUSTER_NAME}-$(date +%s)"
RECORD_FQDN="${RECORD_LABEL}.${BASE_DOMAIN}"

echo "Creating throwaway A record '${RECORD_FQDN}'..."
CREATE_OUT=$(ibmcloud cis dns-record-create "${ZONE_ID}" \
  --type A \
  --name "${RECORD_LABEL}" \
  --content 1.2.3.4 \
  --ttl 120 \
  --output json 2>&1) || CREATE_RC=$?
CREATE_RC="${CREATE_RC:-0}"

if [[ "${CREATE_RC}" -ne 0 ]]; then
  echo "${CREATE_OUT}"
  if echo "${CREATE_OUT}" | grep -qiE 'Method Not Allowed|405|not authorized|forbidden|403|not permitted'; then
    echo "::error::CIS DNS create failed (HTTP 403/405 or auth). openshift-install will hit the same error creating api.${CLUSTER_NAME}.${BASE_DOMAIN}. Fix: CIS plan must be Standard Next (or higher), and IC_KEY needs Internet Services Administrator/Writer on the CIS instance / resource group. Then re-run setup."
  else
    echo "::error::CIS DNS create failed during preflight. Fix CIS permissions/zone before running IPI install."
  fi
  exit 1
fi

RECORD_ID=$(echo "${CREATE_OUT}" | jq -r '.id // empty' 2>/dev/null || true)
if [[ -z "${RECORD_ID}" ]]; then
  # Some CLI versions print a table; fall back to lookup by name.
  RECORD_ID=$(ibmcloud cis dns-records "${ZONE_ID}" --output json 2>/dev/null \
    | jq -r --arg n "${RECORD_FQDN}" --arg short "${RECORD_LABEL}" \
      '.[] | select(.name == $n or .name == $short or (.name | endswith($n))) | .id' \
    | head -1 || true)
fi

if [[ -z "${RECORD_ID}" ]]; then
  echo "::error::Created CIS DNS record but could not resolve its id for cleanup. Check CIS console for '${RECORD_FQDN}'."
  echo "${CREATE_OUT}"
  exit 1
fi

echo "Created record id=${RECORD_ID}; deleting..."
if ! ibmcloud cis dns-record-delete "${ZONE_ID}" "${RECORD_ID}"; then
  echo "::warning::Failed to delete preflight record ${RECORD_ID} (${RECORD_FQDN}). Delete it manually from CIS."
fi

echo "CIS DNS write preflight succeeded."
