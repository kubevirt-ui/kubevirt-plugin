import React from 'react';
import { getDataSourceCronJob } from 'src/views/datasources/utils';

import WizardMetadataLabels from '@catalog/wizard/tabs/metadata/components/WizardMetadataLabels';
import {
  PersistentVolumeClaimModel,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import PreferencePopoverContent from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/PreferencePopoverContent';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
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
        <DescriptionList>
          <DescriptionItem
            // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
            bodyContent={t(
              'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. ',
            )}
            breadcrumb="DataSource.metadata.name"
            data-test-id={`${dataSource?.metadata?.name}-name`}
            descriptionData={dataSource?.metadata?.name}
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
              <ResourceLink kind="Namespace" name={dataSource?.metadata?.namespace} />
            }
            breadcrumb="DataSource.metadata.namespace"
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
            descriptionData={<WizardMetadataLabels labels={dataSource?.metadata?.labels} />}
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
            moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
          />
          <DescriptionItem
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
        <DescriptionList>
          {dataImportCron && (
            <DataSourceImportCronDescription
              dataImportCronName={dataImportCron}
              namespace={dataSource?.metadata?.namespace}
            />
          )}
          {pvcSourceName && pvcSourceNamespace && (
            <DescriptionItem
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
          <DescriptionItem
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
          <DescriptionItem
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
