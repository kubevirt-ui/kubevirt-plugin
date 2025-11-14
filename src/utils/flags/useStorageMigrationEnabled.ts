import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlanModel,
  MigrationControllerModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
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

  const [migController, loaded] = useK8sWatchData({
    groupVersionKind: modelToGroupVersionKind(MigrationControllerModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  });

  const migControllerInstalled = !isEmpty(migController) && loaded;

  setFeatureFlag(
    FLAG_STORAGE_MIGRATION_ENABLED,
    !isEmpty(model) && haveAccessToMigrationNamespace && migControllerInstalled,
  );
};

export default useStorageMigrationEnabled;
