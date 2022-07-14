import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { V1MigrationConfiguration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sPatch, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type HyperConverged = K8sResourceCommon & {
  spec: {
    liveMigrationConfig: V1MigrationConfiguration;
  };
};

export type HyperConvergedList = K8sResourceCommon & {
  items: HyperConverged[];
};

export const updateLiveMigrationConfig = (
  hyperConverged: HyperConverged,
  value: number | string | null,
  name: string,
) =>
  k8sPatch({
    model: HyperConvergedModel,
    resource: hyperConverged,
    data: [
      {
        op: 'replace',
        path: `/spec/liveMigrationConfig/${name}`,
        value,
      },
    ],
  });

export const getLiveMigrationNetwork = (hyperConverged: HyperConverged) =>
  hyperConverged?.spec?.liveMigrationConfig?.network;

export const getLiveMigrationConfig = (hyperConverge: HyperConverged) =>
  hyperConverge?.spec?.liveMigrationConfig;

export const MIGRATION_PER_CLUSTER = 'parallelMigrationsPerCluster';
export const MIGRATION_PER_NODE = 'parallelOutboundMigrationsPerNode';
export const PRIMARY_NETWORK = 'Primary live migration network';
