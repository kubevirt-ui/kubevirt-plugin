/**
 * Delete every IBM Cloud VPC resource whose name starts with CLUSTER_NAME.
 * Carefully ordered to respect dependencies (DNS → VMs → LBs → gateways → subnets → SGs → VPC).
 * Replaces: ci-scripts/hot-cluster/cleanup-vpc-resources.sh (183 lines)
 *
 * Required env: CLUSTER_NAME, IC_API_KEY (or IC_KEY)
 * Optional: ZONE, DRY_RUN, CLEAN_VPC
 */

import { execSync } from 'node:child_process';

import VpcV1 from 'ibm-vpc/vpc/v1';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

import { requireEnv } from '../kube-client';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const apiKey = process.env.IC_KEY || process.env.IC_API_KEY || requireEnv('IC_API_KEY');
  const dryRun = process.env.DRY_RUN === 'true';
  const cleanVpc = process.env.CLEAN_VPC !== 'false';

  let vpcRegion = 'eu-de';
  if (process.env.ZONE) {
    vpcRegion = process.env.ZONE.replace(/-\d+$/, '');
  }

  const vpc = new VpcV1({
    authenticator: new IamAuthenticator({ apikey: apiKey }),
    serviceUrl: `https://${vpcRegion}.iaas.cloud.ibm.com/v1`,
  });

  const nameMatch = (name: string | undefined): boolean =>
    !!name && name.startsWith(clusterName);

  const runOrDry = async (label: string, fn: () => Promise<unknown>): Promise<void> => {
    if (dryRun) {
      console.log(`  [dry-run] would: ${label}`);
      return;
    }
    try {
      await fn();
    } catch (err) {
      console.warn(`  WARNING: ${label} failed: ${err instanceof Error ? err.message : err}`);
    }
  };

  console.log(`=== Cleaning VPC resources for '${clusterName}' (dry_run=${dryRun}, clean_vpc=${cleanVpc}) ===`);

  // 1. DNS records (must be first)
  console.log('1. Deleting stale DNS records...');
  try {
    execSync('ibmcloud plugin install cis -f 2>&1 | tail -1', { stdio: 'pipe' });
    const cisId = execSync("ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty'", { encoding: 'utf8' }).trim();
    if (cisId) {
      execSync(`ibmcloud cis instance-set "${cisId}" 2>&1`, { stdio: 'pipe' });
      const zones = JSON.parse(execSync('ibmcloud cis domains --output json 2>/dev/null || echo "[]"', { encoding: 'utf8' }));
      for (const zone of Array.isArray(zones) ? zones : []) {
        const records = JSON.parse(execSync(`ibmcloud cis dns-records "${zone.id}" --output json 2>/dev/null || echo '[]'`, { encoding: 'utf8' }));
        for (const rec of Array.isArray(records) ? records : []) {
          if (rec.name?.includes(clusterName)) {
            await runOrDry(`delete DNS ${rec.id}`, async () => {
              execSync(`ibmcloud cis dns-record-delete "${zone.id}" "${rec.id}"`, { stdio: 'pipe' });
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn(`  DNS cleanup warning: ${err instanceof Error ? err.message : err}`);
  }

  // 2. VMs
  console.log('2. Deleting stale VMs...');
  const { result: instances } = await vpc.listInstances();
  for (const inst of instances.instances?.filter((i) => nameMatch(i.name)) ?? []) {
    await runOrDry(`delete VM ${inst.id}`, () => vpc.deleteInstance({ id: inst.id! }));
  }
  if (!dryRun) await sleep(60000);

  // 3. Collect stale subnet IDs
  console.log('3. Collecting stale subnet IDs...');
  const { result: subnetList } = await vpc.listSubnets();
  const staleSubnetIds = subnetList.subnets?.filter((s) => nameMatch(s.name)).map((s) => s.id!) ?? [];
  console.log(`  Found ${staleSubnetIds.length} stale subnet(s)`);

  // 4. Load balancers (by subnet + by name)
  console.log('4. Deleting load balancers...');
  const { result: lbs } = await vpc.listLoadBalancers();
  const staleLbs = new Set<string>();

  for (const lb of lbs.load_balancers ?? []) {
    const inStaleSubnet = lb.subnets?.some((s) => staleSubnetIds.includes(s.id!));
    const nameMatches = nameMatch(lb.name) || lb.name?.startsWith(`kube-${clusterName}`);
    if (inStaleSubnet || nameMatches) {
      staleLbs.add(lb.id!);
      await runOrDry(`delete LB ${lb.id}`, () => vpc.deleteLoadBalancer({ id: lb.id! }));
    }
  }
  if (!dryRun && staleLbs.size > 0) await sleep(60000);

  // 5. Wait for LB deletions
  if (!dryRun && staleLbs.size > 0) {
    console.log('5. Waiting for LB deletions...');
    for (let i = 1; i <= 24; i++) {
      const { result: currentLbs } = await vpc.listLoadBalancers();
      const remaining = currentLbs.load_balancers?.filter((lb) => staleLbs.has(lb.id!)).length ?? 0;
      if (remaining === 0) { console.log('  All LBs deleted.'); break; }
      console.log(`  ${remaining} LB(s) still deleting... (${i}/24)`);
      await sleep(30000);
    }
  }

  // 6. Detach public gateways
  console.log('6. Detaching public gateways from subnets...');
  const { result: subnetsForGw } = await vpc.listSubnets();
  for (const s of subnetsForGw.subnets?.filter((s) => nameMatch(s.name) && s.public_gateway) ?? []) {
    await runOrDry(`detach gateway from subnet ${s.id}`, () =>
      vpc.unsetSubnetPublicGateway({ id: s.id! }),
    );
  }
  if (!dryRun) await sleep(10000);

  // 7. Delete subnets
  console.log('7. Deleting stale subnets...');
  for (const id of staleSubnetIds) {
    await runOrDry(`delete subnet ${id}`, () => vpc.deleteSubnet({ id }));
  }
  if (!dryRun) await sleep(30000);

  // 8. Public gateways
  console.log('8. Deleting stale public gateways...');
  const { result: gws } = await vpc.listPublicGateways();
  for (const gw of gws.public_gateways?.filter((g) => nameMatch(g.name)) ?? []) {
    await runOrDry(`delete gateway ${gw.id}`, () => vpc.deletePublicGateway({ id: gw.id! }));
  }

  // 9. Floating IPs
  console.log('9. Deleting stale floating IPs...');
  const { result: ips } = await vpc.listFloatingIps();
  for (const ip of ips.floating_ips?.filter((i) => nameMatch(i.name)) ?? []) {
    await runOrDry(`release IP ${ip.id}`, () => vpc.deleteFloatingIp({ id: ip.id! }));
  }

  // 10. Strip security group rules (breaks circular references)
  console.log('10. Stripping security group rules...');
  if (!dryRun) {
    const { result: sgs } = await vpc.listSecurityGroups();
    for (const sg of sgs.security_groups?.filter((s) => nameMatch(s.name)) ?? []) {
      const { result: rules } = await vpc.listSecurityGroupRules({ securityGroupId: sg.id! });
      for (const rule of rules.rules ?? []) {
        try {
          await vpc.deleteSecurityGroupRule({ securityGroupId: sg.id!, id: rule.id! });
        } catch { /* best effort */ }
      }
    }
  }

  // 11. Delete security groups (multi-pass for circular references)
  console.log('11. Deleting stale security groups...');
  if (!dryRun) {
    for (let pass = 1; pass <= 3; pass++) {
      const { result: sgsPass } = await vpc.listSecurityGroups();
      const stale = sgsPass.security_groups?.filter((s) => nameMatch(s.name)) ?? [];
      if (stale.length === 0) break;
      console.log(`  Pass ${pass}: ${stale.length} security group(s) remaining...`);
      for (const sg of stale) {
        try { await vpc.deleteSecurityGroup({ id: sg.id! }); } catch { /* retry next pass */ }
      }
      await sleep(10000);
    }
  }

  // 12. Retry subnets (after LBs fully removed)
  console.log('12. Retrying stale subnets...');
  const { result: retrySubnets } = await vpc.listSubnets();
  for (const s of retrySubnets.subnets?.filter((s) => nameMatch(s.name)) ?? []) {
    await runOrDry(`delete subnet ${s.id}`, () => vpc.deleteSubnet({ id: s.id! }));
  }

  // 13. VPCs
  if (cleanVpc) {
    console.log('13. Deleting stale VPCs...');
    const { result: vpcs } = await vpc.listVpcs();
    for (const v of vpcs.vpcs?.filter((v) => nameMatch(v.name)) ?? []) {
      await runOrDry(`delete VPC ${v.id}`, () => vpc.deleteVpc({ id: v.id! }));
    }
  }

  // 14. Custom images
  console.log('14. Deleting orphaned custom images...');
  const { result: images } = await vpc.listImages({ visibility: 'private' });
  for (const img of images.images?.filter((i) => nameMatch(i.name)) ?? []) {
    await runOrDry(`delete image ${img.id}`, () => vpc.deleteImage({ id: img.id! }));
  }

  // 15. COS instances (still uses CLI -- no VPC SDK for resource controller)
  console.log('15. Deleting orphaned COS instances...');
  try {
    const cosJson = execSync(
      "ibmcloud resource service-instances --service-name cloud-object-storage --output json 2>/dev/null || echo '[]'",
      { encoding: 'utf8' },
    );
    const cosInstances = JSON.parse(cosJson);
    for (const cos of Array.isArray(cosInstances) ? cosInstances : []) {
      if (cos.name?.startsWith(clusterName)) {
        await runOrDry(`delete COS ${cos.id}`, async () => {
          execSync(`ibmcloud resource service-instance-delete "${cos.id}" -f --recursive`, { stdio: 'pipe' });
        });
      }
    }
  } catch (err) {
    console.warn(`  COS cleanup warning: ${err instanceof Error ? err.message : err}`);
  }

  console.log('=== VPC resource cleanup complete ===');
};

main().catch((err) => {
  console.error(`::error::VPC cleanup failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
