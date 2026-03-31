import React, { FC } from 'react';

import {
  JobModel,
  modelToGroupVersionKind,
  NamespaceModel,
  StorageClassModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Title } from '@patternfly/react-core';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import {
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import {
  STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS,
  STORAGE_CHECKUP_LIVE_MIGRATION,
  STORAGE_CHECKUP_PARAM_NUM_OF_VMS,
  STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN,
  STORAGE_CHECKUP_PARAM_STORAGE_CLASS,
  STORAGE_CHECKUP_PARAM_VMI_TIMEOUT,
  STORAGE_CHECKUP_TIMEOUT,
  STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NO_DATA_SOURCE,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE,
  STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT,
  STORAGE_CHECKUPS_PVC_BOUND,
  STORAGE_CHECKUPS_STORAGE_WITH_RWX,
  STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS,
  STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME,
  STORAGE_CHECKUPS_VM_VOLUME_CLONE,
  STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS,
  STORAGE_CHECKUPS_WITH_SMART_CLONE,
} from '../utils/consts';
import { getSkipTeardownLabel, parseMinutesValue, SkipTeardownOption } from '../utils/utils';

type CheckupsStorageDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const CheckupsStorageDetailsPageSection: FC<CheckupsStorageDetailsPageSectionProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();
  const none = t('None');

  const rawSkipTeardown = configMap?.data?.[STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN] as
    | SkipTeardownOption
    | undefined;
  const skipTeardownLabel = getSkipTeardownLabel(t, rawSkipTeardown ?? 'never');

  const rawTimeout = configMap?.data?.[STORAGE_CHECKUP_TIMEOUT];
  const timeoutDisplay = rawTimeout
    ? t('{{count}} minutes', { count: parseMinutesValue(rawTimeout) })
    : none;

  const rawVmiTimeout = configMap?.data?.[STORAGE_CHECKUP_PARAM_VMI_TIMEOUT];
  const vmiTimeoutDisplay = rawVmiTimeout
    ? t('{{count}} minutes', { count: parseMinutesValue(rawVmiTimeout) })
    : none;

  return (
    <>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Storage checkup details')}
      </Title>
      <Grid>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionItem
              descriptionData={configMap?.metadata?.name}
              descriptionHeader={t('Name')}
            />
            <DescriptionItem
              descriptionData={<CheckupsStatusIcon configMap={configMap} job={job} />}
              descriptionHeader={t('Status')}
            />
            <DescriptionItem
              descriptionData={
                <Timestamp timestamp={configMap?.data?.[STATUS_START_TIME_STAMP] || NO_DATA_DASH} />
              }
              descriptionHeader={t('Start time')}
            />
            <DescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUP_PARAM_STORAGE_CLASS] ||
                configMap?.data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS] ? (
                  <MulticlusterResourceLink
                    name={
                      configMap?.data?.[STORAGE_CHECKUP_PARAM_STORAGE_CLASS] ||
                      configMap?.data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS]
                    }
                    cluster={getCluster(configMap)}
                    groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                  />
                ) : (
                  none
                )
              }
              descriptionHeader={t('Storage class')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_PVC_BOUND] || none}
              descriptionHeader={t('PVC bound')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_WITH_SMART_CLONE] || none}
              descriptionHeader={t('StorageProfiles with smart clone support (CSI/snapshot)')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS] || none}
              descriptionHeader={t('StorageProfiles with spec claimPropertySets')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT] || none}
              descriptionHeader={t('Storage missing VolumeSnapshotClass')}
            />
            <DescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS] || none
              }
              descriptionHeader={t('VirtualMachine with non-virt RBD StorageClass')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE] || none}
              descriptionHeader={t('VirtualMachine boot from golden image')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUP_LIVE_MIGRATION] || none}
              descriptionHeader={t('VirtualMachine live migration')}
            />
            <DescriptionItem descriptionData={timeoutDisplay} descriptionHeader={t('Timeout')} />
            <DescriptionItem
              descriptionData={vmiTimeoutDisplay}
              descriptionHeader={t('VMI timeout')}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionItem
              descriptionData={
                <MulticlusterResourceLink
                  cluster={getCluster(configMap)}
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={getNamespace(configMap)}
                />
              }
              descriptionHeader={t('Namespace')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STATUS_FAILURE_REASON] || none}
              descriptionHeader={t('Failure reason')}
            />
            <DescriptionItem
              descriptionData={
                <Timestamp
                  timestamp={configMap?.data?.[STATUS_COMPLETION_TIME_STAMP] || NO_DATA_DASH}
                />
              }
              descriptionHeader={t('Complete time')}
            />
            <DescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS] || none
              }
              descriptionHeader={t('Storage class with empty claimPropertySets')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_STORAGE_WITH_RWX] || none}
              descriptionHeader={t('Storage with ReadWriteMany')}
            />
            <DescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE] || none
              }
              descriptionHeader={t('Golden image not up to date')}
            />
            <DescriptionItem
              descriptionData={
                configMap?.data?.[STORAGE_CHECKUPS_GOLDEN_IMAGE_NO_DATA_SOURCE] || none
              }
              descriptionHeader={t('Golden image no DataSource')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS] || none}
              descriptionHeader={t('VirtualMachine with unset EFS StorageClass')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_VM_VOLUME_CLONE] || none}
              descriptionHeader={t('VirtualMachine volume clone')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME] || none}
              descriptionHeader={t('VirtualMachine hotplug volume')}
            />
            <DescriptionItem
              descriptionData={
                <MulticlusterResourceLink
                  cluster={getCluster(job)}
                  groupVersionKind={modelToGroupVersionKind(JobModel)}
                  name={getName(job)}
                  namespace={getNamespace(job)}
                />
              }
              descriptionHeader={t('Job')}
            />
            <DescriptionItem
              descriptionData={configMap?.data?.[STORAGE_CHECKUP_PARAM_NUM_OF_VMS] || none}
              descriptionHeader={t('Number of VMs')}
            />
            <DescriptionItem
              descriptionData={skipTeardownLabel}
              descriptionHeader={t('Skip teardown')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsStorageDetailsPageSection;
