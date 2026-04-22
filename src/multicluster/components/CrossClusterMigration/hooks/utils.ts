import {
  MigrationModel,
  NetworkMapModel,
  PlanModel,
  StorageMapModel,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getRandomChars, isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { MTV_MIGRATION_NAMESPACE } from '../constants';

export type PartialResources = {
  createdMigrationPlan?: undefined | V1beta1Plan;
  createdNetworkMap?: undefined | V1beta1NetworkMap;
  createdStorageMap?: undefined | V1beta1StorageMap;
};

export const cleanupPartialResources = ({
  createdMigrationPlan,
  createdNetworkMap,
  createdStorageMap,
}: PartialResources) => {
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
) =>
  resources
    .sort((a, b) => a.localeCompare(b))
    .map((resource) => {
      return {
        children: resource,
        groupVersionKind: groupVersionKind,
        isDisabled: !isEmpty(enabledOptions) && !enabledOptions?.includes(resource),
        value: resource,
      };
    });

export const getCreateMigration = (migrationPlan: V1beta1Plan) => {
  return {
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
  };
};
