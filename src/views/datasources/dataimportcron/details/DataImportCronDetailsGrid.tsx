import React from 'react';

import WizardMetadataLabels from '@catalog/wizard/tabs/metadata/components/WizardMetadataLabels';
import { DataSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch, ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import DataSourceAnnotations from '../../details/components/DataSourceAnnotations/DataSourceAnnotations';

import { DataImportCronManageDetails } from './DataImportCronManageDetails/DataImportCronManageDetails';
import { DataImportCronManageModal } from './DataImportCronManageModal/DataImportCronManageModal';

type DataImportCronDetailsGridProps = {
  dataImportCron: V1beta1DataImportCron;
};

export const DataImportCronDetailsGrid: React.FC<DataImportCronDetailsGridProps> = ({
  dataImportCron,
}) => {
  const { t } = useKubevirtTranslation();
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
          <DescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
            bodyContent={t(
              'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. ',
            )}
            breadcrumb="DataImportCron.metadata.name"
            data-test-id={`${dataImportCron?.metadata?.name}-name`}
            descriptionData={dataImportCron?.metadata?.name}
            descriptionHeader={t('Name')}
            isPopover
            moreInfoURL="http://kubernetes.io/docs/user-guide/identifiers#names"
          />
          <DescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
            bodyContent={t(
              'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
            )}
            descriptionData={
              <ResourceLink kind="Namespace" name={dataImportCron?.metadata?.namespace} />
            }
            breadcrumb="DataImportCron.metadata.namespace"
            descriptionHeader={t('Namespace')}
            isPopover
            moreInfoURL="http://kubernetes.io/docs/user-guide/namespaces"
          />

          <DescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
            bodyContent={t(
              'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
            )}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <LabelsModal
                  onLabelsSubmit={(labels) =>
                    k8sPatch({
                      data: [
                        {
                          op: 'replace',
                          path: '/metadata/labels',
                          value: labels,
                        },
                      ],
                      model: DataImportCronModel,
                      resource: dataImportCron,
                    })
                  }
                  isOpen={isOpen}
                  obj={dataImportCron}
                  onClose={onClose}
                />
              ))
            }
            breadcrumb="DataImportCron.metadata.labels"
            data-test-id={`${dataImportCron?.metadata?.name}-labels`}
            descriptionData={<WizardMetadataLabels labels={dataImportCron?.metadata?.labels} />}
            descriptionHeader={t('Labels')}
            isEdit
            isPopover
            moreInfoURL="http://kubernetes.io/docs/user-guide/labels"
            showEditOnTitle
          />
          <DescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
            bodyContent={t(
              'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
            )}
            descriptionData={
              <DataSourceAnnotations annotations={dataImportCron?.metadata?.annotations} />
            }
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <AnnotationsModal
                  onSubmit={(updatedAnnotations) =>
                    k8sPatch({
                      data: [
                        {
                          op: 'replace',
                          path: '/metadata/annotations',
                          value: updatedAnnotations,
                        },
                      ],
                      model: DataImportCronModel,
                      resource: dataImportCron,
                    })
                  }
                  isOpen={isOpen}
                  obj={dataImportCron}
                  onClose={onClose}
                />
              ))
            }
            breadcrumb="DataImportCron.metadata.annotations"
            descriptionHeader={t('Annotations')}
            isEdit
            isPopover
            moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
          />
          <DescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
            bodyContent={t(
              'Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.',
            )}
            breadcrumb="DataImportCron.metadata.creationTimestamp"
            descriptionData={<Timestamp timestamp={dataImportCron?.metadata?.creationTimestamp} />}
            descriptionHeader={t('Created at')}
            isPopover
          />
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
