import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { FormGroup, Radio } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

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
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Learn more about{' '}
              <a href={documentationURL.ACCESS_MODE} rel="noopener noreferrer" target="_blank">
                access modes
              </a>
              .
            </Trans>
          }
        />
      }
      isStack
      label={t('Access Mode')}
    >
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
