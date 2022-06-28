import React from 'react';

import { DataImportCronModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type DataSourceManagedByDescriptionProps = {
  dataImportCronName: string;
  namespace: string;
};

const DataSourceManagedByDescription: React.FC<DataSourceManagedByDescriptionProps> = ({
  dataImportCronName,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const [dataImportCron] = useK8sWatchResource<V1beta1DataImportCron>({
    groupVersionKind: DataImportCronModelGroupVersionKind,
    name: dataImportCronName,
    namespace: namespace,
  });

  return (
    <DescriptionItem
      descriptionHeader={t('Managed by')}
      descriptionData={
        dataImportCron && (
          <ResourceLink
            groupVersionKind={DataImportCronModelGroupVersionKind}
            name={dataImportCron?.metadata?.name}
            namespace={dataImportCron?.metadata?.namespace}
          />
        )
      }
    />
  );
};

export default DataSourceManagedByDescription;
