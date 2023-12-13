import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { k8sPatch, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type HyperConvergedList = K8sResourceCommon & {
  items: HyperConverged[];
};

export const updateLiveMigrationConfig = (
  hyperConverged: HyperConverged,
  value: null | number | string,
  name: string,
) =>
  k8sPatch({
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

export const getLiveMigrationNetwork = (hyperConverged: HyperConverged) =>
  hyperConverged?.spec?.liveMigrationConfig?.network;

export const getLiveMigrationConfig = (hyperConverge: HyperConverged) =>
  hyperConverge?.spec?.liveMigrationConfig;

export const MIGRATION_PER_CLUSTER = 'parallelMigrationsPerCluster';
export const MIGRATION_PER_NODE = 'parallelOutboundMigrationsPerNode';
export const PRIMARY_NETWORK = 'Primary live migration network';
