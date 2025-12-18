import React from 'react';

import { DataImportCronModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataImportCron } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type DataSourceImportCronDescriptionProps = {
  dataImportCronName: string;
  namespace: string;
};

const DataSourceImportCronDescription: React.FC<DataSourceImportCronDescriptionProps> = ({
  dataImportCronName,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [dataImportCron] = useK8sWatchData<V1beta1DataImportCron>({
    cluster,
    groupVersionKind: DataImportCronModelGroupVersionKind,
    name: dataImportCronName,
    namespace: namespace,
  });

  if (!dataImportCron) return null;

  return (
    <DescriptionItem
      bodyContent={t(
        'The DataImportCron polls disk images and imports them as PersistentVolumeClaims. You can configure the image source and other settings on the DataImportCron details page.',
      )}
      descriptionData={
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={DataImportCronModelGroupVersionKind}
          name={getName(dataImportCron)}
          namespace={getNamespace(dataImportCron)}
        />
      }
      descriptionHeader={t('DataImportCron')}
      isPopover
    />
  );
};

export default DataSourceImportCronDescription;
