import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DiskRowDataLayout,
  diskTypesLabels,
} from '@kubevirt-utils/resources/vm/utils/disk/constants';

const DISK_TYPE_FILTER_ID = 'disk-type';

const useDisksFilters = (): KubevirtFilter<DiskRowDataLayout>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        categoryLabel: t('Disk type'),
        id: DISK_TYPE_FILTER_ID,
        match: (obj, selected) => selected.includes(obj?.drive),
        options: Object.values(diskTypesLabels).map((value) => ({ label: value, value })),
      },
    ],
    [t],
  );
};

export default useDisksFilters;
