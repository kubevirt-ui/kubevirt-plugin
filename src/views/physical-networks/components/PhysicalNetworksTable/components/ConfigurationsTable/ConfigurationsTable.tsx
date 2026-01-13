import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DataViewTable } from '@patternfly/react-data-view';

import { ConfigurationDetails } from '../../../../utils/types';

import { getConfigurationRows, getConfigurationTableColumns } from './utils/utils';

type ConfigurationsTableProps = {
  nncpDetails: ConfigurationDetails[];
  setSelectedConfiguration: Dispatch<SetStateAction<ConfigurationDetails>>;
};

const ConfigurationsTable: FC<ConfigurationsTableProps> = ({
  nncpDetails,
  setSelectedConfiguration,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DataViewTable
      aria-label={t('Configurations table')}
      columns={getConfigurationTableColumns(t)}
      rows={getConfigurationRows(nncpDetails, setSelectedConfiguration)}
    />
  );
};

export default ConfigurationsTable;
