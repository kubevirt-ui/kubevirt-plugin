import React from 'react';

import { useExtensions } from '@console/plugin-sdk';
import { orderExtensionBasedOnInsertBeforeAndAfter } from '@console/shared';
import { DetailsTab, isDetailsTab } from '@openshift-console/dynamic-plugin-sdk';

export const useDetailsTab = (): DetailsTab['properties'][] => {
  const extensions = useExtensions<DetailsTab>(isDetailsTab);
  const ordered = React.useMemo<DetailsTab['properties'][]>(
    () =>
      orderExtensionBasedOnInsertBeforeAndAfter<DetailsTab['properties']>(
        extensions.map(({ properties }) => properties),
      ),
    [extensions],
  );
  return ordered;
};
