#!/bin/bash
#
# Log IBM Cloud identity and infrastructure permission gaps for CI debugging.
# Supports both classic and VPC infrastructure types.
# Safe to run in GitHub Actions — never fails the job (exit 0).
#
# Output:
#   - Step log (expand "Log IBM Cloud IAM diagnostics" in Actions)
#   - Job Summary tab on the workflow run page
#   - Artifact ibmcloud-iam-diagnostics.txt (when GITHUB_STEP_SUMMARY is set)
#
# Optional env:
#   INFRASTRUCTURE_TYPE   'classic' (default) or 'vpc'
#   WORKER_ZONE           Classic datacenter (e.g. fra02, wdc04) or VPC zone (e.g. us-south-1)
#   IBM_REGION            Override KS region for infra-permissions (classic only)

set -uo pipefail

DIAG_FILE="${RUNNER_TEMP:-/tmp}/ibmcloud-iam-diagnostics.txt"
INFRASTRUCTURE_TYPE="${INFRASTRUCTURE_TYPE:-classic}"

# Map classic datacenter zone -> Kubernetes Service region for infra-permissions.
map_worker_zone_to_infra_region() {
  local zone="${1:?zone required}"
  case "${zone}" in
    fra*|ams*|lon*|par*|sng*) echo "eu-de" ;;
    wdc*|dal*|sjc*|tor*|mon*|che*|sao*) echo "us-south" ;;
    tok*|osa*) echo "jp-tok" ;;
    syd*) echo "au-syd" ;;
    *) echo "us-south" ;;
  esac
}

if [[ -n "${IBM_REGION:-}" ]]; then
  INFRA_REGIONS=("${IBM_REGION}")
elif [[ -n "${WORKER_ZONE:-}" && "${INFRASTRUCTURE_TYPE}" == "classic" ]]; then
  INFRA_REGIONS=("$(map_worker_zone_to_infra_region "${WORKER_ZONE}")")
else
  INFRA_REGIONS=("eu-de")
fi

run_classic_infra_permissions() {
  local region="$1"
  echo "#### ibmcloud ks infra-permissions get --region ${region}"
  echo ""
  echo '```'
  ibmcloud ks infra-permissions get --region "${region}" -q 2>&1 || true
  echo '```'
  echo ""
}

run_vpc_diagnostics() {
  echo "### VPC Infrastructure probe"
  echo ""
  echo "#### VPCs in account"
  echo '```'
  ibmcloud is vpcs 2>&1 || echo "(ibmcloud is vpcs failed — VPC Infrastructure plugin may not be installed or no permissions)"
  echo '```'
  echo ""
  echo "#### VPC zones available"
  echo '```'
  if [[ -n "${WORKER_ZONE:-}" ]]; then
    VPC_REGION="${WORKER_ZONE%-*}"
    ibmcloud is zones --output json 2>&1 | jq -r --arg r "${VPC_REGION}" '.[] | select(.region.name == $r) | .name' 2>/dev/null || \
      ibmcloud is zones 2>&1 || echo "(zone listing failed)"
  else
    ibmcloud is zones 2>&1 || echo "(zone listing failed)"
  fi
  echo '```'
  echo ""
  echo "#### VPC flavors in zone ${WORKER_ZONE:-<unset>}"
  echo '```'
  if [[ -n "${WORKER_ZONE:-}" ]]; then
    ibmcloud oc flavors --zone "${WORKER_ZONE}" --provider vpc-gen2 2>&1 | head -30 || echo "(flavor listing failed)"
  else
    echo "(WORKER_ZONE not set, skipping flavor check)"
  fi
  echo '```'
  echo ""
}

run_ipi_prerequisites() {
  echo "### IPI Prerequisites Check"
  echo ""
  echo "Checking if the account has the resources needed for OpenShift IPI on IBM Cloud VPC..."
  echo ""

  echo "#### 1. VPC Infrastructure (create VMs, networks)"
  echo '```'
  if ibmcloud is vpcs 2>&1 | head -3; then
    echo "RESULT: VPC access OK"
  else
    echo "RESULT: FAILED — need VPC Infrastructure Administrator"
  fi
  echo '```'
  echo ""

  echo "#### 2. Cloud Object Storage (RHCOS images, ignition)"
  echo '```'
  if ibmcloud resource service-instances --service-name cloud-object-storage 2>&1 | head -5; then
    echo "RESULT: COS access OK"
  else
    echo "RESULT: FAILED — need COS Administrator"
  fi
  echo '```'
  echo ""

  echo "#### 3. DNS Services (cluster API/ingress records)"
  echo '```'
  ibmcloud plugin install dns -f 2>/dev/null || true
  if ibmcloud dns zones 2>&1 | head -10; then
    echo "RESULT: DNS Services access OK"
  else
    echo "RESULT: FAILED or no DNS zones configured — IPI needs a public DNS zone"
  fi
  echo '```'
  echo ""

  echo "#### 4. Internet Services / CIS (alternative to DNS Services)"
  echo '```'
  ibmcloud plugin install cis -f 2>/dev/null || true
  if ibmcloud cis instances 2>&1 | head -5; then
    echo "RESULT: CIS access OK"
  else
    echo "RESULT: No CIS instances (may use DNS Services instead)"
  fi
  echo '```'
  echo ""

  echo "#### 5. IAM Identity Service (service IDs for cluster components)"
  echo '```'
  if ibmcloud iam service-ids 2>&1 | head -5; then
    echo "RESULT: IAM Identity access OK"
  else
    echo "RESULT: FAILED — need IAM Identity Service Administrator"
  fi
  echo '```'
  echo ""

  echo "#### 6. Resource groups"
  echo '```'
  ibmcloud resource groups 2>&1 | head -10
  echo '```'
  echo ""

  echo "#### 7. IAM authorization policies (service-to-service)"
  echo '```'
  ibmcloud iam authorization-policies 2>&1 | head -20
  echo '```'
  echo ""

  echo "#### Summary"
  echo ""
  echo "If checks 1-5 show OK and check 3 or 4 has a DNS zone, IPI should work."
  echo "If DNS shows no zones, a domain + DNS zone must be configured first."
  echo ""
}

write_diagnostics() {
  echo "## IBM Cloud IAM diagnostics"
  echo ""
  echo "Infrastructure type: \`${INFRASTRUCTURE_TYPE}\`"
  echo "Worker zone: \`${WORKER_ZONE:-<unset>}\`"
  if [[ "${INFRASTRUCTURE_TYPE}" == "classic" ]]; then
    echo "Infra-permissions region(s): \`${INFRA_REGIONS[*]}\`"
  fi
  echo ""

  echo "### Target"
  echo '```'
  ibmcloud target 2>&1 || echo "(ibmcloud target failed)"
  echo '```'
  echo ""

  echo "### Account"
  echo '```'
  ibmcloud account show 2>&1 || echo "(ibmcloud account show failed)"
  echo '```'
  echo ""

  echo "### Cluster list probe"
  echo '```'
  ibmcloud oc cluster ls 2>&1 || echo "(ibmcloud oc cluster ls failed)"
  echo '```'
  echo ""

  if [[ "${INFRASTRUCTURE_TYPE}" == "ipi" ]]; then
    run_ipi_prerequisites
  elif [[ "${INFRASTRUCTURE_TYPE}" == "vpc" ]]; then
    run_vpc_diagnostics
  else
    echo "### Classic infrastructure permissions (missing required/suggested)"
    echo ""
    for region in "${INFRA_REGIONS[@]}"; do
      run_classic_infra_permissions "${region}"
    done
  fi
}

echo "::group::IBM Cloud IAM diagnostics"
write_diagnostics | tee "${DIAG_FILE}"
echo "::endgroup::"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "## IBM Cloud IAM diagnostics"
    echo ""
    echo "Full output is also in the **Log IBM Cloud IAM diagnostics** step log and the \`ibmcloud-iam-diagnostics\` artifact."
    echo ""
    cat "${DIAG_FILE}"
  } >> "${GITHUB_STEP_SUMMARY}"
fi

echo ""
echo "=== IBM Cloud IAM diagnostics written to ${DIAG_FILE} ==="
echo "=== Also check the workflow run Summary tab (top of the run page) ==="

exit 0
