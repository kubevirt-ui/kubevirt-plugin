/**
 * Provision VPC Gen2 resources (VPC, subnet, public gateway).
 * Replaces: ci-scripts/hot-cluster/provision-vpc-resources.sh
 *
 * Required env: VPC_NAME, ZONE, IC_KEY (or IC_API_KEY)
 */

import { appendFileSync } from 'node:fs';

import VpcV1 from 'ibm-vpc/vpc/v1';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const vpcName = requireEnv('VPC_NAME');
  const zone = requireEnv('ZONE');
  const apiKey = process.env.IC_KEY || requireEnv('IC_API_KEY');
  const vpcRegion = zone.replace(/-\d+$/, '');

  console.log(`=== VPC Gen2 provisioning ===`);
  console.log(`VPC region: ${vpcRegion}, zone: ${zone}`);

  const vpc = new VpcV1({
    authenticator: new IamAuthenticator({ apikey: apiKey }),
    serviceUrl: `https://${vpcRegion}.iaas.cloud.ibm.com/v1`,
  });

  // --- VPC ---
  let vpcId: string;
  const { result: vpcs } = await vpc.listVpcs();
  const existing = vpcs.vpcs?.find((v) => v.name === vpcName);

  if (existing) {
    vpcId = existing.id!;
    console.log(`Reusing existing VPC '${vpcName}': ${vpcId}`);
  } else {
    console.log(`Creating VPC '${vpcName}'...`);
    const { result } = await vpc.createVpc({ name: vpcName });
    vpcId = result.id!;
    console.log(`Created VPC: ${vpcId}`);
  }

  // --- Subnet ---
  const subnetName = `${vpcName}-subnet-${zone}`;
  let subnetId: string;
  const { result: subnets } = await vpc.listSubnets();
  const existingSubnet = subnets.subnets?.find((s) => s.name === subnetName);

  if (existingSubnet) {
    subnetId = existingSubnet.id!;
    console.log(`Reusing existing subnet '${subnetName}': ${subnetId}`);
  } else {
    console.log(`Creating subnet '${subnetName}' in zone '${zone}'...`);
    const { result } = await vpc.createSubnet({
      subnetPrototype: {
        name: subnetName,
        vpc: { id: vpcId },
        zone: { name: zone } as unknown as VpcV1.ZoneIdentity,
        total_ipv4_address_count: 256,
        ip_version: 'ipv4',
      } as VpcV1.SubnetPrototypeSubnetByTotalCount,
    });
    subnetId = result.id!;
    console.log(`Created subnet: ${subnetId}`);
  }

  // --- Public Gateway ---
  const gwName = `${vpcName}-gw-${zone}`;
  let gwId: string;
  const { result: gateways } = await vpc.listPublicGateways();
  const existingGw = gateways.public_gateways?.find((g) => g.name === gwName);

  if (existingGw) {
    gwId = existingGw.id!;
    console.log(`Reusing existing public gateway '${gwName}': ${gwId}`);
  } else {
    console.log(`Creating public gateway '${gwName}'...`);
    const { result } = await vpc.createPublicGateway({
      name: gwName,
      vpc: { id: vpcId },
      zone: { name: zone },
    });
    gwId = result.id!;
    console.log(`Created public gateway: ${gwId}`);
  }

  // Attach gateway to subnet
  console.log('Attaching public gateway to subnet...');
  try {
    await vpc.setSubnetPublicGateway({
      id: subnetId,
      publicGatewayIdentity: { id: gwId },
    });
  } catch { /* already attached */ }

  // Outputs
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `vpc_id=${vpcId}\nsubnet_id=${subnetId}\nvpc_region=${vpcRegion}\n`);
  }
};

main().catch((err) => {
  console.error(`::error::VPC provisioning failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
