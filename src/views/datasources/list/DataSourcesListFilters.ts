import { TFunction } from 'react-i18next';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getDataSourceCronJob } from '../utils';

export const getDataImportCronFilter = (t: TFunction): RowFilter<V1beta1DataSource>[] => [
  {
    filterGroupName: t('Source'),
    type: 'data-cron-available',
    reducer: (obj) => (getDataSourceCronJob(obj) ? 'available' : ''),
    filter: ({ selected }, obj) => selected?.length === 0 || !!getDataSourceCronJob(obj),
    items: [
      {
        id: 'available',
        title: t('DataImportCron available'),
      },
    ],
  },
];
