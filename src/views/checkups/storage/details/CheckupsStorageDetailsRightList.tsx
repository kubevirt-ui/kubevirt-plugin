// Extracted from CheckupsStorageDetailsPageSection.tsx
// Root: src/views/checkups/storage/details/CheckupsStorageDetailsPageSection.tsx

import { type FC } from 'react';

import {
  JobModel,
  modelToGroupVersionKind,
  NamespaceModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import { STATUS_COMPLETION_TIME_STAMP, STATUS_FAILURE_REASON } from '../../utils/utils';
import {
  STORAGE_CHECKUP_PARAM_NUM_OF_VMS,
  STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NO_DATA_SOURCE,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE,
  STORAGE_CHECKUPS_STORAGE_WITH_RWX,
  STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS,
  STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME,
  STORAGE_CHECKUPS_VM_VOLUME_CLONE,
  STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS,
} from '../utils/consts';
import { getSkipTeardownLabel, type SkipTeardownOption } from '../utils/utils';
import { type CheckupsStorageDetailsListsProps } from './checkupsStorageDetailsTypes';

const CheckupsStorageDetailsRightList: FC<CheckupsStorageDetailsListsProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();
  const none = t('None');
  const data = configMap?.data;
  const value = (key: string): string => data?.[key] ?? none;

  const rawSkipTeardown = data?.[STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN] as
    | SkipTeardownOption
    | undefined;
  const skipTeardownLabel = getSkipTeardownLabel(t, rawSkipTeardown ?? 'never');

  return (
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
          descriptionData={value(STATUS_FAILURE_REASON)}
          descriptionHeader={t('Failure reason')}
        />
        <DescriptionItem
          descriptionData={
            <Timestamp timestamp={data?.[STATUS_COMPLETION_TIME_STAMP] ?? NO_DATA_DASH} />
          }
          descriptionHeader={t('Complete time')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS)}
          descriptionHeader={t('Storage class with empty claimPropertySets')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_STORAGE_WITH_RWX)}
          descriptionHeader={t('Storage with ReadWriteMany')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE)}
          descriptionHeader={t('Golden image not up to date')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_GOLDEN_IMAGE_NO_DATA_SOURCE)}
          descriptionHeader={t('Golden image no DataSource')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS)}
          descriptionHeader={t('VirtualMachine with unset EFS StorageClass')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_VM_VOLUME_CLONE)}
          descriptionHeader={t('VirtualMachine volume clone')}
        />
        <DescriptionItem
          descriptionData={value(STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME)}
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
          descriptionData={value(STORAGE_CHECKUP_PARAM_NUM_OF_VMS)}
          descriptionHeader={t('Number of VMs')}
        />
        <DescriptionItem
          descriptionData={skipTeardownLabel}
          descriptionHeader={t('Skip teardown')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default CheckupsStorageDetailsRightList;
