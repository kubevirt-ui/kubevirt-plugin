import { TFunction } from 'i18next';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { DiskPresentation } from './virtualMachinesInstancePageDisksTabUtils';

const DISK_TYPE_FILTER_ID = 'disk-type';

export const getVMIDiskFilters = (t: TFunction): KubevirtFilter<DiskPresentation>[] => [
  {
    categoryLabel: t('Disk type'),
    id: DISK_TYPE_FILTER_ID,
    match: (obj, selected) => selected.includes(obj?.drive),
    options: Object.entries(diskTypesLabels).map(([value, label]) => ({ label, value })),
  },
];
