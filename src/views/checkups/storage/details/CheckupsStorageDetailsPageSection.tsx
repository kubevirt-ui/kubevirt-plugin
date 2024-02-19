import React, { FC } from 'react';

import {
  JobModel,
  modelToGroupVersionKind,
  NamespaceModel,
  StorageClassModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Title } from '@patternfly/react-core';

import CheckupsNetworkStatusIcon from '../../CheckupsNetworkStatusIcon';
import {
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import {
  STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS,
  STORAGE_CHECKUP_LIVE_MIGRATION,
  STORAGE_CHECKUP_TIMEOUT,
  STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE,
  STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT,
  STORAGE_CHECKUPS_STORAGE_WITH_RWX,
  STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS,
  STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME,
  STORAGE_CHECKUPS_VM_VOLUME_CLONE,
  STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS,
} from '../utils/utils';

type CheckupsStorageDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const CheckupsStorageDetailsPageSection: FC<CheckupsStorageDetailsPageSectionProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Storage checkup details')}
      </Title>
      <Grid>
        <GridItem span={6}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.metadata?.name}
              descriptionHeader={t('Name')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<CheckupsNetworkStatusIcon configMap={configMap} job={job} />}
              descriptionHeader={t('Status')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <Timestamp timestamp={configMap?.data?.[STATUS_START_TIME_STAMP] || NO_DATA_DASH} />
              }
              descriptionHeader={t('Start time')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS] ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                    name={configMap?.data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS]}
                  />
                ) : (
                  t('None')
                )
              }
              descriptionHeader={t('Default storage class')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS] || t('None')
              }
              descriptionHeader={t('StorageProfiles with spec claimPropertySets')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT] || t('None')
              }
              descriptionHeader={t('Storage missing VolumeSnapshotClass')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS] || t('None')
              }
              descriptionHeader={t('VirtualMachine with non-virt RBD StorageClass')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE] || t('None')}
              descriptionHeader={t('VirtualMachine boot from golden image')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUP_LIVE_MIGRATION] || t('None')}
              descriptionHeader={t('VirtualMachine live migration')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUP_TIMEOUT]}
              descriptionHeader={t('Timeout')}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={configMap?.metadata?.namespace}
                />
              }
              descriptionHeader={t('Namespace')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STATUS_FAILURE_REASON] || t('None')}
              descriptionHeader={t('Failure reason')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <Timestamp
                  timestamp={configMap?.data?.[STATUS_COMPILATION_TIME_STAMP] || NO_DATA_DASH}
                />
              }
              descriptionHeader={t('Complete time')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS] || t('None')
              }
              descriptionHeader={t('Storage class with empty claimPropertySets')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_STORAGE_WITH_RWX] || t('None')}
              descriptionHeader={t('Storage with ReadWriteMany')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE] || t('None')
              }
              descriptionHeader={t('Golden image not up to date')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS] || t('None')
              }
              descriptionHeader={t('VirtualMachine with unset EFS StorageClass')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_VM_VOLUME_CLONE] || t('None')}
              descriptionHeader={t('VirtualMachine volume clone')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME] || t('None')}
              descriptionHeader={t('VirtualMachine hotplug volume')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(JobModel)}
                  name={job?.metadata?.name}
                  namespace={job?.metadata?.namespace}
                />
              }
              descriptionHeader={t('Job')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsStorageDetailsPageSection;
