/**
 * Provision VPC Gen2 resources (VPC, subnet, public gateway).
 * Replaces: ci-scripts/hot-cluster/provision-vpc-resources.sh
 *
 * Required env: VPC_NAME, ZONE, IC_KEY (or IC_API_KEY)
 */

import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import VpcV1 from 'ibm-vpc/vpc/v1';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const vpcName = requireEnv('VPC_NAME');
  const zone = requireEnv('ZONE');
  const apiKey = process.env.IC_KEY ?? requireEnv('IC_API_KEY');
  const vpcRegion = zone.replace(/-\d+$/, '');

  console.log(`=== VPC Gen2 provisioning ===`);
  console.log(`VPC region: ${vpcRegion}, zone: ${zone}`);

  const vpc = new VpcV1({
    authenticator: new IamAuthenticator({ apikey: apiKey }),
    serviceUrl: `https://${vpcRegion}.iaas.cloud.ibm.com/v1`,
  });

  // --- VPC ---
  const vpcId = await (async (): Promise<string> => {
    const { result: vpcs } = await vpc.listVpcs();
    const existing = vpcs.vpcs?.find((vpcEntry) => vpcEntry.name === vpcName);

    if (existing) {
      console.log(`Reusing existing VPC '${vpcName}': ${existing.id ?? ''}`);
      return existing.id ?? '';
    }
    console.log(`Creating VPC '${vpcName}'...`);
    const { result } = await vpc.createVpc({ name: vpcName });
    console.log(`Created VPC: ${result.id ?? ''}`);
    return result.id ?? '';
  })();

  // --- Subnet ---
  const subnetName = `${vpcName}-subnet-${zone}`;
  const subnetId = await (async (): Promise<string> => {
    const { result: subnets } = await vpc.listSubnets();
    const existingSubnet = subnets.subnets?.find((subnetEntry) => subnetEntry.name === subnetName);

    if (existingSubnet) {
      console.log(`Reusing existing subnet '${subnetName}': ${existingSubnet.id ?? ''}`);
      return existingSubnet.id ?? '';
    }
    console.log(`Creating subnet '${subnetName}' in zone '${zone}'...`);
    const { result } = await vpc.createSubnet({
      subnetPrototype: {
        ip_version: 'ipv4',
        name: subnetName,
        total_ipv4_address_count: 256,
        vpc: { id: vpcId },
        zone: { name: zone } as unknown as VpcV1.ZoneIdentity,
      } as VpcV1.SubnetPrototypeSubnetByTotalCount,
    });
    console.log(`Created subnet: ${result.id ?? ''}`);
    return result.id ?? '';
  })();

  // --- Public Gateway ---
  const gwName = `${vpcName}-gw-${zone}`;
  const gwId = await (async (): Promise<string> => {
    const { result: gateways } = await vpc.listPublicGateways();
    const existingGw = gateways.public_gateways?.find((gateway) => gateway.name === gwName);

    if (existingGw) {
      console.log(`Reusing existing public gateway '${gwName}': ${existingGw.id ?? ''}`);
      return existingGw.id ?? '';
    }
    console.log(`Creating public gateway '${gwName}'...`);
    const { result } = await vpc.createPublicGateway({
      name: gwName,
      vpc: { id: vpcId },
      zone: { name: zone },
    });
    console.log(`Created public gateway: ${result.id ?? ''}`);
    return result.id ?? '';
  })();

  // Attach gateway to subnet
  console.log('Attaching public gateway to subnet...');
  try {
    await vpc.setSubnetPublicGateway({
      id: subnetId,
      publicGatewayIdentity: { id: gwId },
    });
  } catch {
    /* already attached */
  }

  // Outputs
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `vpc_id=${vpcId}\nsubnet_id=${subnetId}\nvpc_region=${vpcRegion}\n`);
  }
};

void main().catch((err) => {
  console.error(`::error::VPC provisioning failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
