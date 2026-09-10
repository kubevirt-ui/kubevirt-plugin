import type { FC } from 'react';
import React from 'react';
import type { TFunction } from 'i18next';

import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import { getDataSourceCronJob } from '../../utils';

type DataSourceImportCronCellProps = {
  row: V1beta1DataSource;
  t: TFunction;
};

const DataSourceImportCronCell: FC<DataSourceImportCronCellProps> = ({ row, t }) => {
  const importCron = getDataSourceCronJob(row);
  return <>{importCron ? t('Yes') : t('No')}</>;
};

export default DataSourceImportCronCell;
