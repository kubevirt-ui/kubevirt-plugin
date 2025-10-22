import React from 'react';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash-es';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import { getColumns } from './columns';
import ServiceRow from './ServiceRow';

type ServicesListProps = {
  data: IoK8sApiCoreV1Service[];
  loaded: boolean;
  loadError: any;
};

const ServicesList = ({ data, loaded, loadError }: ServicesListProps) => {
  const { t } = useTranslation();

  return (
    <VirtualizedTable
      columns={getColumns(t)}
      data={data}
      loaded={loaded}
      loadError={loadError}
      NoDataEmptyMsg={() => t('No services found')}
      Row={ServiceRow}
      unfilteredData={data}
    />
  );
};

export default ServicesList;
