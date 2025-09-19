import { MigrationModel, V1beta1Plan } from '@kubev2v/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';

import { MTV_MIGRATION_NAMESPACE } from '../constants';

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
