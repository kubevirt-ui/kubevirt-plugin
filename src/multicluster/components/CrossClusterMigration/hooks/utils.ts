import {
  MigrationModel,
  NetworkMapModel,
  PlanModel,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { type modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getRandomChars, isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { MTV_MIGRATION_NAMESPACE } from '../constants';

export type PartialResources = {
  createdMigrationPlan?: V1beta1Plan;
  createdNetworkMap?: V1beta1NetworkMap;
  createdStorageMap?: V1beta1StorageMap;
};

export const cleanupPartialResources = ({
  createdMigrationPlan,
  createdNetworkMap,
  createdStorageMap,
}: PartialResources): void => {
  if (createdStorageMap) {
    kubevirtK8sDelete({ model: StorageMapModel, resource: createdStorageMap }).catch((e) =>
      kubevirtConsole.error('Failed to clean up StorageMap', e),
    );
  }
  if (createdNetworkMap) {
    kubevirtK8sDelete({ model: NetworkMapModel, resource: createdNetworkMap }).catch((e) =>
      kubevirtConsole.error('Failed to clean up NetworkMap', e),
    );
  }
  if (createdMigrationPlan) {
    kubevirtK8sDelete({ model: PlanModel, resource: createdMigrationPlan }).catch((e) =>
      kubevirtConsole.error('Failed to clean up Plan', e),
    );
  }
};

export const getSelectableOptions = (
  resources: string[],
  groupVersionKind: ReturnType<typeof modelToGroupVersionKind>,
  enabledOptions?: string[],
): Array<{
  children: string;
  groupVersionKind: ReturnType<typeof modelToGroupVersionKind>;
  isDisabled: boolean;
  value: string;
}> =>
  resources
    .toSorted((a, b) => a.localeCompare(b))
    .map((resource) => ({
      children: resource,
      groupVersionKind: groupVersionKind,
      isDisabled: !isEmpty(enabledOptions) && !enabledOptions?.includes(resource),
      value: resource,
    }));

export const getCreateMigration = (migrationPlan: V1beta1Plan): Record<string, unknown> => ({
  apiVersion: `${MigrationModel.apiGroup}/${MigrationModel.apiVersion}`,
  kind: MigrationModel.kind,
  metadata: {
    name: `${getName(migrationPlan)}-${getRandomChars()}`,
    namespace: MTV_MIGRATION_NAMESPACE,
  },
  spec: {
    plan: {
      name: getName(migrationPlan),
      namespace: getNamespace(migrationPlan),
      uid: getUID(migrationPlan),
    },
  },
});
