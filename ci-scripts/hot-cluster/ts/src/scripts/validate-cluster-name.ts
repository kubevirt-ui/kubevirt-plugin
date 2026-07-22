/**
 * Validate cluster_name format against RFC 1123 DNS label rules
 * and IBM Cloud's 21-character IPI limit.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME
 */

import { requireEnv } from '../kube-client';

const main = (): void => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const pattern = /^[a-z0-9]([a-z0-9-]{0,19}[a-z0-9])?$/;

  if (!pattern.test(clusterName)) {
    console.error(
      `::error::Invalid cluster_name: '${clusterName}'. Must be a lower-case RFC 1123 DNS label ` +
        '(start/end with alphanumeric, only lower-case letters/digits/hyphens in between — ' +
        'no uppercase, underscores, or dots) and at most 21 characters (IBM Cloud IPI cluster name ' +
        'limit — longer names are silently truncated, which breaks health checks, teardown, and ' +
        'auto-teardown discovery). This name is also used as-is for the ARC Helm release and the ' +
        'api.${CLUSTER_NAME}.${BASE_DOMAIN} hostname, both of which require RFC 1123-safe values.',
    );
    process.exit(1);
  }

  console.log(`Cluster name '${clusterName}' is valid.`);
};

main();
