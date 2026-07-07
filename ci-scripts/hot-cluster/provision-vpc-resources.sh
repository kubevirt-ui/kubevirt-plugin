#!/usr/bin/env bash
set -euo pipefail

echo "=== VPC Gen2 provisioning ==="

VPC_REGION="${ZONE%-*}"
echo "VPC region: ${VPC_REGION}, zone: ${ZONE}"
ibmcloud target -r "${VPC_REGION}"

VPC_ID=$(ibmcloud is vpcs --output json 2>/dev/null | jq -r --arg n "${VPC_NAME}" '.[] | select(.name == $n) | .id // empty')
if [[ -z "${VPC_ID}" ]]; then
  echo "Creating VPC '${VPC_NAME}'..."
  VPC_ID=$(ibmcloud is vpc-create "${VPC_NAME}" --output json | jq -r '.id')
  echo "Created VPC: ${VPC_ID}"
else
  echo "Reusing existing VPC '${VPC_NAME}': ${VPC_ID}"
fi

SUBNET_NAME="${VPC_NAME}-subnet-${ZONE}"
SUBNET_ID=$(ibmcloud is subnets --output json 2>/dev/null | jq -r --arg n "${SUBNET_NAME}" '.[] | select(.name == $n) | .id // empty')
if [[ -z "${SUBNET_ID}" ]]; then
  echo "Creating subnet '${SUBNET_NAME}' in zone '${ZONE}'..."
  SUBNET_ID=$(ibmcloud is subnet-create "${SUBNET_NAME}" "${VPC_ID}" --zone "${ZONE}" --ipv4-address-count 256 --output json | jq -r '.id')
  echo "Created subnet: ${SUBNET_ID}"
else
  echo "Reusing existing subnet '${SUBNET_NAME}': ${SUBNET_ID}"
fi

GW_NAME="${VPC_NAME}-gw-${ZONE}"
GW_ID=$(ibmcloud is public-gateways --output json 2>/dev/null | jq -r --arg n "${GW_NAME}" '.[] | select(.name == $n) | .id // empty')
if [[ -z "${GW_ID}" ]]; then
  echo "Creating public gateway '${GW_NAME}'..."
  GW_ID=$(ibmcloud is public-gateway-create "${GW_NAME}" "${VPC_ID}" "${ZONE}" --output json | jq -r '.id')
  echo "Created public gateway: ${GW_ID}"
else
  echo "Reusing existing public gateway '${GW_NAME}': ${GW_ID}"
fi

echo "Attaching public gateway to subnet..."
ibmcloud is subnet-update "${SUBNET_ID}" --pgw "${GW_ID}" 2>/dev/null || true

echo "vpc_id=${VPC_ID}" >> "$GITHUB_OUTPUT"
echo "subnet_id=${SUBNET_ID}" >> "$GITHUB_OUTPUT"
echo "vpc_region=${VPC_REGION}" >> "$GITHUB_OUTPUT"
