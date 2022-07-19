import { useMemo } from 'react';

import { V1MigrationConfiguration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HyperConvergedModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { HyperConverged } from '../../../../../utils/types';
import { getHyperConvergedObject } from '../../../../../utils/utils';

const useHCMigrations = (): V1MigrationConfiguration => {
  const [hyperConvergeData] = useK8sWatchResource<HyperConverged[]>({
    groupVersionKind: HyperConvergedModelGroupVersionKind,
    isList: true,
  });

  const hyperConverge = useMemo(
    () => getHyperConvergedObject(hyperConvergeData),
    [hyperConvergeData],
  );

  return hyperConverge?.spec?.liveMigrationConfig || {};
};

export default useHCMigrations;
