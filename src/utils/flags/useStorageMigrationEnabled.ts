import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  SetFeatureFlag,
  useAccessReview,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_STORAGE_MIGRATION_ENABLED } from './consts';

const useStorageMigrationEnabled = (setFeatureFlag: SetFeatureFlag) => {
  const [model] = useK8sModel(getGroupVersionKindForModel(MigPlanModel));
  const [haveAccessToMigrationNamespace] = useAccessReview({
    group: model?.apiGroup,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    resource: model?.plural,
    verb: 'list',
  });

  setFeatureFlag(FLAG_STORAGE_MIGRATION_ENABLED, !isEmpty(model) && haveAccessToMigrationNamespace);
};

export default useStorageMigrationEnabled;
