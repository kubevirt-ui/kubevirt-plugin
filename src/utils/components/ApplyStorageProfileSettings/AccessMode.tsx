import React, { FC } from 'react';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { FormGroup, Radio } from '@patternfly/react-core';

import RecommendationLabel from './RecommendationLabel';
import { ACCESS_MODE_RADIO_OPTIONS, getAccessModesForVolume } from './utils';

import './ApplyStorageProfileSettings.scss';

type AccessModeProps = {
  accessMode: V1beta1StorageSpecAccessModesEnum;
  claimPropertySets: ClaimPropertySets;
  setAccessMode: (accessMode: V1beta1StorageSpecAccessModesEnum) => void;
  volumeMode: V1beta1StorageSpecVolumeModeEnum;
};

export const AccessMode: FC<AccessModeProps> = ({
  accessMode,
  claimPropertySets,
  setAccessMode,
  volumeMode,
}) => {
  const { t } = useKubevirtTranslation();

  const accessModeForVolume = getAccessModesForVolume(claimPropertySets, volumeMode)?.[0];

  return (
    <FormGroup isStack label={t('Access Mode')}>
      {ACCESS_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Radio
          label={
            <div className="ApplyStorageProfileSettings--labelWithGap">
              {label}
              {accessModeForVolume === value && <RecommendationLabel />}
            </div>
          }
          onChange={(_event, checked) => {
            if (checked) {
              setAccessMode(value);
            }
          }}
          id={value}
          isChecked={value === accessMode}
          key={value}
          name="accessMode"
        />
      ))}
    </FormGroup>
  );
};

export default AccessMode;
