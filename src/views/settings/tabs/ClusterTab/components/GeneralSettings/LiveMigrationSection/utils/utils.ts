import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getLiveMigrationConfigPatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import {
  getLiveMigrationConfig,
  getLiveMigrationNetwork,
} from '@kubevirt-utils/resources/hyperconverged/selectors';
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
    data: buildHyperConvergedPatch(hyperConverged, {
      op: 'replace',
      path: getLiveMigrationConfigPatchPath(hyperConverged, name),
      value,
    }),
    model: getHyperConvergedModelFromResource(hyperConverged),
    resource: hyperConverged,
  });

export { getLiveMigrationNetwork };

export { getLiveMigrationConfig };

export const MIGRATION_PER_CLUSTER = 'parallelMigrationsPerCluster';
export const MIGRATION_PER_NODE = 'parallelOutboundMigrationsPerNode';
export const PRIMARY_NETWORK = 'Primary live migration network';
