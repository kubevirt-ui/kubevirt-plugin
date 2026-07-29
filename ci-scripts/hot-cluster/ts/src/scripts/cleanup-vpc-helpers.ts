import type VpcV1 from 'ibm-vpc/vpc/v1';

export type VpcCleanupContext = {
  cleanVpc: boolean;
  clusterName: string;
  dryRun: boolean;
  nameMatch: (name: string | undefined) => boolean;
  runOrDry: (label: string, fn: () => Promise<unknown>) => Promise<void>;
  vpc: VpcV1;
};

/** Delete VMs (instances) matching the cluster name. */
export const cleanupVMs = async (ctx: VpcCleanupContext): Promise<void> => {
  console.log('2. Deleting stale VMs...');
  const { result } = await ctx.vpc.listInstances();
  for (const instance of result.instances?.filter((i) => ctx.nameMatch(i.name)) ?? []) {
    await ctx.runOrDry(`delete VM ${instance.id}`, () =>
      ctx.vpc.deleteInstance({ id: instance.id ?? '' }),
    );
  }
};

/** Collect subnet IDs that belong to stale clusters. */
export const collectStaleSubnetIds = async (ctx: VpcCleanupContext): Promise<Set<string>> => {
  console.log('3. Collecting stale subnets...');
  const { result } = await ctx.vpc.listSubnets();
  const ids = new Set<string>();
  for (const sub of result.subnets?.filter((subnet) => ctx.nameMatch(subnet.name)) ?? []) {
    if (sub.id) ids.add(sub.id);
  }
  return ids;
};

/** Delete load balancers associated with stale subnets. */
export const cleanupLoadBalancers = async (
  ctx: VpcCleanupContext,
  staleSubnetIds: Set<string>,
): Promise<void> => {
  console.log('4. Deleting stale load balancers...');
  const { result } = await ctx.vpc.listLoadBalancers();
  for (const balancer of result.load_balancers ?? []) {
    const lbSubnets = balancer.subnets ?? [];
    const isStale =
      ctx.nameMatch(balancer.name) ||
      lbSubnets.some((subnet: { id?: string }) => subnet.id && staleSubnetIds.has(subnet.id));
    if (isStale) {
      await ctx.runOrDry(`delete LB ${balancer.id}`, () =>
        ctx.vpc.deleteLoadBalancer({ id: balancer.id ?? '' }),
      );
    }
  }
};

/** Delete floating IPs, public gateways, and subnets. */
export const cleanupNetworkResources = async (
  ctx: VpcCleanupContext,
  staleSubnetIds: Set<string>,
): Promise<void> => {
  console.log('5. Deleting floating IPs...');
  const { result: fips } = await ctx.vpc.listFloatingIps();
  for (const fip of fips.floating_ips?.filter((floatingIp) => ctx.nameMatch(floatingIp.name)) ??
    []) {
    await ctx.runOrDry(`delete FIP ${fip.id}`, () =>
      ctx.vpc.deleteFloatingIp({ id: fip.id ?? '' }),
    );
  }

  console.log('6. Deleting public gateways...');
  const { result: gws } = await ctx.vpc.listPublicGateways();
  for (const gateway of gws.public_gateways?.filter((gwy) => ctx.nameMatch(gwy.name)) ?? []) {
    for (const subnetId of staleSubnetIds) {
      try {
        await ctx.vpc.unsetSubnetPublicGateway({ id: subnetId });
      } catch {
        /* best effort */
      }
    }
    await ctx.runOrDry(`delete gateway ${gateway.id}`, () =>
      ctx.vpc.deletePublicGateway({ id: gateway.id ?? '' }),
    );
  }

  console.log('7. Deleting subnets...');
  const { result: subs } = await ctx.vpc.listSubnets();
  for (const sub of subs.subnets?.filter((subnet) => ctx.nameMatch(subnet.name)) ?? []) {
    await ctx.runOrDry(`delete subnet ${sub.id}`, () => ctx.vpc.deleteSubnet({ id: sub.id ?? '' }));
  }
};

/** Delete security groups matching the cluster name. */
export const cleanupSecurityGroups = async (ctx: VpcCleanupContext): Promise<void> => {
  console.log('11. Deleting stale security groups...');
  const { result } = await ctx.vpc.listSecurityGroups();
  for (const secGroup of result.security_groups?.filter((grp) => ctx.nameMatch(grp.name)) ?? []) {
    await ctx.runOrDry(`delete SG ${secGroup.id}`, () =>
      ctx.vpc.deleteSecurityGroup({ id: secGroup.id ?? '' }),
    );
  }
};
