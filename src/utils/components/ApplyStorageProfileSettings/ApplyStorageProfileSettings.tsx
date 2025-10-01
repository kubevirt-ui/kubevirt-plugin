import React, { FC, useEffect, useRef } from 'react';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { Flex, FlexItem, Skeleton } from '@patternfly/react-core';

import ExpandSectionWithCustomToggle from '../ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';

import AccessMode from './AccessMode';
import StorageProfilePopoverHelpIcon from './StorageProfilePopoverHelpIcon';
import VolumeMode from './VolumeMode';

import './ApplyStorageProfileSettings.scss';

type ApplyStorageProfileSettingsProps = {
  accessMode: V1beta1StorageSpecAccessModesEnum;
  setAccessMode: (accessMode?: V1beta1StorageSpecAccessModesEnum) => void;
  setVolumeMode: (volumeMode?: V1beta1StorageSpecVolumeModeEnum) => void;
  storageClassName: string;
  vmCluster?: string;
  volumeMode: V1beta1StorageSpecVolumeModeEnum;
};

const ApplyStorageProfileSettings: FC<ApplyStorageProfileSettingsProps> = ({
  accessMode,
  setAccessMode,
  setVolumeMode,
  storageClassName,
  vmCluster,
  volumeMode,
}) => {
  const { t } = useKubevirtTranslation();
  const { claimPropertySets, error, loaded } = useStorageProfileClaimPropertySets(
    storageClassName,
    vmCluster,
  );
  const storageRef = useRef<string>(undefined);

  useEffect(() => {
    if (storageRef.current === storageClassName) {
      return;
    }
    storageRef.current = storageClassName;
    setAccessMode(undefined);
    setVolumeMode(undefined);
  });

  if (loaded && error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <ExpandSectionWithCustomToggle
      customContent={<StorageProfilePopoverHelpIcon />}
      id="configure-storage-profile"
      isIndented
      toggleContent={t('Configure Storage profile')}
    >
      {loaded ? (
        <Flex spaceItems={{ default: 'spaceItems3xl' }}>
          <FlexItem>
            <VolumeMode
              claimPropertySets={claimPropertySets ?? []}
              {...{ setAccessMode, setVolumeMode, volumeMode }}
            />
          </FlexItem>
          <FlexItem>
            <AccessMode
              claimPropertySets={claimPropertySets ?? []}
              {...{ accessMode, setAccessMode, volumeMode }}
            />
          </FlexItem>
        </Flex>
      ) : (
        <Skeleton screenreaderText={t('Loading StorageProfile')} />
      )}
    </ExpandSectionWithCustomToggle>
  );
};

export default ApplyStorageProfileSettings;
