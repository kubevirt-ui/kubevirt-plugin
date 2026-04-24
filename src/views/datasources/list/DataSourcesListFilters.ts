import { TFunction } from 'i18next';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getDataSourceCronJob } from '../utils';

export const getDataImportCronFilter = (t: TFunction): RowFilter<V1beta1DataSource>[] => [
  {
    filter: ({ selected }, obj) => selected?.length === 0 || Boolean(getDataSourceCronJob(obj)),
    filterGroupName: t('Source'),
    items: [
      {
        id: 'available',
        title: t('DataImportCron available'),
      },
    ],
    reducer: (obj) => (getDataSourceCronJob(obj) ? 'available' : ''),
    type: 'data-cron-available',
  },
];
