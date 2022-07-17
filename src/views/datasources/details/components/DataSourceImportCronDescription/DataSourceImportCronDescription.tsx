import React from 'react';

import { DataImportCronModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type DataSourceImportCronDescriptionProps = {
  dataImportCronName: string;
  namespace: string;
};

const DataSourceImportCronDescription: React.FC<DataSourceImportCronDescriptionProps> = ({
  dataImportCronName,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const [dataImportCron] = useK8sWatchResource<V1beta1DataImportCron>({
    groupVersionKind: DataImportCronModelGroupVersionKind,
    name: dataImportCronName,
    namespace: namespace,
  });

  if (!dataImportCron) return null;

  return (
    <DescriptionItem
      descriptionHeader={t('DataImportCron')}
      descriptionData={
        <ResourceLink
          groupVersionKind={DataImportCronModelGroupVersionKind}
          name={dataImportCron?.metadata?.name}
          namespace={dataImportCron?.metadata?.namespace}
        />
      }
    />
  );
};

export default DataSourceImportCronDescription;
