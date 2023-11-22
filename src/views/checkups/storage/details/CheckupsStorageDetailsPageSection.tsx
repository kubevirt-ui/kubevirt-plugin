import React, { FC } from 'react';

import {
  JobModel,
  modelToGroupVersionKind,
  NamespaceModel,
  StorageClassModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';

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
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
              <DescriptionListDescription>{configMap?.metadata?.name}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
              <CheckupsNetworkStatusIcon configMap={configMap} job={job} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Start time')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp timestamp={configMap?.data?.[STATUS_START_TIME_STAMP] || NO_DATA_DASH} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Default storage class')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS] ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                    name={configMap?.data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS]}
                  />
                ) : (
                  t('None')
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('StorageProfiles with spec claimPropertySets')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Storage missing VolumeSnapshotClass')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('VirtualMachine with non-virt RBD StorageClass')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('VirtualMachine boot from golden image')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('VirtualMachine live migration')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUP_LIVE_MIGRATION] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Timeout')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUP_TIMEOUT]}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={configMap?.metadata?.namespace}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Failure reason')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_FAILURE_REASON] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Complete time')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp
                  timestamp={configMap?.data?.[STATUS_COMPILATION_TIME_STAMP] || NO_DATA_DASH}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('Storage class with empty claimPropertySets')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Storage with ReadWriteMany')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_STORAGE_WITH_RWX] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Golden image not up to date')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('VirtualMachine with unset EFS StorageClass')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('VirtualMachine volume clone')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_VM_VOLUME_CLONE] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('VirtualMachine hotplug volume')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Job')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(JobModel)}
                  name={job?.metadata?.name}
                  namespace={job?.metadata?.namespace}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsStorageDetailsPageSection;
