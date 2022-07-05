import * as React from 'react';

import {
  ResolvedExtension,
  useK8sModels,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import { Extension, ExtensionTypeGuard } from '@openshift-console/dynamic-plugin-sdk/lib/types';

import { filterSubsystems } from '../utils';

const useDashboardSubsystems = <E extends Extension>(
  typeGuard: ExtensionTypeGuard<E>,
): ResolvedExtension<E>[] => {
  const [allK8sModels] = useK8sModels();
  const [dynamicSubsystemExtensions] = useResolvedExtensions<E>(typeGuard);

  return React.useMemo(
    () => filterSubsystems<E>(dynamicSubsystemExtensions, typeGuard, allK8sModels),
    [dynamicSubsystemExtensions, allK8sModels],
  );
};

export default useDashboardSubsystems;
