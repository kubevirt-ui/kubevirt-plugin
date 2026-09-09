// Extracted from CheckupsStorageDetailsPageSection.tsx
// Root: src/views/checkups/storage/details/CheckupsStorageDetailsPageSection.tsx

import React, { type FC } from 'react';

import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import { STATUS_START_TIME_STAMP } from '../../utils/utils';
import {
  STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS,
  STORAGE_CHECKUP_LIVE_MIGRATION,
  STORAGE_CHECKUP_PARAM_STORAGE_CLASS,
  STORAGE_CHECKUP_PARAM_VMI_TIMEOUT,
  STORAGE_CHECKUP_TIMEOUT,
  STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE,
  STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT,
  STORAGE_CHECKUPS_PVC_BOUND,
  STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS,
  STORAGE_CHECKUPS_WITH_SMART_CLONE,
} from '../utils/consts';
import { parseMinutesValue } from '../utils/utils';
import { type CheckupsStorageDetailsListsProps } from './checkupsStorageDetailsTypes';

const CheckupsStorageDetailsLeftList: FC<CheckupsStorageDetailsListsProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();
  const none = t('None');
  const data = configMap?.data;
  const value = (key: string): string => data?.[key] ?? none;

  const rawTimeout = data?.[STORAGE_CHECKUP_TIMEOUT];
  const timeoutDisplay = rawTimeout
    ? t('{{count}} minutes', { count: parseMinutesValue(rawTimeout) })
    : none;

  const rawVmiTimeout = data?.[STORAGE_CHECKUP_PARAM_VMI_TIMEOUT];
  const vmiTimeoutDisplay = rawVmiTimeout
    ? t('{{count}} minutes', { count: parseMinutesValue(rawVmiTimeout) })
    : none;

  const storageClassName =
    data?.[STORAGE_CHECKUP_PARAM_STORAGE_CLASS] ?? data?.[STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS];

  return (
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
            <Timestamp timestamp={data?.[STATUS_START_TIME_STAMP] ?? NO_DATA_DASH} />
          }
          descriptionHeader={t('Start time')}
        />
        <DescriptionItem
          descriptionData={
            storageClassName ? (
              <MulticlusterResourceLink
                cluster={getCluster(configMap)}
                groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                name={storageClassName}
              />
            ) : (
              none
            )
          }
          descriptionHeader={t('Storage class')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_PVC_BOUND)}
          descriptionHeader={t('PVC bound')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_WITH_SMART_CLONE)}
          descriptionHeader={t('StorageProfiles with smart clone support (CSI/snapshot)')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS)}
          descriptionHeader={t('StorageProfiles with spec claimPropertySets')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT)}
          descriptionHeader={t('Storage missing VolumeSnapshotClass')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS)}
          descriptionHeader={t('VirtualMachine with non-virt RBD StorageClass')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE)}
          descriptionHeader={t('VirtualMachine boot from golden image')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUP_LIVE_MIGRATION)}
          descriptionHeader={t('VirtualMachine live migration')}
        />
        <DescriptionItem descriptionData={timeoutDisplay} descriptionHeader={t('Timeout')} />
        <DescriptionItem descriptionData={vmiTimeoutDisplay} descriptionHeader={t('VMI timeout')} />
      </DescriptionList>
    </GridItem>
  );
};

export default CheckupsStorageDetailsLeftList;
