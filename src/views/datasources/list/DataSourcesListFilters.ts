import { TFunction } from 'i18next';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { getDataSourceCronJob } from '../utils';

const DATA_IMPORT_CRON_FILTER_ID = 'data-cron-available';
const DATA_IMPORT_CRON_AVAILABLE_VALUE = 'available';

export const getDataImportCronFilter = (t: TFunction): KubevirtFilter<V1beta1DataSource>[] => [
  {
    categoryLabel: t('Source'),
    id: DATA_IMPORT_CRON_FILTER_ID,
    match: (obj, selected) =>
      selected.includes(DATA_IMPORT_CRON_AVAILABLE_VALUE) && Boolean(getDataSourceCronJob(obj)),
    options: [{ label: t('DataImportCron available'), value: DATA_IMPORT_CRON_AVAILABLE_VALUE }],
  },
];
