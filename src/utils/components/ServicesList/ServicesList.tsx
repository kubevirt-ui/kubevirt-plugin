import React, { useMemo } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';

import { getServiceRowId, getServicesColumns } from './servicesTableDefinition';

type ServicesListProps = {
  data: IoK8sApiCoreV1Service[];
  loaded: boolean;
  loadError: any;
};

const ServicesList = ({ data, loaded, loadError }: ServicesListProps) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getServicesColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(data, columns, 'name');

  const rows = useMemo(
    () => generateRows(sortedData, columns, undefined, getServiceRowId),
    [sortedData, columns],
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  if (loadError) {
    return <div className="pf-v6-u-text-align-center">{t('Error loading services')}</div>;
  }

  if (isEmpty(data)) {
    return <div className="pf-v6-u-text-align-center">{t('No services found')}</div>;
  }

  return <DataViewTable aria-label={t('Services table')} columns={tableColumns} rows={rows} />;
};

export default ServicesList;
