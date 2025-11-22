import React from 'react';

import { DataSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { DataImportCronManageDetails } from './DataImportCronManageDetails/DataImportCronManageDetails';
import { DataImportCronManageModal } from './DataImportCronManageModal/DataImportCronManageModal';

type DataImportCronDetailsGridProps = {
  dataImportCron: V1beta1DataImportCron;
};

export const DataImportCronDetailsGrid: React.FC<DataImportCronDetailsGridProps> = ({
  dataImportCron,
}) => {
  const { createModal } = useModal();
  const [dataSource] = useK8sWatchResource<V1beta1DataSource>({
    groupVersionKind: DataSourceModelGroupVersionKind,
    name: dataImportCron?.spec?.managedDataSource,
    namespace: dataImportCron?.metadata?.namespace,
  });

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <DescriptionList>
          <DescriptionItemName model={DataImportCronModel} resource={dataImportCron} />
          <DescriptionItemNamespace model={DataImportCronModel} resource={dataImportCron} />
          <DescriptionItemLabels model={DataImportCronModel} resource={dataImportCron} />
          <DescriptionItemAnnotations model={DataImportCronModel} resource={dataImportCron} />
          <DescriptionItemCreatedAt model={DataImportCronModel} resource={dataImportCron} />
          <OwnerDetailsItem obj={dataImportCron} />
          <DataImportCronManageDetails
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <DataImportCronManageModal
                  dataImportCron={dataImportCron}
                  dataSource={dataSource}
                  isOpen={isOpen}
                  onClose={onClose}
                />
              ))
            }
            dataImportCron={dataImportCron}
            dataSource={dataSource}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};
