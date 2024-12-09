import React from 'react';
import { getDataSourceCronJob } from 'src/views/datasources/utils';

import {
  PersistentVolumeClaimModel,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import PreferencePopoverContent from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/PreferencePopoverContent';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/resources/bootableresources/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { k8sPatch, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import DataSourceAnnotations from '../DataSourceAnnotations/DataSourceAnnotations';
import DataSourceImportCronDescription from '../DataSourceImportCronDescription/DataSourceImportCronDescription';

type DataSourceDetailsGridProps = {
  dataSource: V1beta1DataSource;
};

export const DataSourceDetailsGrid: React.FC<DataSourceDetailsGridProps> = ({ dataSource }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const dataImportCron = getDataSourceCronJob(dataSource);
  const { name: pvcSourceName, namespace: pvcSourceNamespace } =
    dataSource?.spec?.source?.pvc || {};

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <DescriptionList className="pf-c-description-list">
          <VirtualMachineDescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
            bodyContent={t(
              'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. ',
            )}
            breadcrumb="DataSource.metadata.name"
            data-test-id={`${dataSource?.metadata?.name}-name`}
            descriptionData={dataSource?.metadata?.name}
            descriptionHeader={t('Name')}
            isPopover
            moreInfoURL={documentationURL.NAME}
          />
          <VirtualMachineDescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
            bodyContent={t(
              'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
            )}
            descriptionData={
              <ResourceLink kind="Namespace" name={dataSource?.metadata?.namespace} />
            }
            breadcrumb="DataSource.metadata.namespace"
            descriptionHeader={t('Namespace')}
            isPopover
            moreInfoURL={documentationURL.NAMESPACE_DOC}
          />
          <VirtualMachineDescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
            bodyContent={t(
              'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
            )}
            descriptionData={
              <MetadataLabels labels={dataSource?.metadata?.labels} model={DataSourceModel} />
            }
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
                      model: DataSourceModel,
                      resource: dataSource,
                    })
                  }
                  isOpen={isOpen}
                  obj={dataSource}
                  onClose={onClose}
                />
              ))
            }
            breadcrumb="DataSource.metadata.labels"
            data-test-id={`${dataSource?.metadata?.name}-labels`}
            descriptionHeader={t('Labels')}
            isEdit
            isPopover
            moreInfoURL={documentationURL.LABELS}
            showEditOnTitle
          />
          <VirtualMachineDescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
            bodyContent={t(
              'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
            )}
            descriptionData={
              <DataSourceAnnotations annotations={dataSource?.metadata?.annotations} />
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
                      model: DataSourceModel,
                      resource: dataSource,
                    })
                  }
                  isOpen={isOpen}
                  obj={dataSource}
                  onClose={onClose}
                />
              ))
            }
            breadcrumb="DataSource.metadata.annotations"
            descriptionHeader={t('Annotations')}
            isEdit
            isPopover
            moreInfoURL={documentationURL.ANNOTATIONS}
          />
          <VirtualMachineDescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
            bodyContent={t(
              'Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.',
            )}
            breadcrumb="DataSource.metadata.creationTimestamp"
            descriptionData={<Timestamp timestamp={dataSource?.metadata?.creationTimestamp} />}
            descriptionHeader={t('Created at')}
            isPopover
          />
          <OwnerDetailsItem obj={dataSource} />
        </DescriptionList>
      </GridItem>
      <GridItem span={1} />
      <GridItem span={5}>
        <DescriptionList className="pf-c-description-list">
          {dataImportCron && (
            <DataSourceImportCronDescription
              dataImportCronName={dataImportCron}
              namespace={dataSource?.metadata?.namespace}
            />
          )}
          {pvcSourceName && pvcSourceNamespace && (
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  kind={PersistentVolumeClaimModel.kind}
                  name={pvcSourceName}
                  namespace={pvcSourceNamespace}
                />
              }
              descriptionHeader={t('Source')}
            />
          )}
          <VirtualMachineDescriptionItem
            descriptionData={
              <ResourceLink
                groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
                name={getLabel(dataSource, DEFAULT_INSTANCETYPE_LABEL)}
              />
            }
            bodyContent={t('The default InstanceType for this volume.')}
            descriptionHeader={t('Default InstanceType')}
            isPopover
          />
          <VirtualMachineDescriptionItem
            descriptionData={
              <ResourceLink
                groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
                name={getLabel(dataSource, DEFAULT_PREFERENCE_LABEL)}
              />
            }
            bodyContent={<PreferencePopoverContent />}
            descriptionHeader={t('Preference')}
            isPopover
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};
