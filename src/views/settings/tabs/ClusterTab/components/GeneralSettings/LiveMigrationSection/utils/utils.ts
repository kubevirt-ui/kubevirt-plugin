import { HyperConvergedV1Beta1Model as HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1MigrationConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type HyperConvergedList = K8sResourceCommon & {
  items: HyperConverged[];
};

export const updateLiveMigrationConfig = (
  hyperConverged: HyperConverged,
  value: null | number | string,
  name: string,
  cluster?: string,
): ReturnType<typeof kubevirtK8sPatch> =>
  kubevirtK8sPatch({
    cluster,
    data: [
      {
        op: 'replace',
        path: `/spec/liveMigrationConfig/${name}`,
        value,
      },
    ],
    model: HyperConvergedModel,
    resource: hyperConverged,
  });

export const getLiveMigrationNetwork = (hyperConverged: HyperConverged): string | undefined =>
  hyperConverged?.spec?.liveMigrationConfig?.network;

export const getLiveMigrationConfig = (
  hyperConverge: HyperConverged,
): V1MigrationConfiguration | undefined => hyperConverge?.spec?.liveMigrationConfig;

export const MIGRATION_PER_CLUSTER = 'parallelMigrationsPerCluster';
export const MIGRATION_PER_NODE = 'parallelOutboundMigrationsPerNode';
export const PRIMARY_NETWORK = 'Primary live migration network';
