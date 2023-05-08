import React from 'react';

import { orderExtensionBasedOnInsertBeforeAndAfter } from '@console/shared';
import {
  DetailsTabSection,
  isDetailsTabSection,
  ResolvedExtension,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';

export const useDetailsTabSection = (): [
  ResolvedExtension<DetailsTabSection>['properties'][],
  boolean,
] => {
  const [extensions, resolved] = useResolvedExtensions<DetailsTabSection>(isDetailsTabSection);
  const ordered = React.useMemo<ResolvedExtension<DetailsTabSection>['properties'][]>(
    () =>
      resolved
        ? orderExtensionBasedOnInsertBeforeAndAfter<
            ResolvedExtension<DetailsTabSection>['properties']
          >(extensions.map(({ properties }) => properties))
        : [],
    [extensions, resolved],
  );
  return [ordered, resolved];
};
