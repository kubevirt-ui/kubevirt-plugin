/**
 * Delete every IBM Cloud VPC resource whose name starts with CLUSTER_NAME.
 * Carefully ordered to respect dependencies (DNS → VMs → LBs → gateways → subnets → SGs → VPC).
 * Replaces: ci-scripts/hot-cluster/cleanup-vpc-resources.sh (183 lines)
 *
 * Required env: CLUSTER_NAME, IC_API_KEY (or IC_KEY)
 * Optional: ZONE, DRY_RUN, CLEAN_VPC
 */

import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import VpcV1 from 'ibm-vpc/vpc/v1';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

import type { VpcCleanupContext } from './cleanup-vpc-helpers';
import {
  cleanupLoadBalancers,
  cleanupNetworkResources,
  cleanupSecurityGroups,
  cleanupVMs,
  collectStaleSubnetIds,
} from './cleanup-vpc-helpers';

const cleanupDnsRecords = async (
  clusterName: string,
  runOrDry: (label: string, fn: () => Promise<unknown>) => Promise<void>,
): Promise<void> => {
  console.log('1. Deleting stale DNS records...');
  try {
    execSync('ibmcloud plugin install cis -f 2>&1 | tail -1', { stdio: 'pipe' });
    const cisId = execSync(
      "ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty'",
      { encoding: 'utf8' },
    ).trim();
    if (!cisId) {
      return;
    }
    execSync(`ibmcloud cis instance-set "${cisId}" 2>&1`, { stdio: 'pipe' });
    const zones = JSON.parse(
      execSync('ibmcloud cis domains --output json 2>/dev/null || echo "[]"', {
        encoding: 'utf8',
      }),
    ) as unknown[];
    for (const zone of Array.isArray(zones) ? zones : []) {
      const zoneObj = zone as Record<string, string>;
      const records = JSON.parse(
        execSync(
          `ibmcloud cis dns-records "${zoneObj.id}" --output json 2>/dev/null || echo '[]'`,
          { encoding: 'utf8' },
        ),
      ) as unknown[];
      for (const rec of Array.isArray(records) ? records : []) {
        const recObj = rec as Record<string, string>;
        if (recObj.name?.includes(clusterName)) {
          await runOrDry(`delete DNS ${recObj.id}`, async () => {
            execSync(`ibmcloud cis dns-record-delete "${zoneObj.id}" "${recObj.id}"`, {
              stdio: 'pipe',
            });
          });
        }
      }
    }
  } catch (err) {
    console.warn(`  DNS cleanup warning: ${err instanceof Error ? err.message : String(err)}`);
  }
};

const cleanupCosInstances = async (
  clusterName: string,
  runOrDry: (label: string, fn: () => Promise<unknown>) => Promise<void>,
): Promise<void> => {
  console.log('15. Deleting orphaned COS instances...');
  try {
    const cosJson = execSync(
      "ibmcloud resource service-instances --service-name cloud-object-storage --output json 2>/dev/null || echo '[]'",
      { encoding: 'utf8' },
    );
    const cosInstances = JSON.parse(cosJson) as unknown[];
    for (const cos of Array.isArray(cosInstances) ? cosInstances : []) {
      const cosObj = cos as Record<string, string>;
      if (cosObj.name?.startsWith(clusterName)) {
        await runOrDry(`delete COS ${cosObj.id}`, async () => {
          execSync(`ibmcloud resource service-instance-delete "${cosObj.id}" -f --recursive`, {
            stdio: 'pipe',
          });
        });
      }
    }
  } catch (err) {
    console.warn(`  COS cleanup warning: ${err instanceof Error ? err.message : String(err)}`);
  }
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const apiKey = process.env.IC_KEY ?? process.env.IC_API_KEY ?? requireEnv('IC_API_KEY');
  const dryRun = process.env.DRY_RUN === 'true';
  const cleanVpc = process.env.CLEAN_VPC !== 'false';
  const vpcRegion = process.env.ZONE ? process.env.ZONE.replace(/-\d+$/, '') : 'eu-de';

  const vpc = new VpcV1({
    authenticator: new IamAuthenticator({ apikey: apiKey }),
    serviceUrl: `https://${vpcRegion}.iaas.cloud.ibm.com/v1`,
  });

  const nameMatch = (name: string | undefined): boolean => !!name && name.startsWith(clusterName);
  const runOrDry = async (label: string, cleanupFn: () => Promise<unknown>): Promise<void> => {
    if (dryRun) {
      console.log(`  [dry-run] would: ${label}`);
      return;
    }
    try {
      await cleanupFn();
    } catch (err) {
      console.warn(
        `  WARNING: ${label} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const ctx: VpcCleanupContext = { cleanVpc, clusterName, dryRun, nameMatch, runOrDry, vpc };

  console.log(
    `=== Cleaning VPC resources for '${clusterName}' (dry_run=${dryRun}, clean_vpc=${cleanVpc}) ===`,
  );

  await cleanupDnsRecords(clusterName, runOrDry);

  await cleanupVMs(ctx);
  const staleSubnetIds = await collectStaleSubnetIds(ctx);
  await cleanupLoadBalancers(ctx, staleSubnetIds);
  await cleanupNetworkResources(ctx, staleSubnetIds);
  await cleanupSecurityGroups(ctx);

  console.log('12. Retrying stale subnets...');
  const { result: retrySubnets } = await vpc.listSubnets();
  for (const sub of retrySubnets.subnets?.filter((item) => nameMatch(item.name)) ?? []) {
    await runOrDry(`delete subnet ${sub.id}`, () => vpc.deleteSubnet({ id: sub.id ?? '' }));
  }

  if (cleanVpc) {
    console.log('13. Deleting stale VPCs...');
    const { result: vpcs } = await vpc.listVpcs();
    for (const vpcItem of vpcs.vpcs?.filter((item) => nameMatch(item.name)) ?? []) {
      await runOrDry(`delete VPC ${vpcItem.id}`, () => vpc.deleteVpc({ id: vpcItem.id ?? '' }));
    }
  }

  console.log('14. Deleting orphaned custom images...');
  const { result: images } = await vpc.listImages({ visibility: 'private' });
  for (const img of images.images?.filter((item) => nameMatch(item.name)) ?? []) {
    await runOrDry(`delete image ${img.id}`, () => vpc.deleteImage({ id: img.id ?? '' }));
  }

  await cleanupCosInstances(clusterName, runOrDry);

  console.log('=== VPC resource cleanup complete ===');
};

void main().catch((err) => {
  console.error(`::error::VPC cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
