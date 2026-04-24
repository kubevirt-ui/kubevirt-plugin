import React, { FC } from 'react';
import { TFunction } from 'i18next';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

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
