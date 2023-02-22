import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

const useDisksFilters = (): RowFilter[] => {
  const { t } = useKubevirtTranslation();
  const filters: RowFilter[] = React.useMemo(
    () => [
      {
        filterGroupName: t('Disk Type'),
        type: 'disk-type',
        reducer: (obj) => obj?.drive,
        filter: (drives, obj) => {
          const drive = obj?.drive;
          return (
            drives.selected?.length === 0 ||
            drives.selected?.includes(drive) ||
            !drives?.all?.find((item) => item === drive)
          );
        },
        items: Object.keys(diskTypesLabels).map((type) => ({
          id: diskTypesLabels[type],
          title: diskTypesLabels[type],
        })),
      },
    ],
    [t],
  );

  return filters;
};

export default useDisksFilters;
