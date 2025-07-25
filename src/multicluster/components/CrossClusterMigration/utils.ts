import { PlanModel, ProviderModel, V1beta1Plan } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

import { MTV_MIGRATION_NAMESPACE } from './constants';

export const getInitialMigrationPlan = (vms: V1VirtualMachine[]): V1beta1Plan => ({
  apiVersion: `${PlanModel.apiGroup}/${PlanModel.apiVersion}`,
  kind: PlanModel.kind,
  metadata: {
    name: `cross-cluster-migration-${getRandomChars()}`,
    namespace: MTV_MIGRATION_NAMESPACE,
  },
  spec: {
    map: {
      network: null,
      storage: null,
    },
    provider: {
      destination: {
        apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
        kind: ProviderModel.kind,
        namespace: MTV_MIGRATION_NAMESPACE,
      },
      source: {
        apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
        kind: ProviderModel.kind,
        name: getCluster(vms?.[0]),
        namespace: MTV_MIGRATION_NAMESPACE,
      },
    },
    targetNamespace: getNamespace(vms?.[0]),
    vms: vms.map((vm) => ({
      id: vm.metadata.uid,
      name: getName(vm),
      namespace: getNamespace(vm),
    })),
  },
});
