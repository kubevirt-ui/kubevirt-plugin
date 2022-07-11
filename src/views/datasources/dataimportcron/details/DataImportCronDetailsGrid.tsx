import React from 'react';

import WizardMetadataLabels from '@catalog/wizard/tabs/metadata/components/WizardMetadataLabels';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import DataSourceAnnotations from '../../details/components/DataSourceAnnotations/DataSourceAnnotations';

import { DataImportCronManageDetails } from './DataImportCronManageDetails/DataImportCronManageDetails';

type DataImportCronDetailsGridProps = {
  dataImportCron: V1beta1DataImportCron;
};

export const DataImportCronDetailsGrid: React.FC<DataImportCronDetailsGridProps> = ({
  dataImportCron,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <DescriptionList>
          <DescriptionItem
            descriptionData={dataImportCron?.metadata?.name}
            descriptionHeader={t('Name')}
            isPopover
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
            bodyContent={t(
              'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. ',
            )}
            moreInfoURL="http://kubernetes.io/docs/user-guide/identifiers#names"
            breadcrumb="DataImportCron.metadata.name"
            data-test-id={`${dataImportCron?.metadata?.name}-name`}
          />
          <DescriptionItem
            descriptionData={
              <ResourceLink kind="Namespace" name={dataImportCron?.metadata?.namespace} />
            }
            descriptionHeader={t('Namespace')}
            isPopover
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
            bodyContent={t(
              'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
            )}
            moreInfoURL="http://kubernetes.io/docs/user-guide/namespaces"
            breadcrumb="DataImportCron.metadata.namespace"
          />

          <DescriptionItem
            descriptionData={<WizardMetadataLabels labels={dataImportCron?.metadata?.labels} />}
            descriptionHeader={t('Labels')}
            isPopover
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
            bodyContent={t(
              'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
            )}
            moreInfoURL="http://kubernetes.io/docs/user-guide/labels"
            breadcrumb="DataImportCron.metadata.labels"
            isEdit
            showEditOnTitle
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <LabelsModal
                  obj={dataImportCron}
                  isOpen={isOpen}
                  onClose={onClose}
                  onLabelsSubmit={(labels) =>
                    k8sPatch({
                      model: DataImportCronModel,
                      resource: dataImportCron,
                      data: [
                        {
                          op: 'replace',
                          path: '/metadata/labels',
                          value: labels,
                        },
                      ],
                    })
                  }
                />
              ))
            }
            data-test-id={`${dataImportCron?.metadata?.name}-labels`}
          />
          <DescriptionItem
            descriptionData={
              <DataSourceAnnotations annotations={dataImportCron?.metadata?.annotations} />
            }
            descriptionHeader={t('Annotations')}
            isPopover
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
            bodyContent={t(
              'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
            )}
            moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
            breadcrumb="DataImportCron.metadata.annotations"
            isEdit
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <AnnotationsModal
                  obj={dataImportCron}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={(updatedAnnotations) =>
                    k8sPatch({
                      model: DataImportCronModel,
                      resource: dataImportCron,
                      data: [
                        {
                          op: 'replace',
                          path: '/metadata/annotations',
                          value: updatedAnnotations,
                        },
                      ],
                    })
                  }
                />
              ))
            }
          />
          <DescriptionItem
            descriptionData={<Timestamp timestamp={dataImportCron?.metadata?.creationTimestamp} />}
            descriptionHeader={t('Created at')}
            isPopover
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
            bodyContent={t(
              'Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.',
            )}
            breadcrumb="DataImportCron.metadata.creationTimestamp"
          />
          <OwnerDetailsItem obj={dataImportCron} />
          <DataImportCronManageDetails
            dataImportCron={dataImportCron}
            onEditClick={() => console.log('edit')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};
