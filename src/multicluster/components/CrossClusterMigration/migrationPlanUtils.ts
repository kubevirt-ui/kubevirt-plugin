import { PlanModel, ProviderModel, type V1beta1Plan } from '@forklift-ui/types';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { CCLM_LABEL_KEY, CCLM_LABEL_VALUE, MTV_MIGRATION_NAMESPACE } from './constants';

export const getInitialMigrationPlan = (vms: V1VirtualMachine[]): V1beta1Plan => ({
  apiVersion: `${PlanModel.apiGroup}/${PlanModel.apiVersion}`,
  kind: PlanModel.kind,
  metadata: {
    labels: {
      [CCLM_LABEL_KEY]: CCLM_LABEL_VALUE,
    },
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
        name: null,
        namespace: MTV_MIGRATION_NAMESPACE,
      },
    },
    targetNamespace: null,
    type: 'live',
    vms: vms.map((vm) => ({
      id: getUID(vm),
      name: getName(vm),
      namespace: getNamespace(vm),
    })),
  },
});
