import React, { FC, useMemo } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getServiceRowId, getServicesColumns } from './servicesTableDefinition';

type ServicesListProps = {
  data: IoK8sApiCoreV1Service[];
  loaded: boolean;
  loadError: unknown;
};

const ServicesList: FC<ServicesListProps> = ({ data, loaded, loadError }) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getServicesColumns(t), [t]);

  return (
    <KubevirtTable
      ariaLabel={t('Services table')}
      columns={columns}
      data={data}
      dataTest="services-list"
      fixedLayout
      getRowId={getServiceRowId}
      initialSortKey="name"
      loaded={loaded}
      loadError={loadError}
      noDataMsg={t('No services found')}
    />
  );
};

export default ServicesList;
