import React, { type FC, type ReactElement, useEffect, useRef } from 'react';

import {
  type V1beta1StorageSpecAccessModesEnum,
  type V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { Flex, FlexItem, Skeleton } from '@patternfly/react-core';

import AccessMode from './AccessMode';
import VolumeMode from './VolumeMode';

import './ApplyStorageProfileSettings.scss';

type ApplyStorageProfileSettingsProps = {
  accessMode: V1beta1StorageSpecAccessModesEnum;
  isDisabled?: boolean;
  setAccessMode: (accessMode?: V1beta1StorageSpecAccessModesEnum) => void;
  setVolumeMode: (volumeMode?: V1beta1StorageSpecVolumeModeEnum) => void;
  storageClassName: string;
  vmCluster?: string;
  volumeMode: V1beta1StorageSpecVolumeModeEnum;
};

const ApplyStorageProfileSettings: FC<ApplyStorageProfileSettingsProps> = ({
  accessMode,
  isDisabled,
  setAccessMode,
  setVolumeMode,
  storageClassName,
  vmCluster,
  volumeMode,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const storageProfileResult = useStorageProfileClaimPropertySets(storageClassName, vmCluster);
  const claimPropertySets = storageProfileResult.claimPropertySets;
  const error = storageProfileResult.error as Error | undefined;
  const loaded = storageProfileResult.loaded;
  const storageRef = useRef<string>();

  useEffect(() => {
    if (storageRef.current === storageClassName) {
      return;
    }
    storageRef.current = storageClassName;
    setAccessMode();
    setVolumeMode();
  });

  if (!loaded) {
    return <Skeleton screenreaderText={t('Loading StorageProfile')} />;
  }

  if (loaded && error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <Flex spaceItems={{ default: 'spaceItems3xl' }}>
      <FlexItem>
        <VolumeMode
          claimPropertySets={claimPropertySets ?? []}
          isDisabled={isDisabled}
          {...{ setAccessMode, setVolumeMode, volumeMode }}
        />
      </FlexItem>
      <FlexItem>
        <AccessMode
          claimPropertySets={claimPropertySets ?? []}
          isDisabled={isDisabled}
          {...{ accessMode, setAccessMode, volumeMode }}
        />
      </FlexItem>
    </Flex>
  );
};

export default ApplyStorageProfileSettings;
