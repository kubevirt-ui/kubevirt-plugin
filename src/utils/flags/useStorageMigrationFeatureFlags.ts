import { useLayoutEffect, useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlanModel,
  MigrationControllerModel,
} from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  getGroupVersionKindForModel,
  SetFeatureFlag,
  useAccessReview,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_STORAGE_MIGRATION_ENABLED } from './consts';

const useStorageMigrationFeatureFlags = (setFeatureFlag: SetFeatureFlag) => {
  const [migPlanModel] = useK8sModel(getGroupVersionKindForModel(MigPlanModel));
  const [haveAccessToMigrationNamespace] = useAccessReview({
    group: migPlanModel?.apiGroup,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    resource: migPlanModel?.plural,
    verb: 'list',
  });
  const [migController, mtcControllersLoaded] = useK8sWatchData({
    groupVersionKind: modelToGroupVersionKind(MigrationControllerModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  });

  const mtcGatingSatisfied = useMemo(
    () =>
      !isEmpty(migPlanModel) &&
      haveAccessToMigrationNamespace &&
      !isEmpty(migController) &&
      mtcControllersLoaded,
    [migPlanModel, haveAccessToMigrationNamespace, migController, mtcControllersLoaded],
  );

  useLayoutEffect(() => {
    setFeatureFlag(FLAG_STORAGE_MIGRATION_ENABLED, mtcGatingSatisfied);
  }, [mtcGatingSatisfied, setFeatureFlag]);
};

export default useStorageMigrationFeatureFlags;
